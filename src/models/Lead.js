const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [30, "Phone number is too long"],
      index: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [150, "Email is too long"],
    },

    message: {
      type: String,
      trim: true,
      maxlength: [2000, "Message is too long"],
    },

    status: {
      type: String,
      enum: ["New", "Contacted", "Converted", "Closed"],
      default: "New",
      index: true,
    },

    convertedToCustomer: {
      type: Boolean,
      default: false,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    externalLeadId: {
      type: String,
      trim: true,
      default: null,
    },

    platform: {
      type: String,
      trim: true,
      default: "Other",
    },

    rawData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same external lead from being inserted twice
leadSchema.index(
  { platform: 1, externalLeadId: 1 },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);