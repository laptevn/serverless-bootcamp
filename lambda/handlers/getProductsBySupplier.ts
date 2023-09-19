import {Product} from "../models/product";
import {ProductRepository} from "../repositories/productRepository";
import {CategoryRepository} from "../repositories/categoryRepository";
import {SupplierRepository} from "../repositories/supplierRepository";
import {SupplierIdEvent} from "../models/supplierIdEvent";

const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: SupplierIdEvent): Promise<Product[]> {
    return await productRepository.getProductsBySupplier(event.arguments.supplierId);
};
