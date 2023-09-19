import {IdEvent} from "../models/idEvent";
import {ProductRepository} from "../repositories/productRepository";
import {CategoryRepository} from "../repositories/categoryRepository";
import {SupplierRepository} from "../repositories/supplierRepository";

const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: IdEvent): Promise<boolean> {
    await productRepository.removeProduct(event.arguments.id);
    return true;
};
