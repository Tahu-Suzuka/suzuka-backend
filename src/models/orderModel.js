// src/models/orderModel.js
import { Model, DataTypes } from 'sequelize';
import { TABLE_NAME_USERS } from './userModel.js';

const TABLE_NAME_ORDERS = 'orders';

class Order extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: TABLE_NAME_ORDERS,
            modelName: 'Order',
            timestamps: true,
            createdAt: 'orderDate', 
            updatedAt: 'updatedAt',
        };
    }
}

const OrderSchema = {
    id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        field: 'order_id',
    },
    userId: {
        field: 'user_id',
        allowNull: false,
        type: DataTypes.UUID,
        references: {
            model: TABLE_NAME_USERS,
            key: 'user_id',
        },
    },

    subtotal: {
        field: 'subtotal',
        allowNull: false,
        type: DataTypes.FLOAT,
    },
    shipPrice: {
        field: 'ship_price',
        allowNull: false,
        type: DataTypes.FLOAT,
    },

    discountAmount: {
        field: 'discount_amount',
        allowNull: false,
        type: DataTypes.FLOAT,
        defaultValue: 0,
    },
    voucherCode: {
        field: 'voucher_code',
        allowNull: true,
        type: DataTypes.STRING,
    },
    totalPayment: {
        field: 'total_payment',
        allowNull: false,
        type: DataTypes.FLOAT,
    },
    orderStatus: {
        field: 'order_status',
        allowNull: false,
        type: DataTypes.ENUM('Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'),
        defaultValue: 'Diproses',
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
};

export { Order, OrderSchema, TABLE_NAME_ORDERS };