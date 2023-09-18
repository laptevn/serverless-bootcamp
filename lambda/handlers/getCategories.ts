import {Category} from "../models/category";
import {CategoryRepository} from "../repositories/categoryRepository";

const categoryRepository = new CategoryRepository();

exports.handler = function(): Promise<Category[]> {
    return categoryRepository.getCategories();
};
