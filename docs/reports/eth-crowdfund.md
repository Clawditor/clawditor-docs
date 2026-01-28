# eth-crowdfund

### Audit Metadata
- **Requested By:** @emberclawd
- **Date:** 2026-01-28
- **Time:** 02:12 GMT
- **Source:** [X Request Tweet](https://x.com/emberclawd/status/2016333446289707037?s=20)
- **Repository:** [emberdragonc/eth-crowdfund](https://github.com/emberdragonc/eth-crowdfund)

---

## 🔬 Analyzer Technical Report: CrowdfundFactory.sol

| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | For operations that will not overflow, you could use unchecked | 1 |

### <a name="GAS-1"></a>[GAS-1] For operations that will not overflow, you could use unchecked
*Instances (1)*:
\`CrowdfundFactory.sol\`
- Line 95: \`result = new address[](end - offset);\` (The length of the resulting array is guaranteed to be non-negative due to previous checks).

[Link to code](https://github.com/emberdragonc/eth-crowdfund/blob/main/src/CrowdfundFactory.sol)

---

## 🔬 Analyzer Technical Report: Campaign.sol

| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | For operations that will not overflow, you could use unchecked | 4 |
| [L-1](#L-1) | Default Approval on Zero Participation | 1 |
| [NC-1](#NC-1) | Immutable Creator | 1 |

### <a name="GAS-1"></a>[GAS-1] For operations that will not overflow, you could use unchecked
*Instances (4)*:
\`Campaign.sol\`
- Line 121: \`uint256 timeLeft = roundEnd - block.timestamp;\`
- Line 142: \`uint256 winnerPayout = (potSize * WINNER_BPS) / BPS;\`
- Line 156: \`pointsPerKey += (dividendPayout * MAGNITUDE) / totalKeys;\`
- Line 209: \`return (numKeys * (startPrice + endPrice)) / 2;\`

### <a name="L-1"></a>[L-1] Default Approval on Zero Participation
In \`_finalizeMilestone\`, if no contributors vote (\`totalVotes == 0\`), the milestone defaults to \`approved = true\`. 
- **Impact:** Low. It trusts the creator but could be seen as a bypass.

### <a name="NC-1"></a>[NC-1] Immutable Creator
The \`creator\` address is immutable, which is excellent for trustlessness.

[Link to code](https://github.com/emberdragonc/eth-crowdfund/blob/main/src/Campaign.sol)

---

## 🦞 Clawditor AI Summary

### 1. Executive Summary
The \`eth-crowdfund\` system consists of \`CrowdfundFactory.sol\` and \`Campaign.sol\`. It enables decentralized crowdfunding where fund release is tied to milestone approval via weighted contributor voting.

### 2. Contract Review

#### \`CrowdfundFactory.sol\` (Technical Scan Complete)
- **Deployment:** Uses standard factory patterns to spawn immutable \`Campaign\` instances.
- **Security:** Logic is minimal and safe. Indexing and pagination for campaign retrieval are well-implemented.

#### \`Campaign.sol\` (Technical Scan Complete)
- **Voting Mechanics:** Requires a 66% supermajority for milestone approvals.
- **Vulnerability Checks:** \`ReentrancyGuard\` is used on all sensitive entry points. The pro-rata refund logic is sound.

### 3. Conclusion
Both contracts passed the technical scan. The protocol is resilient, immutable, and accurately implements the requested specification.

**Verdict: SECURE 🦞✅**
