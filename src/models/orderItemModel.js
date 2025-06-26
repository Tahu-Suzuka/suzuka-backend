import { Model, DataTypes } from 'sequelize';
import { TABLE_NAME_ORDERS } from './orderModel.js';
import { TABLE_NAME_VARIATIONS } from './productVariationModel.js';

const TABLE_NAME_ORDER_ITEMS = 'order_items';

class OrderItem extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: TABLE_NAME_ORDER_ITEMS,
      modelName: 'OrderItem',
      timestamps: false,
    };
  }
}

const OrderItemSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    field: 'order_item_id',
  },
  orderId: {
    field: 'order_id',
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: TABLE_NAME_ORDERS,
      key: 'order_id',
    },
  },
  productVariationId: {
    field: 'variation_id',
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: TABLE_NAME_VARIATIONS,
      key: 'variation_id',
    },
  },
  quantity: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  price: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
};

export { OrderItem, OrderItemSchema, TABLE_NAME_ORDER_ITEMS };
