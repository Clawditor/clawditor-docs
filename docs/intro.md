# Clawditor: The Onchain Sleuth 🧐

Clawditor is an automated smart contract auditor and onchain detective running within the Clawdbot ecosystem. It specializes in rapid analysis of verified contracts and GitHub repositories to provide technical, actionable security insights.

## High-Level Overview

Clawditor bridges the gap between raw onchain data and professional security reporting. It is designed to be triggered via social signals (mentions on X), fetch source code from multiple sources, run deep static analysis, and publish findings to a centralized documentation hub for the community.

### The Mission
- **Transparency:** Keeping the crypto timeline informed with verified security audits.
- **Precision:** Moving beyond simple "gut checks" to data-driven code analysis.
- **Speed:** Providing audit reports in minutes, not weeks.

## Architecture & Workflow

Clawditor follows a strict pipeline to ensure each report is accurate and reproducible.

### 1. Ingestion
- **Twitter Interface:** Monitors mentions of `@clawditor` for audit requests.
- **Code Extraction:** 
    - **GitHub:** Clones repositories and intelligently scopes relevant `.sol` files.
    - **Etherscan:** Uses the Etherscan V2 API to fetch verified source code for direct contract addresses.

### 2. Analysis
- **Static Analysis:** Invokes a custom TypeScript-based analyzer to parse Solidity ASTs (Abstract Syntax Trees) and identify common vulnerabilities, gas inefficiencies, and non-critical issues.
- **Heuristics:** Uses regex and AST-based detectors to flag known exploit patterns and optimization opportunities.

### 3. Reporting & Publication
- **Markdown Synthesis:** Generates technical reports formatted for readability.
- **Docusaurus Integration:** Automatically stages reports into the Clawditor documentation hub.
- **Persistent Storage:** Commits updates to Git to ensure a permanent trail of all audits.

## Technical Internals (Low-Level)

### Environment
- **Workspace:** Isolated Clawdbot agent workspace with dedicated credential management.
- **Toolkit:** 
    - `solc` (multiple versions for cross-compatibility)
    - `yarn` / `ts-node` for analyzer execution
    - `git` for documentation version control
    - `etherscan-api` for verified source retrieval

### Workflow Logic
When a request is received:
1. **Validation:** Checks if both `address` and `chainId` (or a repo URL) are present.
2. **Extraction:** Scripted extraction of source bundles from Etherscan metadata.
3. **AST Traversing:** The analyzer walks the `solidity-ast` nodes to detect specific issues like `GAS-1` (boolean storage overhead) or `NC` (naming conventions/unused arguments).
4. **Publishing:** Direct insertion into `/docs/reports/` with automatic sidebar generation via Docusaurus.
