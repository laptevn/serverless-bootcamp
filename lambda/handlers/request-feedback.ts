import handlebars from "handlebars";
import {requestFeedbackTemplate} from "../templates/request-feedback";

const aws = require("aws-sdk");
const ses = new aws.SES({region: 'us-east-1'});

exports.handler = async function (event: any, context: any, callback: any): Promise<void> {
    try {
        await ses.sendEmail({
            Destination: {ToAddresses: [event.Payload.customer]},
            Message: {
                Body: {Html: {Data: createMessage()}},
                Subject: {Data: "We value your feedback"},
            },
            Source: process.env.SENDER_EMAIL
        }).promise();
    } catch (e) {
        console.error(e);
    }
    callback(null, {});
};

function createMessage(): string {
    const template = handlebars.compile(requestFeedbackTemplate);
    return template({});
}
