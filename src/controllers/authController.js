// src/controllers/authController.js
import { AuthService } from "../services/authService.js";
import { validationResult } from 'express-validator';

const authService = new AuthService();

class AuthController {
  async register(req, res) {
    try {
      const user = await authService.register(req.body);
      res.status(201).json({ message: "Register berhasil", data: user });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async login(req, res) {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({ message: "Login berhasil", data: result });
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  }

async loginWithGoogle(req, res) {
    try {
      // Ambil data dari body, mungkin dari token google yang sudah di-decode di frontend
      const { email, name, googleId } = req.body; 
      const result = await authService.loginWithGoogle({ email, name, googleId });
      res.status(200).json({ message: "Login Google berhasil", data: result });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}


 async verifyOtp(req, res) {
    try {
      const result = await authService.verifyOtp(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
}

async resendOtp(req, res) {
  try {
    const { email } = req.body;
    const result = await authService.resendOtp(email);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const result = await authService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

     async changePassword(req, res) {
        try {
            // Ambil userId dari token yang sudah diverifikasi oleh middleware 'authenticate'
            const userId = req.user.id;
            const { oldPassword, newPassword } = req.body;

            await authService.changePassword({ userId, oldPassword, newPassword });

            res.status(200).json({ message: "Password berhasil diubah." });
        } catch (error) {
            // Jika password lama salah, service akan melempar error
            res.status(400).json({ message: error.message });
        }
    }
}

export default new AuthController();
