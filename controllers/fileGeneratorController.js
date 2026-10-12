const fs = require("fs");
const path = require("path");

const fileConfig = require("../config/fileConfig");

const generateFiles = (req, res) => {
  // ------------------------------
  // GET INPUT VALUES
  // ------------------------------
  const outputPath = req.body.outputPath
    ? req.body.outputPath.trim()
    : "";

  const baseName = req.body.baseName
    ? req.body.baseName.trim()
    : "";

  const maxVersion = parseInt(req.body.maxVersion, 10);

  const edmUrl = req.body.edmUrl
    ? req.body.edmUrl.trim()
    : "";

  const client = req.body.client;

  // ------------------------------
  // VALIDATION
  // ------------------------------
  if (
    !outputPath ||
    !baseName ||
    isNaN(maxVersion) ||
    !edmUrl ||
    !client
  ) {
    return res.send("❌ Invalid input.");
  }

  // ------------------------------
  // GET CLIENT FILE CONFIG
  // ------------------------------
  const inputFiles = fileConfig[client];

  if (!inputFiles) {
    return res.send(
      "❌ No file structure found for client: " + client
    );
  }

  // ------------------------------
  // CHECK OUTPUT PATH
  // ------------------------------
  if (!fs.existsSync(outputPath)) {
    return res.send(
      `❌ Output path does not exist:<br>${outputPath}`
    );
  }

  const generatedLinks = [];

  // ------------------------------
  // LOOP VERSIONS
  // ------------------------------
  for (let i = 1; i <= maxVersion; i++) {

    // Generated folder will be created
    // inside the user-provided output path
    const folderPath = path.join(
      outputPath,
      i.toString()
    );

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, {
        recursive: true
      });
    }

    // ------------------------------
    // PROCESS FILES
    // ------------------------------
    inputFiles.forEach(file => {

      // SOURCE FILE
      // Always take template from project root /1 folder
      const sourceFile = path.join(
        __dirname,
        "..",
        "1",
        baseName + file
      );

      // NEW FILE NAME
      const newFileName =
        baseName + file.replace("-1", `-${i}`);

      // DESTINATION FILE
      const destinationFile = path.join(
        folderPath,
        newFileName
      );

      // ------------------------------
      // CHECK SOURCE FILE
      // ------------------------------
      if (fs.existsSync(sourceFile)) {

        let content = fs.readFileSync(
          sourceFile,
          "utf8"
        );

        // ------------------------------
        // REPLACE VERSION
        // ------------------------------
        content = content.replace(
          new RegExp(`${baseName}-1`, "g"),
          `${baseName}-${i}`
        );

        // ------------------------------
        // WRITE FILE
        // ------------------------------
        fs.writeFileSync(
          destinationFile,
          content
        );

        // ------------------------------
        // GENERATE EDM LINK
        // ------------------------------
        if (file.endsWith("-edm.html")) {

          const link =
            `${edmUrl.replace(/\/[^/]*$/, "/")}` +
            `${baseName}-${i}-edm.html`;

          generatedLinks.push(link);
        }
      }
    });
  }

  // ------------------------------
  // RESULT HTML
  // ------------------------------
  const html = `
    <style>
      body {
        font-family: Arial;
        padding: 20px;
      }

      .success {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        padding: 10px;
        margin-bottom: 20px;
      }

      ul {
        margin-top: 10px;
      }

      .output {
        background: #f5f5f5;
        padding: 10px;
        margin-bottom: 20px;
        border: 1px solid #ddd;
      }
    </style>

    <div class="success">
      ✅ <strong>${client.toUpperCase()}</strong>
      files generated for versions 1 → ${maxVersion}
    </div>

    <div class="output">
      <strong>Output Path:</strong><br>
      ${outputPath}
    </div>

    <ul>
      ${generatedLinks
        .map(
          link =>
            `<li>
              <a href="${link}" target="_blank">
                ${link}
              </a>
            </li>`
        )
        .join("")}
    </ul>

    <a href="/">← Go Back</a>
  `;

  res.send(html);
};

module.exports = {
  generateFiles
};