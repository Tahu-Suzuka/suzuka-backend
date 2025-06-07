import { Router } from 'express';
import ProductController from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import { validateAdmin } from '../middleware/validateAdmin.js';
import { uploadProduct } from '../middleware/upload.js'; // Impor uploadProduct

const router = Router();

// Terapkan middleware 'authenticate' dan 'validateAdmin' pada rute yang perlu diamankan
router.post('/', authenticate, validateAdmin, uploadProduct.single('product_image'), ProductController.createProduct);
router.put('/:id', authenticate, validateAdmin, uploadProduct.single('product_image'), ProductController.updateProduct);
router.delete('/:id', authenticate, validateAdmin, ProductController.deleteProduct);

// Rute GET biarkan publik (bisa diakses siapa saja)
router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);



/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: Add a new product to the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *                 description: The product's name.
 *                 example: Product A
 *               category:
 *                 type: string
 *                 description: The product's category.
 *                 example: Tahu Kuning
 *               description:
 *                 type: string
 *                 description: The product's description.
 *                 example: Tahu Kuning adalah produk tahu yang terkenal di Indonesia.
 *               price:
 *                 type: number
 *                 description: The product's price.
 *                 example: 10000
 *               image:
 *                 type: string
 *                 description: The product's image URL.
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Product created successfully.
 *       422:
 *         description: Validation error.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products in the system.
 *     responses:
 *       200:
 *         description: A list of products.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve a product's details using its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details retrieved successfully.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Modify the details of an existing product.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_name:
 *                 type: string
 *                 description: The product's name.
 *               category:
 *                 type: string
 *                 description: The product's category.
 *               description:
 *                 type: string
 *                 description: The product's description.
 *               price:
 *                 type: number
 *                 description: The product's price.
 *               image:
 *                 type: string
 *                 description: The product's image URL.
 *     responses:
 *       200:
 *         description: Product updated successfully.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Remove a product from the system using its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The product ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     description: Retrieve a list of products filtered by category.
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         description: The category name.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully.
 *       404:
 *         description: No products found for the category.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /products/name/{name}:
 *   get:
 *     summary: Get products by name
 *     description: Retrieve a list of products filtered by name.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         description: The product name.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully.
 *       404:
 *         description: No products found for the name.
 *       500:
 *         description: Internal server error.
 */


export default router;
