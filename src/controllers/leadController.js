const Lead = require("../models/Lead");
const Customer = require("../models/Customer");

/*
  CREATE LEAD
  Used by website/ad lead forms and future Facebook/Instagram/WhatsApp integrations.
*/
const createLead = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      message,
      platform,
      externalLeadId,
      rawData,
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const cleanName = String(name).trim();
    const cleanPhone = String(phone).trim();
    const cleanEmail = email ? String(email).trim().toLowerCase() : undefined;

    // Prevent duplicate external leads
    if (platform && externalLeadId) {
      const existingLead = await Lead.findOne({
        platform: String(platform).trim(),
        externalLeadId: String(externalLeadId).trim(),
      });

      if (existingLead) {
        return res.status(200).json({
          success: true,
          duplicate: true,
          message: "Lead already exists",
          lead: existingLead,
        });
      }
    }

    const lead = await Lead.create({
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      message: message ? String(message).trim() : undefined,
      platform: platform ? String(platform).trim() : "Other",
      externalLeadId: externalLeadId
        ? String(externalLeadId).trim()
        : undefined,
      rawData: rawData || null,
    });

    return res.status(201).json({
      success: true,
      message: "Lead received successfully",
      lead,
    });
  } catch (error) {
    console.error("Create lead error:", error);

    if (error.code === 11000) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "Lead already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create lead",
    });
  }
};


/*
  GET ALL LEADS
*/
const getLeads = async (req, res) => {
  try {
    const leads = await Lead.find()
      .sort({ createdAt: -1 })
      .populate("customerId", "name phone email");

    return res.json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("Get leads error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch leads",
    });
  }
};


/*
  GET SINGLE LEAD
*/
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "customerId",
      "name phone email"
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error("Get lead error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid lead ID",
    });
  }
};


/*
  UPDATE LEAD
*/
const updateLead = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "email",
      "message",
      "status",
      "platform",
    ];

    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] =
          typeof req.body[field] === "string"
            ? req.body[field].trim()
            : req.body[field];
      }
    }

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase();
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error) {
    console.error("Update lead error:", error);

    return res.status(400).json({
      success: false,
      message: "Unable to update lead",
    });
  }
};


/*
  DELETE LEAD
*/
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    return res.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error) {
    console.error("Delete lead error:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid lead ID",
    });
  }
};


/*
  CONVERT LEAD → CUSTOMER

  If a customer with the same phone already exists,
  the existing customer is linked instead of creating another one.
*/
const convertLeadToCustomer = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    if (lead.convertedToCustomer && lead.customerId) {
      const existingCustomer = await Customer.findById(lead.customerId);

      return res.json({
        success: true,
        message: "Lead is already converted",
        customer: existingCustomer,
        lead,
      });
    }

    const existingCustomer = await Customer.findOne({
      phone: lead.phone,
    });

    let customer;

    if (existingCustomer) {
      customer = existingCustomer;
    } else {
      customer = await Customer.create({
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
      });
    }

    lead.convertedToCustomer = true;
    lead.customerId = customer._id;
    lead.status = "Converted";

    await lead.save();

    return res.json({
      success: true,
      message: "Lead converted to customer successfully",
      customer,
      lead,
    });
  } catch (error) {
    console.error("Convert lead error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to convert lead to customer",
    });
  }
};


module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  convertLeadToCustomer,
};