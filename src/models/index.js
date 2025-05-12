import { User, UserSchema } from "./userModel.js";
import { Product, ProductSchema } from "./productModel.js";
import { Category, CategorySchema } from "./categoryModel.js";

const setupModels = (sequelize) => {    
    User.init(UserSchema, User.config(sequelize));
    Product.init(ProductSchema, Product.config(sequelize));
    Category.init(CategorySchema, Category.config(sequelize));
}
export default setupModels;
