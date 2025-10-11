import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

// Determine this script's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.argv[2] || "dev"; // e.g. "dev" or "prod"

switch (env) {
  case "dev":
    break;
  case "prod":
    break;
  default:
    throw new Error(`Unknown env: ${env}`);
}

const manifestTemplatePath = path.resolve(__dirname, "../manifest.template.xml");
const manifestOutPath = env === "dev"
  ? path.resolve(__dirname, "../manifest-local.xml")
  : path.resolve(__dirname, "../manifest.xml");


const xml = fs.readFileSync(manifestTemplatePath, "utf8");

const replacements = {
  dev: "https://localhost:3000/commands.html",
  prod: "https://word.projdocs.com/commands.html",
};

const updated = xml.replace(
  /https:\/\/word\.projdocs\.com\/commands\.html/g,
  replacements[env] || replacements.prod
);

fs.writeFileSync(manifestOutPath, updated, "utf8");
console.log(`✅ Generated manifest for ${env}: ${manifestOutPath}`);