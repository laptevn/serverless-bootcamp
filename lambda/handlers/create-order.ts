import {Order, OrderWithPrice} from "../models/order";
import {OrderEvent} from "../models/order-event";
import {OrderRepository} from "../repositories/order-repository";
import {ProductRepository} from "../repositories/product-repository";
import {CategoryRepository} from "../repositories/category-repository";
import {SupplierRepository} from "../repositories/supplier-repository";
import { StepFunctions } from 'aws-sdk'

const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const stepFunctions = new StepFunctions();

const orderRepository = new OrderRepository();
const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: OrderEvent): Promise<OrderWithPrice> {
    const order = await orderRepository.createOrder(event);
    await stepFunctions.startExecution({
        stateMachineArn: process.env.STEP_FUNCTION_ARN as string,
        input: JSON.stringify(await createOrderForNotification(order))
    }).promise();

    return {
        ...order,
        totalPrice: await calculateTotalPrice(order)
    }
};

async function createOrderForNotification(order: Order): Promise<Order> {
    const result = JSON.parse(JSON.stringify(order));
    for (const item of result.details) {
        item.product = (await productRepository.getProduct(item.product)).name;
    }
    return result;
}

async function calculateTotalPrice(order: Order): Promise<number> {
    let totalPrice = 0;
    for (const item of order.details) {
        totalPrice += item.quantity * (await productRepository.getProduct(item.product)).price;
    }
    return totalPrice;
}
