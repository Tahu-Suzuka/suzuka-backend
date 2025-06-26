import { User, UserSchema } from './userModel.js';
import { Product, ProductSchema } from './productModel.js';
import { Category, CategorySchema } from './categoryModel.js';
import { Order, OrderSchema } from './orderModel.js';
import { OrderItem, OrderItemSchema } from './orderItemModel.js';
import { Cart, CartSchema } from './cartModel.js';
import { Voucher, VoucherSchema } from './voucherModel.js';
import { Review, ReviewSchema } from './reviewModel.js';
import { ProductVariation, ProductVariationSchema } from './productVariationModel.js';

const setupModels = (sequelize) => {
  User.init(UserSchema, User.config(sequelize));
  Product.init(ProductSchema, Product.config(sequelize));
  Category.init(CategorySchema, Category.config(sequelize));
  Order.init(OrderSchema, Order.config(sequelize));
  OrderItem.init(OrderItemSchema, OrderItem.config(sequelize));
  Cart.init(CartSchema, Cart.config(sequelize));
  Voucher.init(VoucherSchema, Voucher.config(sequelize));
  Review.init(ReviewSchema, Review.config(sequelize));
  ProductVariation.init(ProductVariationSchema, ProductVariation.config(sequelize));

  // Category punya banyak Product
  Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
  Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

  // User -> Product
  // User (admin) punya banyak Product
  User.hasMany(Product, { foreignKey: 'userId', as: 'products' });
  Product.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User -> Order
  // User (pelanggan) punya banyak Order
  User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Order -> OrderItem
  // Order punya banyak OrderItem
  Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
  OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

  // Product -> OrderItem
  // Product punya banyak OrderItem
  Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
  OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  // User -> Cart
  // User (pelanggan) punya banyak Cart
  User.hasMany(Cart, { foreignKey: 'userId', as: 'cartItems' });
  Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Product -> Cart
  // Product punya banyak Cart
  // Cart berisi banyak produk
  Product.hasMany(Cart, { foreignKey: 'productId', as: 'cartItems' });
  Cart.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  // User -> Voucher
  // User (pelanggan) punya banyak Voucher
  User.hasMany(Voucher, { foreignKey: 'userId', as: 'vouchers' });
  Voucher.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User punya banyak review
  // User (pelanggan) bisa memberikan banyak review
  User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
  Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Product punya banyak review
  // Produk bisa memiliki banyak review
  Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
  Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  // Order punya banyak review
  // Pelanggan bisa memberikan review pada order yang telah selesai
  Order.hasMany(Review, { foreignKey: 'orderId', as: 'reviews' });
  Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

  Product.hasMany(ProductVariation, { foreignKey: 'productId', as: 'variations' });
  ProductVariation.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

  ProductVariation.hasMany(Cart, { as: 'cartItems', foreignKey: 'productVariationId' });
  Cart.belongsTo(ProductVariation, { as: 'variation', foreignKey: 'productVariationId' });

  ProductVariation.hasMany(OrderItem, { as: 'orderItems', foreignKey: 'productVariationId' });
  OrderItem.belongsTo(ProductVariation, { as: 'variation', foreignKey: 'productVariationId' });
};
export default setupModels;
