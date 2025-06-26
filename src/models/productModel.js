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
    };
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
  mainImage: {
    field: 'main_image',
    type: DataTypes.STRING,
    allowNull: true,
  },
  additionalImage1: {
    field: 'additional_image_1',
    type: DataTypes.STRING,
    allowNull: true,
  },
  additionalImage2: {
    field: 'additional_image_2',
    type: DataTypes.STRING,
    allowNull: true,
  },
  additionalImage3: {
    field: 'additional_image_3',
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryId: {
    field: 'category_id',
    allowNull: false,
    type: DataTypes.STRING,
    references: {
      model: TABLE_NAME_CATEGORIES,
      key: 'category_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
};

export { Product, ProductSchema, TABLE_NAME_PRODUCTS };
