import { Model, DataTypes } from 'sequelize';
import { TABLE_NAME_PRODUCTS } from './productModel.js';

const TABLE_NAME_VARIATIONS = 'product_variations';

class ProductVariation extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: TABLE_NAME_VARIATIONS,
      modelName: 'ProductVariation',
      timestamps: false,
    };
  }
}

const ProductVariationSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    field: 'variation_id',
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
  name: {
    field: 'variation_name',
    allowNull: false,
    type: DataTypes.STRING,
  },
  price: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
};

export { ProductVariation, ProductVariationSchema, TABLE_NAME_VARIATIONS };
