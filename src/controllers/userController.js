import { UserService } from "../services/userService.js";
import { validationResult } from "express-validator";


  const userService = new UserService();

  class UserController {
 async createUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    try {
      const data = req.body;
      const user = await userService.create(data);

      user.password = undefined;

      res.status(201).json({
        message: "User baru berhasil dibuat oleh Admin",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message || "Gagal membuat user",
      });
    }
  }
        

    async getAllUsers(req, res) {
      try {
        const users = await userService.getAll();
        res.status(200).json({
          message: "Berhasil mengambil data semua user",
          data: users,
        });
      } catch (error) {
        res.status(500).json({
          message: error.message || "Gagal mengambil data user",
        });
      }
    }

     async searchUsers(req, res) {
        try {
            const { q } = req.query;
            const users = await userService.searchByName(q);

            res.status(200).json({
                message: "Hasil pencarian user",
                data: users
            });
        } catch (error) {
            res.status(500).json({
                message: error.message || "Gagal melakukan pencarian user",
            });
        }
    }

    // Mendapatkan user berdasarkan ID
    async getUserById(req, res) {
      try {
        const { id } = req.params;
        const user = await userService.getById(id);
        if (!user) {
          return res.status(404).json({
            message: `User dengan ID ${id} tidak ditemukan`,
          });
        }
        res.status(200).json({
          message: "Berhasil mengambil data user",
          data: user,
        });
      } catch (error) {
        res.status(500).json({
          message: error.message || "Gagal mengambil data user",
        });
      }
    }

    // Memperbarui user berdasarkan ID
    async updateUser(req, res) {
      try {
        const errors = validationResult(req);
         if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
          }
        const { id } = req.params;
        const data = req.body;
        const user = await userService.update(id, data);
        res.status(200).json({
          message: "Berhasil memperbarui data user",
          data: user,
        });
      } catch (error) {
        res.status(500).json({
          message: error.message || "Gagal memperbarui data user",
        });
      }
    }
    async updateProfile(req, res) {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
      }
    try {
      const userId = req.user.id; 
      const updatedUser = await userService.updateProfile(userId, req.body);
      
      res.status(200).json({
        message: "Profil berhasil diperbarui",
        data: updatedUser,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

    async updateProfilePicture(req, res) {
    const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() });
      }
    try {
      if (!req.file) {
        return res.status(400).json({ message: "File gambar tidak ditemukan." });
      }

      const userId = req.user.id;
      // Dapatkan path relatif yang bisa diakses publik
      const imagePath = req.file.path.replace(/\\/g, "/").replace("public/", "/");

      const updatedUser = await userService.updateProfile(userId, { image: imagePath });

      res.status(200).json({
        message: "Foto profil berhasil diperbarui",
        data: updatedUser,
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

   async getProfile(req, res) {
      try {
        const userId = req.user.id;
        const user = await userService.getById(userId);

        if (!user) {
          return res.status(404).json({ message: "User tidak ditemukan" });
        }
        
        user.password = undefined;
        user.otp = undefined;

        res.status(200).json({
          message: "Profil berhasil diambil",
          data: user,
        });
      } catch (error) {
        res.status(500).json({
          message: error.message || "Gagal mengambil data profil",
        });
      }
    }
   
    async deleteUser(req, res) {
      try {
        const { id } = req.params;
        await userService.delete(id);
        res.status(200).json({
          message: `User dengan ID ${id} berhasil dihapus`,
        });
      } catch (error) {
        res.status(500).json({
          message: error.message || "Gagal menghapus data user",
        });
      }
    }

    
  }
  

  export default new UserController();
