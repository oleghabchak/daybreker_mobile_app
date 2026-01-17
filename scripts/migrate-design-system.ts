#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface Migration {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
  description: string;
}

const migrations: Migration[] = [
  // Spacing migrations
  {
    pattern: /Spacing\.xs/g,
    replacement: 'Space[1]',
    description: 'Update xs spacing (4px)',
  },
  {
    pattern: /Spacing\.sm/g,
    replacement: 'Space[2]',
    description: 'Update sm spacing (8px)',
  },
  {
    pattern: /Spacing\.md/g,
    replacement: 'Space[4]',
    description: 'Update md spacing (16px)',
  },
  {
    pattern: /Spacing\.lg/g,
    replacement: 'Space[6]',
    description: 'Update lg spacing (24px)',
  },
  {
    pattern: /Spacing\.xl/g,
    replacement: 'Space[8]',
    description: 'Update xl spacing (32px)',
  },
  {
    pattern: /Spacing\.xxl/g,
    replacement: 'Space[12]',
    description: 'Update xxl spacing (48px)',
  },
  
  // Import updates
  {
    pattern: /import \{ ([^}]*), Spacing([^}]*) \} from '(.*)\/theme'/g,
    replacement: (match, before, after, path) => {
      const items = [before, after].filter(Boolean).join(',');
      return `import { ${items}, Space } from '${path}/theme'`;
    },
    description: 'Update theme imports',
  },
  
  // Color migrations
  {
    pattern: /Colors\.primary/g,
    replacement: 'Colors.primary',
    description: 'Primary color (now orange)',
  },
  {
    pattern: /Colors\.textPrimary/g,
    replacement: 'Colors.text',
    description: 'Update text primary color',
  },
  {
    pattern: /Colors\.background/g,
    replacement: 'Colors.background',
    description: 'Background color',
  },
  
  // Component migrations
  {
    pattern: /<TouchableOpacity([^>]*?)style=\{(\[?)(styles\.button)/g,
    replacement: '<Button$1style={$2$3',
    description: 'Replace TouchableOpacity buttons with Button component',
  },
  {
    pattern: /<TextInput([^>]*?)style=\{(\[?)(styles\.input)/g,
    replacement: '<Input$1style={$2$3',
    description: 'Replace TextInput with Input component',
  },
];

async function migrateFile(filePath: string): Promise<boolean> {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    const changes: string[] = [];

    migrations.forEach(migration => {
      const before = content;
      content = content.replace(migration.pattern, migration.replacement as any);
      if (before !== content) {
        hasChanges = true;
        changes.push(migration.description);
      }
    });

    // Add imports for new components if needed
    if (hasChanges) {
      // Check if we need to add UI component imports
      if (content.includes('<Button') && !content.includes("from '../components/ui/Button'")) {
        const importPath = path.relative(path.dirname(filePath), path.join(__dirname, '../src/components/ui/Button'));
        content = `import { Button } from '${importPath}';\n` + content;
      }
      if (content.includes('<Input') && !content.includes("from '../components/ui/Input'")) {
        const importPath = path.relative(path.dirname(filePath), path.join(__dirname, '../src/components/ui/Input'));
        content = `import { Input } from '${importPath}';\n` + content;
      }
      if (content.includes('<Toggle') && !content.includes("from '../components/ui/Toggle'")) {
        const importPath = path.relative(path.dirname(filePath), path.join(__dirname, '../src/components/ui/Toggle'));
        content = `import { Toggle } from '${importPath}';\n` + content;
      }

      fs.writeFileSync(filePath, content);
      console.log(`✅ ${path.relative(process.cwd(), filePath)}`);
      changes.forEach(change => console.log(`   - ${change}`));
    }

    return hasChanges;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting design system migration...\n');

  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['**/node_modules/**', '**/constants/theme.ts'],
  });

  console.log(`Found ${files.length} files to process\n`);

  let migratedCount = 0;
  for (const file of files) {
    if (await migrateFile(file)) {
      migratedCount++;
    }
  }

  console.log(`\n✨ Migration complete! Updated ${migratedCount} files.`);
  
  // Generate migration report
  const report = {
    totalFiles: files.length,
    migratedFiles: migratedCount,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2));
  console.log('\n📊 Migration report saved to migration-report.json');
}

main().catch(console.error);