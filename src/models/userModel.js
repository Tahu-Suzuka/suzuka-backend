import { Model, DataTypes } from "sequelize";

const TABLE_NAME = "users";

class User extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: TABLE_NAME,
      modelName: "User",
      timestamps: false,
    };
  }
}

const UserSchema = {
  id: {
    type: DataTypes.UUID, // Gunakan UUID
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4, // Ini akan menghasilkan UUID otomatis jika tidak diberikan
    field: "user_id",
    allowNull: false,
  },
  name: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  password : {
    allowNull: false,
    type: DataTypes.STRING,
  },
  email: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.STRING
  },
  phone: {
    type: DataTypes.STRING
  },
  image: {
    type: DataTypes.STRING
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    allowNull: false
  },
  googleId: {
  type: DataTypes.STRING,
  unique: true,
  }

};

export { User, UserSchema };
