const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
  visitedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Visitor", visitorSchema);
