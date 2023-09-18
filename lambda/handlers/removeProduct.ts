import {IdEvent} from "../models/idEvent";
import {ProductRepository} from "../repositories/productRepository";
import {CategoryRepository} from "../repositories/categoryRepository";

const productRepository = new ProductRepository(new CategoryRepository());

exports.handler = async function (event: IdEvent): Promise<boolean> {
    await productRepository.removeProduct(event.arguments.id);
    return true;
};
