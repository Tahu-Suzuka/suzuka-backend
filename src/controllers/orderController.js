// src/controllers/orderController.js
import { OrderService } from "../services/orderService.js";
const orderService = new OrderService();
import { validationResult } from "express-validator";

class OrderController {
    
    async createOrder(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const userId = req.user.id;
            const newOrder = await orderService.createOrder(userId, req.body);
            res.status(201).json({ message: "Pesanan berhasil dibuat", data: newOrder });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async createOrderFromCart(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            const userId = req.user.id;
            const newOrder = await orderService.createOrderFromCart(userId, req.body);
            res.status(201).json({ message: "Pesanan berhasil dibuat dari keranjang", data: newOrder });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

     async createManualOrder(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        
        try {
            const newOrder = await orderService.createManualOrder(req.body);
            res.status(201).json({ message: "Pesanan manual berhasil dibuat", data: newOrder });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getUserOrders(req, res) {
        try {
            const userId = req.user.id;
            const orders = await orderService.getOrdersByUser(userId);
            res.status(200).json({
                message: "Berhasil mengambil riwayat pesanan",
                data: orders
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getSingleOrder(req, res) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const order = await orderService.getOrderDetails(id, userId);
            res.status(200).json({
                message: "Berhasil mengambil detail pesanan",
                data: order
            });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

       async updateOrderStatus(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updatedOrder = await orderService.updateOrderStatus(id, status);
            res.status(200).json({ message: `Status pesanan berhasil diubah menjadi ${status}`, data: updatedOrder });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async updateOrderStatusByUser(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        
        try {
            const userId = req.user.id;
            const { orderId } = req.params;
            const { status } = req.body;

            const updatedOrder = await orderService.updateOrderStatusByUser({ userId, orderId, status });

            res.status(200).json({
                message: `Pesanan berhasil diubah menjadi ${status}.`,
                data: updatedOrder
            });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async createMidtransTransaction(req, res) {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;
        
        const transactionToken = await orderService.createMidtransTransaction(orderId, userId);

        res.status(200).json({
            message: "Transaction token berhasil dibuat",
            token: transactionToken
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}    
  async handleMidtransNotification(req, res) {
        try {
            await orderService.handlePaymentNotification(req.body);
            res.status(200).json({ status: "ok", message: "Notification processed" });
        } catch (error) {
            res.status(500).json({ status: "error", message: error.message });
        }
    }

}

export default new OrderController();