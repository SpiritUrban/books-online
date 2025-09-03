#!/usr/bin/env node
'use strict';

// scripts/optimize-images.js
// Resize/compress cover.jpg (1600x900) and hero-wide.jpg (1920x1080) in books/*/img.
// Options:
//   --only=covers | --only=heroes
//   --webp        (also write .webp next to jpg)

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const sharp = require('sharp');

const ONLY = getArg('only'); // covers | heroes | undefined
const MAKE_WEBP = hasFlag('webp');

const ROOT = process.cwd();
const BOOKS_DIR = path.join(ROOT, 'books');

(async function main() {
  const files = await collectTargets();
  if (!files.length) {
    console.log('No cover.jpg / hero-wide.jpg found under books/*/img');
    return;
  }

  let changed = 0;
  for (const file of files) {
    const type = file.toLowerCase().endsWith('cover.jpg') ? 'cover' : 'hero';
    try {
      const before = await fileSize(file);
      const buf = await fsp.readFile(file);
      let img = sharp(buf, { failOn: 'none' });

      const meta = await img.metadata();
      if (meta.format !== 'jpeg' && meta.format !== 'jpg') {
        console.log(`Skip (not JPEG): ${rel(file)} (${meta.format || 'unknown'})`);
        continue;
      }

      const target = (type === 'cover')
        ? { width: 1600, height: 900 }
        : { width: 1920, height: 1080 };

      const outBuf = await img
        .resize({ width: target.width, height: target.height, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80, progressive: true, chromaSubsampling: '4:2:0' })
        .toBuffer();

      if (outBuf.length < buf.length) {
        await fsp.writeFile(file, outBuf);
        changed++;
        reportReduced(file, before, outBuf.length);
      } else {
        console.log(`No win: ${rel(file)} (${kb(buf.length)} -> ${kb(outBuf.length)})`);
      }

      if (MAKE_WEBP) {
        const webpPath = file.replace(/\.jpg$/i, '.webp');
        const webpBuf = await sharp(outBuf).webp({ quality: 82 }).toBuffer();
        await fsp.writeFile(webpPath, webpBuf);
        console.log(`  webp: ${rel(webpPath)} (${kb(webpBuf.length)})`);
      }

    } catch (e) {
      console.error('Error:', rel(file), e.message);
    }
  }

  console.log(`\nDone. Optimized: ${changed}/${files.length}`);
})();

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}
function getArg(name) {
  const i = process.argv.findIndex(a => a === `--${name}`);
  if (i >= 0 && process.argv[i+1] && !process.argv[i+1].startsWith('--')) return process.argv[i+1];
  const kv = process.argv.find(a => a.startsWith(`--${name}=`));
  return kv ? kv.slice(name.length + 3) : undefined;
}

async function collectTargets() {
  const out = [];
  async function walk(dir) {
    let entries;
    try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(full);
      } else if (e.isFile()) {
        const n = e.name.toLowerCase();
        if (n === 'cover.jpg' && (ONLY === undefined || ONLY === 'covers')) out.push(full);
        if (n === 'hero-wide.jpg' && (ONLY === undefined || ONLY === 'heroes')) out.push(full);
      }
    }
  }
  await walk(BOOKS_DIR);
  return out;
}

function rel(p) { return path.relative(ROOT, p).replace(/\\/g, '/'); }
async function fileSize(p) { try { const { size } = await fsp.stat(p); return size; } catch { return 0; } }
function kb(n) { return (n/1024).toFixed(0) + ' KB'; }
function reportReduced(file, before, after) {
  const delta = ((1 - after/before) * 100).toFixed(1);
  console.log(`OK ${rel(file)}: ${kb(before)} -> ${kb(after)} (-${delta}%)`);
}
