import {OrderRepository} from "../repositories/order-repository";
import {Order} from "../models/order";
import handlebars from "handlebars";
import {shipmentConfirmedTemplate} from "../templates/shipment-confirmed";

const orderRepository = new OrderRepository();
const aws = require("aws-sdk");
const ses = new aws.SES({region: 'us-east-1'});

exports.handler = async function (event: any, context: any, callback: any): Promise<void> {
    const order = await orderRepository.getOrder(event.orderId);

    try {
        await ses.sendEmail({
            Destination: {ToAddresses: [order.customer]},
            Message: {
                Body: {Html: {Data: createMessage(order)}},
                Subject: {Data: "Shipment confirmed"},
            },
            Source: process.env.SENDER_EMAIL
        }).promise();
    } catch (e) {
        console.error(e);
    }

    callback(null, {
        customer: order.customer
    });
};

function createMessage(order: Order): string {
    const template = handlebars.compile(shipmentConfirmedTemplate);
    return template({
        orderId: order.id
    });
}
