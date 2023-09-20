import {Order} from "../models/order";
import {OrderEvent} from "../models/order-event";
import {OrderRepository} from "../repositories/order-repository";
import {ProductRepository} from "../repositories/product-repository";
import {CategoryRepository} from "../repositories/category-repository";
import {SupplierRepository} from "../repositories/supplier-repository";

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

const orderRepository = new OrderRepository();
const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: OrderEvent): Promise<Order> {
    const order = await orderRepository.createOrder(event);
    await sqs.sendMessage({
        MessageBody: JSON.stringify(await createOrderForNotification(order)),
        QueueUrl: process.env.QUEUE_URL
    }).promise();
    return order;
};

async function createOrderForNotification(order: Order): Promise<Order> {
    const result = JSON.parse(JSON.stringify(order));
    for (const item of result.details) {
        item.product = (await productRepository.getProduct(item.product)).name;
    }
    return result;
}
