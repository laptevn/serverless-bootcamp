import {Product} from "../models/product";
import {ProductEvent} from "../models/productEvent";

exports.handler = async function (event: ProductEvent): Promise<Product> {
    console.log(event.arguments);
    return {
        id: 1,
        name: "product 1",
        category: {
            id: 1,
            name: "category 1"
        }
    };
};
