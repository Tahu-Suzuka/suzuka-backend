import { Router } from 'express';
import CategoryController from '../controllers/categoryController.js';

const router = Router();

// Routes
router.post('/', CategoryController.createCategory);
router.get('/', CategoryController.getAllCategories);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: Tahu Goreng
 *     responses:
 *       201:
 *         description: Category created successfully.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Retrieve all categories
 *     responses:
 *       200:
 *         description: A list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   category_id:
 *                     type: string
 *                     example: 1
 *                   category_name:
 *                     type: string
 *                     example: Tahu Goreng
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Update a category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category_name:
 *                 type: string
 *                 example: Tahu Putih
 *     responses:
 *       200:
 *         description: Category updated successfully.
 *       404:
 *         description: Category not found.
 *       400:
 *         description: Bad request.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 1
 *     responses:
 *       200:
 *         description: Category deleted successfully.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Internal server error.
 */


export default router;
