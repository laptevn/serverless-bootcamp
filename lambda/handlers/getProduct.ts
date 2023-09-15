import {IdEvent} from "../models/idEvent";
import {Product} from "../models/product";

exports.handler = async function (event: IdEvent): Promise<Product> {
    return {
        id: 1,
        name: "product 1",
        category: {
            id: 1,
            name: "category 1"
        }
    };
};
