import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as lambda from '@aws-cdk/aws-lambda';

export class ServerlessStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const api = new appsync.GraphqlApi(this, 'api', {
      name: 'api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql')
    });

    this.addLambdaResolver(api, 'getCategories', 'Query', 'categories');
    this.addLambdaResolver(api, 'getCategory', 'Query', 'category');
    this.addLambdaResolver(api, 'getProducts', 'Query', 'products');
    this.addLambdaResolver(api, 'getProduct', 'Query', 'product');
    this.addLambdaResolver(api, 'addProduct', 'Mutation', 'addProduct');
    this.addLambdaResolver(api, 'updateProduct', 'Mutation', 'updateProduct');
    this.addLambdaResolver(api, 'removeProduct', 'Mutation', 'removeProduct');
  }

  private addLambdaResolver(api: appsync.GraphqlApi, lambdaName: string, resolverTypeName: string, resolverFieldName: string) {
    const lambdaFunction = new lambda.Function(this, lambdaName, {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: lambdaName + '.handler',
      code: lambda.Code.fromAsset('lambda/handlers'),
      memorySize: 1024
    });
    const dataSource = api.addLambdaDataSource(lambdaName + 'DataSource', lambdaFunction);
    dataSource.createResolver({
      typeName: resolverTypeName,
      fieldName: resolverFieldName
    });
  }
}
