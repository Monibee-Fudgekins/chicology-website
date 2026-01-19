#!/usr/bin/env node

/**
 * Simple test runner for the AI website
 * Runs basic health checks and validation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('Running AI Website Tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

// Test 1: Check if build output exists
test('Build output exists', () => {
  const outDir = path.join(rootDir, 'out');
  if (!fs.existsSync(outDir)) {
    throw new Error('out/ directory not found. Run npm run build first.');
  }
});

// Test 2: Check if index.html exists
test('Index page generated', () => {
  const indexPath = path.join(rootDir, 'out', 'index.html');
  if (!fs.existsSync(indexPath)) {
    throw new Error('out/index.html not found');
  }
});

// Test 3: Check if functions exist
test('Health check function exists', () => {
  const funcPath = path.join(rootDir, 'functions', '__health.js');
  if (!fs.existsSync(funcPath)) {
    throw new Error('functions/__health.js not found');
  }
});

// Test 4: Check if blog posts exist
test('Blog content exists', () => {
  const contentDir = path.join(rootDir, 'content', 'blog');
  if (!fs.existsSync(contentDir)) {
    throw new Error('content/blog directory not found');
  }
  const files = fs.readdirSync(contentDir);
  if (files.filter(f => f.endsWith('.mdx')).length === 0) {
    throw new Error('No blog posts found in content/blog');
  }
});

console.log(`\nTests: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failed > 0) {
  process.exit(1);
}

process.exit(0);
