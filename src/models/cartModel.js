import { Model, DataTypes } from 'sequelize';
import { TABLE_NAME_USERS } from './userModel.js';
import { TABLE_NAME_VARIATIONS } from './productVariationModel.js';

export const TABLE_NAME_CARTS = 'carts';

export class Cart extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: TABLE_NAME_CARTS,
            modelName: 'Cart',
            timestamps: true,
        };
    }
}

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
     productVariationId: {
        field: 'variation_id',
        allowNull: false,
        type: DataTypes.UUID, 
        references: {
            model: TABLE_NAME_VARIATIONS, 
            key: 'variation_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
    }
};