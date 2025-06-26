import { CartService } from '../services/cartService.js';
import { validationResult } from 'express-validator';

const cartService = new CartService();

class CartController {
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCart(userId);
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Gagal mengambil data keranjang', error: error.message });
    }
  }

  async addItem(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const userId = req.user.id;
      const { items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        return res
          .status(400)
          .json({ message: 'Input harus berupa array "items" yang tidak kosong.' });
      }

      const newItems = await cartService.addItemToCart({ userId, items });
      res.status(201).json({ message: 'Item berhasil ditambahkan ke keranjang', data: newItems });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateItems(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const userId = req.user.id;
      const { items } = req.body; // items adalah array [{ productId, quantity }]

      await cartService.updateItemQuantity({ userId, items });

      res.status(200).json({ message: 'Keranjang berhasil diperbarui.' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeItem(req, res) {
    try {
      const userId = req.user.id;
      // Diubah dari cartItemId menjadi cartId
      const { id: cartId } = req.params;
      // Mengirim cartId ke service
      const result = await cartService.removeItemFromCart({ userId, cartId });
      res.status(200).json(result);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      const result = await cartService.clearCart(userId);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Gagal mengosongkan keranjang', error: error.message });
    }
  }
}

export default new CartController();
