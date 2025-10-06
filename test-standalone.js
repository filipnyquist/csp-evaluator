// Test script for the standalone CSP evaluator
const CSPEvaluator = require('./csp-evaluator.js');

console.log('Testing CSP Evaluator Standalone Library\n');
console.log('='.repeat(50));

// Test 1: Basic CSP evaluation
console.log('\nTest 1: Evaluating a simple CSP with unsafe-inline');
console.log('-'.repeat(50));
const test1 = CSPEvaluator.evaluateCSP("script-src 'unsafe-inline' https://example.com");
console.log('CSP:', "script-src 'unsafe-inline' https://example.com");
console.log('Findings:', test1.findings.length);
console.log('Summary:', test1.summary);
test1.findings.forEach((f, i) => {
  console.log(`  ${i+1}. [${CSPEvaluator.Severity[f.severity]}] ${f.description}`);
});

// Test 2: CSP with missing directives
console.log('\nTest 2: Evaluating CSP with missing directives');
console.log('-'.repeat(50));
const test2 = CSPEvaluator.evaluateCSP("script-src 'self'");
console.log('CSP:', "script-src 'self'");
console.log('Findings:', test2.findings.length);
console.log('Summary:', test2.summary);
test2.findings.slice(0, 3).forEach((f, i) => {
  console.log(`  ${i+1}. [${CSPEvaluator.Severity[f.severity]}] ${f.description.substring(0, 80)}...`);
});

// Test 3: Good CSP with nonces
console.log('\nTest 3: Evaluating CSP with nonce');
console.log('-'.repeat(50));
const test3 = CSPEvaluator.evaluateCSP("script-src 'nonce-abc123def456' 'strict-dynamic'; object-src 'none'; base-uri 'none'");
console.log('CSP:', "script-src 'nonce-abc123def456' 'strict-dynamic'; object-src 'none'; base-uri 'none'");
console.log('Findings:', test3.findings.length);
console.log('Summary:', test3.summary);
test3.findings.forEach((f, i) => {
  console.log(`  ${i+1}. [${CSPEvaluator.Severity[f.severity]}] ${f.description.substring(0, 80)}${f.description.length > 80 ? '...' : ''}`);
});

// Test 4: Using classes directly
console.log('\nTest 4: Using classes directly');
console.log('-'.repeat(50));
const parser = new CSPEvaluator.CspParser("default-src 'self'; script-src 'unsafe-eval'");
console.log('Parsed CSP directives:', Object.keys(parser.csp.directives));
const evaluator = new CSPEvaluator.CspEvaluator(parser.csp);
const findings = evaluator.evaluate();
console.log('Found', findings.length, 'issues');

console.log('\n' + '='.repeat(50));
console.log('All tests completed successfully!');
