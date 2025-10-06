#!/usr/bin/env node
/**
 * Bundle script to create a standalone single-file CSP Evaluator library
 * This bundles all compiled JavaScript files into one standalone file
 */

const fs = require('fs');
const path = require('path');

// Read all compiled JS files in dependency order
const files = [
  'dist/finding.js',
  'dist/csp.js',
  'dist/utils.js',
  'dist/allowlist_bypasses/angular.js',
  'dist/allowlist_bypasses/flash.js',
  'dist/allowlist_bypasses/jsonp.js',
  'dist/checks/parser_checks.js',
  'dist/checks/security_checks.js',
  'dist/checks/strictcsp_checks.js',
  'dist/parser.js',
  'dist/evaluator.js'
];

// Build the standalone file
let standalone = `/**
 * CSP Evaluator - Standalone Single-File Library
 * 
 * This is a standalone version of the CSP Evaluator library bundled into a single file.
 * It requires no external dependencies except standard JavaScript built-ins.
 * 
 * Usage:
 *   // In browser or Node.js:
 *   const result = CSPEvaluator.evaluateCSP("script-src 'unsafe-inline' https://example.com");
 *   console.log(result.findings);
 *   console.log(result.summary);
 * 
 * Or use the classes directly:
 *   const parser = new CSPEvaluator.CspParser("script-src https://example.com");
 *   const evaluator = new CSPEvaluator.CspEvaluator(parser.csp);
 *   const findings = evaluator.evaluate();
 * 
 * @license Apache-2.0
 * @author Originally by Lukas Weichselbaum (lwe@google.com)
 */

(function(global) {
  'use strict';

  // Create a module registry
  const modules = {};
  const loaded = {};
  
  // Define a custom require function
  function customRequire(modulePath) {
    if (loaded[modulePath]) {
      return loaded[modulePath];
    }
    
    const moduleMap = {
      './finding': 'finding',
      './csp': 'csp',
      './utils': 'utils',
      '../utils': 'utils',
      '../allowlist_bypasses/angular': 'allowlist_bypasses_angular',
      '../allowlist_bypasses/flash': 'allowlist_bypasses_flash',
      '../allowlist_bypasses/jsonp': 'allowlist_bypasses_jsonp',
      './checks/parser_checks': 'checks_parser_checks',
      './checks/security_checks': 'checks_security_checks',
      './checks/strictcsp_checks': 'checks_strictcsp_checks',
      '../csp': 'csp',
      '../finding': 'finding',
      './parser': 'parser',
      '../parser': 'parser',
      './evaluator': 'evaluator'
    };
    
    const moduleName = moduleMap[modulePath];
    if (moduleName && modules[moduleName]) {
      loaded[modulePath] = modules[moduleName]();
      return loaded[modulePath];
    }
    
    return {};
  }
  
`;

// Process each file and create module factories
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  const moduleName = file.replace('dist/', '').replace(/\//g, '_').replace(/\.js$/, '');
  
  standalone += `  // ===== ${file} =====\n`;
  standalone += `  modules['${moduleName}'] = function() {\n`;
  standalone += `    const exports = {};\n`;
  standalone += `    const module = { exports };\n`;
  standalone += `    const require = customRequire;\n`;
  standalone += `    \n`;
  
  // Process the content - remove use strict and __esModule
  content = content
    .replace(/["']use strict["'];?\s*\n?/g, '')
    .replace(/Object\.defineProperty\(exports,\s*["']__esModule["'],\s*\{\s*value:\s*true\s*\}\);?\s*\n?/g, '');
  
  // Indent the content
  const indented = content.split('\n').map(line => '    ' + line).join('\n');
  standalone += indented + '\n';
  standalone += `    \n`;
  standalone += `    return exports;\n`;
  standalone += `  };\n\n`;
});

// Initialize modules in order
standalone += `  // Initialize all modules\n`;
files.forEach((file) => {
  const moduleName = file.replace('dist/', '').replace(/\//g, '_').replace(/\.js$/, '');
  const varName = `${moduleName}_mod`;
  const modulePath = file.replace('dist/', './').replace(/\.js$/, '');
  standalone += `  const ${varName} = customRequire('${modulePath}');\n`;
});

// Add public API
standalone += `\n  // ===== Public API =====\n`;
standalone += `  \n`;
standalone += `  /**\n`;
standalone += `   * Evaluate a CSP string and return findings\n`;
standalone += `   * @param {string} cspString - The CSP string to evaluate\n`;
standalone += `   * @param {object} options - Optional configuration\n`;
standalone += `   * @param {number} options.cspVersion - CSP version (1, 2, or 3) - defaults to 3\n`;
standalone += `   * @param {boolean} options.strictChecks - Include strict CSP checks - defaults to false\n`;
standalone += `   * @returns {object} Object containing findings and metadata\n`;
standalone += `   */\n`;
standalone += `  function evaluateCSP(cspString, options = {}) {\n`;
standalone += `    const cspVersion = options.cspVersion || csp_mod.Version.CSP3;\n`;
standalone += `    const strictChecks = options.strictChecks || false;\n`;
standalone += `    \n`;
standalone += `    const cspParser = new parser_mod.CspParser(cspString);\n`;
standalone += `    const parsedCsp = cspParser.csp;\n`;
standalone += `    \n`;
standalone += `    const cspEvaluator = new evaluator_mod.CspEvaluator(parsedCsp, cspVersion);\n`;
standalone += `    const checks = strictChecks ? \n`;
standalone += `      [...evaluator_mod.DEFAULT_CHECKS, ...evaluator_mod.STRICTCSP_CHECKS] : \n`;
standalone += `      evaluator_mod.DEFAULT_CHECKS;\n`;
standalone += `    const findings = cspEvaluator.evaluate(undefined, checks);\n`;
standalone += `    \n`;
standalone += `    return {\n`;
standalone += `      csp: parsedCsp,\n`;
standalone += `      findings: findings,\n`;
standalone += `      summary: {\n`;
standalone += `        total: findings.length,\n`;
standalone += `        high: findings.filter(f => f.severity === finding_mod.Severity.HIGH).length,\n`;
standalone += `        medium: findings.filter(f => f.severity === finding_mod.Severity.MEDIUM || f.severity === finding_mod.Severity.MEDIUM_MAYBE).length,\n`;
standalone += `        info: findings.filter(f => f.severity === finding_mod.Severity.INFO).length,\n`;
standalone += `        syntax: findings.filter(f => f.severity === finding_mod.Severity.SYNTAX).length\n`;
standalone += `      }\n`;
standalone += `    };\n`;
standalone += `  }\n\n`;

// Export to global scope
standalone += `  // Export to global scope\n`;
standalone += `  const CSPEvaluator = {\n`;
standalone += `    evaluateCSP,\n`;
standalone += `    CspParser: parser_mod.CspParser,\n`;
standalone += `    CspEvaluator: evaluator_mod.CspEvaluator,\n`;
standalone += `    Csp: csp_mod.Csp,\n`;
standalone += `    Finding: finding_mod.Finding,\n`;
standalone += `    Severity: finding_mod.Severity,\n`;
standalone += `    Type: finding_mod.Type,\n`;
standalone += `    Directive: csp_mod.Directive,\n`;
standalone += `    Keyword: csp_mod.Keyword,\n`;
standalone += `    Version: csp_mod.Version\n`;
standalone += `  };\n\n`;

standalone += `  global.CSPEvaluator = CSPEvaluator;\n\n`;

standalone += `  // For Node.js / CommonJS\n`;
standalone += `  if (typeof module !== 'undefined' && module.exports) {\n`;
standalone += `    module.exports = CSPEvaluator;\n`;
standalone += `  }\n\n`;

standalone += `})(typeof window !== 'undefined' ? window : global);\n`;

// Write the standalone file
fs.writeFileSync('csp-evaluator.js', standalone, 'utf8');
console.log('✓ Created csp-evaluator.js');
console.log(`  File size: ${(standalone.length / 1024).toFixed(2)} KB`);
