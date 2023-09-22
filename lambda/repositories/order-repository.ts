import DynamoDB from "aws-sdk/clients/dynamodb";
import {Entity, Table} from "dynamodb-onetable";
import schema from "./schema";
import {OrderEvent} from "../models/order-event";
import {Order} from "../models/order";

export class OrderRepository {
    private readonly orderModel;

    constructor() {
        const client = new DynamoDB.DocumentClient({region: 'us-east-1'});
        const table = new Table({
            client: client,
            name: process.env.TABLE_NAME,
            schema: schema,
        });
        type OrderType = Entity<typeof schema.models.Order>;
        this.orderModel = table.getModel<OrderType>('Order');
    }

    async createOrder(event: OrderEvent): Promise<Order> {
        return await this.orderModel.create({
            address: event.arguments.order.address,
            customer: event.identity.claims.email,
            date: new Date().toLocaleDateString(),
            details: event.arguments.order.details
        }) as Order;
    }

    async getOrders(date: string): Promise<Order[]> {
        return await this.orderModel.find({gsi1pk: date}, {index: 'gsi1'}) as Order[];
    }

    async removeOrder(id: string): Promise<void> {
        await this.orderModel.remove({id: id});
    }

    async getOrder(id: string): Promise<Order> {
        return await this.orderModel.get({id: id}) as Order;
    }
}
