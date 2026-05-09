import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pkg = require("../package.json");

export default (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "public, max-age=300");

  const name = pkg.name || "";
  res.json({
    app_name:    name.charAt(0).toUpperCase() + name.slice(1),
    app_version: pkg.version || "",
  });
};