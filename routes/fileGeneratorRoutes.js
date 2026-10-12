const express = require("express");

const router = express.Router();

const { generateFiles } = require("../controllers/fileGeneratorController");

// File Generator
router.post("/", generateFiles);

module.exports = router;