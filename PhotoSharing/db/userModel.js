const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  first_name: { type: String },
  last_name: { type: String },
  location: { type: String },
  description: { type: String },
  occupation: { type: String },
  login_name: { type: String, unique: true, sparse: true },
  password: { type: String },
});

// Export the model using the singular name and check mongoose.models first
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
