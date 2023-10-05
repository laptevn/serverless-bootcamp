# Online shop
Description of functionality https://docs.google.com/document/d/1ZepkVBOFnLs0OgfwmC7Hk4Q0nbseZwggK838qdKlD6o/edit

## How to?
1. To install dependencies run `npm install` command.
2. To build sources run `npm run build` command.
3. To deploy the app run `cdk deploy` command. Set SHOP_OWNER_EMAIL environment variable (e.g. laptev@hey.com) before deployment.
4. To import initial data run `npm run import` command. Required only once. Please read limitations section.
5. To migrate DB run `npm run migrate` command. Required only once. Please read limitations section.
6. To test API use any HTTP client. For example AppSync console. Credentials are below.

## Known limitations
There is a problem with node dependencies used in Lambdas and DB scripts (import and migration).<br>
To run import or migration commented code should be used instead of uncommented.<br>
We can leave scripts as is after this change, but it will lead to strange TS compilation issues. They don't block anything and can be ignored, but they are false flags that disturb development.<br>
So a decision was made to leave them as is now. It's not important point of the task.

## Prerequisites
It's not possible to create None AppSync data source and pass Unit JavaScript resolver using CDK.<br>
So this step is performed manually - created data source with [this](subscription-resolver.js) resolver.

## App Sync credentials
admin/Admin!2admin
customer/Customer!2customer

## How to use API?
Use any HTTP client, I will use AppSync web console further.<br>
Accessing API without authentication and authorization will lead to errors. Click Login button right in Queries section of AppSync.<br>
Please use admin or customer users (named like corresponding groups they belong) with credentials above.<br>

The list of all supported operations can be found in [schema](graphql/schema.graphql) file.<br>
Admins can do everything, customers can run all queries and only one mutation - create order.

Queries operates over Category, Product, Supplier entities. Mutations support CUD operations over a product.<br>
Example of listing all Categories:
```
query MyQuery {
  categories {
    id
    name
    description
  }
}
```
Create order mutation is used for triggering order management process.<br>
Example of creating an order:
```
mutation MyMutation {
  createOrder(order: {address: "New York", details: [{product: "01H98D66JC8FAYE", quantity: 10}]})
    id
    totalPrice
    details {
      product
      quantity
    }
}
```

There is a subscription for new orders that sends new orders to admin using minimal price filtering.<br>

Please watch [demo](https://www.loom.com/share/5e253156c3cc48e1a9aa8552e560a2e6) to see API in action.

