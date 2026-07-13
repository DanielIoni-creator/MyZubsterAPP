// models/index.js
const mongoose = require('mongoose');
const Order = require('./Order');

const db = {
  mongoose,
  Order
};

module.exports = db;