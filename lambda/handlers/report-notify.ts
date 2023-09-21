import {SNS} from "aws-sdk";
import {S3Event} from "aws-lambda";
import {S3} from "aws-sdk";
import * as handlebars from 'handlebars';
import {Metadata} from "aws-sdk/clients/s3";
import {reportNotificationTemplate} from "../templates/report-notification";

const sns = new SNS();
const s3 = new S3({region: 'us-east-1', signatureVersion: 'v4'});

exports.handler = async function (event: S3Event): Promise<void> {
    for (const record of event.Records) {
        const meta = await s3.headObject({
            Bucket: record.s3.bucket.name,
            Key: record.s3.object.key
        }).promise();
        if (!meta.Metadata) {
            continue;
        }

        const oneWeekExpiration = 60 * 60 * 24 * 7;
        const signedURL = s3.getSignedUrl('getObject', {
            Bucket: record.s3.bucket.name,
            Key: record.s3.object.key,
            Expires: oneWeekExpiration
        });

        await sns.publish({
            Message: await createMessage(meta.Metadata, signedURL),
            TopicArn: process.env.TOPIC_ARN
        }).promise();
    }
};

async function createMessage(metadata: Metadata, signedURL: string): Promise<string> {
    const template = handlebars.compile(reportNotificationTemplate, {noEscape: true});
    return template({
        currentDate: metadata.reportingdate,
        totalOrders: metadata.orderscount,
        grandTotal: metadata.totalrevenue,
        presignedURL: signedURL
    });
}
