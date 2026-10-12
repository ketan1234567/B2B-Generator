const fs = require("fs");
const path = require("path");
const axios = require("axios");

// =====================================
// DOWNLOAD PDF
// =====================================

async function downloadPDF(url, filePath) {
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",

    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/pdf,application/octet-stream"
    },

    maxRedirects: 5,
    timeout: 60000
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}


// =====================================
// RETRY LOGIC
// =====================================

async function downloadWithRetry(url, filePath) {

  for (let i = 0; i < 3; i++) {

    try {

      await downloadPDF(url, filePath);

      return;

    } catch (err) {

      console.log(`Retry ${i + 1} for ${url}`);

      if (i === 2) {
        throw err;
      }
    }
  }
}


// =====================================
// PDF GENERATOR CONTROLLER
// =====================================

const downloadPDFs = async (req, res) => {

  try {

    // ---------------------------------
    // Get data from UI
    // ---------------------------------

    const {
      urls,
      baseName,
      outputPath
    } = req.body;


    // ---------------------------------
    // Convert URLs into array
    // ---------------------------------

    const urlList = urls
      .split("\n")
      .map(u => u.trim())
      .filter(Boolean);

let successCount = 0;
let failedCount = 0;
const failedFiles = [];

    // ---------------------------------
    // Validate input
    // ---------------------------------

    if (
      !baseName ||
      !outputPath ||
      urlList.length === 0
    ) {

      return res
        .status(400)
        .send(
          "❌ Provide baseName, outputPath & URLs"
        );
    }


    // ---------------------------------
    // Check Output Path
    // ---------------------------------

    if (!fs.existsSync(outputPath)) {

      return res
        .status(400)
        .send(
          `❌ Output path does not exist:<br>${outputPath}`
        );
    }


    // ---------------------------------
    // Download PDFs
    // ---------------------------------

    for (let i = 0; i < urlList.length; i++) {

      const index = i + 1;


      // ---------------------------------
      // Folder Path
      // ---------------------------------

      const folder = path.join(
        outputPath,
        `${index}`
      );


      // ---------------------------------
      // Create folder ONLY if missing
      // ---------------------------------

      if (!fs.existsSync(folder)) {

        fs.mkdirSync(folder, {
          recursive: true
        });

        console.log(
          `Created folder: ${folder}`
        );

      } else {

        console.log(
          `Using existing folder: ${folder}`
        );
      }


      // ---------------------------------
      // PDF File Path
      // ---------------------------------

      const filePath = path.join(
        folder,
        `${baseName}-${index}.pdf`
      );


      // ---------------------------------
      // Prepare URL
      // ---------------------------------

      const url = urlList[i].startsWith("http")
        ? urlList[i]
        : `https://${urlList[i]}`;


      console.log(
        `Downloading: ${url}`
      );


      // ---------------------------------
      // Download with retry
      // ---------------------------------

      try {

        await downloadWithRetry(
          url,
          filePath
        );

        successCount++;

        console.log(
          `Saved: ${filePath}`
        );

      } catch (err) {

  failedCount++;

  failedFiles.push({
    index: index,
    url: url,
    error: err.message
  });

  console.error(
    `Failed: ${url}`,
    err.message
  );
      }
    }


    // ---------------------------------
    // Send response
    // ---------------------------------

res.send(`
  <html>
    <head>
      <title>PDF Download Report</title>

      <style>
        body {
          font-family: Arial;
          padding: 30px;
        }

        .report {
          padding: 20px;
          border: 1px solid #ddd;
          margin-bottom: 20px;
        }

        .success {
          color: green;
        }

        .failed {
          color: red;
        }
      </style>
    </head>

    <body>

      <h2>📄 PDF Download Report</h2>

      <div class="report">

        <p>
          📊 Total:
          <strong>${urlList.length}</strong>
        </p>

        <p class="success">
          ✅ Successful:
          <strong>${successCount}</strong>
        </p>

        <p class="failed">
          ❌ Failed:
          <strong>${failedCount}</strong>
        </p>

      </div>

      ${
        failedFiles.length > 0
          ? `
            <h3 class="failed">
              ❌ Failed PDFs
            </h3>

            <ul>
              ${failedFiles
                .map(
                  file => `
                    <li>
                      PDF ${file.index} -
                      ${file.url}
                      <br>
                      Error: ${file.error}
                    </li>
                  `
                )
                .join("")}
            </ul>
          `
          : `
            <h3 class="success">
              🎉 All PDFs downloaded successfully!
            </h3>
          `
      }

      <br>

      <a href="/">← Go Back</a>

    </body>
  </html>
`);

  } catch (error) {

    console.error(
      "PDF Generator Error:",
      error
    );

    res
      .status(500)
      .send(
        "❌ Something went wrong while downloading PDFs."
      );
  }
};


// =====================================
// EXPORT
// =====================================

module.exports = {
  downloadPDFs
};