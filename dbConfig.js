// require("dotenv").config(); 

// const { Pool } = require("pg");

// const isProduction = process.env.NODE_ENV === "production"; // Check if we're in production

// // Connection string for local development
// const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

// // Pool configuration based on environment (production or development)
// const pool = new Pool({
//     connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
//     ssl: isProduction ? { rejectUnauthorized: false } : false // Use SSL in production (common for services like Heroku;
// });

// module.exports = { pool };

require("dotenv").config(); 

const { Pool } = require("pg");

// Check if we're in production
const isProduction = process.env.NODE_ENV === "production"; 

// Connection string for local development
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;

// Pool configuration based on environment (production or development)
const pool = new Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false // Use SSL in production (e.g., for Heroku)
});

module.exports = { pool };

