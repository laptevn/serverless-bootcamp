import {Category} from "./category";

export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    weight: number;
    imageUrl: string;
    category: Category;
}
