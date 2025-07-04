import { Model, DataTypes } from 'sequelize';

const TABLE_NAME_CATEGORIES = 'categories';

class Category extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: TABLE_NAME_CATEGORIES,
      modelName: 'Category',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
    };
  }
}

const CategorySchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.STRING,
    field: 'category_id',
  },
  category_name: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'category_image',
  },
};

export { Category, CategorySchema, TABLE_NAME_CATEGORIES };
