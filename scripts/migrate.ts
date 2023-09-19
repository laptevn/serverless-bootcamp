import {Entity, Table} from 'dynamodb-onetable'
import {Migrate} from 'onetable-migrate'
import DynamoDB from 'aws-sdk/clients/dynamodb';
// import {DynamoDBClient} from '@aws-sdk/client-dynamodb'
// import Dynamo from 'dynamodb-onetable/Dynamo'
import schema from '../lambda/repositories/schema'

const OneTableParams = {
    client: new DynamoDB.DocumentClient({region: 'us-east-1'}),
    //client: new Dynamo({client: new DynamoDBClient({region: 'us-east-1'})}),
    name: 'ServerlessStack-Entries3C9817F4-1RSJWJ4P8NGC5',
};

type ProductType = Entity<typeof schema.models.Product>;
const migrate = new Migrate(OneTableParams, {
    migrations: [
        {
            version: '0.0.1',
            description: 'Initialize the database',
            schema: schema,
            async up(db: Table, migrate: Migrate, params: unknown) {
                const productModel = db.getModel<ProductType>('Product');
                (await productModel.scan()).forEach(product => {
                    productModel.update({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        currency: product.currency,
                        weight: product.weight,
                        imageUrl: product.imageUrl,
                        supplier: product.supplier,
                        category: product.category,
                        gsi2pk: product.supplier,
                        gsi2sk: product.id
                    })
                });
            },
            async down(db: Table, migrate: Migrate, params: unknown) {
                const productModel = db.getModel<ProductType>('Product');
                (await productModel.scan()).forEach(product => {
                    productModel.update({
                        id: product.id,
                        name: product.name,
                        description: product.description,
                        price: product.price,
                        currency: product.currency,
                        weight: product.weight,
                        imageUrl: product.imageUrl,
                        supplier: product.supplier,
                        category: product.category
                    })
                });
            },
        },
    ],
});
migrate.init().then(async () => {
    await migrate.apply("up", '0.0.1');
});
