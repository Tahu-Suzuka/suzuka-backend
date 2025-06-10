// scripts/seedDatabase.js
import "../src/configs/database.js"; // Inisialisasi koneksi database
import { User } from "../src/models/userModel.js";
import { Category } from "../src/models/categoryModel.js";
import { Product } from "../src/models/productModel.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

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
        role: "user",
        isVerified: true,
      });
      console.log("User 'Jack Rochmat' berhasil dibuat.");
    } else {
      console.log("User 'Jack Rochmat' sudah ada.");
    }

    // =================================================================
    // 2. BUAT KATEGORI
    // =================================================================
    console.log("Membuat kategori...");
    // --- PERUBAHAN STRUKTUR KATEGORI ---
    const categoryNames = [
      "Tahu Kuning",
      "Tahu Putih",
      "Tahu Stik",
      "Tahu Varian Rasa", // Untuk Tahu Pedas & Tahu Hijau
      "Aneka Tahu Olahan", // Untuk Kerupuk Tahu
    ];

    const categoryPromises = categoryNames.map((name) => {
      return Category.findOrCreate({
        where: { category_name: name },
        defaults: { id: uuidv4(), category_name: name },
      });
    });

    const createdCategoriesResult = await Promise.all(categoryPromises);
    const categoriesMap = new Map();
    createdCategoriesResult.forEach(([category, created]) => {
      categoriesMap.set(category.category_name, category.id);
      if (created) {
        console.log(`- Kategori '${category.category_name}' berhasil dibuat.`);
      } else {
        console.log(`- Kategori '${category.category_name}' sudah ada.`);
      }
    });

    // =================================================================
    // 3. BUAT PRODUK
    // =================================================================
    console.log("Membuat produk...");
    // --- PERUBAHAN STRUKTUR PRODUK ---
    const productsData = [
      // Tahu Kuning
      { name: "Tahu Kuning 9x9", category: "Tahu Kuning", price: 12000 },
      { name: "Tahu Kuning 9x10", category: "Tahu Kuning", price: 13000 },
      { name: "Tahu Kuning 10x11", category: "Tahu Kuning", price: 14000 },
      // Tahu Putih
      { name: "Tahu Putih 9x9", category: "Tahu Putih", price: 11000 },
      { name: "Tahu Putih 9x10", category: "Tahu Putih", price: 12000 },
      { name: "Tahu Putih 10x11", category: "Tahu Putih", price: 13000 },
      // Tahu Stik
      { name: "Tahu Stik Putih", category: "Tahu Stik", price: 15000 },
      { name: "Tahu Stik Kuning", category: "Tahu Stik", price: 16000 },
      // Tahu Varian Rasa
      { name: "Tahu Pedas", category: "Tahu Varian Rasa", price: 17000 },
      { name: "Tahu Hijau", category: "Tahu Varian Rasa", price: 15000 },
      // Aneka Tahu Olahan
      { name: "Kerupuk Tahu", category: "Aneka Tahu Olahan", price: 10000 },
    ];

    const productPromises = productsData.map((prod) => {
      const categoryId = categoriesMap.get(prod.category);
      if (!categoryId) {
        console.warn(`Peringatan: Kategori '${prod.category}' untuk produk '${prod.name}' tidak ditemukan. Dilewati.`);
        return Promise.resolve(null);
      }
      return Product.findOrCreate({
        where: { product_name: prod.name },
        defaults: {
          id: uuidv4(),
          product_name: prod.name,
          description: `Deskripsi lengkap untuk ${prod.name}, dibuat dari bahan berkualitas terbaik.`,
          price: prod.price,
          image: "https://via.placeholder.com/150",
          categoryId: categoryId,
          userId: adminId,
        },
      });
    });

    const createdProductsResult = await Promise.all(productPromises);
    createdProductsResult.forEach((result) => {
      if (result) {
        const [product, created] = result;
        if (created) {
          console.log(`- Produk '${product.product_name}' berhasil dibuat.`);
        } else {
          console.log(`- Produk '${product.product_name}' sudah ada.`);
        }
      }
    });

    console.log("\nProses seeding database berhasil diselesaikan.");
  } catch (err) {
    console.error("\nTerjadi kesalahan saat proses seeding:", err.message);
  } finally {
    console.log("Keluar dari skrip.");
    process.exit();
  }
};

// Jalankan fungsi seeder
seedDatabase();