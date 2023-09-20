import {IdEvent} from "../models/id-event";
import {Product} from "../models/product";
import {ProductRepository} from "../repositories/product-repository";
import {CategoryRepository} from "../repositories/category-repository";
import {SupplierRepository} from "../repositories/supplier-repository";

const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: IdEvent): Promise<Product> {
    return productRepository.getProduct(event.arguments.id);
};
