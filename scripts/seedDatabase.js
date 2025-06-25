import "../src/configs/database.js";
import { User } from "../src/models/userModel.js";
import { Category } from "../src/models/categoryModel.js";
import { Product } from "../src/models/productModel.js";
import { ProductVariation } from "../src/models/productVariationModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const categoryNames = ["Tahu Original", "Tahu Stik", "Tahu Varian Rasa", "Aneka Tahu Olahan"];
const productsWithVariations = [
  { productName: "Tahu Kuning", categoryName: "Tahu Original", description: "Tahu kuning legendaris dengan tekstur lembut.", variations: [ { name: "Kecil", price: 8000 }, { name: "Normal", price: 9000 }, { name: "Besar", price: 10000 }] },
  { productName: "Tahu Putih", categoryName: "Tahu Original", description: "Tahu putih segar, cocok untuk segala masakan.", variations: [ { name: "Kecil", price: 8000 }, { name: "Normal", price: 9000 }, { name: "Besar", price: 10000 }] },
  { productName: "Tahu Stik Kuning", categoryName: "Tahu Stik", description: "Camilan stik tahu kuning yang renyah.", variations: [{ name: "Normal", price: 8000 }] },
  { productName: "Tahu Stik Putih", categoryName: "Tahu Stik", description: "Camilan stik tahu putih yang gurih.", variations: [{ name: "Normal", price: 8000 }] },
  { productName: "Tahu Pedas", categoryName: "Tahu Varian Rasa", description: "Tahu dengan isian pedas menggugah selera.", variations: [{ name: "Normal", price: 8000 }] },
  { productName: "Tahu Hijau", categoryName: "Tahu Varian Rasa", description: "Tahu unik dengan ekstrak sayuran hijau.", variations: [{ name: "Normal", price: 8000 }] },
  { productName: "Kerupuk Tahu", categoryName: "Aneka Tahu Olahan", description: "Kerupuk renyah dari ampas tahu berkualitas.", variations: [ { name: "250gr", price: 10000 }, { name: "500gr", price: 20000 }] },
];

const seedDatabase = async () => {
  try {
    console.log("Memulai proses seeding database...");

    console.log("Mengecek dan membuat users...");
    const adminEmail = "suzukatahu@gmail.com";
    let adminUser = await User.findOne({ where: { email: adminEmail } });

    if (!adminUser) {
      const adminPassHash = await bcrypt.hash("tahusuzuka", 10);
      adminUser = await User.create({
        id: uuidv4(),
        name: "Admin",
        email: adminEmail,
        password: adminPassHash,
        role: "admin",
        isVerified: true,
      });
      console.log("Admin berhasil dibuat.");
    } else {
      console.log("Admin sudah ada.");
    }
    const adminId = adminUser.id;

    const userEmail = "jack@suzuka.com";
    let regularUser = await User.findOne({ where: { email: userEmail } });

    if (!regularUser) {
      const userPassHash = await bcrypt.hash("jack123456", 10);
      regularUser = await User.create({
        id: uuidv4(),
        name: "Jack Rochmat",
        email: userEmail,
        password: userPassHash,
        address: "Jl. Tahu No. 123, Bandung",
        phone: "081234567890",
        role: "user",
        isVerified: true,
      });
      console.log("User 'Jack Rochmat' berhasil dibuat.");
    } else {
      console.log("User 'Jack Rochmat' sudah ada.");
    }

    console.log("Membuat kategori...");

    const categoryPromises = categoryNames.map(name => Category.findOrCreate({ where: { category_name: name }, defaults: { id: uuidv4(), category_name: name } }));
    const createdCategories = await Promise.all(categoryPromises);
    const categoriesMap = new Map(createdCategories.map(([category]) => [category.category_name, category.id]));

    console.log("Membuat produk dan variasinya...");
    for (const productData of productsWithVariations) {
        const categoryId = categoriesMap.get(productData.categoryName);
        if(!categoryId) continue;

        const [product, created] = await Product.findOrCreate({
            where: { product_name: productData.productName },
            defaults: { id: uuidv4(), ...productData, categoryId, userId: adminId }
        });

        if(created){
            console.log(`- Produk '${product.product_name}' dibuat.`);
            const variationsToCreate = productData.variations.map(v => ({ ...v, id: uuidv4(), productId: product.id }));
            await ProductVariation.bulkCreate(variationsToCreate);
            console.log(`  - ${variationsToCreate.length} variasi ditambahkan.`);
        } else {
            console.log(`- Produk '${product.product_name}' sudah ada.`);
        }
    }

    console.log("\nProses seeding berhasil.");
  } catch (err) {
    console.error("\nError saat seeding:", err);
  } finally {
    process.exit();
  }
};

// Jalankan fungsi seeder
seedDatabase();