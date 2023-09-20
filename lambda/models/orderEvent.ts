import {OrderDetails} from "./order";

export type OrderEvent = {
    arguments: {
        order: {
            address: string;
            details: [OrderDetails]
        }
    }
    identity: {
        claims: {
            email: string;
        }
    }
}
