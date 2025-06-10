import { Model, DataTypes } from 'sequelize';
import { TABLE_NAME_USERS } from './userModel.js';
import { TABLE_NAME_PRODUCTS } from './productModel.js';

// Diubah dari TABLE_NAME_CART_ITEMS menjadi TABLE_NAME_CARTS
export const TABLE_NAME_CARTS = 'carts';

// Diubah dari CartItem menjadi Cart
export class Cart extends Model {
    static config(sequelize) {
        return {
            sequelize,
            // Diubah dari 'cart_items' menjadi 'carts'
            tableName: TABLE_NAME_CARTS,
            // Diubah dari 'CartItem' menjadi 'Cart'
            modelName: 'Cart',
            timestamps: true,
        };
    }
}

// Diubah dari CartItemSchema menjadi CartSchema
export const CartSchema = {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        field: 'cart_id',
    },
    quantity: {
        allowNull: false,
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    userId: {
        field: 'user_id',
        allowNull: false,
        type: DataTypes.UUID,
        references: {
            model: TABLE_NAME_USERS,
            key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
    productId: {
        field: 'product_id',
        allowNull: false,
        type: DataTypes.STRING,
        references: {
            model: TABLE_NAME_PRODUCTS,
            key: 'product_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    },
};