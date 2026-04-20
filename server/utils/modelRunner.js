const { spawn } = require("child_process");
const path      = require("path");
const fs        = require("fs");
const os        = require("os");
const { v4: uuidv4 } = require("uuid");

const SCRIPT_PATH = path.join(__dirname, "../ml/run_model.py");
const TMP_DIR     = os.tmpdir();

function runModel(inputBuffer) {
  return new Promise((resolve, reject) => {
    const id         = uuidv4();
    const inputPath  = path.join(TMP_DIR, `dedup_in_${id}.csv`);
    const outputPath = path.join(TMP_DIR, `dedup_out_${id}.csv`);

    fs.writeFileSync(inputPath, inputBuffer);

    const python = process.env.PYTHON_BIN ||
      (process.platform === "win32" ? "python" : "python3");

    const proc = spawn(python, [SCRIPT_PATH, inputPath, outputPath]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => (stdout += d.toString()));
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
      process.stdout.write(`[python] ${d}`);
    });

    proc.on("close", (code) => {
      try { fs.unlinkSync(inputPath); } catch (_) {}

      if (code !== 0) {
        try { fs.unlinkSync(outputPath); } catch (_) {}
        return reject(new Error(`Python model failed (exit ${code}): ${stderr.trim()}`));
      }

      // Last line of stdout is the JSON summary
      let summary = {};
      try {
        const jsonLine = stdout.trim().split("\n").pop();
        summary = JSON.parse(jsonLine);
      } catch (e) {
        return reject(new Error(`Could not parse model output: ${stdout}`));
      }

      let outputCsv = "";
      try {
        outputCsv = fs.readFileSync(outputPath, "utf8");
        fs.unlinkSync(outputPath);
      } catch (e) {
        return reject(new Error(`Could not read output CSV: ${e.message}`));
      }

      resolve({ outputCsv, ...summary });
    });

    proc.on("error", (err) => {
      try { fs.unlinkSync(inputPath); } catch (_) {}
      try { fs.unlinkSync(outputPath); } catch (_) {}
      reject(new Error(
        `Failed to start Python: ${err.message}.\n` +
        `Make sure Python is installed and on your PATH, or set PYTHON_BIN in server/.env`
      ));
    });
  });
}

module.exports = { runModel };
