import {Category} from "../models/category";
import {IdEvent} from "../models/id-event";
import {CategoryRepository} from "../repositories/category-repository";

const categoryRepository = new CategoryRepository();

exports.handler = async function (event: IdEvent): Promise<Category> {
    return categoryRepository.getCategory(event.arguments.id);
};
