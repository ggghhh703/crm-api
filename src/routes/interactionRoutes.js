const express = require("express");
const mongoose = require("mongoose");
const Interaction = require("../models/Interaction");

const router = express.Router();

// CREATE interaction
router.post("/", async (req, res) => {
  try {
    const { customer, type, subject, notes, followUpDate, createdBy } = req.body;

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "Customer is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(customer)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Interaction type is required",
      });
    }

    const interaction = await Interaction.create({
      customer,
      type,
      subject: subject || "",
      notes: notes || "",
      followUpDate: followUpDate || null,
      createdBy: createdBy || "",
    });

    const populatedInteraction = await Interaction.findById(
      interaction._id
    ).populate("customer");

    res.status(201).json({
      success: true,
      message: "Interaction created successfully",
      data: populatedInteraction,
    });
  } catch (error) {
    console.error("Create interaction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create interaction",
    });
  }
});

// GET interactions
// Optional: ?customer=CUSTOMER_ID&type=Call
router.get("/", async (req, res) => {
  try {
    const { customer, type } = req.query;

    const filter = {};

    if (customer) {
      if (!mongoose.Types.ObjectId.isValid(customer)) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer ID",
        });
      }

      filter.customer = customer;
    }

    if (type) {
      filter.type = type;
    }

    const interactions = await Interaction.find(filter)
      .populate("customer")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      data: interactions,
      count: interactions.length,
    });
  } catch (error) {
    console.error("Get interactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load interactions",
    });
  }
});

// UPDATE interaction
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interaction ID",
      });
    }

    const allowedFields = [
      "type",
      "subject",
      "notes",
      "followUpDate",
      "createdBy",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const interaction = await Interaction.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).populate("customer");

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: "Interaction not found",
      });
    }

    res.json({
      success: true,
      message: "Interaction updated successfully",
      data: interaction,
    });
  } catch (error) {
    console.error("Update interaction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update interaction",
    });
  }
});

// DELETE interaction
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interaction ID",
      });
    }

    const interaction = await Interaction.findByIdAndDelete(id);

    if (!interaction) {
      return res.status(404).json({
        success: false,
        message: "Interaction not found",
      });
    }

    res.json({
      success: true,
      message: "Interaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete interaction error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete interaction",
    });
  }
});

module.exports = router;