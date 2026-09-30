const express = require("express");
const mongoose = require("mongoose");
const Deal = require("../models/Deal");

const router = express.Router();

// =====================================================
// ADD DEAL
// POST /deals
// =====================================================

router.post("/", async (req, res) => {
  try {
    const deal = await Deal.create(req.body);

    res.status(201).json({
      success: true,
      message: "Deal created successfully",
      data: deal,
    });
  } catch (error) {
    console.error("Create Deal Error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// GET ALL DEALS
// GET /deals
//
// Optional:
// /deals?page=1&limit=10
// /deals?search=phone
// /deals?sortBy=createdAt&order=desc
// =====================================================

router.get("/", async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    const skip = (page - 1) * limit;

    // Search all String fields automatically
    const stringFields = Object.keys(Deal.schema.paths).filter(
      (field) => Deal.schema.paths[field].instance === "String"
    );

    const filter = {};

    if (search.trim() && stringFields.length > 0) {
      filter.$or = stringFields.map((field) => ({
        [field]: {
          $regex: search.trim(),
          $options: "i",
        },
      }));
    }

    const sortOrder = order.toLowerCase() === "asc" ? 1 : -1;

    const sort = {
      [sortBy]: sortOrder,
    };

    const [deals, total] = await Promise.all([
      Deal.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),

      Deal.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: deals,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get Deals Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// GET DEAL BY ID
// GET /deals/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Deal ID",
      });
    }

    const deal = await Deal.findById(id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    res.json({
      success: true,
      data: deal,
    });
  } catch (error) {
    console.error("Get Deal Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// UPDATE DEAL
// PUT /deals/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Deal ID",
      });
    }

    const deal = await Deal.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    res.json({
      success: true,
      message: "Deal updated successfully",
      data: deal,
    });
  } catch (error) {
    console.error("Update Deal Error:", error);

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// DELETE DEAL
// DELETE /deals/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Deal ID",
      });
    }

    const deal = await Deal.findByIdAndDelete(id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: "Deal not found",
      });
    }

    res.json({
      success: true,
      message: "Deal deleted successfully",
      data: deal,
    });
  } catch (error) {
    console.error("Delete Deal Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;