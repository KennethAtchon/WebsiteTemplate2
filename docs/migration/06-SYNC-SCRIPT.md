# Automated Sync Scripts

## Overview
These scripts automate the migration process to reduce manual errors.

---

## Script 1: Folder Reorganization

**File:** `scripts/reorganize-frontend.sh`

```bash
#!/bin/bash
# reorganize-frontend.sh
# Reorganizes frontend folder structure to match project

set -e  # Exit on error

FRONTEND_DIR="/home/kenneth/Documents/Workplace/WebsiteTemplate2/frontend"
cd "$FRONTEND_DIR/src"

echo "🔄 Reorganizing frontend folder structure..."

# Create shared directory
echo "📁 Creating shared directory..."
mkdir -p shared

# Move directories to shared
echo "📦 Moving directories to shared/..."
mv components shared/ 2>/dev/null || echo "⚠️  components already moved"
mv constants shared/ 2>/dev/null || echo "⚠️  constants already moved"
mv contexts shared/ 2>/dev/null || echo "⚠️  contexts already moved"
mv hooks shared/ 2>/dev/null || echo "⚠️  hooks already moved"
mv lib shared/ 2>/dev/null || echo "⚠️  lib already moved"
mv providers shared/ 2>/dev/null || echo "⚠️  providers already moved"
mv services shared/ 2>/dev/null || echo "⚠️  services already moved"
mv types shared/ 2>/dev/null || echo "⚠️  types already moved"
mv utils shared/ 2>/dev/null || echo "⚠️  utils already moved"

# Create i18n directory
echo "🌍 Creating i18n directory..."
mkdir -p shared/i18n

echo "✅ Folder reorganization complete!"
echo ""
echo "New structure:"
tree -L 2 -d .
```

**Usage:**
```bash
chmod +x scripts/reorganize-frontend.sh
./scripts/reorganize-frontend.sh
```

---

## Script 2: Import Path Fixer

**File:** `scripts/fix-imports.ts`

```typescript
#!/usr/bin/env bun
// fix-imports.ts
// Automatically updates import paths after folder reorganization

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const FRONTEND_DIR = '/home/kenneth/Documents/Workplace/WebsiteTemplate2/frontend/src';

interface ImportReplacement {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const replacements: ImportReplacement[] = [
  {
    pattern: /from ["']@\/components\//g,
    replacement: 'from "@/shared/components/',
    description: 'components -> shared/components',
  },
  {
    pattern: /from ["']@\/constants\//g,
    replacement: 'from "@/shared/constants/',
    description: 'constants -> shared/constants',
  },
  {
    pattern: /from ["']@\/contexts\//g,
    replacement: 'from "@/shared/contexts/',
    description: 'contexts -> shared/contexts',
  },
  {
    pattern: /from ["']@\/hooks\//g,
    replacement: 'from "@/shared/hooks/',
    description: 'hooks -> shared/hooks',
  },
  {
    pattern: /from ["']@\/lib\//g,
    replacement: 'from "@/shared/lib/',
    description: 'lib -> shared/lib',
  },
  {
    pattern: /from ["']@\/providers\//g,
    replacement: 'from "@/shared/providers/',
    description: 'providers -> shared/providers',
  },
  {
    pattern: /from ["']@\/services\//g,
    replacement: 'from "@/shared/services/',
    description: 'services -> shared/services',
  },
  {
    pattern: /from ["']@\/types\//g,
    replacement: 'from "@/shared/types/',
    description: 'types -> shared/types',
  },
  {
    pattern: /from ["']@\/utils\//g,
    replacement: 'from "@/shared/utils/',
    description: 'utils -> shared/utils',
  },
];

async function fixImports() {
  console.log('🔍 Finding TypeScript/TSX files...');
  
  const files = await glob(`${FRONTEND_DIR}/**/*.{ts,tsx}`, {
    ignore: ['**/node_modules/**', '**/dist/**', '**/*.d.ts'],
  });

  console.log(`📝 Found ${files.length} files to process`);

  let totalChanges = 0;
  let filesModified = 0;

  for (const file of files) {
    let content = readFileSync(file, 'utf8');
    let modified = false;
    let fileChanges = 0;

    for (const { pattern, replacement, description } of replacements) {
      const matches = content.match(pattern);
      if (matches) {
        content = content.replace(pattern, replacement);
        modified = true;
        fileChanges += matches.length;
      }
    }

    if (modified) {
      writeFileSync(file, content, 'utf8');
      filesModified++;
      totalChanges += fileChanges;
      console.log(`✅ Updated: ${path.relative(FRONTEND_DIR, file)} (${fileChanges} changes)`);
    }
  }

  console.log('');
  console.log('📊 Summary:');
  console.log(`   Files processed: ${files.length}`);
  console.log(`   Files modified: ${filesModified}`);
  console.log(`   Total changes: ${totalChanges}`);
  console.log('');
  console.log('✅ Import path transformation complete!');
}

fixImports().catch(console.error);
```

**Usage:**
```bash
chmod +x scripts/fix-imports.ts
bun run scripts/fix-imports.ts
```

---

## Script 3: Component Sync

**File:** `scripts/sync-components.sh`

```bash
#!/bin/bash
# sync-components.sh
# Syncs components from project to frontend

set -e

PROJECT_DIR="/home/kenneth/Documents/Workplace/WebsiteTemplate2/project"
FRONTEND_DIR="/home/kenneth/Documents/Workplace/WebsiteTemplate2/frontend"

echo "🔄 Syncing components from project to frontend..."

# Sync shared components
echo "📦 Syncing shared/components..."
rsync -av --checksum \
  --exclude='*.test.*' \
  --exclude='__tests__' \
  "$PROJECT_DIR/shared/components/" \
  "$FRONTEND_DIR/src/shared/components/"

echo "✅ Component sync complete!"
echo ""
echo "⚠️  Remember to:"
echo "   1. Review changes with: git diff"
echo "   2. Fix any import path issues"
echo "   3. Test components"
```

**Usage:**
```bash
chmod +x scripts/sync-components.sh
./scripts/sync-components.sh
```

---

## Script 4: Feature Sync

**File:** `scripts/sync-features.sh`

```bash
#!/bin/bash
# sync-features.sh
# Syncs features from project to frontend

set -e

PROJECT_DIR="/home/kenneth/Documents/Workplace/WebsiteTemplate2/project"
FRONTEND_DIR="/home/kenneth/Documents/Workplace/WebsiteTemplate2/frontend"

echo "🔄 Syncing features from project to frontend..."

# Sync each feature
for feature in account admin auth calculator contact customers faq orders payments subscriptions; do
  echo "📦 Syncing feature: $feature"
  rsync -av --checksum \
    --exclude='*.test.*' \
    --exclude='__tests__' \
    "$PROJECT_DIR/features/$feature/" \
    "$FRONTEND_DIR/src/features/$feature/"
done

echo "✅ Feature sync complete!"
echo ""
echo "⚠️  Remember to:"
echo "   1. Review changes with: git diff"
echo "   2. Fix any import path issues"
echo "   3. Remove any backend-only code"
echo "   4. Test features"
```

**Usage:**
```bash
chmod +x scripts/sync-features.sh
./scripts/sync-features.sh
```

---

## Script 5: Full Sync

**File:** `scripts/full-sync.sh`

```bash
#!/bin/bash
# full-sync.sh
# Performs complete sync from project to frontend

set -e

PROJECT_DIR="/home/kenneth/Documents/Workplace/WebsiteTemplate2/project"
FRONTEND_DIR="/home/kenneth/Documents/Workplace/WebsiteTemplate2/frontend"

echo "🚀 Starting full sync from project to frontend..."
echo ""

# Sync components
echo "1️⃣  Syncing components..."
rsync -av --checksum \
  --exclude='*.test.*' \
  --exclude='__tests__' \
  "$PROJECT_DIR/shared/components/" \
  "$FRONTEND_DIR/src/shared/components/"

# Sync features
echo ""
echo "2️⃣  Syncing features..."
rsync -av --checksum \
  --exclude='*.test.*' \
  --exclude='__tests__' \
  "$PROJECT_DIR/features/" \
  "$FRONTEND_DIR/src/features/"

# Sync utilities
echo ""
echo "3️⃣  Syncing utilities..."
rsync -av --checksum \
  --exclude='*.test.*' \
  --exclude='__tests__' \
  --exclude='*db*' \
  --exclude='*prisma*' \
  "$PROJECT_DIR/shared/utils/" \
  "$FRONTEND_DIR/src/shared/utils/"

# Sync types
echo ""
echo "4️⃣  Syncing types..."
rsync -av --checksum \
  --exclude='*.test.*' \
  "$PROJECT_DIR/shared/types/" \
  "$FRONTEND_DIR/src/shared/types/"

# Sync constants
echo ""
echo "5️⃣  Syncing constants..."
rsync -av --checksum \
  --exclude='*.test.*' \
  "$PROJECT_DIR/shared/constants/" \
  "$FRONTEND_DIR/src/shared/constants/"

# Sync hooks
echo ""
echo "6️⃣  Syncing hooks..."
rsync -av --checksum \
  --exclude='*.test.*' \
  "$PROJECT_DIR/shared/hooks/" \
  "$FRONTEND_DIR/src/shared/hooks/"

# Copy tailwind config
echo ""
echo "7️⃣  Copying tailwind.config.ts..."
cp "$PROJECT_DIR/tailwind.config.ts" "$FRONTEND_DIR/tailwind.config.ts"

# Update content paths in tailwind config
sed -i 's|"./pages/\*\*/\*.{ts,tsx}"|"./src/**/*.{ts,tsx}"|g' "$FRONTEND_DIR/tailwind.config.ts"
sed -i 's|"./components/\*\*/\*.{ts,tsx}"|"./src/**/*.{ts,tsx}"|g' "$FRONTEND_DIR/tailwind.config.ts"
sed -i 's|"./app/\*\*/\*.{ts,tsx}"|"./src/**/*.{ts,tsx}"|g' "$FRONTEND_DIR/tailwind.config.ts"

echo ""
echo "✅ Full sync complete!"
echo ""
echo "⚠️  Next steps:"
echo "   1. Review all changes: git diff"
echo "   2. Run import fixer: bun run scripts/fix-imports.ts"
echo "   3. Remove backend-only code from services"
echo "   4. Test build: bun run build"
echo "   5. Test lint: bun run lint"
echo "   6. Test app: bun run dev"
```

**Usage:**
```bash
chmod +x scripts/full-sync.sh
./scripts/full-sync.sh
```

---

## Script 6: Verification Script

**File:** `scripts/verify-migration.ts`

```typescript
#!/usr/bin/env bun
// verify-migration.ts
// Verifies migration completeness

import { existsSync, statSync } from 'fs';
import { glob } from 'glob';
import path from 'path';

const PROJECT_DIR = '/home/kenneth/Documents/Workplace/WebsiteTemplate2/project';
const FRONTEND_DIR = '/home/kenneth/Documents/Workplace/WebsiteTemplate2/frontend/src';

interface VerificationResult {
  category: string;
  expected: number;
  actual: number;
  missing: string[];
  status: 'pass' | 'fail' | 'warning';
}

async function verifyComponents(): Promise<VerificationResult> {
  const projectComponents = await glob(`${PROJECT_DIR}/shared/components/**/*.tsx`);
  const frontendComponents = await glob(`${FRONTEND_DIR}/shared/components/**/*.tsx`);
  
  const projectSet = new Set(projectComponents.map(f => path.basename(f)));
  const frontendSet = new Set(frontendComponents.map(f => path.basename(f)));
  
  const missing = [...projectSet].filter(f => !frontendSet.has(f));
  
  return {
    category: 'Components',
    expected: projectComponents.length,
    actual: frontendComponents.length,
    missing,
    status: missing.length === 0 ? 'pass' : 'warning',
  };
}

async function verifyFeatures(): Promise<VerificationResult> {
  const features = ['account', 'admin', 'auth', 'calculator', 'contact', 
                   'customers', 'faq', 'orders', 'payments', 'subscriptions'];
  
  const missing: string[] = [];
  
  for (const feature of features) {
    const projectPath = `${PROJECT_DIR}/features/${feature}`;
    const frontendPath = `${FRONTEND_DIR}/features/${feature}`;
    
    if (!existsSync(frontendPath)) {
      missing.push(feature);
    }
  }
  
  return {
    category: 'Features',
    expected: features.length,
    actual: features.length - missing.length,
    missing,
    status: missing.length === 0 ? 'pass' : 'fail',
  };
}

async function verifyStructure(): Promise<VerificationResult> {
  const requiredDirs = [
    'shared/components',
    'shared/constants',
    'shared/contexts',
    'shared/hooks',
    'shared/lib',
    'shared/providers',
    'shared/services',
    'shared/types',
    'shared/utils',
    'features',
    'styles',
  ];
  
  const missing = requiredDirs.filter(dir => !existsSync(`${FRONTEND_DIR}/${dir}`));
  
  return {
    category: 'Folder Structure',
    expected: requiredDirs.length,
    actual: requiredDirs.length - missing.length,
    missing,
    status: missing.length === 0 ? 'pass' : 'fail',
  };
}

async function verifyConfig(): Promise<VerificationResult> {
  const requiredFiles = [
    'tsconfig.json',
    'tailwind.config.ts',
    'vite.config.ts',
    'package.json',
    '.env.example',
  ];
  
  const missing = requiredFiles.filter(file => 
    !existsSync(`${FRONTEND_DIR}/../${file}`)
  );
  
  return {
    category: 'Configuration Files',
    expected: requiredFiles.length,
    actual: requiredFiles.length - missing.length,
    missing,
    status: missing.length === 0 ? 'pass' : 'warning',
  };
}

async function main() {
  console.log('🔍 Verifying migration completeness...\n');
  
  const results = await Promise.all([
    verifyStructure(),
    verifyComponents(),
    verifyFeatures(),
    verifyConfig(),
  ]);
  
  console.log('📊 Verification Results:\n');
  
  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : 
                 result.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${icon} ${result.category}`);
    console.log(`   Expected: ${result.expected}`);
    console.log(`   Actual: ${result.actual}`);
    
    if (result.missing.length > 0) {
      console.log(`   Missing: ${result.missing.join(', ')}`);
    }
    console.log('');
  }
  
  const allPassed = results.every(r => r.status === 'pass');
  const hasWarnings = results.some(r => r.status === 'warning');
  
  if (allPassed) {
    console.log('✅ All verifications passed!');
  } else if (hasWarnings) {
    console.log('⚠️  Some warnings found. Review and address as needed.');
  } else {
    console.log('❌ Some verifications failed. Please address the issues.');
    process.exit(1);
  }
}

main().catch(console.error);
```

**Usage:**
```bash
chmod +x scripts/verify-migration.ts
bun run scripts/verify-migration.ts
```

---

## Complete Migration Workflow

### Step-by-Step Process

```bash
# 1. Reorganize folder structure
./scripts/reorganize-frontend.sh

# 2. Perform full sync
./scripts/full-sync.sh

# 3. Fix import paths
bun run scripts/fix-imports.ts

# 4. Verify migration
bun run scripts/verify-migration.ts

# 5. Test build
cd frontend
bun run build

# 6. Test lint
bun run lint

# 7. Run dev server
bun run dev
```

---

## Troubleshooting

### Issue: Import paths not updating
**Solution:** Run fix-imports.ts again, check for edge cases

### Issue: Components missing after sync
**Solution:** Check rsync output, verify source paths

### Issue: Build fails after sync
**Solution:** Check for backend-only imports, remove them

### Issue: Types not matching
**Solution:** Ensure TypeScript strict mode enabled, fix type errors

---

## Maintenance

### Regular Sync
Run these scripts periodically to keep frontend in sync with project:

```bash
# Weekly sync
./scripts/full-sync.sh
bun run scripts/fix-imports.ts
bun run scripts/verify-migration.ts
```

### After Project Updates
When project folder is updated:

```bash
# Sync specific parts
./scripts/sync-components.sh  # If components changed
./scripts/sync-features.sh    # If features changed
```
