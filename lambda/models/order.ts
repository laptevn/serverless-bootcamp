export type OrderDetails = {
    product: string;
    quantity: number;
}

export type Order = {
    id: string;
    address: string;
    customer: string;
    date: string;
    details: [OrderDetails];
}
