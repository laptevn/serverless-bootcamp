import { StepFunctions } from 'aws-sdk'

const stepFunctions = new StepFunctions();

exports.handler = async function (event: any): Promise<void> {
    const parameters = extractParameters(event.headers.referer);
    const status = parameters.result;
    const message = {
        status: status,
        orderId: parameters.orderId
    };
    if (!['approve', 'reject'].includes(message.status)) {
        console.error('Unknown status: ', status);
        return;
    }

    await stepFunctions.sendTaskSuccess({
        output: JSON.stringify(message),
        taskToken: parameters.taskToken
    }).promise();
};

function extractParameters(url: string): { [key: string]: string } {
    const result: { [key: string]: string } = {};
    url.split('?')[1]?.split('&').forEach(element => {
        const [key, ...rest] = element.split('=');
        const value: string = rest.join('=');
        result[key] = value;
    });
    return result;
}
