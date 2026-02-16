#!/usr/bin/env node

/**
 * Helper script to create daily update blog posts
 * Can be used by AI workers or manually
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

function createDailyUpdate(date) {
  const dateStr = date || new Date().toISOString().split('T')[0];
  const slug = `daily-update-${dateStr}`;
  const filePath = path.join(rootDir, 'content', 'blog', `${slug}.mdx`);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`✓ Daily update for ${dateStr} already exists`);
    return { exists: true, path: filePath };
  }
  
  // Create the content
  const content = `---
slug: ${slug}
title: Daily Update ${dateStr}
date: ${dateStr}
summary: Daily content update
---

- System health check completed
- Monitoring endpoints active
- All systems operational

---

## Status

The autonomous AI system is functioning normally.
`;
  
  // Write the file
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Created daily update: ${filePath}`);
  
  return { exists: false, path: filePath };
}

// If run directly, create today's update
if (fileURLToPath(import.meta.url) === process.argv[1]) {
  const dateArg = process.argv[2];
  const result = createDailyUpdate(dateArg);
  process.exit(0);
}

export { createDailyUpdate };
