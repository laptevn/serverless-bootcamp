import {IdEvent} from "../models/idEvent";
import {Product} from "../models/product";
import {ProductRepository} from "../repositories/productRepository";
import {CategoryRepository} from "../repositories/categoryRepository";
import {SupplierRepository} from "../repositories/supplierRepository";

const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: IdEvent): Promise<Product> {
    return productRepository.getProduct(event.arguments.id);
};
