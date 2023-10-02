# Online shop
Description of functionality https://docs.google.com/document/d/1ZepkVBOFnLs0OgfwmC7Hk4Q0nbseZwggK838qdKlD6o/edit

## How to?
1. To build sources run `npm run build` command.
2. To import initial data run `npm run import` command. Required only once. Please read limitations section.
3. To migrate DB run `npm run migrate` command. Required only once. Please read limitations section.
4. To deploy the app run `cdk deploy` command. Set SHOP_OWNER_EMAIL environment variable before deployment.
5. To test API use any HTTP client. For example AppSync console. Credentials are below.

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
