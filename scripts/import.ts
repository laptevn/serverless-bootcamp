import DynamoDB from 'aws-sdk/clients/dynamodb';
// import {DynamoDBClient} from '@aws-sdk/client-dynamodb'
// import Dynamo from 'dynamodb-onetable/Dynamo'
import schema from '../lambda/repositories/schema'
import {Entity, Table} from "dynamodb-onetable";
import axios from 'axios';

type Category = {
    Id: string,
    Name: string,
    Description: string
}

type Product = {
    Id: string,
    Name: string,
    Description: string,
    Price: number,
    Currency: string,
    Weight: number,
    ImageUrl: string,
    Supplier: string,
    Category: string
}

type Supplier = {
    Id: string,
    Name: string
}

async function main() {
    const client = new DynamoDB.DocumentClient({region: 'us-east-1'});
    //const client = new Dynamo({client: new DynamoDBClient({region: 'us-east-1'})});
    const table = new Table({
        client: client,
        name: 'ServerlessStack-Entries3C9817F4-1RSJWJ4P8NGC5',
        schema: schema,
    });

    type CategoryType = Entity<typeof schema.models.Category>;
    const categoryTable = table.getModel<CategoryType>('Category');
    const categories: Category[] = (await axios.get('https://raw.githubusercontent.com/msg-CareerPaths/aws-serverless-training/master/chapters/data/categories.json')).data;
    categories.forEach(categoryData => {
        categoryTable.create({id: categoryData.Id, name: categoryData.Name, description: categoryData.Description});
    })

    type ProductType = Entity<typeof schema.models.Product>;
    const productTable = table.getModel<ProductType>('Product');
    const products: Product[] = (await axios.get('https://raw.githubusercontent.com/msg-CareerPaths/aws-serverless-training/master/chapters/data/products.json')).data;
    products.forEach(productData => {
        productTable.create({
            id: productData.Id,
            name: productData.Name,
            description: productData.Description,
            price: productData.Price,
            currency: productData.Currency,
            weight: productData.Weight,
            imageUrl: productData.ImageUrl,
            supplier: productData.Supplier,
            category: productData.Category
        });
    });

    type SupplierType = Entity<typeof schema.models.Supplier>;
    const supplierTable = table.getModel<SupplierType>('Supplier');
    const suppliers: Supplier[] = (await axios.get('https://raw.githubusercontent.com/msg-CareerPaths/aws-serverless-training/master/chapters/data/suppliers.json')).data;
    suppliers.forEach(supplierData => {
        supplierTable.create({id: supplierData.Id, name: supplierData.Name});
    })
}

main();
