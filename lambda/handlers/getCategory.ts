import {Category} from "../models/category";
import {IdEvent} from "../models/idEvent";
import {CategoryRepository} from "../repositories/categoryRepository";

const categoryRepository = new CategoryRepository();

exports.handler = async function (event: IdEvent): Promise<Category> {
    return categoryRepository.getCategory(event.arguments.id);
};
