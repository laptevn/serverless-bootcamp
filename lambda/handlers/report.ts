import {OrderRepository} from "../repositories/order-repository";
import {ProductRepository} from "../repositories/product-repository";
import {CategoryRepository} from "../repositories/category-repository";
import {SupplierRepository} from "../repositories/supplier-repository";
import {ReportingOrder} from "../models/reporting-order";
import {Order} from "../models/order";
import * as handlebars from 'handlebars';
import {reportTemplate} from "../templates/report";
import puppeteer from "puppeteer-core";
import { S3 } from "aws-sdk";

const orderRepository = new OrderRepository();
const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());
const s3 = new S3({ region: 'us-east-1' });
const chromium = require("@sparticuz/chromium");

exports.handler = async function (): Promise<void> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const reportingDate = yesterday.toLocaleDateString();
    const orders = await orderRepository.getOrders(reportingDate);
    if (orders.length === 0) {
        console.log('No orders found for ' + reportingDate);
        return;
    }

    const reportingOrders = await createReportingOrders(orders);
    const totalRevenue = reportingOrders.reduce(
        (sum, current) => sum + Number.parseFloat(current.totalPrice), 0).toFixed(2);

    const report = await htmlToPDF(await createHTMLReport(reportingOrders, reportingDate, totalRevenue));
    await saveToS3(report, reportingDate + '.pdf', reportingDate, reportingOrders.length, totalRevenue);
};

async function createReportingOrders(orders: Order[]): Promise<ReportingOrder[]> {
    const reportingOrders: ReportingOrder[] = [];
    for (const order of orders) {
        for (const detail of order.details) {
            const product = await productRepository.getProduct(detail.product);
            reportingOrders.push({
                email: order.customer,
                address: order.address,
                product: product.name,
                pricePerItem: product.price,
                quantity: detail.quantity,
                totalPrice: (product.price * detail.quantity).toFixed(2)
            })
        }
    }

    return reportingOrders;
}

async function createHTMLReport(orders: ReportingOrder[], date: string, totalRevenue: string): Promise<string> {
    const template = handlebars.compile(reportTemplate);
    return template({
        orders: orders,
        currentDate: date,
        grandTotal: totalRevenue
    });
}

async function htmlToPDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
        defaultViewport: chromium.defaultViewport,
        args: [...chromium.args, "--hide-scrollbars", "--disable-web-security"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.emulateMediaType('screen');
    return await page.pdf({
        margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
        printBackground: true,
        format: 'A4'
    });
}

async function saveToS3(content: Buffer, objectName: string, reportingDate: string, ordersCount: number, totalRevenue: string): Promise<void> {
    await s3.upload({
        Bucket: process.env.S3_BUCKET as string,
        Key: objectName,
        Body: content,
        Metadata: {
            reportingDate: reportingDate,
            ordersCount: ordersCount.toString(),
            totalRevenue: totalRevenue
        }
    }).promise();
}
