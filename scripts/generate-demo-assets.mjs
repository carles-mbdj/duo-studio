#!/usr/bin/env node
/**
 * Génère les visuels de démonstration dans public/demo/ :
 *  - une image SVG pour chaque chemin /demo/... référencé dans le frontmatter des projets
 *    (cover + gallery), aux couleurs de la catégorie ;
 *  - les portraits placeholder des deux profils ;
 *  - un CV d'exemple au format PDF.
 *
 * Usage : npm run demo:assets
 * Les fichiers existants sont régénérés. Les images ne sont que des placeholders :
 * remplacez-les par vos vraies images (même chemin, ou modifiez le frontmatter).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, "public");
const PROJECTS_DIR = path.join(ROOT, "content", "projets");
const W = 1600;
const H = 1000;

const palettes = {
  dev: { label: "DEV & DATA", stops: ["#1e1b4b", "#3730a3", "#4f46e5", "#818cf8"], ink: "#e0e7ff" },
  architecture: {
    label: "ARCHITECTURE",
    stops: ["#431407", "#7c2d12", "#c2410c", "#fdba74"],
    ink: "#ffedd5",
  },
};

/* --------------------------------------------------------------------------- */

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/** Générateur pseudo-aléatoire déterministe (mêmes images à chaque exécution). */
function seededRandom(seedText) {
  let seed = 0;
  for (const char of seedText) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

/** Coupe un texte en lignes d'environ `max` caractères. */
function wrap(text, max) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

/* --------------------------------------------------------------------------- *
 * Motifs
 * --------------------------------------------------------------------------- */

function devMotif(variant, rand, ink) {
  const parts = [];
  if (variant === 0) {
    // Tableau de bord : barres + courbe
    const baseY = 760;
    for (let i = 0; i < 12; i++) {
      const h = 120 + rand() * 360;
      parts.push(
        `<rect x="${860 + i * 54}" y="${baseY - h}" width="34" height="${h}" rx="6" fill="${ink}" opacity="${0.18 + rand() * 0.25}"/>`,
      );
    }
    let d = `M 860 ${520 - rand() * 80}`;
    for (let i = 1; i <= 12; i++) d += ` L ${860 + i * 54} ${300 + rand() * 260}`;
    parts.push(
      `<path d="${d}" fill="none" stroke="${ink}" stroke-width="5" stroke-linejoin="round" opacity="0.85"/>`,
    );
    parts.push(
      `<line x1="840" y1="${baseY + 2}" x2="1520" y2="${baseY + 2}" stroke="${ink}" stroke-width="2" opacity="0.4"/>`,
    );
  } else if (variant === 1) {
    // Éditeur de code
    parts.push(
      `<rect x="840" y="180" width="660" height="620" rx="24" fill="#000" opacity="0.25"/>`,
    );
    parts.push(
      [0, 1, 2]
        .map((i) => `<circle cx="${880 + i * 28}" cy="216" r="8" fill="${ink}" opacity="0.5"/>`)
        .join(""),
    );
    for (let i = 0; i < 14; i++) {
      const indent = [0, 1, 1, 2, 2, 1, 0][Math.floor(rand() * 7)] * 40;
      const w = 120 + rand() * 340;
      parts.push(
        `<rect x="${880 + indent}" y="${260 + i * 36}" width="${w}" height="14" rx="7" fill="${ink}" opacity="${0.2 + rand() * 0.45}"/>`,
      );
    }
  } else {
    // Graphe de points (nuage + régression)
    for (let i = 0; i < 70; i++) {
      const x = 860 + rand() * 640;
      const y = 760 - (x - 860) * 0.7 - rand() * 160 + 80;
      parts.push(
        `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${4 + rand() * 7}" fill="${ink}" opacity="${0.25 + rand() * 0.5}"/>`,
      );
    }
    parts.push(
      `<line x1="860" y1="800" x2="1500" y2="350" stroke="${ink}" stroke-width="4" stroke-dasharray="14 10" opacity="0.8"/>`,
    );
  }
  return parts.join("");
}

function architectureMotif(variant, rand, ink) {
  const parts = [];
  const stroke = `stroke="${ink}" fill="none" stroke-linecap="square"`;
  if (variant === 0) {
    // Plan de niveau
    const x = 860;
    const y = 200;
    parts.push(
      `<rect x="${x}" y="${y}" width="620" height="560" ${stroke} stroke-width="10" opacity="0.85"/>`,
    );
    const split = 300 + rand() * 80;
    parts.push(
      `<line x1="${x + split}" y1="${y}" x2="${x + split}" y2="${y + 330}" ${stroke} stroke-width="6" opacity="0.7"/>`,
    );
    parts.push(
      `<line x1="${x}" y1="${y + 330}" x2="${x + 620}" y2="${y + 330}" ${stroke} stroke-width="6" opacity="0.7"/>`,
    );
    parts.push(
      `<line x1="${x + 420}" y1="${y + 330}" x2="${x + 420}" y2="${y + 560}" ${stroke} stroke-width="6" opacity="0.7"/>`,
    );
    // portes (arcs)
    parts.push(
      `<path d="M ${x + split} ${y + 240} a 70 70 0 0 1 70 70" ${stroke} stroke-width="3" opacity="0.6"/>`,
    );
    parts.push(
      `<path d="M ${x + 140} ${y + 330} a 70 70 0 0 0 70 70" ${stroke} stroke-width="3" opacity="0.6"/>`,
    );
    // cotes
    parts.push(
      `<line x1="${x}" y1="${y - 40}" x2="${x + 620}" y2="${y - 40}" ${stroke} stroke-width="2" opacity="0.5"/>`,
    );
    parts.push(
      `<text x="${x + 310}" y="${y - 52}" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="${ink}" opacity="0.7">12,40 m</text>`,
    );
  } else if (variant === 1) {
    // Façade de maison
    const x = 880;
    const base = 780;
    parts.push(
      `<line x1="820" y1="${base}" x2="1540" y2="${base}" ${stroke} stroke-width="4" opacity="0.6"/>`,
    );
    parts.push(
      `<path d="M ${x} ${base} V 470 L ${x + 300} 270 L ${x + 600} 470 V ${base} Z" ${stroke} stroke-width="8" opacity="0.85"/>`,
    );
    parts.push(
      `<rect x="${x + 250}" y="${base - 200}" width="100" height="200" ${stroke} stroke-width="5" opacity="0.7"/>`,
    );
    for (const wx of [x + 70, x + 430]) {
      parts.push(
        `<rect x="${wx}" y="${base - 230}" width="100" height="110" ${stroke} stroke-width="5" opacity="0.7"/>`,
      );
      parts.push(
        `<rect x="${wx}" y="500" width="100" height="90" ${stroke} stroke-width="5" opacity="0.7"/>`,
      );
    }
  } else {
    // Coupe / structure
    for (let i = 0; i < 6; i++) {
      parts.push(
        `<line x1="${880 + i * 120}" y1="240" x2="${880 + i * 120}" y2="760" ${stroke} stroke-width="3" opacity="${0.3 + rand() * 0.3}"/>`,
      );
    }
    for (let i = 0; i < 4; i++) {
      parts.push(
        `<line x1="860" y1="${280 + i * 160}" x2="1500" y2="${280 + i * 160}" ${stroke} stroke-width="${i === 3 ? 10 : 6}" opacity="0.75"/>`,
      );
    }
    parts.push(
      `<path d="M 860 280 L 1180 160 L 1500 280" ${stroke} stroke-width="8" opacity="0.85"/>`,
    );
    for (let i = 0; i < 9; i++) {
      parts.push(
        `<line x1="${880 + i * 70}" y1="760" x2="${850 + i * 70}" y2="800" ${stroke} stroke-width="2" opacity="0.5"/>`,
      );
    }
  }
  return parts.join("");
}

/* --------------------------------------------------------------------------- */

function projectSvg({ title, subtitle, category, index, seed }) {
  const palette = palettes[category];
  const rand = seededRandom(seed);
  const variant = (index + Math.floor(rand() * 3)) % 3;
  const angle = 20 + Math.round(rand() * 50);
  const [s0, s1, s2, s3] = palette.stops;
  const titleLines = wrap(title, 18);
  const subtitleLines = subtitle ? wrap(subtitle, 38) : [];
  const motif =
    category === "dev"
      ? devMotif(variant, rand, palette.ink)
      : architectureMotif(variant, rand, palette.ink);
  const grid =
    category === "architecture"
      ? `<pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="${palette.ink}" stroke-width="1" opacity="0.08"/></pattern><rect width="${W}" height="${H}" fill="url(#g)"/>`
      : `<pattern id="g" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="${palette.ink}" opacity="0.12"/></pattern><rect width="${W}" height="${H}" fill="url(#g)"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeXml(title)}">
<defs>
<linearGradient id="bg" gradientTransform="rotate(${angle} .5 .5)">
<stop offset="0" stop-color="${s0}"/><stop offset=".45" stop-color="${s1}"/><stop offset=".8" stop-color="${s2}"/><stop offset="1" stop-color="${s3}"/>
</linearGradient>
<radialGradient id="glow" cx=".8" cy=".2" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
${grid}
${motif}
<text x="100" y="150" font-family="Helvetica, Arial, sans-serif" font-size="26" letter-spacing="6" fill="${palette.ink}" opacity="0.85">${escapeXml(palette.label)} · VISUEL D'EXEMPLE</text>
${titleLines
  .map(
    (line, i) =>
      `<text x="100" y="${430 + i * 84}" font-family="Georgia, 'Times New Roman', serif" font-size="72" fill="#ffffff">${escapeXml(line)}</text>`,
  )
  .join("\n")}
${subtitleLines
  .map(
    (line, i) =>
      `<text x="100" y="${460 + titleLines.length * 84 + i * 42}" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="${palette.ink}" opacity="0.9">${escapeXml(line)}</text>`,
  )
  .join("\n")}
</svg>
`;
}

function portraitSvg(category, initial) {
  const palette = palettes[category];
  const [s0, s1, s2] = palette.stops;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000" role="img" aria-label="Portrait d'exemple">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${s0}"/><stop offset=".6" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient></defs>
<rect width="800" height="1000" fill="url(#bg)"/>
<circle cx="400" cy="400" r="150" fill="${palette.ink}" opacity="0.22"/>
<path d="M 140 1000 C 160 720 280 620 400 620 C 520 620 640 720 660 1000 Z" fill="${palette.ink}" opacity="0.22"/>
<text x="400" y="455" text-anchor="middle" font-family="Georgia, serif" font-size="150" fill="#fff">${escapeXml(initial)}</text>
<text x="400" y="940" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="24" letter-spacing="5" fill="${palette.ink}">PHOTO D'EXEMPLE</text>
</svg>
`;
}

/** PDF minimal (une page, texte) écrit à la main, sans dépendance. */
function cvPdf() {
  const lines = [
    ["F2", 26, "CV d'exemple - Duo Studio"],
    ["F1", 12, ""],
    ["F1", 12, "Ce document est un fichier de demonstration."],
    ["F1", 12, "Remplacez public/demo/cv-exemple.pdf par votre vrai CV,"],
    ["F1", 12, "ou modifiez le chemin dans src/config/site.ts (people.*.cv)."],
    ["F1", 12, ""],
    ["F2", 14, "Formation (exemple)"],
    ["F1", 12, "Cycle ingenieur - ecole d'exemple"],
    ["F1", 12, ""],
    ["F2", 14, "Experience (exemple)"],
    ["F1", 12, "Stage - entreprise d'exemple"],
  ];
  let y = 780;
  const content = lines
    .map(([font, size, text]) => {
      const line = `BT /${font} ${size} Tf 72 ${y} Td (${text.replace(/[()\\]/g, "\\$&")}) Tj ET`;
      y -= size + 12;
      return line;
    })
    .join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return pdf;
}

/* --------------------------------------------------------------------------- */

function write(relPath, data) {
  const target = path.join(PUBLIC_DIR, relPath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, data);
  return relPath;
}

let count = 0;
const files = fs.existsSync(PROJECTS_DIR)
  ? fs.readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
  : [];

for (const file of files) {
  const { data } = matter(fs.readFileSync(path.join(PROJECTS_DIR, file), "utf8"));
  if (!data.category || !palettes[data.category]) continue;
  const images = [
    { src: data.cover, caption: data.summary?.split(".")[0] },
    ...(data.gallery ?? []).map((g) => ({ src: g.src, caption: g.caption ?? g.alt })),
  ];
  const seen = new Set();
  images.forEach((image, index) => {
    if (!image.src || !image.src.startsWith("/demo/") || seen.has(image.src)) return;
    seen.add(image.src);
    write(
      image.src,
      projectSvg({
        title: data.title,
        subtitle: image.caption,
        category: data.category,
        index,
        seed: `${data.slug}-${index}`,
      }),
    );
    count++;
  });
}

write("/demo/portrait-dev.svg", portraitSvg("dev", "C"));
write("/demo/portrait-architecture.svg", portraitSvg("architecture", "G"));
write("/demo/cv-exemple.pdf", cvPdf());

console.log(
  `✓ ${count} visuels de projets, 2 portraits et 1 CV d'exemple générés dans public/demo/`,
);
