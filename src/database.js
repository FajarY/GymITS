const dotenv = require('dotenv');
const knex = require('knex')
dotenv.config();

const pg = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  },
});

const customer = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.POSTGRES_CUSTOMER,
    password: process.env.POSTGRES_CUSTOMER_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
});

const trainer = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.POSTGRES_TRAINER,
    password: process.env.POSTGRES_TRAINER_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
});

const admin = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.POSTGRES_ADMIN,
    password: process.env.POSTGRES_ADMIN_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
});

module.exports = {
  pg, 
  customer,
  trainer,
  admin
};