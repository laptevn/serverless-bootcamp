import {IdEvent} from "../models/idEvent";
import {Product} from "../models/product";
import {ProductRepository} from "../repositories/productRepository";
import {CategoryRepository} from "../repositories/categoryRepository";

const productRepository = new ProductRepository(new CategoryRepository());

exports.handler = async function (event: IdEvent): Promise<Product> {
    return productRepository.getProduct(event.arguments.id);
};
