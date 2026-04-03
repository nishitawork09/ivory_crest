const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  img: String,
  title: String,
  desc: String,
  price: Number,
  capacity: Number,
});

module.exports = mongoose.model("Room", roomSchema);