#!/usr/bin/env node

/**
 * Frontend Validation Script
 * 
 * Runs type checking, linting, and tests to ensure code quality
 * before commits. Helps prevent runtime errors like the ones we just fixed.
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔍 Running frontend validation...\n');

const runCommand = (command, description) => {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: path.join(__dirname)
    });
    console.log(`✅ ${description} passed\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed\n`);
    return false;
  }
};

let allPassed = true;

// Type checking
if (!runCommand('npx tsc --noEmit', 'TypeScript type checking')) {
  allPassed = false;
}

// Build test (ensures no compilation errors)
if (!runCommand('npm run build', 'Build compilation')) {
  allPassed = false;
}

// Run tests
if (!runCommand('npm test', 'Unit tests')) {
  allPassed = false;
}

if (allPassed) {
  console.log('🎉 All validation checks passed! Ready to commit.');
  process.exit(0);
} else {
  console.log('💥 Some validation checks failed. Please fix the issues before committing.');
  process.exit(1);
}
