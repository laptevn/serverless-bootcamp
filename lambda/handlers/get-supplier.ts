import {IdEvent} from "../models/id-event";
import {SupplierRepository} from "../repositories/supplier-repository";
import {Supplier} from "../models/supplier";

const supplierRepository = new SupplierRepository();

exports.handler = async function (event: IdEvent): Promise<Supplier> {
    return supplierRepository.getSupplier(event.arguments.id);
};
