import {Product} from "../models/product";
import {ProductEvent} from "../models/product-event";
import {ProductRepository} from "../repositories/product-repository";
import {CategoryRepository} from "../repositories/category-repository";
import {SupplierRepository} from "../repositories/supplier-repository";

const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: ProductEvent): Promise<Product> {
    return productRepository.updateProduct(event);
};
