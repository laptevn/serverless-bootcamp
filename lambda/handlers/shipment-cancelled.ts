import {OrderRepository} from "../repositories/order-repository";
import {Order} from "../models/order";
import handlebars from "handlebars";
import {shipmentCancelledTemplate} from "../templates/shipment-cancelled";

const orderRepository = new OrderRepository();
const aws = require("aws-sdk");
const ses = new aws.SES({region: 'us-east-1'});

exports.handler = async function (event: any, context: any, callback: any): Promise<void> {
    const order = await orderRepository.getOrder(event.orderId);
    await orderRepository.removeOrder(event.orderId);
    try {
        await ses.sendEmail({
            Destination: {ToAddresses: [order.customer]},
            Message: {
                Body: {Html: {Data: createMessage(order)}},
                Subject: {Data: "Shipment cancelled"},
            },
            Source: process.env.SENDER_EMAIL
        }).promise();
    } catch (e) {
        console.error(e);
    }
    callback(null, {});
};

function createMessage(order: Order): string {
    const template = handlebars.compile(shipmentCancelledTemplate);
    return template({
        orderId: order.id
    });
}
