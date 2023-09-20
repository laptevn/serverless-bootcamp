import {Product} from "../models/product";
import {CategoryIdEvent} from "../models/category-id-event";
import {ProductRepository} from "../repositories/product-repository";
import {CategoryRepository} from "../repositories/category-repository";
import {SupplierRepository} from "../repositories/supplier-repository";

const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: CategoryIdEvent): Promise<Product[]> {
    return await productRepository.getProducts(event.arguments.categoryId);
};
