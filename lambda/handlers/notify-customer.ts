import {Order} from "../models/order";
import * as handlebars from 'handlebars';
import {orderTemplate} from "../templates/order";

const aws = require("aws-sdk");
const ses = new aws.SES({region: 'us-east-1'});

exports.handler = async function (event: Order, context: any, callback: any): Promise<void> {
    try {
        await ses.sendEmail({
            Destination: {ToAddresses: [event.customer]},
            Message: {
                Body: {Html: {Data: createMessage(event)}},
                Subject: {Data: "Order confirmation"},
            },
            Source: process.env.SENDER_EMAIL
        }).promise();
    } catch (e) {
        console.error(e);
    }

    callback(null, {
        orderId: event.id,
        customer: event.customer
    });
};

function createMessage(order: Order): string {
    const template = handlebars.compile(orderTemplate);
    return template({
        ...order,
        total_amount: order.details.reduce((sum, current) => sum + current.quantity, 0)
    });
}
