#!/usr/bin/env node

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface MigrationRule {
  name: string;
  test: (node: ts.Node) => boolean;
  transform: (node: ts.Node, sourceFile: ts.SourceFile) => ts.Node | null;
}

class ASTMigrator {
  private rules: MigrationRule[] = [];
  private printer = ts.createPrinter();

  addRule(rule: MigrationRule) {
    this.rules.push(rule);
  }

  migrateFile(filePath: string): { success: boolean; changes: string[] } {
    const sourceCode = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const changes: string[] = [];
    const transformer = (context: ts.TransformationContext) => {
      return (rootNode: ts.Node) => {
        const visit = (node: ts.Node): ts.Node => {
          for (const rule of this.rules) {
            if (rule.test(node)) {
              const transformed = rule.transform(node, sourceFile);
              if (transformed) {
                changes.push(rule.name);
                return transformed;
              }
            }
          }
          return ts.visitEachChild(node, visit, context);
        };
        return ts.visitNode(rootNode, visit);
      };
    };

    const result = ts.transform(sourceFile, [transformer]);
    const transformedFile = result.transformed[0];
    
    if (changes.length > 0) {
      const newCode = this.printer.printFile(transformedFile as ts.SourceFile);
      fs.writeFileSync(filePath, newCode);
      return { success: true, changes };
    }

    return { success: false, changes: [] };
  }
}

// Example migration rules
const spacingMigrationRule: MigrationRule = {
  name: 'Migrate Spacing tokens',
  test: (node) => {
    if (ts.isPropertyAccessExpression(node)) {
      const obj = node.expression;
      const prop = node.name;
      return ts.isIdentifier(obj) && obj.text === 'Spacing' && ts.isIdentifier(prop);
    }
    return false;
  },
  transform: (node) => {
    const propAccess = node as ts.PropertyAccessExpression;
    const prop = propAccess.name as ts.Identifier;
    
    const spacingMap: Record<string, string> = {
      'xs': '1',
      'sm': '2', 
      'md': '4',
      'lg': '6',
      'xl': '8',
      'xxl': '12'
    };
    
    const newIndex = spacingMap[prop.text];
    if (newIndex) {
      return ts.factory.createElementAccessExpression(
        ts.factory.createIdentifier('Space'),
        ts.factory.createNumericLiteral(newIndex)
      );
    }
    return null;
  }
};

// Run migration
const migrator = new ASTMigrator();
migrator.addRule(spacingMigrationRule);

// Example usage
console.log('AST-based migration tool ready');
console.log('This properly understands TypeScript and preserves code structure');