#!/usr/bin/env node
/**
 * One-time recipe generator.
 *
 * Reads COUNTRIES and MENU_DATA from global_menu_v8.tsx, calls Claude Haiku
 * for every dish, and writes src/recipes.json.
 *
 * Resumable — already-generated entries are skipped on re-run.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-recipes.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');

// ── Validate API key ───────────────────────────────────────────────────────────
const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('\nError: ANTHROPIC_API_KEY environment variable is not set.');
  console.error('Usage: ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-recipes.mjs\n');
  process.exit(1);
}

// ── Extract COUNTRIES and MENU_DATA from source ───────────────────────────────
let src = readFileSync(join(ROOT, 'global_menu_v8.tsx'), 'utf8');

// Strip TypeScript type annotations so we can eval the plain object literals.
src = src
  .replace(/:\s*Record<string,\s*MenuItem\[\]>/g, '')
  .replace(/:\s*Country\[\]/g, '')
  .replace(/:\s*DishType\[\]/g, '')
  .replace(/:\s*DishStyle\b/g, '')
  .replace(/:\s*MenuItem\[\]/g, '');

/**
 * Extracts a JS array or object literal assigned to `varName` using
 * brace/bracket depth tracking, then evals it to a plain JS value.
 */
function extractLiteral(varName) {
  const varIdx = src.indexOf(`const ${varName}`);
  if (varIdx < 0) throw new Error(`${varName} not found in source file`);

  // Advance to the opening bracket or brace.
  let i = src.indexOf('=', varIdx) + 1;
  while (src[i] === ' ' || src[i] === '\n' || src[i] === '\r') i++;

  const open  = src[i];
  const close = open === '[' ? ']' : '}';
  let depth = 0, j = i;

  while (j < src.length) {
    if (src[j] === open)  depth++;
    if (src[j] === close) { depth--; if (depth === 0) break; }
    j++;
  }

  // Indirect eval runs in global scope, avoiding strict-mode restrictions.
  // eslint-disable-next-line no-eval
  return (0, eval)('(' + src.slice(i, j + 1) + ')');
}

const COUNTRIES = extractLiteral('COUNTRIES');
const MENU_DATA  = extractLiteral('MENU_DATA');

// ── Load existing output for resumability ─────────────────────────────────────
const OUTPUT  = join(ROOT, 'src', 'recipes.json');
const recipes = existsSync(OUTPUT) ? JSON.parse(readFileSync(OUTPUT, 'utf8')) : {};

const total = COUNTRIES.reduce((sum, c) => sum + (MENU_DATA[c.code]?.length ?? 0), 0);
let done = 0, skipped = 0, failed = 0;

// ── Fetch a single recipe from the Anthropic API ──────────────────────────────
async function fetchRecipe(dish, country) {
  const prompt =
    `BBC Good Food style recipe for "${dish.english}" (${dish.local}) from ${country.name}. ` +
    `Return ONLY a JSON object, no markdown: ` +
    `{"description":"2 sentences","ingredients":["qty ingredient",...max 10],` +
    `"prep_time":"X mins","cook_time":"X mins","steps":["step",...max 6]}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'Content-Type':      'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key':         API_KEY,
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e?.error?.message ?? `HTTP ${res.status}`);
  }

  const text = (await res.json()).content.map(b => b.text ?? '').join('');
  const s = text.indexOf('{'), e = text.lastIndexOf('}');
  if (s < 0 || e < 0) throw new Error('No JSON found in response');
  return JSON.parse(text.slice(s, e + 1));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── Main loop ─────────────────────────────────────────────────────────────────
console.log(`\nGenerating recipes for ${total} dishes across ${COUNTRIES.length} countries…`);
console.log('  + = generated   · = skipped (already done)   ✗ = failed\n');

for (const country of COUNTRIES) {
  const dishes = MENU_DATA[country.code] ?? [];
  process.stdout.write(`  ${country.name.padEnd(18)}`);

  for (const dish of dishes) {
    const key = `${country.code}:${dish.rank}`;

    if (recipes[key]) {
      process.stdout.write('·');
      skipped++;
      continue;
    }

    let succeeded = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        recipes[key] = await fetchRecipe(dish, country);
        // Save after every dish so progress is never lost.
        writeFileSync(OUTPUT, JSON.stringify(recipes, null, 2));
        process.stdout.write('+');
        done++;
        succeeded = true;
        break;
      } catch (err) {
        if (attempt === 3) {
          process.stdout.write('✗');
          console.error(`\n    FAILED ${key} (${dish.english}): ${err.message}`);
          failed++;
        } else {
          await sleep(2000 * attempt); // exponential back-off before retry
        }
      }
    }

    if (succeeded) {
      await sleep(150); // ~6 req/s — comfortably inside Haiku rate limits
    }
  }

  process.stdout.write('\n');
}

console.log(`\n  Done.  Generated: ${done}  Skipped: ${skipped}  Failed: ${failed}`);
if (done > 0) console.log(`  Saved to: src/recipes.json`);
if (failed > 0) console.log(`  Re-run the script to retry failed dishes.`);
