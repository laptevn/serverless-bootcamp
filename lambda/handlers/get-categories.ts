import {Category} from "../models/category";
import {CategoryRepository} from "../repositories/category-repository";

const categoryRepository = new CategoryRepository();

exports.handler = function(): Promise<Category[]> {
    return categoryRepository.getCategories();
};
