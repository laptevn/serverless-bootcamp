import {Product} from "../models/product";
import {ProductEvent} from "../models/productEvent";
import {ProductRepository} from "../repositories/productRepository";
import {CategoryRepository} from "../repositories/categoryRepository";

const productRepository = new ProductRepository(new CategoryRepository());

exports.handler = async function (event: ProductEvent): Promise<Product> {
    return productRepository.updateProduct(event);
};
