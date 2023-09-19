import {Product} from "../models/product";
import {ProductEvent} from "../models/productEvent";
import {ProductRepository} from "../repositories/productRepository";
import {CategoryRepository} from "../repositories/categoryRepository";
import {SupplierRepository} from "../repositories/supplierRepository";

const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: ProductEvent): Promise<Product> {
    return await productRepository.addProduct(event);
};
