// node art.js '<json [[name,[hl...]],...]>' -> JSON array of SVG strings with "hl" class added
const fs = require("fs");
let src = fs.readFileSync(require("path").join(__dirname, "../../anatomegaly/art.js"), "utf8");
src = src.replace("window.LBL_CAP = CAP;", "window.LBL_CAP = CAP; window.__ART = ART;");
const window = {};
eval(src);
const req = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const out = req.map(([name, hl]) => {
  const f = window.__ART[name];
  if (!f) throw new Error("no art " + name);
  let s = f();
  const set = new Set(hl || []);
  let hits = 0;
  s = s.replace(/data-p="([^"]*)" class="([^"]*)"/g, (m, ids, cls) => {
    if (ids.split(" ").some((x) => set.has(x))) { hits++; return 'data-p="' + ids + '" class="' + cls + ' hl"'; }
    return m;
  });
  if (set.size && !hits) throw new Error("no hl hit " + name + " " + [...set]);
  return { svg: s, cap: window.LBL_CAP[name] };
});
process.stdout.write(JSON.stringify(out));
