# CSP Evaluator - Standalone Library

This is a single-file, standalone version of the CSP Evaluator library that requires no external dependencies (except standard JavaScript built-ins).

## Features

- **Zero Dependencies**: No npm packages or external libraries needed
- **Single File**: Everything bundled into one `csp-evaluator.js` file
- **Universal**: Works in both Node.js and browser environments
- **Complete**: Includes all CSP evaluation checks and bypass detection

## Usage

### Quick Start

The simplest way to use the library:

```javascript
const CSPEvaluator = require('./csp-evaluator.js');

const result = CSPEvaluator.evaluateCSP("script-src 'unsafe-inline' https://example.com");

console.log('Total findings:', result.summary.total);
console.log('High severity:', result.summary.high);

result.findings.forEach(finding => {
  console.log(`- [${finding.severity}] ${finding.description}`);
});
```

### In Browser

```html
<script src="csp-evaluator.js"></script>
<script>
  const result = CSPEvaluator.evaluateCSP("script-src 'self'");
  console.log(result);
</script>
```

### Advanced Usage

You can also use the classes directly for more control:

```javascript
const CSPEvaluator = require('./csp-evaluator.js');

// Parse a CSP
const parser = new CSPEvaluator.CspParser("script-src 'nonce-abc123' 'strict-dynamic'; object-src 'none'");
console.log('Parsed directives:', Object.keys(parser.csp.directives));

// Evaluate with custom options
const evaluator = new CSPEvaluator.CspEvaluator(parser.csp, CSPEvaluator.Version.CSP3);
const findings = evaluator.evaluate();

// Access severity levels
findings.forEach(f => {
  if (f.severity === CSPEvaluator.Severity.HIGH) {
    console.log('Critical issue:', f.description);
  }
});
```

### API Options

The `evaluateCSP` function accepts an options object:

```javascript
const result = CSPEvaluator.evaluateCSP("script-src 'self'", {
  cspVersion: CSPEvaluator.Version.CSP3,  // CSP version (1, 2, or 3)
  strictChecks: false  // Include strict CSP checks
});
```

## Exported API

- `CSPEvaluator.evaluateCSP(cspString, options)` - Main evaluation function
- `CSPEvaluator.CspParser` - Parser class
- `CSPEvaluator.CspEvaluator` - Evaluator class
- `CSPEvaluator.Csp` - CSP object class
- `CSPEvaluator.Finding` - Finding class
- `CSPEvaluator.Severity` - Severity enum
- `CSPEvaluator.Type` - Finding type enum
- `CSPEvaluator.Directive` - CSP directive enum
- `CSPEvaluator.Keyword` - CSP keyword enum
- `CSPEvaluator.Version` - CSP version enum

## Building

To rebuild the standalone library from the TypeScript source:

```bash
# Install dependencies and compile TypeScript
npm install
tsc --build

# Bundle into standalone file
node bundle-standalone.js
```

## Testing

Run the test suite for the standalone library:

```bash
node test-standalone.js
```

## Severity Levels

- **HIGH** (10): Critical issues that allow XSS
- **SYNTAX** (20): Syntax errors in the CSP
- **MEDIUM** (30): Issues that weaken the CSP
- **HIGH_MAYBE** (40): Potential critical issues
- **STRICT_CSP** (45): Strict CSP recommendations
- **MEDIUM_MAYBE** (50): Potential issues
- **INFO** (60): Informational findings
- **NONE** (100): No severity

## Examples

### Example 1: Basic CSP Validation

```javascript
const result = CSPEvaluator.evaluateCSP("default-src 'self'; script-src 'unsafe-inline'");

// Result structure:
// {
//   csp: { /* parsed CSP object */ },
//   findings: [ /* array of Finding objects */ ],
//   summary: {
//     total: 3,
//     high: 2,
//     medium: 1,
//     info: 0,
//     syntax: 0
//   }
// }
```

### Example 2: Check a Strict CSP

```javascript
const strictCSP = "script-src 'nonce-abc123' 'strict-dynamic'; object-src 'none'; base-uri 'none'";
const result = CSPEvaluator.evaluateCSP(strictCSP);

if (result.summary.total === 0) {
  console.log('✓ No issues found - this is a strict CSP!');
} else {
  console.log('Found issues:', result.findings);
}
```

### Example 3: Filter by Severity

```javascript
const result = CSPEvaluator.evaluateCSP("script-src https://cdn.example.com");

const criticalIssues = result.findings.filter(f => 
  f.severity === CSPEvaluator.Severity.HIGH
);

console.log(`Found ${criticalIssues.length} critical issues`);
```

## License

Apache-2.0

## Credits

Originally created by Lukas Weichselbaum (lwe@google.com) and contributors to the [google/csp-evaluator](https://github.com/google/csp-evaluator) project.
