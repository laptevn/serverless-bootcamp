export type OrderDetails = {
    product: string;
    quantity: number;
}

export class Order {
    id: string;
    address: string;
    customer: string;
    date: string;
    details: [OrderDetails];
}

export class OrderWithPrice extends Order {
    totalPrice: number;
}
