import {Product} from "../models/product";
import {ProductEvent} from "../models/productEvent";
import {ProductRepository} from "../repositories/productRepository";
import {CategoryRepository} from "../repositories/categoryRepository";

const productRepository = new ProductRepository(new CategoryRepository());

exports.handler = async function (event: ProductEvent): Promise<Product> {
    await productRepository.addProduct(event);
    return {
        id: "1",
        name: "product 1",
        description: "product 1 description",
        price: 10,
        currency: '123',
        weight: 1,
        imageUrl: 'url',
        category: {
            id: "1",
            name: "category 1",
            description: "category 1 description"
        }
    };
};
