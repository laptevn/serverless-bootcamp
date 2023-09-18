import DynamoDB from 'aws-sdk/clients/dynamodb';
import schema from './schema'
import {Entity, Table} from "dynamodb-onetable";
import {Category} from "../models/category";

export class CategoryRepository {
    private readonly categoryModel;

    constructor() {
        const client = new DynamoDB.DocumentClient({region: 'us-east-1'});
        const table = new Table({
            client: client,
            name: process.env.TABLE_NAME,
            schema: schema,
        });
        type CategoryType = Entity<typeof schema.models.Category>;
        this.categoryModel = table.getModel<CategoryType>('Category');
    }

    async getCategories(): Promise<Category[]> {
        return (await this.categoryModel.find({pk: 'category'})) as Category[];
    }

    async getCategory(id: string): Promise<Category> {
        const category = await this.categoryModel.get({pk: 'category', sk: id});
        if (category) {
            return category as Category;
        }
        throw new Error("Category not found");
    }
}
