#!/usr/bin/env node
/**
 * Comprehensive example showing all features of the standalone CSP evaluator
 */

const CSPEvaluator = require('./csp-evaluator.js');

console.log('═'.repeat(70));
console.log('  CSP Evaluator - Standalone Library - Comprehensive Example');
console.log('═'.repeat(70));
console.log();

// Example 1: Basic usage with evaluateCSP
console.log('📋 Example 1: Basic CSP Evaluation');
console.log('─'.repeat(70));
const result1 = CSPEvaluator.evaluateCSP("script-src 'unsafe-inline' https://cdn.example.com");
console.log('CSP: script-src \'unsafe-inline\' https://cdn.example.com');
console.log('Summary:', result1.summary);
console.log('Top finding:', result1.findings[0]?.description.substring(0, 60) + '...');
console.log();

// Example 2: Using parser and evaluator classes directly
console.log('🔧 Example 2: Using Classes Directly');
console.log('─'.repeat(70));
const parser = new CSPEvaluator.CspParser("default-src 'self'; script-src 'nonce-abc123'");
console.log('Parsed directives:', Object.keys(parser.csp.directives));
console.log('Script-src values:', parser.csp.directives['script-src']);

const evaluator = new CSPEvaluator.CspEvaluator(parser.csp);
const findings = evaluator.evaluate();
console.log('Findings count:', findings.length);
console.log();

// Example 3: Filtering by severity
console.log('🚨 Example 3: Filtering by Severity');
console.log('─'.repeat(70));
const result3 = CSPEvaluator.evaluateCSP("script-src https://cdn.jsdelivr.net");
const highSeverity = result3.findings.filter(f => 
  f.severity === CSPEvaluator.Severity.HIGH
);
const mediumSeverity = result3.findings.filter(f => 
  f.severity === CSPEvaluator.Severity.MEDIUM ||
  f.severity === CSPEvaluator.Severity.MEDIUM_MAYBE
);
console.log('Total findings:', result3.findings.length);
console.log('High severity issues:', highSeverity.length);
console.log('Medium severity issues:', mediumSeverity.length);
console.log();

// Example 4: Checking different CSP versions
console.log('🔢 Example 4: CSP Version Comparison');
console.log('─'.repeat(70));
const cspWithNonce = "script-src 'nonce-abc123' 'unsafe-inline'";
const v1Result = CSPEvaluator.evaluateCSP(cspWithNonce, { 
  cspVersion: CSPEvaluator.Version.CSP1 
});
const v3Result = CSPEvaluator.evaluateCSP(cspWithNonce, { 
  cspVersion: CSPEvaluator.Version.CSP3 
});
console.log('CSP:', cspWithNonce);
console.log('CSP v1 findings:', v1Result.findings.length);
console.log('CSP v3 findings:', v3Result.findings.length);
console.log('(v3 ignores unsafe-inline when nonce is present)');
console.log();

// Example 5: Strict CSP checks
console.log('🔒 Example 5: Strict CSP Checks');
console.log('─'.repeat(70));
const strictResult = CSPEvaluator.evaluateCSP("script-src https://example.com", {
  strictChecks: true
});
console.log('CSP: script-src https://example.com');
console.log('With strict checks:', strictResult.findings.length, 'findings');
const strictRecommendations = strictResult.findings.filter(f =>
  f.severity === CSPEvaluator.Severity.STRICT_CSP
);
console.log('Strict CSP recommendations:', strictRecommendations.length);
if (strictRecommendations.length > 0) {
  console.log('Example:', strictRecommendations[0].description.substring(0, 60) + '...');
}
console.log();

// Example 6: Validating a good strict CSP
console.log('✅ Example 6: Validating a Strict CSP');
console.log('─'.repeat(70));
const goodCSP = "script-src 'nonce-randomNonce123' 'strict-dynamic'; " +
                "object-src 'none'; base-uri 'none'";
const goodResult = CSPEvaluator.evaluateCSP(goodCSP);
console.log('CSP:', goodCSP);
console.log('Findings:', goodResult.findings.length);
if (goodResult.findings.length === 0) {
  console.log('✓ This is a well-configured strict CSP!');
} else {
  console.log('Issues found:', goodResult.findings.map(f => f.description).join(', '));
}
console.log();

// Example 7: Checking for specific directive types
console.log('🔍 Example 7: Checking Specific Directives');
console.log('─'.repeat(70));
const complexCSP = "default-src 'self'; script-src 'self' https://trusted.cdn.com; " +
                   "style-src 'unsafe-inline'; img-src *; object-src 'none'";
const parser7 = new CSPEvaluator.CspParser(complexCSP);
console.log('Directives present:');
for (const [directive, values] of Object.entries(parser7.csp.directives)) {
  console.log(`  ${directive}: ${values?.join(' ') || '(none)'}`);
}
console.log();

// Example 8: Understanding Finding types
console.log('📊 Example 8: Finding Types');
console.log('─'.repeat(70));
const result8 = CSPEvaluator.evaluateCSP("script-src 'unsafe-eval' https://cdn.com");
const findingTypes = {};
result8.findings.forEach(f => {
  const typeName = Object.keys(CSPEvaluator.Type).find(
    key => CSPEvaluator.Type[key] === f.type
  );
  findingTypes[typeName] = (findingTypes[typeName] || 0) + 1;
});
console.log('Finding types found:');
for (const [type, count] of Object.entries(findingTypes)) {
  console.log(`  ${type}: ${count}`);
}
console.log();

// Example 9: Checking allowlist bypasses
console.log('⚠️  Example 9: Allowlist Bypass Detection');
console.log('─'.repeat(70));
const bypassCSP = "script-src 'self' https://ajax.googleapis.com";
const bypassResult = CSPEvaluator.evaluateCSP(bypassCSP);
const bypassFindings = bypassResult.findings.filter(f =>
  f.description.includes('bypass') || f.description.includes('JSONP') || 
  f.description.includes('Angular')
);
console.log('CSP:', bypassCSP);
if (bypassFindings.length > 0) {
  console.log('⚠️  Potential bypasses detected:');
  bypassFindings.forEach(f => {
    console.log(`  - ${f.description.substring(0, 60)}...`);
  });
} else {
  console.log('No obvious bypasses detected');
}
console.log();

// Example 10: Complete report
console.log('📄 Example 10: Complete Evaluation Report');
console.log('─'.repeat(70));
function generateReport(cspString) {
  const result = CSPEvaluator.evaluateCSP(cspString);
  
  console.log(`CSP: ${cspString}`);
  console.log();
  console.log('Summary:');
  console.log(`  Total Issues: ${result.summary.total}`);
  console.log(`  High:         ${result.summary.high}`);
  console.log(`  Medium:       ${result.summary.medium}`);
  console.log(`  Info:         ${result.summary.info}`);
  console.log(`  Syntax:       ${result.summary.syntax}`);
  console.log();
  
  if (result.findings.length > 0) {
    console.log('Findings:');
    result.findings.forEach((finding, i) => {
      const severityName = Object.keys(CSPEvaluator.Severity).find(
        key => CSPEvaluator.Severity[key] === finding.severity
      );
      console.log(`  ${i + 1}. [${severityName}] ${finding.directive}`);
      console.log(`     ${finding.description}`);
      if (finding.value) {
        console.log(`     Value: ${finding.value}`);
      }
      console.log();
    });
  } else {
    console.log('✓ No issues found!');
  }
}

generateReport("default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'");

console.log('═'.repeat(70));
console.log('For more examples, see STANDALONE-README.md or open demo.html');
console.log('═'.repeat(70));
