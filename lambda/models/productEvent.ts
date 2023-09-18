export type ProductEvent = {
    arguments: {
        product: {
            id: string;
            name: string;
            description: string;
            price: number;
            currency: string;
            weight: number;
            imageUrl: string;
            category: string;
            supplier: string;
        }
    }
}
