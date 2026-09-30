const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer is required"],
      index: true,
    },

    type: {
      type: String,
      enum: {
        values: ["Call", "WhatsApp", "Email", "Note"],
        message: "Invalid interaction type",
      },
      required: [true, "Interaction type is required"],
      index: true,
    },

    subject: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    followUpDate: {
      type: Date,
      default: null,
      index: true,
    },

    createdBy: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Fast customer timeline queries
interactionSchema.index({ customer: 1, createdAt: -1 });

// Fast follow-up queries
interactionSchema.index({ followUpDate: 1, customer: 1 });

module.exports = mongoose.model("Interaction", interactionSchema);