# Maximal Extractable Value (MEV): A Comprehensive Technical Analysis of Sandwich Attacks, Front-Running, and the Ethereum vs. Solana Threat Landscape (2025)

Maximal Extractable Value (MEV) represents one of the most economically significant and technically sophisticated phenomena in modern blockchain systems. Unlike traditional smart contract exploits that target specific protocol vulnerabilities, MEV extraction exploits the fundamental property of blockchain: the ability of block proposers to control transaction inclusion, exclusion, and ordering within a block. In 2025, sandwich attacks alone constituted **$289.76 million**, representing **51.56%** of the total MEV transaction volume of **$561.92 million** across Ethereum and alternative chains.

## Technical Foundation: The Anatomy of MEV

### Formal Definition and Prerequisites

MEV can be formally defined as the maximum value that can be extracted by a block proposer (or an entity with influence over block construction) by reordering, inserting, or censoring transactions within a block. The extraction requires three critical primitives:

1. **Observation**: The ability to see pending transactions in the mempool or through direct transaction flow
2. **Influence**: The capability to control transaction ordering or inclusion within a block
3. **Execution**: The technical ability to construct and execute profitable transaction sequences

Mathematically, given a set of pending transactions `T = {t₁, …, tₙ}` available to a block proposer at time `t`, an extractor chooses:
- A subset `S ⊆ T`
- An ordering `π(S)`
- Additional transactions `A = {a₁, …, aₘ}` to insert

The goal is to maximize the proposer's expected profit, which includes both standard transaction fees and MEV extraction revenue.

### The Economic Impact

According to research from the European Securities and Markets Authority (ESMA) and multiple blockchain analytics firms, MEV is **widespread on Ethereum and growing on other chains**. The extracted value represents an "invisible tax" on users, particularly those trading on decentralized exchanges (DEXs), liquidating positions, or interacting with protocols during volatile market conditions.

## Taxonomy of MEV Strategies

### 1. Pure Front-Running

Pure front-running occurs when an attacker observes a pending transaction that will move market prices (typically a large swap on a DEX) and submits a competing transaction with higher gas fees to execute first. The attacker's transaction captures the price movement before the victim's transaction executes.

**Technical Implementation:**
- Monitor the public mempool for large swaps exceeding a certain value threshold
- Calculate the expected price impact of the victim's transaction
- Execute a similar swap in the same direction before the victim
- Capture the spread between the pre-victim and post-victim prices

### 2. Sandwich Attacks

The sandwich attack is the most prevalent form of MEV extraction, constituting the majority of MEV by volume. The attack pattern involves:

1. **Front-Run Transaction**: The attacker submits a buy order immediately before the victim's swap, driving up the price of the target asset
2. **Victim Transaction**: The victim's swap executes at the artificially inflated price, receiving less output than expected
3. **Back-Run Transaction**: The attacker sells the acquired assets immediately after the victim's transaction, capturing the profit from the price movement

**Profit Calculation:**
```
Sandwich Profit = (Price_After_Victim - Price_Before_Victim) × Front_Run_Amount
                - Front_Run_Gas_Costs
                - Back_Run_Gas_Costs
                - Slippage_and_Fees
```

The attack is particularly effective against:
- Large market orders on AMMs with low liquidity
- Trading pairs with high slippage parameters
- Assets with high volatility during specific time windows

### 3. Back-Running and Atomic Arbitrage

Back-running exploits occur when an attacker detects a transaction that creates an arbitrage opportunity and places their transaction immediately after it. This is commonly used for:

- **Liquidation Back-Running**: Detecting undercollateralized positions and submitting liquidation transactions
- **Cross-DEX Arbitrage**: Exploiting price discrepancies between different DEXs or trading pairs
- **Oracle Update Exploitation**: Capturing value from delayed or stale oracle updates

Atomic arbitrage involves executing a sequence of trades within a single block that are only profitable when ordered together. These opportunities arise from:
- Temporary price discrepancies between DEXs
- Cross-chain asset mispricings
- Flash loan-enabled price manipulation followed by arbitrage

### 4. Time-Bandit and Reorg Attacks

The most extreme form of MEV extraction involves reorganizing the blockchain to capture previously confirmed value. While extremely costly and risky, time-bandit attacks become rational when:

- The MEV opportunity exceeds the cost of reorganizing the chain
- Validator coordination allows for successful reorg execution
- The protocol lacks finality guarantees

### 5. Bundle and Auction Participation

Modern MEV markets operate through specialized infrastructure where searchers construct **bundles**—groups of ordered transactions that must be included atomically—and submit them to:
- **Private Relays**: Flashbots-style infrastructure that connects searchers with block builders
- **Block Builders**: Specialized entities that construct maximally profitable blocks
- **MEV Auctions**: Marketplaces where MEV revenue is distributed among searchers, builders, and proposers

## The Ethereum MEV Stack

### Public Mempool and Gas Auctions

The earliest MEV extraction relied on the **public mempool**—a shared pool of pending transactions visible to all network participants. Bots would:
1. Monitor pending transactions in real-time
2. Compute profitable counter-transactions
3. Attach higher gas prices to win inclusion races

This created **destructive competition** characterized by:
- Gas fee auctions that drove network congestion
- Front-running races that degraded user experience
- Predatory extraction of value from retail traders

### Flashbots and Private Bundles

To address the problems of public mempool MEV, the community developed **private relay-based markets** through Flashbots. Key innovations include:

- **Bundle Submission**: Searchers submit signed transaction bundles to a relay
- **Atomic Execution**: Bundles execute all-or-nothing, preventing front-running of the MEV strategy itself
- **Direct Payment**: Searchers pay block proposers directly, bypassing the gas fee market

**Technical Stack:**
```
Searcher → Private Relay → Block Builder → Validator → Proposer
```

### Proposer-Builder Separation (PBS)

Flashbots' **mev-boost** implements Proposer-Builder Separation, which has become central to Ethereum's MEV infrastructure:

1. **Builders** specialize in constructing maximally profitable blocks, incorporating MEV bundles and optimizing transaction ordering
2. **Relays** mediate between builders and proposers, validating block contents without revealing MEV strategies
3. **Proposers** receive blocks from multiple builders and select the most profitable, earning revenue while focusing on consensus duties

**Impact:**
- Reduces harmful on-chain mempool competition
- Concentrates MEV expertise in specialized builders
- Creates centralization pressures around top builders and relays
- Generated over $1.5 billion in validator revenue since implementation

## Solana Architecture and MEV Differences

Solana's fundamentally different architecture creates a distinct MEV threat model:

### Key Architectural Primitives

1. **No Global Mempool (Gulf Stream)**
   - Transactions are forwarded directly to the upcoming leader rather than gossiped to an open mempool
   - The leader schedule is deterministic and known in advance
   - Eliminates the "watch-and-race" dynamic common on Ethereum

2. **Short Blockhash Validity**
   - Recent blockhashes are only valid for ~150 slots (≈1 minute)
   - Transactions cannot linger indefinitely in a pending state
   - Reduces the window for mempool-based observation

3. **Transaction Processing Unit (TPU)**
   - Clients send transactions directly to a leader's TPU port
   - Leaders receive prioritized connections based on stake weight
   - Connection limits and prioritization mechanisms increase sybil attack costs

4. **High Throughput and Parallel Execution**
   - Processes transactions quickly, reducing mempool race windows
   - Increases importance of direct leader access over mempool competition

### Practical Consequences for MEV

- **Access-Based Attacks**: Instead of racing in a public mempool, attackers compete for **privileged access** to leaders through specialized RPC endpoints or validator clients
- **Validator-Centric MEV**: Most MEV flows through validator-level infrastructure rather than separate builder/relay layers
- **Jito and Block Engines**: Specialized middleware projects aggregate searchers, produce optimized block payloads, and coordinate with validators

**Comparison Table: Ethereum vs. Solana MEV**

| Dimension | Ethereum | Solana |
|-----------|----------|--------|
| **Observation** | Public mempool + private relays | Leader-directed RPC, specialized clients |
| **Ordering Control** | PBS, builders, relays | Validators/leaders, block engines |
| **Attack Surface** | Gas auctions, sandwiching, reorg | Access-based attacks, congestion |
| **Mitigation** | Flashbots, mev-boost | Jito, validator client changes |

## Sandwich Attack Deep Dive: The Dominant MEV Vector

### Attack Mechanics

Sandwich attacks constitute the majority of MEV extraction due to their:
- **Predictability**: Large swaps create deterministic price movements
- **Low Technical Barrier**: Exploitable with standard tooling and moderate capital
- **Consistent Profitability**: Systematic extraction from retail trading activity

### Technical Implementation

A typical sandwich attack follows this sequence:

```solidity
// Simplified Sandwich Attack Pattern
contract SandwichAttacker {
    
    function executeSandwich(
        address[] memory path,
        uint256 victimAmountIn,
        uint256 frontRunAmount,
        uint256[] memory pools
    ) external {
        // Step 1: Front-Run - Buy before victim
        uint256 frontRunAmountOut = swap(frontRunAmount, path, true);
        
        // Step 2: Victim executes their swap at inflated price
        // Victim's swap naturally pushes price back down
        
        // Step 3: Back-Run - Sell after victim
        uint256 backRunAmountOut = swap(frontRunAmountOut, path, false);
        
        // Calculate profit
        uint256 profit = backRunAmountOut - frontRunAmount;
        require(profit > 0, "No profit");
    }
}
```

### Detection and Measurement

According to EigenPhi and other MEV analytics platforms:
- **Sandwich attacks represented $289.76 million** (51.56%) of total MEV transaction volume
- Average profit per sandwich attack varies from **$10 to $500** depending on:
  - Victim swap size
  - Liquidity depth of the target pool
  - Gas price conditions
  - Asset volatility

### MEV Searcher Competition

The sandwich attack market has evolved to include:
- **Coopetition**: Multiple searchers coordinating to avoid destructive competition
- **Bundling**: Combining multiple sandwich opportunities in single transactions
- **Cross-DEX Strategies**: Sandwiching across multiple DEXs for amplified profits

## Mitigation Strategies

### Protocol-Level Mitigations

1. **Private Transaction Submission**
   - Encrypted transaction submission protects user privacy through threshold encryption and trusted execution environments
   - Transaction contents are only revealed after block finalization, preventing front-running based on price prediction

2. **Fair Sequencing Services (FSS)**
   - Protocols provide impartial transaction sequencing, prioritizing user transactions
   - Orders are processed in arrival sequence while encrypted

3. **Order Flow Auctions**
   - User order flow is auctioned to multiple participants, reducing single-entity control
   - Auction revenues are shared with users to compensate for potential MEV losses

### DEX-Level Protections

1. **Slippage Limits**
   - Strict slippage parameters prevent large orders from executing at extreme prices
   - Automatic transaction rejection mechanisms for attempted price manipulation

2. **Limit Orders**
   - Support for limit orders that execute only after submission
   - Reduced losses from transaction ordering uncertainty

3. **Batch Auctions**
   - Aggregation of all orders within fixed time windows
   - Uniform clearing prices eliminate transaction ordering advantages

### User-Level Defenses

1. **Private RPC Endpoints**
   - Avoid public mempool exposure
   - Direct transaction submission to validators

2. **Delayed Submission Strategies**
   - Random delays in transaction submission
   - Reduced predictability for MEV bots

3. **Cross-Chain Transaction Routing**
   - Utilization of privacy-protecting DEX aggregators
   - Distributed transaction footprints

## Research Directions and Open Problems

### Privacy-Preserving Block Construction

Cryptographic research is exploring:
- **Fully Homomorphic Encryption**: Computing MEV opportunities while encrypted
- **Threshold Encryption**: Distributed key management preventing single-point control
- **Zero-Knowledge Proofs**: Verifying transaction validity without revealing transaction contents

### MEV Measurement on Solana

The no-mempool architecture creates unique challenges:
- Requires specialized instrumentation of leader traffic
- Validator log analysis tools remain immature
- Measurement methodologies differ fundamentally from Ethereum

### Economic Modeling

- **Access Pricing**: Balancing privileged access versus public fees
- **Stake-Weighted Connection Prioritization**: Modeling costs based on stake weight
- **Decentralized Incentive Distribution**: Distributing MEV revenue without centralizing execution

## Conclusion

MEV represents one of the most economically significant challenges in blockchain systems, with complexity spanning cryptography, economics, and distributed systems. The $289.76 million scale of sandwich attacks in 2025 underscores the systemic risks faced by users.

Ethereum's MEV infrastructure has seen significant improvement through Flashbots and mev-boost, but introduces builder-level centralization risks. Solana's no-mempool architecture fundamentally changes MEV dynamics, shifting competition from fee auctions to access control.

Future research directions focus on:
- Practical privacy-preserving mechanisms
- Decentralized MEV distribution
- Cross-chain MEV mitigation strategies

For developers, understanding the MEV threat model is essential for building extraction-resistant protocols. For users, adopting privacy-preserving transaction strategies can significantly reduce MEV losses. For researchers, MEV provides a rich field connecting cryptography, economics, and distributed systems.
