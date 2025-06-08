import { Model, DataTypes } from 'sequelize';
import { TABLE_NAME_CATEGORIES } from './categoryModel.js';
import { TABLE_NAME_USERS } from './userModel.js';

const TABLE_NAME_PRODUCTS = 'products';

class Product extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: TABLE_NAME_PRODUCTS,
            modelName: 'Product',
            timestamps: true,
            createdAt: 'createdAt',
            updatedAt: false,
        }
    }
}

const ProductSchema = {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING,
        field: 'product_id',
    },
    product_name: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    description: {
        allowNull: false,
        type: DataTypes.STRING,
    },
    price: {
        allowNull: false,
        type: DataTypes.FLOAT,
    },
    image: {
        type: DataTypes.STRING
    },
        categoryId: {
        field: 'category_id',
        allowNull: false,
        type: DataTypes.STRING, 
        references: {
            model: TABLE_NAME_CATEGORIES, 
            key: 'category_id'  
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
        userId: {
        field: 'user_id',
        allowNull: false,
        type: DataTypes.UUID, 
        references: {
            model: TABLE_NAME_USERS,
            key: 'user_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
};

export { Product, ProductSchema, TABLE_NAME_PRODUCTS };
