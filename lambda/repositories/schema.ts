export default {
    version: '0.1.0',
    format: 'onetable:1.0.0',
    indexes: {
        primary: {hash: 'pk', sort: 'sk'},
        gsi1: {hash: 'gsi1pk', sort: 'gsi1sk'},
        gsi2: {hash: 'gsi2pk', sort: 'gsi2sk'},
    },
    models: {
        Category: {
            pk: {type: String, value: 'category'},
            sk: {type: String, value: '${id}'},
            id: {type: String, required: true, unique: true},
            name: {type: String, required: true},
            description: {type: String, required: true},
        },
        Product: {
            pk: {type: String, value: 'product#${id}'},
            sk: {type: String, value: 'product#${id}'},
            id: {type: String, required: true, unique: true},
            name: {type: String, required: true},
            description: {type: String, required: true},
            price: {type: Number, required: true},
            currency: {type: String, required: true},
            weight: {type: Number, required: true},
            imageUrl: {type: String, required: true},
            category: {type: String, required: true},
            supplier: {type: String, required: true},
            gsi1pk: {type: String, value: '${category}'},
            gsi1sk: {type: String, value: '${id}'},
        }
    }
}
