import {Supplier} from "../models/supplier";
import {SupplierRepository} from "../repositories/supplier-repository";

const supplierRepository = new SupplierRepository();

exports.handler = function(): Promise<Supplier[]> {
    return supplierRepository.getSuppliers();
};
