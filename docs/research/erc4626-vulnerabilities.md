# ERC-4626 Vault Vulnerabilities: A Comprehensive Security Analysis

## Executive Summary

ERC-4626 has emerged as the de facto standard for tokenized vaults in DeFi, enabling yield aggregators, lending markets, and staking derivatives to share a common interface. However, this standardization has also highlighted critical vulnerabilities that have led to millions of dollars in losses. The most devastating of these is the **inflation attack**, which exploits rounding errors and donation vectors to steal user funds. This report provides an in-depth analysis of ERC-4626 security vulnerabilities, their exploitation mechanics, and comprehensive mitigation strategies.

---

## Table of Contents

1. [Introduction to ERC-4626](#1-introduction-to-erc-4626)
2. [The Inflation Attack](#2-the-inflation-attack)
3. [The Donation Attack](#3-the-donation-attack)
4. [Case Study: ResupplyFi Hack](#4-case-study-resupplyfi-hack)
5. [Other Vulnerability Classes](#5-other-vulnerability-classes)
6. [Mitigation Strategies](#6-mitigation-strategies)
7. [Best Practices for Developers](#7-best-practices-for-developers)
8. [Audit Recommendations](#8-audit-recommendations)
9. [Conclusion](#9-conclusion)

---

## 1. Introduction to ERC-4626

### 1.1 What is ERC-4626?

ERC-4626 is a standardized interface for tokenized vaults that extends ERC-20. It provides a consistent API for yield-bearing vaults that represent shares of a single underlying ERC-20 token. The standard was designed to solve the fragmentation problem where each protocol implemented its own vault logic with incompatible interfaces.

**Key Components:**
- **Assets**: The underlying ERC-20 tokens deposited into the vault
- **Shares**: ERC-20 tokens representing proportional ownership of the vault
- **Exchange Rate**: `totalAssets / totalSupply` determines the value relationship

### 1.2 Core Functions

```solidity
// View functions
function asset() external view returns (address);
function totalAssets() external view returns (uint256);
function convertToShares(uint256 assets) external view returns (uint256);
function convertToAssets(uint256 shares) external view returns (uint256);

// Mutable functions
function deposit(uint256 assets, address receiver) external returns (uint256 shares);
function mint(uint256 shares, address receiver) external returns (uint256 assets);
function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);
function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);
```

### 1.3 Why ERC-4626 Matters

The standard has been adopted by major protocols including:
- **Yearn Finance** - Yield aggregator
- **Balancer** - Automated portfolio manager
- **Morpho** - Lending protocol
- **Convex** - Curve yield optimizer

This widespread adoption means vulnerabilities in ERC-4626 implementations can affect billions in total value locked (TVL).

---

## 2. The Inflation Attack

### 2.1 Attack Overview

The inflation attack exploits rounding behavior in ERC-4626 vault share calculations. When an attacker manipulates the vault's `totalAssets` relative to `totalSupply`, subsequent depositors may receive zero or minimal shares due to integer division rounding down.

### 2.2 The Vulnerability Root Cause

The core vulnerability lies in the share calculation formula:

```solidity
shares = totalSupply * assets / totalAssets;
```

When `totalAssets` is artificially inflated through direct token transfers (donations), the division can result in:

1. **Zero shares** for legitimate depositors (assets × supply ÷ inflated assets = 0)
2. **Disproportionate share ownership** for the attacker

### 2.3 Detailed Attack Scenarios

#### Scenario 1: Rounding to Zero Shares

**Initial State:**
```
totalAssets = 0
totalSupply = 0
```

**Attack Steps:**

1. **Attacker front-runs initial deposit:**
   ```solidity
   // Attacker deposits 1 wei
   vault.deposit(1, attacker);
   ```
   Result: `totalAssets = 1`, `totalSupply = 1`

2. **Attacker donates tokens to inflate denominator:**
   ```solidity
   // Direct transfer to vault (skips share minting)
   IERC20(asset).transfer(address(vault), 20_000e18);
   ```
   Result: `totalAssets = 20_000e18 + 1`

3. **Victim deposits 20,000 tokens:**
   ```solidity
   vault.deposit(20_000e18, victim);
   ```
   
   **Calculation:**
   ```
   shares = 1 * 20_000e18 / (20_000e18 + 1)
   shares = 20_000e18 / 20_000e18.000000000000000001
   shares = 0 (rounded down)
   ```
   
   Result: Victim receives **zero shares** despite depositing 20,000 tokens!

4. **Attacker drains the vault:**
   ```solidity
   vault.redeem(1, attacker, attacker);  // Gets all ~20,000 tokens
   ```

#### Scenario 2: Rounding to One Share

If the vault prevents zero-share deposits (`require(shares > 0)`), the attack still works:

**After donation of 10,000 tokens:**
```
totalAssets = 10_000e18 + 1
totalSupply = 1
```

**Victim deposit calculation:**
```
shares = 1 * 20_000e18 / (10_000e18 + 1)
shares = 1 (rounded down)
```

Victim receives only **1 share** while attacker also has 1 share:
- Pool: 30,000 tokens
- Each share worth: 15,000 tokens
- Attacker profit: ~5,000 tokens (25% of victim's deposit)

### 2.4 Mathematical Analysis

The attack exploits integer division truncation:

```
┌─────────────────────────────────────────────────────────────┐
│                    Division Truncation                      │
├─────────────────────────────────────────────────────────────┤
│  shares = totalSupply * assets / totalAssets                │
│                                                             │
│  With attacker = 1 share, victim depositing 20,000:         │
│                                                             │
│  Normal:    1 * 20,000 / 1     = 20,000 shares              │
│  Inflated:  1 * 20,000 / 20,001 = 0.9999... → 0 shares      │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Why New Vaults Are Most Vulnerable

New vaults with low liquidity are prime targets because:
1. Small donations cause large percentage changes in `totalAssets`
2. Low `totalSupply` means attacker can easily gain majority share percentage
3. First depositor effectively sets the initial exchange rate

---

## 3. The Donation Attack

### 3.1 Attack Mechanism

The donation attack is a variant of inflation attack where the attacker sends tokens directly to the vault without minting shares. This manipulates `totalAssets` without changing `totalSupply`.

**Key insight:** ERC-20 tokens can be transferred to any address, including vault contracts, without triggering any vault logic.

### 3.2 Attack Prerequisites

For the attack to be profitable:
1. Vault must accept direct token transfers
2. No minimum initial liquidity requirement
3. Vault shares used as collateral (for lending protocol exploits)
4. No sanity checks on exchange rate

### 3.3 Donation Attack Formula

```
After donation:
  totalAssets = originalAssets + donatedAssets
  totalSupply = unchanged

Exchange rate becomes:
  exchangeRate = (originalAssets + donatedAssets) / totalSupply

Attacker deposits 1 wei:
  shares = 1 wei (first depositor special case)
  
Effective value per share:
  valuePerShare = (originalAssets + donatedAssets) / 1
```

---

## 4. Case Study: ResupplyFi Hack

### 4.1 Incident Overview

**Date:** June 2025  
**Protocol:** ResupplyFi (lending protocol integrated with Convex/Yearn)  
**Loss:** ~$9.8 million  
**Attack Type:** ERC-4626 donation attack with flash loan

### 4.2 Protocol Architecture

ResupplyFi allowed users to:
1. Deposit stablecoins into ERC-4626 vaults
2. Receive vault shares as collateral
3. Borrow against those shares

The exploited vault was **wstUSR**, holding crvUSD tokens.

### 4.3 Exploit Walkthrough

#### Step 1: Flash Loan Setup
```solidity
function exploit() external {
    // Borrow $4,000 worth of crvUSD
    flashLoan(4000e18, address(this), abi.encode("attack"));
}
```

#### Step 2: Donation Attack
```solidity
// Donate 2,000 crvUSD directly to vault (no shares minted)
IERC20(crvUSD).transfer(address(vault), 2_000e18);

// Vault state after donation:
totalAssets = 2,000 crvUSD
totalSupply = 0
```

#### Step 3: Tiny Deposit
```solidity
// Deposit 1 wei
vault.deposit(1, attacker);

// Vault state after deposit:
totalAssets = 2,000 crvUSD
totalSupply = 1 share
exchangeRate = 2,000 / 1 = 2,000 crvUSD per share
```

#### Step 4: Exchange Rate Manipulation
The attacker repeated the donation-deposit cycle multiple times, pushing the exchange rate to extreme levels.

#### Step 5: Collateral Exploitation
```solidity
// Borrowing against inflated shares
lendingPool.borrow(
    collateral = address(wstUSR),
    amount = 9_800_000e18,  // $9.8M drained
    onBehalfOf = attacker
);
```

#### Step 6: Fund Laundering
- Swapped crvUSD → ETH/USDT/DAI via Curve/Uniswap
- Split across multiple wallets
- Laundered via Tornado Cash

### 4.4 Vulnerability Analysis

**Vulnerable Code:**
```solidity
function deposit(uint256 assets, address receiver) public returns (uint256 shares) {
    require(assets > 0, "Zero deposit");
    
    uint256 supply = totalSupply();
    uint256 balance = totalAssets();
    
    // Vulnerable calculation
    shares = assets * supply / balance;
    
    _mint(receiver, shares);
    asset.safeTransferFrom(msg.sender, address(this), assets);
}
```

**Root Causes:**
1. No minimum initial liquidity check
2. Unhandled direct donations
3. Lending logic trusted vault accounting blindly
4. No exchange rate sanity checks

---

## 5. Other Vulnerability Classes

### 5.1 Oracle Manipulation

ERC-4626 vaults using `convertToShares`/`convertToAssets` as price oracles are vulnerable to manipulation:

**Attack Vector:**
```solidity
// Manipulator donates tokens
IERC20(asset).transfer(address(vault), largeAmount);

// Oracle now reports inflated value
uint256 price = vault.convertToAssets(1e18);  // Artificially high
```

**Mitigation:** Use TWAP (Time-Weighted Average Price) oracles instead of spot prices.

### 5.2 Fee-on-Transfer Tokens

Vaults supporting fee-on-transfer tokens (e.g., USDT, USDC in some contexts) must account for transferred fees:

```solidity
// WRONG: Doesn't account for fees
uint256 balanceBefore = asset.balanceOf(address(this));
asset.safeTransferFrom(msg.sender, address(this), assets);
uint256 balanceAfter = asset.balanceOf(address(this));
uint256 actualAssets = balanceAfter - balanceBefore;  // Less than requested!

// CORRECT: Track actual assets received
uint256 balanceBefore = asset.balanceOf(address(this));
asset.safeTransferFrom(msg.sender, address(this), assets);
uint256 actualAssets = asset.balanceOf(address(this)) - balanceBefore;
require(actualAssets == assets, "Fee-on-transfer not supported");
```

### 5.3 Rounding Direction Issues

Per ERC-4626 specification:

| Function | Rounding Direction | Rationale |
|----------|-------------------|-----------|
| `convertToShares` (view) | Round down | Don't overvalue shares |
| `convertToAssets` (view) | Round down | Don't overvalue assets |
| `previewDeposit` | Round down | Favor vault |
| `previewMint` | Round up | Favor vault |
| `previewWithdraw` | Round up | Favor vault |
| `previewRedeem` | Round down | Favor vault |

**Implementation Example:**
```solidity
function convertToShares(uint256 assets) public view override returns (uint256) {
    uint256 supply = totalSupply();
    if (supply == 0) {
        return assets;
    }
    return assets.mulDiv(supply, totalAssets(), Math.Rounding.Down);
}

function convertToAssets(uint256 shares) public view override returns (uint256) {
    uint256 supply = totalSupply();
    if (supply == 0) {
        return shares;
    }
    return shares.mulDiv(totalAssets(), supply, Math.Rounding.Down);
}
```

### 5.4 Reentrancy via Callbacks

Some ERC-4626 implementations support callbacks that could enable reentrancy:

```solidity
// VULNERABLE to reentrancy
function deposit(uint256 assets, address receiver) external returns (uint256) {
    _mint(receiver, shares);
    
    // External call before updating accounting
    IFeeReceiver(msg.sender).onDepositCallback(shares);  // Can re-enter!
    
    asset.safeTransferFrom(msg.sender, address(this), assets);
    return shares;
}
```

---

## 6. Mitigation Strategies

### 6.1 Minimum Initial Liquidity

**Implementation:**
```solidity
uint256 public constant MIN_INITIAL_LIQUIDITY = 1_000e18;

function deposit(uint256 assets, address receiver) public returns (uint256 shares) {
    if (totalSupply() == 0) {
        require(assets >= MIN_INITIAL_LIQUIDITY, "Insufficient initial deposit");
        // Mint initial shares to address(0) or to the vault itself
        shares = assets;
        _mint(address(0), shares);  // Burn initial shares
        shares = 0;
    }
    
    // ... rest of deposit logic
}
```

**Pros:**
- Forces meaningful initial exchange rate
- Prevents tiny deposits from setting prices

**Cons:**
- First depositor loses funds (effectively burned)
- May discourage early liquidity providers

### 6.2 Dead Shares (Uniswap V2 Pattern)

**Implementation:**
```solidity
uint256 public constant DEAD_SHARES = 1000;

function deposit(uint256 assets, address receiver) public returns (uint256 shares) {
    uint256 calculatedShares = convertToShares(assets);
    
    if (totalSupply() == 0) {
        // Mint dead shares on first deposit
        _mint(address(0), DEAD_SHARES);
        calculatedShares -= DEAD_SHARES;
    }
    
    require(calculatedShares > 0, "Zero shares");
    _mint(receiver, calculatedShares);
    asset.safeTransferFrom(msg.sender, address(this), assets);
}
```

**Pros:**
- Low gas overhead
- Optional module

**Cons:**
- Doesn't fully prevent attacks (just makes them expensive)
- Locks some assets permanently

### 6.3 Virtual Offset (OpenZeppelin Approach)

**Implementation:**
```solidity
uint256 private constant _DECIMAL_OFFSET = 10;  // Extra decimal places

function totalAssets() public view override returns (uint256) {
    return asset.balanceOf(address(this)) + _VIRTUAL_ASSETS;
}

function totalSupply() public view override returns (uint256) {
    return super.totalSupply() + _VIRTUAL_SHARES;
}

function convertToShares(uint256 assets) public view override returns (uint256) {
    return assets.mulDiv(
        totalSupply() + 10**_DECIMAL_OFFSET,
        totalAssets() + _VIRTUAL_ASSETS,
        Math.Rounding.Down
    );
}
```

**How it works:**
- Virtual assets and shares are added to calculations
- Rounding errors become negligible
- Attack profitability reduced significantly

### 6.4 Internal Asset Tracking

**Implementation:**
```solidity
uint256 private _trackedAssets;

function deposit(uint256 assets, address receiver) public returns (uint256 shares) {
    _trackedAssets += assets;  // Track before external calls
    asset.safeTransferFrom(msg.sender, address(this), assets);
    
    // Use tracked assets instead of balance
    shares = assets.mulDiv(totalSupply() + 1, _trackedAssets, Math.Rounding.Down);
    _mint(receiver, shares);
}

// Override totalAssets to use tracked value
function totalAssets() public view override returns (uint256) {
    return _trackedAssets;
}
```

**Pros:**
- Immune to donation attacks
- Self-contained logic

**Cons:**
- Doesn't work with rebasing tokens
- Potential token loss if funds sent directly to vault

### 6.5 Router Pattern

Using a router contract for all vault interactions:

```solidity
// Router implementation
contract ERC4626Router {
    function deposit(address vault, uint256 assets, address receiver, uint256 minShares) 
        external returns (uint256 shares) {
        
        // Router takes custody first
        IERC20(IERC4626(vault).asset()).transferFrom(msg.sender, address(this), assets);
        IERC20(IERC4626(vault).asset()).approve(vault, assets);
        
        // Deposit through router
        shares = IERC4626(vault).deposit(assets, receiver);
        
        require(shares >= minShares, "Slippage exceeded");
    }
}
```

**Pros:**
- First depositor protection
- Centralized security

**Cons:**
- Additional trust assumption (router)
- Higher gas costs

### 6.6 Exchange Rate Sanity Checks

```solidity
uint256 public constant MAX_EXCHANGE_RATE = 1e30;  // Reasonable upper bound
uint256 public constant MIN_EXCHANGE_RATE = 1;     // Lower bound

function _checkExchangeRateSanity(uint256 newAssets, uint256 newShares) internal view {
    if (totalSupply() == 0) return;
    
    uint256 newRate = (totalAssets() + newAssets).mulDiv(1e18, totalSupply() + newShares);
    
    // Check for extreme rates
    require(newRate >= MIN_EXCHANGE_RATE, "Rate too low");
    require(newRate <= MAX_EXCHANGE_RATE, "Rate too high");
}
```

---

## 7. Best Practices for Developers

### 7.1 Implementation Checklist

- [ ] Use OpenZeppelin's audited ERC-4626 implementation
- [ ] Implement minimum initial liquidity requirement
- [ ] Add virtual offset for extra precision
- [ ] Include exchange rate sanity checks
- [ ] Prevent zero-share mints
- [ ] Handle fee-on-transfer tokens explicitly
- [ ] Follow correct rounding directions
- [ ] Add reentrancy guards on all external calls
- [ ] Emit events for all state changes

### 7.2 Integration Checklist

- [ ] Don't use vault share price as sole oracle
- [ ] Implement slippage protection for users
- [ ] Validate deposits against minimum/maximum amounts
- [ ] Cross-check vault prices with external oracles
- [ ] Test edge cases with low liquidity
- [ ] Fuzz test donation scenarios

### 7.3 Recommended Code Patterns

**Secure Deposit Function:**
```solidity
function deposit(uint256 assets, address receiver) public override returns (uint256 shares) {
    // Check for fee-on-transfer tokens
    uint256 balanceBefore = asset.balanceOf(address(this));
    asset.safeTransferFrom(msg.sender, address(this), assets);
    uint256 actualAssets = asset.balanceOf(address(this)) - balanceBefore;
    
    require(actualAssets > 0, "Zero assets");
    require(actualAssets >= assets, "Fee-on-transfer not supported");
    
    // Minimum liquidity check for first depositor
    if (totalSupply() == 0) {
        require(actualAssets >= MIN_INITIAL_LIQUIDITY, "Below minimum initial liquidity");
    }
    
    // Calculate shares with proper rounding
    shares = actualAssets.mulDiv(totalSupply() + 1, totalAssets() + actualAssets, Math.Rounding.Down);
    
    require(shares > 0, "Zero shares");
    
    // State updates before external calls
    _mint(receiver, shares);
    
    // Emit event
    emit Deposit(msg.sender, receiver, actualAssets, shares);
}
```

### 7.4 Testing Recommendations

```solidity
contract ERC4626Test is Test {
    address user = makeAddr("user");
    address attacker = makeAddr("attacker");
    IERC4626 vault;
    
    function testInflationAttack() public {
        // Setup
        vm.startPrank(attacker);
        IERC20(asset).approve(address(vault), type(uint256).max);
        
        // Step 1: Attacker deposits 1 wei
        vault.deposit(1, attacker);
        
        // Step 2: Attacker donates
        IERC20(asset).transfer(address(vault), 10_000e18);
        
        // Step 3: Victim deposits
        vm.startPrank(user);
        IERC20(asset).approve(address(vault), type(uint256).max);
        
        // Should revert with proper protection
        vm.expectRevert("Zero shares");
        vault.deposit(10_000e18, user);
    }
    
    function testInflationAttackWithMinimumLiquidity() public {
        // Test that minimum liquidity requirement prevents attack
        vm.startPrank(attacker);
        
        // First deposit must meet minimum
        vault.deposit(MIN_INITIAL_LIQUIDITY, attacker);
        
        // Attack no longer profitable
        IERC20(asset).transfer(address(vault), 10_000e18);
        
        vm.startPrank(user);
        // User gets fair shares
        uint256 shares = vault.deposit(10_000e18, user);
        assertGt(shares, 0);
    }
}
```

---

## 8. Audit Recommendations

### 8.1 Critical Test Cases

1. **Zero Supply State**
   - First deposit with minimum liquidity
   - First deposit with tiny amount (1 wei)
   - Verify zero-share protection

2. **Donation Scenarios**
   - Direct ERC-20 transfer to vault
   - Multiple sequential donations
   - Large donation before first deposit

3. **Exchange Rate Manipulation**
   - Extreme exchange rate values
   - Flash loan attacks
   - Sandwich attacks with swap pools

4. **Fee-on-Transfer**
   - Deposit with transfer fees
   - Withdrawal with fees
   - Mixed fee and non-fee tokens

### 8.2 Audit Focus Areas

| Area | Risk Level | Check |
|------|------------|-------|
| Initial liquidity | Critical | Minimum deposit requirement |
| Donation handling | Critical | Direct transfer accounting |
| Rounding directions | High | Correct Math.Rounding usage |
| Oracle integration | High | TWAP vs spot price |
| Callback hooks | Medium | Reentrancy guards |
| Fee tokens | Medium | Balance tracking |
| Access control | Low | Admin functions |

### 8.3 Tools and Techniques

- **Echidna/Foundry fuzzing**: Test extreme inputs
- **Slither**: Static analysis for common vulnerabilities
- **Mythril**: Security scanning
- **Manual audit**: Expert review of edge cases
- **Formal verification**: Mathematical proof of correctness

---

## 9. Conclusion

ERC-4626 has significantly improved vault standardization in DeFi, but its adoption has also exposed critical vulnerabilities that have resulted in millions of dollars in losses. The inflation and donation attacks represent fundamental risks that stem from:

1. **Rounding behavior** in integer division
2. **Unchecked direct token transfers** (donations)
3. **Lack of initial liquidity safeguards**
4. **Trust in vault accounting without verification**

### Key Takeaways

**For Developers:**
- Always implement minimum initial liquidity requirements
- Use OpenZeppelin's audited implementation with virtual offset
- Add exchange rate sanity checks
- Never trust vault share prices as oracles without verification

**For Protocols:**
- Cross-check vault prices with independent oracles
- Implement collateral verification in lending logic
- Test low-liquidity and edge case scenarios

**For Auditors:**
- Specifically test donation and inflation attack vectors
- Fuzz test initial vault states
- Verify rounding direction compliance
- Review oracle integration assumptions

The ResupplyFi hack demonstrates that even audited protocols can miss these subtle vulnerabilities. As DeFi continues to grow, the security of ERC-4626 implementations remains paramount. Developers must prioritize defense-in-depth strategies, combining multiple mitigation techniques to protect user funds.

---

## References

1. [ERC-4626 EIP Specification](https://eips.ethereum.org/EIPS/eip-4626)
2. [OpenZeppelin ERC-4626 Implementation](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC4626/ERC4626.sol)
3. [OpenZeppelin: A Novel Defense Against ERC4626 Inflation Attacks](https://blog.openzeppelin.com/a-novel-defense-against-erc4626-inflation-attacks)
4. [MixBytes: Overview of the Inflation Attack](https://mixbytes.io/blog/overview-of-the-inflation-attack)
5. [Zellic: Exploring ERC-4626 Security Primer](https://www.zellic.io/blog/exploring-erc-4626/)
6. [ResupplyFi Hack Analysis - SolidityScan](https://blog.solidityscan.com/resupply-hack-analysis-d4e3baaa294a)
7. [a16z ERC-4626 Property Tests](https://github.com/a16z/erc4626-tests)

---

*Document Version: 1.0*  
*Last Updated: January 2026*  
*Author: SC-Researcher Agent*
