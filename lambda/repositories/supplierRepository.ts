import DynamoDB from 'aws-sdk/clients/dynamodb';
import schema from './schema'
import {Entity, Table} from "dynamodb-onetable";
import {Supplier} from "../models/supplier";

export class SupplierRepository {
    private readonly supplierModel;

    constructor() {
        const client = new DynamoDB.DocumentClient({region: 'us-east-1'});
        const table = new Table({
            client: client,
            name: process.env.TABLE_NAME,
            schema: schema,
        });
        type SupplierType = Entity<typeof schema.models.Supplier>;
        this.supplierModel = table.getModel<SupplierType>('Supplier');
    }

    async getSuppliers(): Promise<Supplier[]> {
        return (await this.supplierModel.find({pk: 'supplier'})) as Supplier[];
    }

    async getSupplier(id: string): Promise<Supplier> {
        const supplier = await this.supplierModel.get({pk: 'supplier', sk: id});
        if (supplier) {
            return supplier as Supplier;
        }
        throw new Error("Supplier not found");
    }
}
