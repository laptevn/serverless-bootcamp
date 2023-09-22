import {SNS} from "aws-sdk";
import handlebars from "handlebars";
import {shipmentApprovalTemplate} from "../templates/shipment-approval";

const sns = new SNS();

exports.handler = async function (event: any, context: any, callback: any): Promise<void> {
    await sns.publish({
        Message: await createMessage(
            event.payload.Payload.orderId,
            event.payload.Payload.customer,
            event.lambdaURL,
            event.taskToken),
        TopicArn: process.env.TOPIC_ARN
    }).promise();
    callback(null, {});
};

async function createMessage(
    orderId: string, customer: string, lambdaUrl: string, taskToken: string): Promise<string> {
    const template = handlebars.compile(shipmentApprovalTemplate, {noEscape: true});
    return template({
        orderId: orderId,
        customer: customer,
        approvalLambdaUrl: lambdaUrl,
        taskToken: taskToken
    });
}
