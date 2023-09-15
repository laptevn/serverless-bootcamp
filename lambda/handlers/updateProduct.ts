import {Product} from "../models/product";
import {UpdateProductEvent} from "../models/updateProductEvent";

exports.handler = async function (event: UpdateProductEvent): Promise<Product> {
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
