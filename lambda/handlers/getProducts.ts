import {Product} from "../models/product";
import {CategoryIdEvent} from "../models/categoryIdEvent";

exports.handler = async function (event: CategoryIdEvent): Promise<Product[]> {
    return [
        {
            id: 1,
            name: "product 1",
            category: {
                id: 1,
                name: "category 1"
            }
        },
        {
            id: 2,
            name: "product 2",
            category: {
                id: 1,
                name: "category 1"
            }
        },
        {
            id: 3,
            name: "product 3",
            category: {
                id: 2,
                name: "category 2"
            }
        }];
};
