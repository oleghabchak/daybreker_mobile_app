#!/usr/bin/env tsx

/**
 * Daybreaker Health Code Generator
 * 
 * Generates screens, components, hooks, and database operations following
 * established patterns and HIPAA compliance requirements.
 */

import { program } from 'commander';
import { generateScreen } from './screen-generator';
import { generateComponent } from './component-generator';
import { generateHook } from './hook-generator';
import { generateDatabase } from './database-generator';
import { generateService } from './service-generator';

program
  .name('daybreaker-gen')
  .description('Daybreaker Health code generation tool')
  .version('1.0.0');

// Screen Generator
program
  .command('screen <name>')
  .description('Generate a new screen with navigation, styling, and state management')
  .option('-t, --type <type>', 'Screen type (onboarding|main|modal)', 'main')
  .option('-f, --form', 'Include form handling')
  .option('-a, --auth', 'Require authentication')
  .option('-d, --database <table>', 'Connect to database table')
  .action(async (name, options) => {
    await generateScreen(name, options);
  });

// Component Generator
program
  .command('component <name>')
  .description('Generate a UI component following design system')
  .option('-t, --type <type>', 'Component type (ui|business|layout)', 'ui')
  .option('-p, --props <props>', 'Component props (comma-separated)')
  .option('-s, --styled', 'Generate with StyleSheet')
  .option('-i, --interactive', 'Include interaction handlers')
  .action(async (name, options) => {
    await generateComponent(name, options);
  });

// Hook Generator
program
  .command('hook <name>')
  .description('Generate a custom React hook')
  .option('-t, --type <type>', 'Hook type (state|data|effect)', 'state')
  .option('-d, --database <table>', 'Connect to database table')
  .option('-r, --realtime', 'Include real-time subscriptions')
  .action(async (name, options) => {
    await generateHook(name, options);
  });

// Database Generator
program
  .command('database <table>')
  .description('Generate database operations (CRUD) with HIPAA compliance')
  .option('-t, --types', 'Generate TypeScript types')
  .option('-h, --hooks', 'Generate React hooks')
  .option('-a, --audit', 'Include audit logging')
  .option('-r, --rls', 'Include Row Level Security policies')
  .action(async (table, options) => {
    await generateDatabase(table, options);
  });

// Service Generator
program
  .command('service <name>')
  .description('Generate a service class for business logic')
  .option('-t, --type <type>', 'Service type (api|business|utility)', 'business')
  .option('-s, --singleton', 'Create as singleton')
  .option('-e, --error-handling', 'Include comprehensive error handling')
  .action(async (name, options) => {
    await generateService(name, options);
  });

// List available generators
program
  .command('list')
  .description('List all available generators and their options')
  .action(() => {
    console.log(`
🧬 Daybreaker Health Code Generators

Available Commands:
  screen <name>        Generate screens with navigation & state
  component <name>     Generate UI components with design system
  hook <name>          Generate custom React hooks
  database <table>     Generate HIPAA-compliant database operations
  service <name>       Generate business logic services

Examples:
  daybreaker-gen screen ProfileSettings --form --auth
  daybreaker-gen component HealthCard --type=ui --styled
  daybreaker-gen hook useHealthMetrics --database=health_scores --realtime
  daybreaker-gen database user_workouts --types --hooks --audit

Use --help with any command for detailed options.
    `);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}