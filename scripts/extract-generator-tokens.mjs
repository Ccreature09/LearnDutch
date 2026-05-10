import fs from "fs";
const s = fs.readFileSync("src/sentence-generation/generator.ts", "utf8");
const words = new Set();
function add(w) {
  if (!w || w.length < 2) return;
  if (/^[a-zA-Zàáâãäåæçèéêëìíîïñòóôõöùúûüýÿ'-]+$/i.test(w)) words.add(w.toLowerCase());
}
for (const key of ["dutch:", "dutchWant:", "dutchOmdat:"]) {
  const re = new RegExp(`\\b${key}\\s*"([^"]+)"`, "g");
  let m;
  while ((m = re.exec(s))) {
    m[1].split(/\s+/).forEach(add);
  }
}
console.log([...words].sort().join("\n"));
