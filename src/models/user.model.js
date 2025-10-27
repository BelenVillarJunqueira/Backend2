const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
first_name: { type: String, required: true },
last_name:  { type: String, required: true },
email:      { type: String, required: true, unique: true, lowercase: true, trim: true },
age:        { type: Number },
password:   { type: String, required: true },
cart:       { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
role:       { type: String, default: "user" },
createdAt:  { type: Date, default: () => new Date() }
}, { timestamps: true });



module.exports = mongoose.models.User || mongoose.model('User', userSchema);
