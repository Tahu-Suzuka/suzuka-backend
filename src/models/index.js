import { User, UserSchema } from "./userModel.js";
import { Product, ProductSchema } from "./productModel.js";
import { Category, CategorySchema } from "./categoryModel.js";
import { Order, OrderSchema } from "./orderModel.js";
import { OrderItem, OrderItemSchema } from "./orderItemModel.js";

const setupModels = (sequelize) => {    
    User.init(UserSchema, User.config(sequelize));
    Product.init(ProductSchema, Product.config(sequelize));
    Category.init(CategorySchema, Category.config(sequelize));
    Order.init(OrderSchema, Order.config(sequelize));
    OrderItem.init(OrderItemSchema, OrderItem.config(sequelize));

    Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
    Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

    User.hasMany(Product, { foreignKey: 'userId', as: 'products' });
    Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });

        // User -> Order
    User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
    Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Order -> OrderItem
    Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
    OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

    // Product -> OrderItem
    Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
    OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
}
export default setupModels;
