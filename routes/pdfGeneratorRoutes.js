const express = require("express");

const router = express.Router();

const pdfGeneratorController = require("../controllers/pdfGeneratorController");

// =====================================
// PDF GENERATOR
// =====================================

router.post("/", pdfGeneratorController.downloadPDFs);

module.exports = router;