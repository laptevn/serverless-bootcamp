import {IdEvent} from "../models/idEvent";
import {SupplierRepository} from "../repositories/supplierRepository";
import {Supplier} from "../models/supplier";

const supplierRepository = new SupplierRepository();

exports.handler = async function (event: IdEvent): Promise<Supplier> {
    return supplierRepository.getSupplier(event.arguments.id);
};
