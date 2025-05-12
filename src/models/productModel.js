import { Model, DataTypes } from 'sequelize';

const TABLE_NAME = 'products';

class Product extends Model {
    static config(sequelize) {
        return {
            sequelize,
            tableName: TABLE_NAME,
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
    category: { 
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
    }
};

export { Product, ProductSchema };