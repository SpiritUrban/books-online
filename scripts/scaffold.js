#!/usr/bin/env node
/**
 * Books Online — filesystem scaffold
 * Создаёт директории и ПУСТЫЕ файлы под сайт книг на GitHub Pages.
 *
 * Usage:
 *   node scripts/scaffold.js                 // каркас + пример nastavnik-11 (3 страницы)
 *   node scripts/scaffold.js --root .        // явный корень
 *   node scripts/scaffold.js --slugs nastavnik-11,nastavnik-12 --pages 12
 *   node scripts/scaffold.js --force         // перезаписывать существующие ПУСТЫЕ файлы
 *
 * Параметры:
 *   --root   путь к корню проекта (по умолчанию текущая папка)
 *   --slugs  список книг через запятую (по умолчанию "nastavnik-11")
 *   --pages  число страниц на книгу (по умолчанию 3)
 *   --force  разрешить перезапись/пересоздание файлов (аккуратно)
 */

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const argv = parseArgs(process.argv.slice(2));
const ROOT = path.resolve(argv.root || ".");
const SLUGS = (argv.slugs ? String(argv.slugs) : "nastavnik-11")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const PAGES = clampInt(argv.pages, 3, 1, 999);
const FORCE = Boolean(argv.force);

main().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

async function main() {
  console.log("📁 Root:", ROOT);
  console.log("📚 Slugs:", SLUGS.join(", "));
  console.log("📄 Pages per book:", PAGES);
  console.log("⚠️ Force overwrite:", FORCE);

  // 1) Базовые директории
  const baseDirs = [
    "", // корень
    "assets",
    path.join("assets", "css"),
    path.join("assets", "js"),
    path.join("assets", "img"),
    "data",
    "books",
  ];

  // 2) Базовые файлы (пустые)
  const baseFiles = [
    "index.html",
    path.join("assets", "css", "base.css"),
    path.join("assets", "js", "app.js"),
    path.join("assets", "img", "cover-placeholder.jpg"),
    path.join("assets", "img", "author-avatar.jpg"),
    path.join("data", "books.json"),
  ];

  await ensureDirs(baseDirs);
  await touchFiles(baseFiles);

  // 3) Книги
  for (const slug of SLUGS) {
    await makeBookSkeleton(slug, PAGES);
  }

  console.log("✅ Done.");
  console.log("Tip: добавь содержимое позже — сейчас все файлы пустые по твоему запросу.");
}

async function makeBookSkeleton(slug, pages) {
  const bookRoot = path.join("books", slug);
  const dirs = [
    bookRoot,
    path.join(bookRoot, "pages"),
    path.join(bookRoot, "img"),
    path.join(bookRoot, "extras"),
  ];
  await ensureDirs(dirs);

  const files = [
    path.join(bookRoot, "index.html"),
    path.join(bookRoot, "book.json"),
    path.join(bookRoot, "img", "cover.jpg"),
    path.join(bookRoot, "img", "hero-wide.jpg"),
    path.join(bookRoot, "extras", "README.txt"),
  ];

  // Страницы 001..NNN
  const pageFiles = [];
  for (let i = 1; i <= pages; i++) {
    pageFiles.push(path.join(bookRoot, "pages", pad3(i) + ".html"));
  }

  await touchFiles([...files, ...pageFiles]);
  console.log(`  • ${slug}: created ${pages} empty page file(s)`);
}

async function ensureDirs(dirs) {
  for (const d of dirs) {
    const full = path.join(ROOT, d);
    await fsp.mkdir(full, { recursive: true });
  }
}

async function touchFiles(files) {
  for (const f of files) {
    const full = path.join(ROOT, f);
    const exists = await fileExists(full);
    if (!exists) {
      await fsp.writeFile(full, "");
    } else if (FORCE) {
      // Перезаписываем пустым содержимым
      await fsp.writeFile(full, "");
    } else {
      // Не трогаем существующий
    }
  }
}

async function fileExists(p) {
  try {
    await fsp.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function pad3(n) {
  return String(n).padStart(3, "0");
}

function clampInt(value, def, min, max) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return def;
  return Math.max(min, Math.min(max, n));
}

function parseArgs(args) {
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!a.startsWith("--")) continue;
    const key = a.replace(/^--/, "");
    const next = args[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true; // флаг
    } else {
      out[key] = next; // значение
      i++;
    }
  }
  return out;
}
