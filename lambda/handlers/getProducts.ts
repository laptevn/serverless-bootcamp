import {Product} from "../models/product";
import {CategoryIdEvent} from "../models/categoryIdEvent";
import {ProductRepository} from "../repositories/productRepository";
import {CategoryRepository} from "../repositories/categoryRepository";
import {SupplierRepository} from "../repositories/supplierRepository";

const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: CategoryIdEvent): Promise<Product[]> {
    return await productRepository.getProducts(event.arguments.categoryId);
};
