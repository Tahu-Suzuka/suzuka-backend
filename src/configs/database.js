import { config } from 'dotenv';
import { Sequelize } from 'sequelize';
import setupModels from '../models/index.js';

config();

const database = new Sequelize(
  process.env.MYSQL_DATABASE, // name database
  process.env.MYSQL_USER, // user database
  process.env.MYSQL_PASSWORD, // password database
  {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    port: process.env.MYSQL_PORT || 3306, 
  },
);

database.sync();

setupModels(database);

export default database;
