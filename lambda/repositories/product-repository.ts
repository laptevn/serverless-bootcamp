import DynamoDB from 'aws-sdk/clients/dynamodb';
import schema from './schema'
import {Entity, Table} from "dynamodb-onetable";
import {Product} from "../models/product";
import {CategoryRepository} from "./category-repository";
import {ProductEvent} from "../models/product-event";
import {SupplierRepository} from "./supplier-repository";

export class ProductRepository {
    private readonly productModel;

    constructor(private readonly categoryRepository: CategoryRepository,
                private readonly supplierRepository: SupplierRepository) {
        const client = new DynamoDB.DocumentClient({region: 'us-east-1'});
        const table = new Table({
            client: client,
            name: process.env.TABLE_NAME,
            schema: schema,
        });
        type ProductType = Entity<typeof schema.models.Product>;
        this.productModel = table.getModel<ProductType>('Product');
    }

    async getProducts(categoryId: string): Promise<Product[]> {
        const category = await this.categoryRepository.getCategory(categoryId);
        if (!category) {
            throw new Error("Category not found");
        }

        const result: Product[] = [];
        const products = await this.productModel.find({gsi1pk: categoryId}, {index: 'gsi1'});
        for (const product of products) {
            const supplier = await this.supplierRepository.getSupplier(product?.supplier as string);
            result.push({
                id: product.id as string,
                name: product.name as string,
                description: product.description as string,
                price: product.price as number,
                currency: product.currency as string,
                weight: product.weight as number,
                imageUrl: product.imageUrl as string,
                category: {
                    id: category.id,
                    name: category.name,
                    description: category.description
                },
                supplier: {
                    id: supplier.id,
                    name: supplier.name
                }
            })
        }
        return result;
    }

    async getProductsBySupplier(supplierId: string): Promise<Product[]> {
        const supplier = await this.supplierRepository.getSupplier(supplierId);
        if (!supplier) {
            throw new Error("Supplier not found");
        }

        const result: Product[] = [];
        const products = await this.productModel.find({gsi2pk: supplierId}, {index: 'gsi2'});
        for (const product of products) {
            const category = await this.categoryRepository.getCategory(product?.category as string);
            result.push({
                id: product.id as string,
                name: product.name as string,
                description: product.description as string,
                price: product.price as number,
                currency: product.currency as string,
                weight: product.weight as number,
                imageUrl: product.imageUrl as string,
                category: {
                    id: category.id,
                    name: category.name,
                    description: category.description
                },
                supplier: {
                    id: supplier.id,
                    name: supplier.name
                }
            })
        }
        return result;
    }

    async getProduct(productId: string): Promise<Product> {
        const product = await this.productModel.get({
            pk: 'product#' + productId,
            sk: 'product#' + productId
        });
        if (!product) {
            throw new Error("Product not found");
        }

        const category = await this.categoryRepository.getCategory(product.category as string);
        const supplier = await this.supplierRepository.getSupplier(product.supplier as string);
        return {
            id: product.id as string,
            name: product.name as string,
            description: product.description as string,
            price: product.price as number,
            currency: product.currency as string,
            weight: product.weight as number,
            imageUrl: product.imageUrl as string,
            category: {
                id: category.id,
                name: category.name,
                description: category.description
            },
            supplier: {
                id: supplier.id,
                name: supplier.name
            }
        }
    }

    async addProduct(event: ProductEvent): Promise<Product> {
        await this.productModel.create({
            id: event.arguments.product.id,
            name: event.arguments.product.name,
            description: event.arguments.product.description,
            price: event.arguments.product.price,
            currency: event.arguments.product.currency,
            weight: event.arguments.product.weight,
            imageUrl: event.arguments.product.imageUrl,
            supplier: event.arguments.product.supplier,
            category: event.arguments.product.category
        });
        return this.getProduct(event.arguments.product.id);
    }

    async updateProduct(event: ProductEvent): Promise<Product> {
        await this.productModel.update({
            id: event.arguments.product.id,
            name: event.arguments.product.name,
            description: event.arguments.product.description,
            price: event.arguments.product.price,
            currency: event.arguments.product.currency,
            weight: event.arguments.product.weight,
            imageUrl: event.arguments.product.imageUrl,
            supplier: event.arguments.product.supplier,
            category: event.arguments.product.category
        });
        return this.getProduct(event.arguments.product.id);
    }

    async removeProduct(id: string): Promise<void> {
        await this.productModel.remove({
            pk: 'product#' + id,
            sk: 'product#' + id
        });
    }
}
