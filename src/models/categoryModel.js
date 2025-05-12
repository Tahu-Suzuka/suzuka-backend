import { Model, DataTypes } from 'sequelize';

const TABLE_NAME = 'categories';

class Category extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: TABLE_NAME,
            modelName: 'Category',
            timestamps: true,
            createdAt: 'createdAt',
            updatedAt: false,
        }
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
    }
};

export { Category, CategorySchema };