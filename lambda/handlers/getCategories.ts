import {Category} from "../models/category";

exports.handler = async function (): Promise<Category[]> {
    return [
        {
            id: 1,
            name: "category 1"
        },
        {
            id: 2,
            name: "category 2"
        }];
};
