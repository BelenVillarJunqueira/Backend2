const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
token: { type: String, index: true },
expiresAt: Date,
used: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ResetToken', resetTokenSchema);