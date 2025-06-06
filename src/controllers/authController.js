// src/controllers/authController.js
import { AuthService } from "../services/authService.js";
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
    const { email, name } = req.body;
    const result = await authService.loginWithGoogle({ email, name });

    if (result.isNew || result.isVerified === false) {
      return res.status(200).json({
        message: result.message,
        data: {
          id: result.user.id,
          email: result.user.email,
          isVerified: result.user.isVerified
        }
      });
    }

    return res.status(200).json({
      message: result.message,
      data: {
        token: result.token,
        user: result.user
      }
    });
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
}

export default new AuthController();
