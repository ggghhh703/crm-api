const express = require("express");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");

const router = express.Router();

// ==========================================
// ADD CUSTOMER
// ==========================================
router.post("/", async (req, res) => {
  try {
    const customer = await Customer.create(req.body);

    res.status(201).json(customer);
  } catch (error) {
    console.error("Create customer error:", error);

    // Duplicate key
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A customer with this value already exists",
      });
    }

    // Mongoose validation
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Customer validation failed",
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create customer",
    });
  }
});

// ==========================================
// GET ALL CUSTOMERS
// ==========================================
router.get("/", async (req, res) => {
  try {
    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .lean();

    // Keep array response for existing frontend
    res.json(customers);
  } catch (error) {
    console.error("Get customers error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load customers",
    });
  }
});

// ==========================================
// GET CUSTOMER BY ID
// ==========================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findById(id).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json(customer);
  } catch (error) {
    console.error("Get customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load customer",
    });
  }
});

// ==========================================
// UPDATE CUSTOMER
// ==========================================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    // Prevent accidental modification of MongoDB identity fields
    const updates = { ...req.body };

    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    const customer = await Customer.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json(customer);
  } catch (error) {
    console.error("Update customer error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A customer with this value already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Customer validation failed",
        errors: Object.values(error.errors).map(
          (item) => item.message
        ),
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update customer",
    });
  }
});

// ==========================================
// DELETE CUSTOMER
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error) {
    console.error("Delete customer error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete customer",
    });
  }
});

module.exports = router;