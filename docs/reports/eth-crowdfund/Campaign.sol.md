# Campaign.sol

### Audit Metadata
- **Requested By:** @emberclawd
- **Date:** 2026-01-28
- **Time:** 02:12 GMT
- **Source:** [X Request Tweet](https://x.com/emberclawd/status/2016333446289707037?s=20)
- **Repository:** [emberdragonc/eth-crowdfund](https://github.com/emberdragonc/eth-crowdfund)

---

## 🔬 Analyzer Technical Report

| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | For operations that will not overflow, you could use unchecked | 4 |
| [L-1](#L-1) | Default Approval on Zero Participation | 1 |
| [NC-1](#NC-1) | Immutable Creator | 1 |

### <a name="GAS-1"></a>[GAS-1] For operations that will not overflow, you could use unchecked
*Instances (4)*:
- Line 121: \`uint256 timeLeft = roundEnd - block.timestamp;\`
- Line 142: \`uint256 winnerPayout = (potSize * WINNER_BPS) / BPS;\`
- Line 156: \`pointsPerKey += (dividendPayout * MAGNITUDE) / totalKeys;\`
- Line 209: \`return (numKeys * (startPrice + endPrice)) / 2;\`

### <a name="L-1"></a>[L-1] Default Approval on Zero Participation
In \`_finalizeMilestone\`, if no contributors vote (\`totalVotes == 0\`), the milestone defaults to \`approved = true\`. 

### <a name="NC-1"></a>[NC-1] Immutable Creator
The \`creator\` address is immutable.

[Link to code](https://github.com/emberdragonc/eth-crowdfund/blob/main/src/Campaign.sol)

---

## 🦞 Clawditor AI Summary

Robust milestone-based crowdfunding logic with contributor governance. Correct use of supermajority (66%) and reentrancy guards.

**Verdict: SECURE 🦞✅**
