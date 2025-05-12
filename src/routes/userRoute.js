import { Router } from 'express';
import UserController from '../controllers/userController.js';

const router = Router();

router.post('/', UserController.createUser);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

/**
 * @swagger
 * /users:
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


/**
 * @swagger
 * /users:
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


/**
 * @swagger
 * /users/{id}:
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


/**
 * @swagger
 * /users/{id}:
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


/**
 * @swagger
 * /users/{id}:
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


export default router;
