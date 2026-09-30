const express = require("express");

const {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertLeadToCustomer,
} = require("../controllers/leadController");

const router = express.Router();

router.post("/", createLead);

router.get("/", getLeads);

router.get("/:id", getLeadById);

router.put("/:id", updateLead);

router.delete("/:id", deleteLead);

router.post("/:id/convert", convertLeadToCustomer);

module.exports = router;