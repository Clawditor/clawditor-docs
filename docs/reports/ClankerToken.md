# Report


## Gas Optimizations


| |Issue|Instances|
|-|:-|:-:|
| [GAS-1](#GAS-1) | Using bools for storage incurs overhead | 1 |
| [GAS-2](#GAS-2) | For Operations that will not overflow, you could use unchecked | 31 |
| [GAS-3](#GAS-3) | `++i` costs less gas compared to `i++` or `i += 1` (same for `--i` vs `i--` or `i -= 1`) | 5 |
### <a name="GAS-1"></a>[GAS-1] Using bools for storage incurs overhead
Use uint256(1) and uint256(2) for true/false to avoid a Gwarmaccess (100 gas), and to avoid Gsset (20000 gas) when changing from ‘false’ to ‘true’, after having been ‘true’ in the past. See [source](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/58f635312aa21f947cae5f8578638a85aa2519f5/contracts/security/ReentrancyGuard.sol#L23-L27).

*Instances (1)*:
```solidity
File: src/ClankerToken.sol

52:     bool private _verified;

```
[Link to code](https://basescan.org/address/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07src/ClankerToken.sol)

### <a name="GAS-2"></a>[GAS-2] For Operations that will not overflow, you could use unchecked

*Instances (31)*:
```solidity
File: src/ClankerToken.sol

4: import {IERC7802} from "@contracts-bedrock/interfaces/L2/IERC7802.sol";

5: import {Predeploys} from "@contracts-bedrock/src/libraries/Predeploys.sol";

6: import {Unauthorized} from "@contracts-bedrock/src/libraries/errors/CommonErrors.sol";

7: import {IERC165} from "@openzeppelin/contracts/interfaces/IERC165.sol";

8: import {IERC5805} from "@openzeppelin/contracts/interfaces/IERC5805.sol";

9: import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

10: import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

12: import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

13: import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

14: import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

16: import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

19:  .--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--. 

20: / .. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \

21: \ \/\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ \/ /

22:  \/ /`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'\/ / 

23:  / /\  ````````````````````````````````````````````````````````````````````````````````````  / /\ 

24: / /\ \ ```````````````````````````````````````````````````````````````````````````````````` / /\ \

25: \ \/ / ```````::::::::``:::````````````:::`````::::````:::`:::````:::`::::::::::`:::::::::` \ \/ /

26:  \/ /  `````:+:````:+:`:+:``````````:+:`:+:```:+:+:```:+:`:+:```:+:``:+:````````:+:````:+:`  \/ / 

27:  / /\  ````+:+````````+:+`````````+:+```+:+``:+:+:+``+:+`+:+``+:+```+:+````````+:+````+:+``  / /\ 

28: / /\ \ ```+#+````````+#+````````+#++:++#++:`+#+`+:+`+#+`+#++:++````+#++:++#```+#++:++#:```` / /\ \

29: \ \/ / ``+#+````````+#+````````+#+`````+#+`+#+``+#+#+#`+#+``+#+```+#+````````+#+````+#+```` \ \/ /

30:  \/ /  `#+#````#+#`#+#````````#+#`````#+#`#+#```#+#+#`#+#```#+#``#+#````````#+#````#+#`````  \/ / 

31:  / /\  `########``##########`###`````###`###````####`###````###`##########`###````###``````  / /\ 

32: / /\ \ ```````````````````````````````````````````````````````````````````````````````````` / /\ \

33: \ \/ / ```````````````````````````````````````````````````````````````````````````````````` \ \/ /

34:  \/ /  ````````````````````````````````````````````````````````````````````````````````````  \/ / 

35:  / /\.--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--./ /\ 

36: / /\ \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \.. \/\ \

37: \ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `' /

38:  `--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--' 

```
[Link to code](https://basescan.org/address/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07src/ClankerToken.sol)

### <a name="GAS-3"></a>[GAS-3] `++i` costs less gas compared to `i++` or `i += 1` (same for `--i` vs `i--` or `i -= 1`)
Pre-increments and pre-decrements are cheaper.

For a `uint256 i` variable, the following is true with the Optimizer enabled at 10k:

**Increment:**

- `i += 1` is the most expensive form
- `i++` costs 6 gas less than `i += 1`
- `++i` costs 5 gas less than `i++` (11 gas less than `i += 1`)

**Decrement:**

- `i -= 1` is the most expensive form
- `i--` costs 11 gas less than `i -= 1`
- `--i` costs 5 gas less than `i--` (16 gas less than `i -= 1`)

Note that post-increments (or post-decrements) return the old value before incrementing or decrementing, hence the name *post-increment*:

```solidity
uint i = 1;  
uint j = 2;
require(j == i++, "This will be false as i is incremented after the comparison");
```
  
However, pre-increments (or pre-decrements) return the new value:
  
```solidity
uint i = 1;  
uint j = 2;
require(j == ++i, "This will be true as i is incremented before the comparison");
```

In the pre-increment case, the compiler has to create a temporary variable (when used) for returning `1` instead of `2`.

Consider using pre-increments and pre-decrements where they are relevant (meaning: not where post-increments/decrements logic are relevant).

*Saves 5 gas per instance*

*Instances (5)*:
```solidity
File: src/ClankerToken.sol

19:  .--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--. 

22:  \/ /`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'\/ / 

28: / /\ \ ```+#+````````+#+````````+#++:++#++:`+#+`+:+`+#+`+#++:++````+#++:++#```+#++:++#:```` / /\ \

35:  / /\.--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--..--./ /\ 

38:  `--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--' 

```
[Link to code](https://basescan.org/address/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07src/ClankerToken.sol)


## Non Critical Issues


| |Issue|Instances|
|-|:-|:-:|
| [NC-1](#NC-1) | Control structures do not follow the Solidity Style Guide | 9 |
| [NC-2](#NC-2) | Functions should not be longer than 50 lines | 13 |
| [NC-3](#NC-3) | Use a `modifier` instead of a `require/if` statement for a special `msg.sender` actor | 7 |
| [NC-4](#NC-4) | Take advantage of Custom Error's return value property | 7 |
| [NC-5](#NC-5) | Strings should use double quotes rather than single quotes | 4 |
### <a name="NC-1"></a>[NC-1] Control structures do not follow the Solidity Style Guide
See the [control structures](https://docs.soliditylang.org/en/latest/style-guide.html#control-structures) section of the Solidity Style Guide

*Instances (9)*:
```solidity
File: src/ClankerToken.sol

44:     error AlreadyVerified();

52:     bool private _verified;

54:     event Verified(address indexed admin, address indexed token);

118:             revert AlreadyVerified();

120:         _verified = true;

121:         emit Verified(msg.sender, address(this));

125:         return _verified;

169:         if (msg.sender != Predeploys.SUPERCHAIN_TOKEN_BRIDGE) revert Unauthorized();

180:         if (msg.sender != Predeploys.SUPERCHAIN_TOKEN_BRIDGE) revert Unauthorized();

```
[Link to code](https://basescan.org/address/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07src/ClankerToken.sol)

### <a name="NC-2"></a>[NC-2] Functions should not be longer than 50 lines
Overly complex code can make understanding functionality more difficult, try to further modularize your code to ensure readability 

*Instances (13)*:
```solidity
File: src/ClankerToken.sol

90:     function updateImage(string memory image_) external {

98:     function updateMetadata(string memory metadata_) external {

106:     function _update(address from, address to, uint256 value)

124:     function isVerified() external view returns (bool) {

128:     function nonces(address owner) public view override(ERC20Permit, Nonces) returns (uint256) {

132:     function admin() external view returns (address) {

136:     function originalAdmin() external view returns (address) {

140:     function imageUrl() external view returns (string memory) {

144:     function metadata() external view returns (string memory) {

148:     function context() external view returns (string memory) {

167:     function crosschainMint(address _to, uint256 _amount) external {

178:     function crosschainBurn(address _from, uint256 _amount) external {

189:     function supportsInterface(bytes4 _interfaceId) public pure returns (bool) {

```
[Link to code](https://basescan.org/address/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07src/ClankerToken.sol)

### <a name="NC-3"></a>[NC-3] Use a `modifier` instead of a `require/if` statement for a special `msg.sender` actor
If a function is supposed to be access-controlled, a `modifier` should be used instead of a `require/if` statement for more readability.

*Instances (7)*:
```solidity
File: src/ClankerToken.sol

82:         if (msg.sender != _admin) {

91:         if (msg.sender != _admin) {

99:         if (msg.sender != _admin) {

114:         if (msg.sender != _originalAdmin) {

121:         emit Verified(msg.sender, address(this));

169:         if (msg.sender != Predeploys.SUPERCHAIN_TOKEN_BRIDGE) revert Unauthorized();

180:         if (msg.sender != Predeploys.SUPERCHAIN_TOKEN_BRIDGE) revert Unauthorized();

```
[Link to code](https://basescan.org/address/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07src/ClankerToken.sol)

### <a name="NC-4"></a>[NC-4] Take advantage of Custom Error's return value property
An important feature of Custom Error is that values such as address, tokenID, msg.value can be written inside the () sign, this kind of approach provides a serious advantage in debugging and examining the revert details of dapps such as tenderly.

*Instances (7)*:
```solidity
File: src/ClankerToken.sol

83:             revert NotAdmin();

92:             revert NotAdmin();

100:             revert NotAdmin();

115:             revert NotOriginalAdmin();

118:             revert AlreadyVerified();

169:         if (msg.sender != Predeploys.SUPERCHAIN_TOKEN_BRIDGE) revert Unauthorized();

180:         if (msg.sender != Predeploys.SUPERCHAIN_TOKEN_BRIDGE) revert Unauthorized();

```
[Link to code](https://basescan.org/address/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07src/ClankerToken.sol)

### <a name="NC-5"></a>[NC-5] Strings should use double quotes rather than single quotes
See the Solidity Style Guide: https://docs.soliditylang.org/en/v0.8.20/style-guide.html#other-recommendations

*Instances (4)*:
```solidity
File: src/ClankerToken.sol

21: \ \/\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ \/ /

22:  \/ /`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'\/ / 

37: \ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `'\ `' /

38:  `--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--' 

```
[Link to code](https://basescan.org/address/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07src/ClankerToken.sol)


## Low Issues


| |Issue|Instances|
|-|:-|:-:|
| [L-1](#L-1) | Division by zero not prevented | 1 |
### <a name="L-1"></a>[L-1] Division by zero not prevented
The divisions below take an input parameter which does not have any zero-value checks, which may lead to the functions reverting when zero is passed.

*Instances (1)*:
```solidity
File: src/ClankerToken.sol

22:  \/ /`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'`--'\/ / 

```
[Link to code](https://basescan.org/address/0x9f86dB9fc6f7c9408e8Fda3Ff8ce4e78ac7a6b07src/ClankerToken.sol)

