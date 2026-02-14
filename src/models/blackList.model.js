const mongoose = require("mongoose");

const tokenBlackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required to blacklist"],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 TTL INDEX (Auto delete after 3 days)
tokenBlackListSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 3 }
);

// ✅ CREATE MODEL
const tokenBlackModel = mongoose.model(
  "blacklist",
  tokenBlackListSchema
);

// ✅ EXPORT MODEL (NOT SCHEMA)
module.exports = tokenBlackModel;
