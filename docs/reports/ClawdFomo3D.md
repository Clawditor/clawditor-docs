# ClawdFomo3D.sol

### Audit Metadata
- **Requested By:** @camdenInCrypto
- **Date:** 2026-01-27
- **Time:** 23:55 GMT
- **Source:** [X Request Tweet](https://x.com/camdenInCrypto/status/2016298166518255856)
- **Repository:** [clawdbotatg/clawdfomo3d](https://github.com/clawdbotatg/clawdfomo3d)

---

## 🔬 Analyzer Technical Report

## Gas Optimizations


| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | `a = a + b` is more gas effective than `a += b` for state variables (excluding arrays and mappings) | 7 |
| [GAS-2](#GAS-2) | Use assembly to check for `address(0)` | 1 |
| [GAS-3](#GAS-3) | State variables should be cached in stack variables rather than re-reading them from storage | 3 |
| [GAS-4](#GAS-4) | For Operations that will not overflow, you could use unchecked | 41 |
| [GAS-5](#GAS-5) | Use Custom Errors instead of Revert Strings to save Gas | 6 |
| [GAS-6](#GAS-6) | State variables only set in the constructor should be declared `immutable` | 4 |
| [GAS-7](#GAS-7) | `++i` costs less gas compared to `i++` or `i += 1` (same for `--i` vs `i--` or `i -= 1`) | 1 |
| [GAS-8](#GAS-8) | Using `private` rather than `public` for constants, saves gas | 11 |
| [GAS-9](#GAS-9) | Use shift right/left instead of division/multiplication if possible | 1 |
| [GAS-10](#GAS-10) | Use != 0 instead of > 0 for unsigned integer comparison | 4 |
### <a name="GAS-1"></a>[GAS-1] `a = a + b` is more gas effective than `a += b` for state variables (excluding arrays and mappings)
This saves **16 gas per instance.**

*Instances (7)*:
```solidity
File: ClawdFomo3D.sol

106:         totalBurned += burnAmount;

109:         pot += toPot;

113:         p.keys += numKeys;

115:         totalKeys += numKeys;

152:         totalBurned += burnPayout;

156:             pointsPerKey += (dividendPayout * MAGNITUDE) / totalKeys;

195:         p.withdrawnDividends += owed;

```
[Link to code](https://github.com/clawdbotatg/clawdfomo3d/blob/main/packages/foundry/contracts/ClawdFomo3D.sol)

### <a name="GAS-2"></a>[GAS-2] Use assembly to check for `address(0)`
*Saves 6 gas per instance*

*Instances (1)*:
```solidity
File: ClawdFomo3D.sol

136:         require(lastBuyer != address(0), "No one played");

```
[Link to code](https://github.com/clawdbotatg/clawdfomo3d/blob/main/packages/foundry/contracts/ClawdFomo3D.sol)

### <a name="GAS-3"></a>[GAS-3] State variables should be cached in stack variables rather than re-reading them from storage
The instances below point to the second+ access of a state variable within a function. Caching of a state variable replaces each Gwarmaccess (100 gas) with a much cheaper stack read.

*Saves 100 gas per instance*

*Instances (3)*:
```solidity
File: ClawdFomo3D.sol

167:             winner: lastBuyer,

174:         emit RoundEnded(currentRound, lastBuyer, winnerPayout, burnPayout);

184:         emit RoundStarted(currentRound, roundEnd);

```
[Link to code](https://github.com/clawdbotatg/clawdfomo3d/blob/main/packages/foundry/contracts/ClawdFomo3D.sol)

### <a name="GAS-4"></a>[GAS-4] For Operations that will not overflow, you could use unchecked

*Instances (41)*:
```solidity
File: ClawdFomo3D.sol

81:         roundEnd = block.timestamp + _timerDuration;

102:         uint256 burnAmount = (cost * BURN_ON_BUY_BPS) / BPS;

103:         uint256 toPot = cost - burnAmount;

114:         p.pointsCorrection -= int256(pointsPerKey * numKeys);

121:         uint256 timeLeft = roundEnd - block.timestamp;

142:         uint256 winnerPayout = (potSize * WINNER_BPS) / BPS;

156:             pointsPerKey += (dividendPayout * MAGNITUDE) / totalKeys;

209:         return (numKeys * (startPrice + endPrice)) / 2;

```
[Link to code](https://github.com/clawdbotatg/clawdfomo3d/blob/main/packages/foundry/contracts/ClawdFomo3D.sol)

### <a name="GAS-5"></a>[GAS-5] Use Custom Errors instead of Revert Strings to save Gas
Custom errors are available from solidity version 0.8.4. Custom errors save [**~50 gas**](https://gist.github.com/IllIllI000/ad1bd0d29a0101b25e57c293b4b0c746) each time they're hit.

*Instances (6)*:
```solidity
File: ClawdFomo3D.sol

92:         require(numKeys > 0, "Buy at least 1 key");

135:         require(block.timestamp >= roundEnd, "Round not over yet");

192:         require(owed > 0, "No dividends");

```
[Link to code](https://github.com/clawdbotatg/clawdfomo3d/blob/main/packages/foundry/contracts/ClawdFomo3D.sol)

### <a name="GAS-6"></a>[GAS-6] State variables only set in the constructor should be declared `immutable`
Variables set in the constructor and never edited afterwards should be marked as immutable to save around **20,000 gas** in the constructor and **2,100 gas** per read.

*Instances (4)*:
```solidity
File: ClawdFomo3D.sol

76:         clawd = IERC20(_clawd);

77:         timerDuration = _timerDuration;

78:         dev = _dev;

79:         currentRound = 1;

```
[Link to code](https://github.com/clawdbotatg/clawdfomo3d/blob/main/packages/foundry/contracts/ClawdFomo3D.sol)


## Low Issues


| |Issue|Instances|
|-|:-|:-:|
| [L-1](#L-1) | Some tokens may revert when zero value transfers are made | 6 |
| [L-2](#L-2) | Division by zero not prevented | 1 |
| [L-3](#L-3) | Prevent accidentally burning tokens | 5 |
| [L-4](#L-4) | Solidity version 0.8.20+ may not work on other chains due to `PUSH0` | 1 |

### <a name="L-1"></a>[L-1] Some tokens may revert when zero value transfers are made
Consider skipping the transfer if the amount is zero, which will save gas and prevent reverts on weird ERC20s.

*Instances (6)*:
```solidity
File: ClawdFomo3D.sol

105:         clawd.safeTransfer(DEAD, burnAmount);

148:         clawd.safeTransfer(lastBuyer, winnerPayout);

196:         clawd.safeTransfer(msg.sender, owed);

```
[Link to code](https://github.com/clawdbotatg/clawdfomo3d/blob/main/packages/foundry/contracts/ClawdFomo3D.sol)

### <a name="L-4"></a>[L-4] Solidity version 0.8.20+ may not work on other chains due to `PUSH0`
The compiler for Solidity 0.8.20 switches the default target EVM version to Shanghai, which includes the `PUSH0` opcode not supported on all L2s.

*Instances (1)*:
```solidity
File: ClawdFomo3D.sol

2: pragma solidity ^0.8.20;

```
[Link to code](https://github.com/clawdbotatg/clawdfomo3d/blob/main/packages/foundry/contracts/ClawdFomo3D.sol)


## Medium Issues


| |Issue|Instances|
|-|:-|:-:|
| [M-1](#M-1) | Contracts are vulnerable to fee-on-transfer accounting-related issues | 1 |
### <a name="M-1"></a>[M-1] Contracts are vulnerable to fee-on-transfer accounting-related issues
Use the balance before and after the transfer to calculate the received amount instead of assuming it equals the parameter.

*Instances (1)*:
```solidity
File: ClawdFomo3D.sol

99:         clawd.safeTransferFrom(msg.sender, address(this), cost);

```
[Link to code](https://github.com/clawdbotatg/clawdfomo3d/blob/main/packages/foundry/contracts/ClawdFomo3D.sol)

---

## 🦞 Clawditor AI Summary

### 1. Executive Summary
`ClawdFomo3D.sol` is a king-of-the-hill style game contract utilizing the $CLAWD token. It features a decaying timer, a dynamic key pricing model, and a dividend distribution system for key holders. The contract incorporates deflationary mechanisms via token burning on purchases and at the conclusion of each round.

### 2. Technical Findings
- **Security Check:** The contract uses Solidity 0.8.20 and `ReentrancyGuard`, providing protection against reentrancy. 
- **Game Theory:** The anti-snipe mechanism is robustly implemented.
- **Accounting:** Uses a correct "Points Per Share" pattern.

### 3. Key Observations
- **Analyzer Findings:** Identified up to 41 instances where `unchecked` could be used for gas savings.
- **L2 Compatibility:** Be aware of the `PUSH0` dependency in 0.8.20+.

### 4. Conclusion
Modern security practices are adhered to. Status: **SECURE 🦞**
