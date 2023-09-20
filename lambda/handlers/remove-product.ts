import {IdEvent} from "../models/id-event";
import {ProductRepository} from "../repositories/product-repository";
import {CategoryRepository} from "../repositories/category-repository";
import {SupplierRepository} from "../repositories/supplier-repository";

const productRepository = new ProductRepository(new CategoryRepository(), new SupplierRepository());

exports.handler = async function (event: IdEvent): Promise<boolean> {
    await productRepository.removeProduct(event.arguments.id);
    return true;
};
