const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new mongoose.Schema({
title: { type: String, required: true, unique: true, trim: true },
code: { type: String, required: true, unique: true, trim: true },
description: { type: String, default: "" },
price: { type: Number, required: true, min: 0 },
status: { type: Boolean, default: true },
stock: { type: Number, default: 0, min: 0 },
category: { type: String, default: "" },
thumbnails: { type: [String], default: [] },
image: { type: String, default: "" } 
}, { timestamps: true });

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.models.Product || mongoose.model("Product", productSchema);
