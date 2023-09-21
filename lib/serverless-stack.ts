import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from '@aws-cdk/aws-iam';
import * as s3 from '@aws-cdk/aws-s3';
import * as sns from '@aws-cdk/aws-sns';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';
import * as events from '@aws-cdk/aws-events';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';
import {Runtime} from "@aws-cdk/aws-lambda";
import { Queue } from "@aws-cdk/aws-sqs";
import {CfnOutput} from "@aws-cdk/core";
import {LambdaFunction} from "@aws-cdk/aws-events-targets";

export class ServerlessStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const userPool: cognito.UserPool = new cognito.UserPool(this, "ServerlessOnboardingUserPool", {
            selfSignUpEnabled: true,
            accountRecovery: cognito.AccountRecovery.NONE,
            userVerification: {
                emailStyle: cognito.VerificationEmailStyle.CODE,
            },
            autoVerify: {
                email: true,
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
            }
        });

        const userPoolClient: cognito.UserPoolClient = new cognito.UserPoolClient(
            this,
            "UserPoolClient",
            {
                userPool,
            }
        );
        new CfnOutput(this, "UserPoolClientId", {
            value: userPoolClient.userPoolClientId,
        });

        const api = new appsync.GraphqlApi(this, 'api', {
            name: 'api',
            schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
            authorizationConfig: {
                defaultAuthorization: {
                    authorizationType: appsync.AuthorizationType.USER_POOL,
                    userPoolConfig: {
                        userPool
                    }
                },
            }
        });

        const table = new dynamodb.Table(this, 'Entries', {
            partitionKey: {name: 'pk', type: dynamodb.AttributeType.STRING},
            sortKey: {name: 'sk', type: dynamodb.AttributeType.STRING},
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });
        table.addGlobalSecondaryIndex({
            indexName: 'gsi1',
            partitionKey: {name: 'gsi1pk', type: dynamodb.AttributeType.STRING},
            sortKey: {name: 'gsi1sk', type: dynamodb.AttributeType.STRING},
            projectionType: dynamodb.ProjectionType.ALL
        });
        table.addGlobalSecondaryIndex({
            indexName: 'gsi2',
            partitionKey: {name: 'gsi2pk', type: dynamodb.AttributeType.STRING},
            sortKey: {name: 'gsi2sk', type: dynamodb.AttributeType.STRING},
            projectionType: dynamodb.ProjectionType.ALL
        });

        this.addLambdaResolver(api, 'get-categories', 'Query', 'categories', table);
        this.addLambdaResolver(api, 'get-category', 'Query', 'category', table);
        this.addLambdaResolver(api, 'get-products', 'Query', 'products', table);
        this.addLambdaResolver(api, 'get-products-by-supplier', 'Query', 'productsBySupplier', table);
        this.addLambdaResolver(api, 'get-product', 'Query', 'product', table);
        this.addLambdaResolver(api, 'add-product', 'Mutation', 'addProduct', table);
        this.addLambdaResolver(api, 'update-product', 'Mutation', 'updateProduct', table);
        this.addLambdaResolver(api, 'remove-product', 'Mutation', 'removeProduct', table);
        this.addLambdaResolver(api, 'get-suppliers', 'Query', 'suppliers', table);
        this.addLambdaResolver(api, 'get-supplier', 'Query', 'supplier', table);

        const deadLetterQueue = new Queue(this, "onboarding-dlq", {
            queueName: 'orders-dlq'
        });
        const queue = new Queue(this, 'orders', {
            queueName: 'orders',
            deadLetterQueue: {
                queue: deadLetterQueue,
                maxReceiveCount: 3
            }
        })
        const createOrderFunction = this.addLambdaResolver(api, 'create-order', 'Mutation', 'createOrder', table, queue.queueUrl);
        queue.grantSendMessages(createOrderFunction);

        const ownerEmail = 'laptev@hey.com';
        const notifyCustomerFunction = new lambda.NodejsFunction(this as any, 'notify-customer', {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/notify-customer.ts',
            memorySize: 1024,
            environment: {
                SENDER_EMAIL: ownerEmail
            }
        });
        queue.grantConsumeMessages(notifyCustomerFunction);
        notifyCustomerFunction.addEventSource(new lambdaEventSources.SqsEventSource(queue));
        notifyCustomerFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: ['ses:SendEmail', 'SES:SendRawEmail'],
            resources: ['*'],
            effect: iam.Effect.ALLOW,
        }));

        const s3Bucket = new s3.Bucket(this, 'order-reports', {
            objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL
        });

        const rule = new events.Rule(this, 'report-rule', {
            schedule: events.Schedule.cron({minute: '0', hour: '02', month: '*', weekDay: '*', year: '*'})
        });
        const reportingFunction = new lambda.NodejsFunction(this as any, 'report', {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/report.ts',
            memorySize: 1096,
            environment: {
                TABLE_NAME: table.tableName,
                S3_BUCKET: s3Bucket.bucketName
            },
            bundling: {
                externalModules: ["aws-sdk"],
                nodeModules: ["@sparticuz/chromium"]
            },
            timeout: cdk.Duration.minutes(1)
        });
        rule.addTarget(new LambdaFunction(reportingFunction));
        s3Bucket.grantReadWrite(reportingFunction);
        table.grantReadWriteData(reportingFunction);

        const reportNotification = new sns.Topic(this, 'report notification');
        reportNotification.addSubscription(new subscriptions.EmailSubscription(ownerEmail));
        const reportNotifyFunction = new lambda.NodejsFunction(this as any, 'report-notify', {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/report-notify.ts',
            memorySize: 1024,
            environment: {
                TOPIC_ARN: reportNotification.topicArn
            },
        });
        reportNotification.grantPublish(reportNotifyFunction);
        reportNotifyFunction.addEventSource(new lambdaEventSources.S3EventSource(s3Bucket, {events: [s3.EventType.OBJECT_CREATED]}));
        s3Bucket.grantReadWrite(reportNotifyFunction);
    }

    private addLambdaResolver(api: appsync.GraphqlApi, lambdaName: string, resolverTypeName: string, resolverFieldName: string, table: dynamodb.Table, queueUrl: string = ''): lambda.NodejsFunction {
        const lambdaFunction = new lambda.NodejsFunction(this as any, lambdaName, {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/' + lambdaName + '.ts',
            memorySize: 1024,
            environment: {
                TABLE_NAME: table.tableName,
                QUEUE_URL: queueUrl
            }
        });
        const dataSource = api.addLambdaDataSource(lambdaName + 'DataSource', lambdaFunction);
        dataSource.createResolver({
            typeName: resolverTypeName,
            fieldName: resolverFieldName
        });

        table.grantReadWriteData(lambdaFunction);
        return lambdaFunction;
    }
}
