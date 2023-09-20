import {Product} from "../models/product";
import {ProductRepository} from "../repositories/product-repository";
import {CategoryRepository} from "../repositories/category-repository";
import {SupplierRepository} from "../repositories/supplier-repository";
import {SupplierIdEvent} from "../models/supplier-id-event";

const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: SupplierIdEvent): Promise<Product[]> {
    return await productRepository.getProductsBySupplier(event.arguments.supplierId);
};
