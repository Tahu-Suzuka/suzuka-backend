import { Model, DataTypes } from 'sequelize';
import { TABLE_NAME_USERS } from './userModel.js';
import { TABLE_NAME_PRODUCTS } from './productModel.js';
import { TABLE_NAME_ORDERS } from './orderModel.js';

const TABLE_NAME_REVIEWS = 'reviews';

class Review extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: TABLE_NAME_REVIEWS,
            modelName: 'Review',
            timestamps: true,
            createdAt: 'createdAt',
            updatedAt: false,
        };
    }
}

const ReviewSchema = {
    id:{ 
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        field: 'review_id',
    },
    rating: {
        allowNull: false,
        type: DataTypes.INTEGER,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        allowNull: true,
        type: DataTypes.TEXT
    },
    image1: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    image2: {
        type: DataTypes.STRING,
        allowNull: true,
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
    },
    productId: {
        field: 'product_id',
        allowNull: false,
        type: DataTypes.STRING,
        references: {
            model: TABLE_NAME_PRODUCTS,
            key: 'product_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    orderId: {
        field: 'order_id',
        allowNull: false,
        type: DataTypes.UUID,
        references: {
            model: TABLE_NAME_ORDERS,
            key: 'order_id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
}

export { Review, ReviewSchema, TABLE_NAME_REVIEWS };