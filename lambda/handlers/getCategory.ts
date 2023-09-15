import {Category} from "../models/category";
import {IdEvent} from "../models/idEvent";

exports.handler = async function (event: IdEvent): Promise<Category> {
    return {
            id: 1,
            name: "category 1"
        };
};
