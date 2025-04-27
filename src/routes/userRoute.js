import { Router } from 'express';
import UserController from '../controllers/userController.js';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Add a new user to the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's name.
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: User created successfully.
 */
router.post('/', UserController.createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Retrieve all user data from the system.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The user ID.
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: The user's name.
 *                     example: John Doe
 */
router.get('/', UserController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     description: Get a specific user from the system by their ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to retrieve.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: User data retrieved successfully.
 *       404:
 *         description: User not found.
 */
router.get('/:id', UserController.getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     description: Update the data of an existing user by their ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The new name of the user.
 *                 example: Jane Doe
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       404:
 *         description: User not found.
 */
router.put('/:id', UserController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Remove a user from the system by their ID.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       404:
 *         description: User not found.
 */
router.delete('/:id', UserController.deleteUser);

export default router;
