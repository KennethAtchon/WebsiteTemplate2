#!/usr/bin/env bun

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { execSync } from 'node:child_process';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function getFilesRecursively(dir, baseDir = dir) {
  const files = [];
  
  try {
    const items = await readdir(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const statResult = await stat(fullPath);
      
      if (statResult.isDirectory()) {
        // Skip node_modules and other common exclusions
        if (!['node_modules', '.git', '.next', 'dist', 'coverage', '.swc', 'test-results', 'playwright-report'].includes(item)) {
          files.push(...await getFilesRecursively(fullPath, baseDir));
        }
      } else {
        const relativePath = relative(baseDir, fullPath);
        files.push(relativePath);
      }
    }
  } catch (error) {
    // Handle permission errors gracefully
  }
  
  return files.sort();
}

async function compareFileStructures(sourceDir, targetDir, sourceName, targetName) {
  log(`Comparing file structures: ${sourceName} → ${targetName}`, 'blue');
  
  const sourceFiles = await getFilesRecursively(sourceDir);
  const targetFiles = await getFilesRecursively(targetDir);
  
  const sourceFileSet = new Set(sourceFiles);
  const targetFileSet = new Set(targetFiles);
  
  const missing = sourceFiles.filter(file => !targetFileSet.has(file));
  const extra = targetFiles.filter(file => !sourceFileSet.has(file));
  
  return { missing, extra };
}

async function checkDependencies(packagePath, name) {
  const issues = [];
  
  try {
    const packageJson = JSON.parse(await readFile(packagePath, 'utf-8'));
    
    // Check if dependencies exist in node_modules (basic check)
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const packageDir = packagePath.replace('/package.json', '');
    
    for (const [dep, version] of Object.entries(allDeps)) {
      try {
        // Try to resolve the package using Bun's resolution
        execSync(`cd ${packageDir} && bun --silent pm ls ${dep}`, { encoding: 'utf-8', stdio: 'pipe' });
      } catch (error) {
        issues.push(`${name}: Missing dependency ${dep}@${version}`);
      }
    }
  } catch (error) {
    issues.push(`${name}: Cannot read package.json`);
  }
  
  return issues;
}

async function runBuildScript(packageDir, scriptName, name) {
  try {
    log(`Running ${scriptName} for ${name}...`, 'blue');
    const output = execSync(`cd ${packageDir} && bun run ${scriptName}`, { 
      encoding: 'utf-8', 
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout
    });
    return { success: true, output };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || error.message || 'Build failed'
    };
  }
}

async function verifyBackend() {
  logSection('Verifying Backend Migration');
  
  const projectBackend = join(process.cwd(), 'project');
  const migratedBackend = join(process.cwd(), 'backend');
  
  // Compare file structures
  const { missing, extra } = await compareFileStructures(projectBackend, migratedBackend, 'project (backend)', 'backend');
  
  // Check dependencies
  const dependencyIssues = await checkDependencies(join(migratedBackend, 'package.json'), 'backend');
  
  // Report results
  if (missing.length === 0) {
    logSuccess('All backend files migrated successfully');
  } else {
    logError(`Missing ${missing.length} backend files:`);
    missing.forEach(file => logError(`  - ${file}`));
  }
  
  if (extra.length > 0) {
    logWarning(`Extra files in backend:`);
    extra.forEach(file => logWarning(`  - ${file}`));
  }
  
  if (dependencyIssues.length === 0) {
    logSuccess('All backend dependencies are satisfied');
  } else {
    logError('Backend dependency issues:');
    dependencyIssues.forEach(issue => logError(`  - ${issue}`));
  }
  
  return { missing, extra, dependencyIssues };
}

async function verifyFrontend() {
  logSection('Verifying Frontend Migration');
  
  const projectFrontend = join(process.cwd(), 'project');
  const migratedFrontend = join(process.cwd(), 'frontend');
  
  // Compare file structures (focus on app directory and components)
  const projectAppFiles = await getFilesRecursively(join(projectFrontend, 'app'));
  const frontendSrcFiles = await getFilesRecursively(join(migratedFrontend, 'src'));
  
  // Map expected migrations
  const expectedMigrations = new Map();
  projectAppFiles.forEach(file => {
    if (file.startsWith('app/')) {
      const mappedFile = file.replace('app/', 'src/');
      expectedMigrations.set(mappedFile, file);
    }
  });
  
  const missing = [];
  const extra = [];
  
  // Check for missing files
  for (const [frontendFile, projectFile] of expectedMigrations) {
    if (!frontendSrcFiles.includes(frontendFile)) {
      missing.push(`${projectFile} → ${frontendFile}`);
    }
  }
  
  // Check for extra files
  frontendSrcFiles.forEach(file => {
    if (!expectedMigrations.has(file)) {
      extra.push(file);
    }
  });
  
  // Check dependencies
  const dependencyIssues = await checkDependencies(join(migratedFrontend, 'package.json'), 'frontend');
  
  // Report results
  if (missing.length === 0) {
    logSuccess('All frontend files migrated successfully');
  } else {
    logError(`Missing ${missing.length} frontend files:`);
    missing.forEach(file => logError(`  - ${file}`));
  }
  
  if (extra.length > 0) {
    logWarning(`Extra files in frontend:`);
    extra.forEach(file => logWarning(`  - ${file}`));
  }
  
  if (dependencyIssues.length === 0) {
    logSuccess('All frontend dependencies are satisfied');
  } else {
    logError('Frontend dependency issues:');
    dependencyIssues.forEach(issue => logError(`  - ${issue}`));
  }
  
  return { missing, extra, dependencyIssues };
}

async function verifyTests() {
  logSection('Verifying Test Migration');
  
  const projectTests = join(process.cwd(), 'project', '__tests__');
  const backendTests = join(process.cwd(), 'backend', '__tests__');
  const frontendTests = join(process.cwd(), 'frontend', '__tests__');
  
  const results = {
    backend: { missing: [], extra: [], exists: false },
    frontend: { missing: [], extra: [], exists: false },
    project: { files: [] }
  };
  
  // Get all test files from project
  try {
    results.project.files = await getFilesRecursively(projectTests);
    log(`Found ${results.project.files.length} test files in project/`, 'blue');
  } catch (error) {
    logWarning('No __tests__ directory found in project/');
    return results;
  }
  
  // Check backend tests
  try {
    results.backend.exists = true;
    const backendTestFiles = await getFilesRecursively(backendTests);
    const backendProjectFiles = results.project.files.filter(file => 
      file.includes('backend/') || file.includes('api/') || file.includes('integration/')
    );
    
    const backendExpected = backendProjectFiles.map(file => file.replace(/^__tests__\//, ''));
    const backendFileSet = new Set(backendTestFiles);
    
    results.backend.missing = backendExpected.filter(file => !backendFileSet.has(file));
    results.backend.extra = backendTestFiles.filter(file => !backendExpected.includes(file));
    
    if (results.backend.missing.length === 0) {
      logSuccess('Backend tests migrated successfully');
    } else {
      logError(`Missing ${results.backend.missing.length} backend test files:`);
      results.backend.missing.forEach(file => logError(`  - ${file}`));
    }
  } catch (error) {
    results.backend.exists = false;
    const backendProjectFiles = results.project.files.filter(file => 
      file.includes('backend/') || file.includes('api/') || file.includes('integration/')
    );
    results.backend.missing = backendProjectFiles.map(file => file.replace(/^__tests__\//, ''));
    logError(`Backend __tests__ directory missing. Need to migrate ${results.backend.missing.length} test files`);
  }
  
  // Check frontend tests
  try {
    results.frontend.exists = true;
    const frontendTestFiles = await getFilesRecursively(frontendTests);
    const frontendProjectFiles = results.project.files.filter(file => 
      file.includes('unit/') || file.includes('components/') || file.includes('hooks/') || file.includes('features/')
    );
    
    const frontendExpected = frontendProjectFiles.map(file => file.replace(/^__tests__\//, ''));
    const frontendFileSet = new Set(frontendTestFiles);
    
    results.frontend.missing = frontendExpected.filter(file => !frontendFileSet.has(file));
    results.frontend.extra = frontendTestFiles.filter(file => !frontendExpected.includes(file));
    
    if (results.frontend.missing.length === 0) {
      logSuccess('Frontend tests migrated successfully');
    } else {
      logError(`Missing ${results.frontend.missing.length} frontend test files:`);
      results.frontend.missing.forEach(file => logError(`  - ${file}`));
    }
  } catch (error) {
    results.frontend.exists = false;
    const frontendProjectFiles = results.project.files.filter(file => 
      file.includes('unit/') || file.includes('components/') || file.includes('hooks/') || file.includes('features/')
    );
    results.frontend.missing = frontendProjectFiles.map(file => file.replace(/^__tests__\//, ''));
    logError(`Frontend __tests__ directory missing. Need to migrate ${results.frontend.missing.length} test files`);
  }
  
  return results;
}

async function runBuildTests() {
  logSection('Running Build Tests');
  
  const results = {
    backend: await runBuildScript('backend', 'build', 'backend'),
    frontend: await runBuildScript('frontend', 'build', 'frontend'),
    project: await runBuildScript('project', 'build', 'project')
  };
  
  // Report results
  Object.entries(results).forEach(([name, result]) => {
    if (result.success) {
      logSuccess(`${name} builds successfully`);
    } else {
      logError(`${name} build failed:`);
      log(result.output, 'red');
    }
  });
  
  return results;
}

function generateReport(result) {
  logSection('Migration Verification Report');
  
  const totalIssues = result.issues.length + result.missingFiles.length + result.dependencyIssues.length;
  const totalWarnings = result.warnings.length + result.extraFiles.length;
  const totalMissingTests = result.testResults.backend.missing.length + result.testResults.frontend.missing.length;
  
  if (totalIssues === 0 && totalMissingTests === 0) {
    logSuccess('🎉 Migration verification PASSED! All files, tests, and dependencies are correctly migrated.');
  } else {
    logError(`❌ Migration verification FAILED with ${totalIssues} issues, ${totalWarnings} warnings, and ${totalMissingTests} missing tests.`);
  }
  
  // Summary
  log('\n📊 Summary:', 'blue');
  log(`  Missing Files: ${result.missingFiles.length}`, result.missingFiles.length > 0 ? 'red' : 'green');
  log(`  Extra Files: ${result.extraFiles.length}`, result.extraFiles.length > 0 ? 'yellow' : 'green');
  log(`  Dependency Issues: ${result.dependencyIssues.length}`, result.dependencyIssues.length > 0 ? 'red' : 'green');
  log(`  Missing Tests: ${totalMissingTests}`, totalMissingTests > 0 ? 'red' : 'green');
  log(`  Backend Build: ${result.buildResults.backend.success ? 'PASS' : 'FAIL'}`, result.buildResults.backend.success ? 'green' : 'red');
  log(`  Frontend Build: ${result.buildResults.frontend.success ? 'PASS' : 'FAIL'}`, result.buildResults.frontend.success ? 'green' : 'red');
  log(`  Project Build: ${result.buildResults.project.success ? 'PASS' : 'FAIL'}`, result.buildResults.project.success ? 'green' : 'red');
  
  // Test breakdown
  if (totalMissingTests > 0) {
    log('\n🧪 Test Migration Status:', 'blue');
    log(`  Backend Tests: ${result.testResults.backend.exists ? 'EXISTS' : 'MISSING'} (${result.testResults.backend.missing.length} missing)`, result.testResults.backend.missing.length > 0 ? 'red' : 'green');
    log(`  Frontend Tests: ${result.testResults.frontend.exists ? 'EXISTS' : 'MISSING'} (${result.testResults.frontend.missing.length} missing)`, result.testResults.frontend.missing.length > 0 ? 'red' : 'green');
  }
  
  // Recommendations
  log('\n💡 Recommendations:', 'blue');
  if (result.missingFiles.length > 0) {
    log('  - Review and migrate missing files from project/ to backend/frontend/', 'yellow');
  }
  if (result.dependencyIssues.length > 0) {
    log('  - Install missing dependencies: bun install in respective directories', 'yellow');
  }
  if (totalMissingTests > 0) {
    log('  - Migrate test files from project/__tests__/ to appropriate backend/frontend/__tests__/ directories', 'yellow');
  }
  if (!result.buildResults.backend.success) {
    log('  - Fix backend build errors before proceeding', 'yellow');
  }
  if (!result.buildResults.frontend.success) {
    log('  - Fix frontend build errors before proceeding', 'yellow');
  }
  if (totalIssues === 0 && totalMissingTests === 0) {
    log('  - Migration looks good! You can proceed with development', 'green');
  }
}

async function main() {
  log('🔍 Starting Migration Verification...', 'cyan');
  log('This script will verify that backend/ and frontend/ folders contain all necessary files from project/', 'blue');
  
  const result = {
    success: true,
    issues: [],
    warnings: [],
    missingFiles: [],
    extraFiles: [],
    dependencyIssues: [],
    buildResults: {
      backend: { success: false, output: '' },
      frontend: { success: false, output: '' },
      project: { success: false, output: '' }
    },
    testResults: {
      backend: { missing: [], extra: [], exists: false },
      frontend: { missing: [], extra: [], exists: false },
      project: { files: [] }
    }
  };
  
  try {
    // Verify backend
    const backendResult = await verifyBackend();
    result.missingFiles.push(...backendResult.missing.map(f => `backend/${f}`));
    result.extraFiles.push(...backendResult.extra.map(f => `backend/${f}`));
    result.dependencyIssues.push(...backendResult.dependencyIssues);
    
    // Verify frontend
    const frontendResult = await verifyFrontend();
    result.missingFiles.push(...frontendResult.missing.map(f => `frontend/${f}`));
    result.extraFiles.push(...frontendResult.extra.map(f => `frontend/${f}`));
    result.dependencyIssues.push(...frontendResult.dependencyIssues);
    
    // Verify tests
    result.testResults = await verifyTests();
    
    // Run build tests
    result.buildResults = await runBuildTests();
    
    // Determine overall success
    result.success = 
      result.missingFiles.length === 0 &&
      result.dependencyIssues.length === 0 &&
      result.testResults.backend.missing.length === 0 &&
      result.testResults.frontend.missing.length === 0 &&
      result.buildResults.backend.success &&
      result.buildResults.frontend.success &&
      result.buildResults.project.success;
    
  } catch (error) {
    logError(`Verification failed with error: ${error.message}`);
    result.issues.push(error.message);
    result.success = false;
  }
  
  // Generate final report
  generateReport(result);
  
  // Exit with appropriate code
  process.exit(result.success ? 0 : 1);
}

// Run the verification
main().catch(console.error);
