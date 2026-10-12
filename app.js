const express = require("express");
const path = require("path");

const fileGeneratorRoutes = require("./routes/fileGeneratorRoutes");
const pdfGeneratorRoutes = require("./routes/pdfGeneratorRoutes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/generate", fileGeneratorRoutes);
app.use("/download", pdfGeneratorRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});