import {SQSEvent} from "aws-lambda";
import {Order} from "../models/order";
import * as handlebars from 'handlebars';
import {orderTemplate} from "../templates/order";

const aws = require("aws-sdk");
const ses = new aws.SES({region: 'us-east-1'});

exports.handler = async function (event: SQSEvent): Promise<void> {
    for (const record of event.Records) {
        const order = JSON.parse(record.body) as Order;
        console.log(order.customer);

        await ses.sendEmail({
            Destination: {ToAddresses: [order.customer]},
            Message: {
                Body: {Html: {Data: createMessage(order)}},
                Subject: {Data: "Order confirmation"},
            },
            Source: process.env.SENDER_EMAIL
        }).promise();
    }
};

function createMessage(order: Order): string {
    const template = handlebars.compile(orderTemplate);
    return template({
        ...order,
        total_amount: order.details.reduce((sum, current) => sum + current.quantity, 0)
    });
}
