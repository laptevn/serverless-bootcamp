import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import {Runtime} from "@aws-cdk/aws-lambda";

export class ServerlessStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const api = new appsync.GraphqlApi(this, 'api', {
            name: 'api',
            schema: appsync.Schema.fromAsset('graphql/schema.graphql')
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

        this.addLambdaResolver(api, 'getCategories', 'Query', 'categories', table);
        this.addLambdaResolver(api, 'getCategory', 'Query', 'category', table);
        this.addLambdaResolver(api, 'getProducts', 'Query', 'products', table);
        this.addLambdaResolver(api, 'getProductsBySupplier', 'Query', 'productsBySupplier', table);
        this.addLambdaResolver(api, 'getProduct', 'Query', 'product', table);
        this.addLambdaResolver(api, 'addProduct', 'Mutation', 'addProduct', table);
        this.addLambdaResolver(api, 'updateProduct', 'Mutation', 'updateProduct', table);
        this.addLambdaResolver(api, 'removeProduct', 'Mutation', 'removeProduct', table);
        this.addLambdaResolver(api, 'getSuppliers', 'Query', 'suppliers', table);
        this.addLambdaResolver(api, 'getSupplier', 'Query', 'supplier', table);
    }

    private addLambdaResolver(api: appsync.GraphqlApi, lambdaName: string, resolverTypeName: string, resolverFieldName: string, table: dynamodb.Table) {
        const lambdaFunction = new lambda.NodejsFunction(this as any, lambdaName, {
            runtime: Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: 'lambda/handlers/' + lambdaName + '.ts',
            memorySize: 1024,
            environment: {
                TABLE_NAME: table.tableName
            },
            bundling: {
                nodeModules: ['dynamodb-onetable']
            }
        });
        const dataSource = api.addLambdaDataSource(lambdaName + 'DataSource', lambdaFunction);
        dataSource.createResolver({
            typeName: resolverTypeName,
            fieldName: resolverFieldName
        });

        table.grantReadWriteData(lambdaFunction);
    }
}
