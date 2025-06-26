import { Model, DataTypes } from 'sequelize';
import { TABLE_NAME_USERS } from './userModel.js';

const TABLE_NAME_VOUCHERS = 'vouchers';

class Voucher extends Model {
  static config(sequelize) {
    return {
      sequelize,
      tableName: TABLE_NAME_VOUCHERS,
      modelName: 'Voucher',
      timestamps: true,
    };
  }
}

const VoucherSchema = {
  id: {
    allowNull: false,
    primaryKey: true,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    field: 'voucher_id',
  },
  code: {
    allowNull: false,
    type: DataTypes.STRING,
    unique: true,
  },
  description: {
    allowNull: false,
    type: DataTypes.STRING,
  },
  type: {
    allowNull: false,
    type: DataTypes.ENUM('POTONGAN_HARGA', 'PERSENTASE', 'POTONGAN_ONGKIR'),
  },
  value: {
    allowNull: false,
    type: DataTypes.FLOAT,
  },
  maxDiscount: {
    allowNull: true,
    type: DataTypes.FLOAT,
  },
  minPurchase: {
    allowNull: false,
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  validFrom: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  validUntil: {
    allowNull: false,
    type: DataTypes.DATE,
  },
  usageLimit: {
    allowNull: false,
    type: DataTypes.INTEGER,
  },
  usageCount: {
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isActive: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  userId: {
    field: 'user_id',
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: TABLE_NAME_USERS,
      key: 'user_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
};

export { Voucher, VoucherSchema, TABLE_NAME_VOUCHERS };
