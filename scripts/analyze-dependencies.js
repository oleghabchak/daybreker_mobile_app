#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const glob_1 = require("glob");
class DependencyAnalyzer {
    constructor() {
        this.files = new Map();
    }
    async analyze() {
        console.log('🔍 Analyzing codebase dependencies...\n');
        const files = await (0, glob_1.glob)('../src/**/*.{ts,tsx}', {
            ignore: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*'],
            cwd: __dirname,
        });
        // First pass: collect file info
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            const info = this.analyzeFile(file, content);
            this.files.set(file, info);
        }
        // Second pass: build dependency graph
        const migrationOrder = this.calculateMigrationOrder();
        // Generate report
        this.generateReport(migrationOrder);
    }
    analyzeFile(filePath, content) {
        const imports = this.extractImports(content);
        const exports = this.extractExports(content);
        const usesOldTheme = /Spacing\.|Colors\.textPrimary/.test(content);
        const usesNewComponents = /from ['"]\.\.\/components\/ui/.test(content);
        const complexity = this.calculateComplexity(content);
        return {
            path: filePath,
            imports,
            exports,
            usesOldTheme,
            usesNewComponents,
            complexity
        };
    }
    extractImports(content) {
        const importRegex = /import\s+(?:.*?)\s+from\s+['"](.+?)['"]/g;
        const imports = [];
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            imports.push(match[1]);
        }
        return imports;
    }
    extractExports(content) {
        const exportRegex = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
        const exports = [];
        let match;
        while ((match = exportRegex.exec(content)) !== null) {
            exports.push(match[1]);
        }
        return exports;
    }
    calculateComplexity(content) {
        // Simple complexity score based on:
        // - Number of components
        // - Number of styles
        // - Lines of code
        const componentCount = (content.match(/<\w+/g) || []).length;
        const styleCount = (content.match(/styles\.\w+/g) || []).length;
        const lineCount = content.split('\n').length;
        return Math.round((componentCount * 2 + styleCount + lineCount / 10) / 10);
    }
    calculateMigrationOrder() {
        // Sort by:
        // 1. Files with no internal dependencies first
        // 2. Then by increasing complexity
        // 3. Screens last
        const sorted = Array.from(this.files.entries()).sort(([pathA, infoA], [pathB, infoB]) => {
            // Constants first
            if (pathA.includes('/constants/'))
                return -1;
            if (pathB.includes('/constants/'))
                return 1;
            // UI components second
            if (pathA.includes('/components/ui/'))
                return -1;
            if (pathB.includes('/components/ui/'))
                return 1;
            // Other components third
            if (pathA.includes('/components/'))
                return -1;
            if (pathB.includes('/components/'))
                return 1;
            // Screens last
            if (pathA.includes('/screens/'))
                return 1;
            if (pathB.includes('/screens/'))
                return -1;
            // Within same category, sort by complexity
            return infoA.complexity - infoB.complexity;
        });
        return sorted.map(([path]) => path);
    }
    generateReport(migrationOrder) {
        const report = {
            summary: {
                totalFiles: this.files.size,
                filesUsingOldTheme: Array.from(this.files.values()).filter(f => f.usesOldTheme).length,
                filesUsingNewComponents: Array.from(this.files.values()).filter(f => f.usesNewComponents).length,
            },
            migrationOrder: migrationOrder.map((path, index) => {
                const info = this.files.get(path);
                return {
                    order: index + 1,
                    path: path.replace('src/', ''),
                    complexity: info.complexity,
                    status: info.usesNewComponents ? 'partial' : 'pending'
                };
            }),
            criticalPath: this.identifyCriticalPath()
        };
        fs.writeFileSync('dependency-analysis.json', JSON.stringify(report, null, 2));
        console.log('📊 Dependency Analysis Complete\n');
        console.log(`Total files: ${report.summary.totalFiles}`);
        console.log(`Using old theme: ${report.summary.filesUsingOldTheme}`);
        console.log(`Using new components: ${report.summary.filesUsingNewComponents}`);
        console.log('\n🎯 Critical path files:');
        report.criticalPath.forEach(file => console.log(`   - ${file}`));
        console.log('\nFull report saved to dependency-analysis.json');
    }
    identifyCriticalPath() {
        // Files that many others depend on
        const dependencyCount = new Map();
        for (const [filePath, info] of this.files) {
            for (const imp of info.imports) {
                if (imp.startsWith('.')) {
                    const resolvedPath = path.resolve(path.dirname(filePath), imp);
                    const count = dependencyCount.get(resolvedPath) || 0;
                    dependencyCount.set(resolvedPath, count + 1);
                }
            }
        }
        return Array.from(dependencyCount.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([path]) => path.replace(process.cwd() + '/', ''));
    }
}
// Run analysis
const analyzer = new DependencyAnalyzer();
analyzer.analyze().catch(console.error);
