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
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as lambdaEventSources from '@aws-cdk/aws-lambda-event-sources';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import {Runtime, FunctionUrlAuthType} from "@aws-cdk/aws-lambda";
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

        const reportNotificationTopic = new sns.Topic(this, 'report notification');
        reportNotificationTopic.addSubscription(new subscriptions.EmailSubscription(ownerEmail));
        const reportNotifyFunction = new lambda.NodejsFunction(this as any, 'report-notify', {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/report-notify.ts',
            memorySize: 1024,
            environment: {
                TOPIC_ARN: reportNotificationTopic.topicArn
            },
        });
        reportNotificationTopic.grantPublish(reportNotifyFunction);
        reportNotifyFunction.addEventSource(new lambdaEventSources.S3EventSource(s3Bucket, {events: [s3.EventType.OBJECT_CREATED]}));
        s3Bucket.grantReadWrite(reportNotifyFunction);

        const confirmationCallbackFunction = new lambda.NodejsFunction(this as any, 'confirmation-callback', {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/confirmation-callback.ts',
            memorySize: 1024
        });
        confirmationCallbackFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: ['states:SendTaskSuccess'],
            resources: ['*'],
            effect: iam.Effect.ALLOW,
        }));
        const confirmationCallbackURL = confirmationCallbackFunction.addFunctionUrl({
            authType: FunctionUrlAuthType.NONE
        })

        const askShipmentConfirmationFunction = new lambda.NodejsFunction(this as any, 'ask-shipment-confirmation', {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/ask-shipment-confirmation.ts',
            memorySize: 1024,
            environment: {
                TOPIC_ARN: reportNotificationTopic.topicArn
            },
        });
        reportNotificationTopic.grantPublish(askShipmentConfirmationFunction);

        const shipmentConfirmedFunction = new lambda.NodejsFunction(this as any, 'shipment-confirmed', {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/shipment-confirmed.ts',
            memorySize: 1024,
            environment: {
                SENDER_EMAIL: ownerEmail,
                TABLE_NAME: table.tableName
            },
        });
        shipmentConfirmedFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: ['ses:SendEmail', 'SES:SendRawEmail'],
            resources: ['*'],
            effect: iam.Effect.ALLOW,
        }));
        table.grantReadWriteData(shipmentConfirmedFunction);

        const shipmentCancelledFunction = new lambda.NodejsFunction(this as any, 'shipment-cancelled', {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/shipment-cancelled.ts',
            memorySize: 1024,
            environment: {
                SENDER_EMAIL: ownerEmail,
                TABLE_NAME: table.tableName
            },
        });
        shipmentCancelledFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: ['ses:SendEmail', 'SES:SendRawEmail'],
            resources: ['*'],
            effect: iam.Effect.ALLOW,
        }));
        table.grantReadWriteData(shipmentCancelledFunction);

        const requestFeedbackFunction = new lambda.NodejsFunction(this as any, 'request-feedback', {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/request-feedback.ts',
            memorySize: 1024,
            environment: {
                SENDER_EMAIL: ownerEmail
            },
        });
        requestFeedbackFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: ['ses:SendEmail', 'SES:SendRawEmail'],
            resources: ['*'],
            effect: iam.Effect.ALLOW,
        }));

        const orderStateMachine = new sfn.StateMachine(this, 'OrderStateMachine', {
            definition: new tasks.LambdaInvoke(this, "NotifyCustomerTask", {
                lambdaFunction: notifyCustomerFunction
            }).next(new tasks.LambdaInvoke(this, "AskShipmentConfirmation", {
                lambdaFunction: askShipmentConfirmationFunction,
                integrationPattern: sfn.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
                payload: sfn.TaskInput.fromObject({
                    taskToken: sfn.JsonPath.taskToken,
                    payload: sfn.JsonPath.entirePayload,
                    lambdaURL: confirmationCallbackURL.url
                })
            })).next(new sfn.Choice(this, 'Shipment Confirmation')
                .when(sfn.Condition.stringEquals('$.status', 'approve'), new tasks.LambdaInvoke(this, "ShipmentConfirmed", {
                    lambdaFunction: shipmentConfirmedFunction
                }).next(new sfn.Wait(this, 'FeedbackDelay', {
                    time: sfn.WaitTime.duration(cdk.Duration.seconds(10))
                })).next(new tasks.LambdaInvoke(this, "RequestFeedback", {
                    lambdaFunction: requestFeedbackFunction
                })))
                .otherwise(new tasks.LambdaInvoke(this, "ShipmentCancelled", {
                    lambdaFunction: shipmentCancelledFunction
                })))
        });

        const createOrderFunction = this.addLambdaResolver(api, 'create-order', 'Mutation', 'createOrder', table, orderStateMachine.stateMachineArn);
        orderStateMachine.grantStartExecution(createOrderFunction);
    }

    private addLambdaResolver(api: appsync.GraphqlApi, lambdaName: string, resolverTypeName: string, resolverFieldName: string, table: dynamodb.Table, stepFunctionArn: string = ''): lambda.NodejsFunction {
        const lambdaFunction = new lambda.NodejsFunction(this as any, lambdaName, {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/' + lambdaName + '.ts',
            memorySize: 1024,
            environment: {
                TABLE_NAME: table.tableName,
                STEP_FUNCTION_ARN: stepFunctionArn
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
