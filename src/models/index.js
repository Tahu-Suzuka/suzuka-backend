import { User, UserSchema } from "./userModel.js";
import { Product, ProductSchema } from "./productModel.js";
import { Category, CategorySchema } from "./categoryModel.js";

const setupModels = (sequelize) => {    
    User.init(UserSchema, User.config(sequelize));
    Product.init(ProductSchema, Product.config(sequelize));
    Category.init(CategorySchema, Category.config(sequelize));

    Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
    Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

    User.hasMany(Product, { foreignKey: 'userId', as: 'products' });
    Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });
}
export default setupModels;
