import {Supplier} from "../models/supplier";
import {SupplierRepository} from "../repositories/supplierRepository";

const supplierRepository = new SupplierRepository();

exports.handler = function(): Promise<Supplier[]> {
    return supplierRepository.getSuppliers();
};
