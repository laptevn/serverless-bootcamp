export type UpdateProductEvent = {
    arguments: {
        id: number;
        product: {
            name: string;
            category: number;
        }
    }
}
