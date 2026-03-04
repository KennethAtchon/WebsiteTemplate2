#!/usr/bin/env bun

import { readdir, readFile, stat } from 'fs/promises';
import { join, relative, extname } from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

interface VerificationResult {
  success: boolean;
  issues: string[];
  warnings: string[];
  missingFiles: string[];
  extraFiles: string[];
  dependencyIssues: string[];
  buildResults: {
    backend: { success: boolean; output: string };
    frontend: { success: boolean; output: string };
    project: { success: boolean; output: string };
  };
}

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message: string, color: keyof typeof COLORS = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logSection(title: string) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${title}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
}

function logSuccess(message: string) {
  log(`✅ ${message}`, 'green');
}

function logError(message: string) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, 'yellow');
}

async function getFilesRecursively(dir: string, baseDir: string = dir): Promise<string[]> {
  const files: string[] = [];
  
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

async function compareFileStructures(sourceDir: string, targetDir: string, sourceName: string, targetName: string): Promise<{ missing: string[]; extra: string[] }> {
  log(`Comparing file structures: ${sourceName} → ${targetName}`, 'blue');
  
  const sourceFiles = await getFilesRecursively(sourceDir);
  const targetFiles = await getFilesRecursively(targetDir);
  
  const sourceFileSet = new Set(sourceFiles);
  const targetFileSet = new Set(targetFiles);
  
  const missing = sourceFiles.filter(file => !targetFileSet.has(file));
  const extra = targetFiles.filter(file => !sourceFileSet.has(file));
  
  return { missing, extra };
}

async function checkDependencies(packagePath: string, name: string): Promise<string[]> {
  const issues: string[] = [];
  
  try {
    const packageJson = JSON.parse(await readFile(packagePath, 'utf-8'));
    
    // Check if dependencies exist in node_modules (basic check)
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const packageDir = packagePath.replace('/package.json', '');
    
    for (const [dep, version] of Object.entries(allDeps)) {
      try {
        // Try to resolve the package
        require.resolve(dep, { paths: [packageDir] });
      } catch (error) {
        issues.push(`${name}: Missing dependency ${dep}@${version}`);
      }
    }
  } catch (error) {
    issues.push(`${name}: Cannot read package.json`);
  }
  
  return issues;
}

async function runBuildScript(packageDir: string, scriptName: string, name: string): Promise<{ success: boolean; output: string }> {
  try {
    log(`Running ${scriptName} for ${name}...`, 'blue');
    const output = execSync(`cd ${packageDir} && bun run ${scriptName}`, { 
      encoding: 'utf-8', 
      stdio: 'pipe',
      timeout: 30000 // 30 second timeout
    });
    return { success: true, output };
  } catch (error: any) {
    return { 
      success: false, 
      output: error.stdout || error.message || 'Build failed'
    };
  }
}

async function verifyBackend(): Promise<{ missing: string[]; extra: string[]; dependencyIssues: string[] }> {
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

async function verifyFrontend(): Promise<{ missing: string[]; extra: string[]; dependencyIssues: string[] }> {
  logSection('Verifying Frontend Migration');
  
  const projectFrontend = join(process.cwd(), 'project');
  const migratedFrontend = join(process.cwd(), 'frontend');
  
  // Compare file structures (focus on app directory and components)
  const projectAppFiles = await getFilesRecursively(join(projectFrontend, 'app'));
  const frontendSrcFiles = await getFilesRecursively(join(migratedFrontend, 'src'));
  
  // Map expected migrations
  const expectedMigrations = new Map<string, string>();
  projectAppFiles.forEach(file => {
    if (file.startsWith('app/')) {
      const mappedFile = file.replace('app/', 'src/');
      expectedMigrations.set(mappedFile, file);
    }
  });
  
  const missing: string[] = [];
  const extra: string[] = [];
  
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

async function runBuildTests(): Promise<{ backend: { success: boolean; output: string }; frontend: { success: boolean; output: string }; project: { success: boolean; output: string } }> {
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

function generateReport(result: VerificationResult): void {
  logSection('Migration Verification Report');
  
  const totalIssues = result.issues.length + result.missingFiles.length + result.dependencyIssues.length;
  const totalWarnings = result.warnings.length + result.extraFiles.length;
  
  if (totalIssues === 0) {
    logSuccess('🎉 Migration verification PASSED! All files and dependencies are correctly migrated.');
  } else {
    logError(`❌ Migration verification FAILED with ${totalIssues} issues and ${totalWarnings} warnings.`);
  }
  
  // Summary
  log('\n📊 Summary:', 'blue');
  log(`  Missing Files: ${result.missingFiles.length}`, result.missingFiles.length > 0 ? 'red' : 'green');
  log(`  Extra Files: ${result.extraFiles.length}`, result.extraFiles.length > 0 ? 'yellow' : 'green');
  log(`  Dependency Issues: ${result.dependencyIssues.length}`, result.dependencyIssues.length > 0 ? 'red' : 'green');
  log(`  Backend Build: ${result.buildResults.backend.success ? 'PASS' : 'FAIL'}`, result.buildResults.backend.success ? 'green' : 'red');
  log(`  Frontend Build: ${result.buildResults.frontend.success ? 'PASS' : 'FAIL'}`, result.buildResults.frontend.success ? 'green' : 'red');
  log(`  Project Build: ${result.buildResults.project.success ? 'PASS' : 'FAIL'}`, result.buildResults.project.success ? 'green' : 'red');
  
  // Recommendations
  log('\n💡 Recommendations:', 'blue');
  if (result.missingFiles.length > 0) {
    log('  - Review and migrate missing files from project/ to backend/frontend/', 'yellow');
  }
  if (result.dependencyIssues.length > 0) {
    log('  - Install missing dependencies: bun install in respective directories', 'yellow');
  }
  if (!result.buildResults.backend.success) {
    log('  - Fix backend build errors before proceeding', 'yellow');
  }
  if (!result.buildResults.frontend.success) {
    log('  - Fix frontend build errors before proceeding', 'yellow');
  }
  if (totalIssues === 0) {
    log('  - Migration looks good! You can proceed with development', 'green');
  }
}

async function main(): Promise<void> {
  log('🔍 Starting Migration Verification...', 'cyan');
  log('This script will verify that backend/ and frontend/ folders contain all necessary files from project/', 'blue');
  
  const result: VerificationResult = {
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
    
    // Run build tests
    result.buildResults = await runBuildTests();
    
    // Determine overall success
    result.success = 
      result.missingFiles.length === 0 &&
      result.dependencyIssues.length === 0 &&
      result.buildResults.backend.success &&
      result.buildResults.frontend.success &&
      result.buildResults.project.success;
    
  } catch (error: any) {
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
if (import.meta.main) {
  main().catch(console.error);
}
