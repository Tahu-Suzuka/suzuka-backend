  import { UserService } from "../services/userService.js";

  const userService = new UserService();

  class UserController {
    async createUser(req, res) {
      try {
        const data = req.body;
        const user = await userService.create(data);
        res.status(201).json({
          message: "Berhasil membuat user baru",
          data: user,
        });
      } catch (error) {
        res.status(500).json({
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

    // Menghapus user berdasarkan ID
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
