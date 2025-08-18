# Kappa Token Manager

A comprehensive Node.js application for creating and launching tokens on the Sui blockchain using the Kappa protocol's bonding curve system.

## Features

- 🚀 **Token Creation**: Create custom tokens with metadata
- 📈 **Bonding Curves**: Deploy automated market maker curves
- 💰 **Trading**: Built-in buy/sell functionality
- 📊 **Project Management**: Track token projects and their status
- 💼 **Wallet Integration**: Secure private key management
- 🎯 **Interactive CLI**: User-friendly command-line interface

## Prerequisites

- Node.js 18+ installed
- A Sui wallet with SUI tokens for gas fees
- Basic understanding of blockchain concepts

## Installation

1. **Clone or download the project**
2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```

4. **Edit the `.env` file and add your private key:**
   ```
   MASTER_PRIVATE_KEY=your_sui_private_key_here
   NODE_ENV=development
   ```

5. **Optional: Configure BlockVision API for enhanced performance:**
   ```
   BLOCKVISION_API_KEY=your_blockvision_api_key_here
   USE_HTTPS=true
   ```
   
   **BlockVision Benefits:**
   - Faster RPC response times
   - Higher rate limits
   - Better reliability
   - Enhanced performance for production use
   
   If no BlockVision API key is provided, the system will automatically fall back to the default Sui mainnet RPC endpoint.

## Getting Your Private Key

### From Sui Wallet Browser Extension:
1. Open Sui Wallet
2. Go to Settings → Export Private Key
3. Copy the private key (starts with `suiprivkey1`)

### From Sui CLI:
```bash
sui client active-address
sui keytool export --key-identity [your-address] --json
```

## Getting Your BlockVision API Key (Optional)

BlockVision provides enhanced RPC endpoints with better performance and reliability:

1. **Sign up at BlockVision:**
   - Visit [BlockVision.org](https://blockvision.org)
   - Create an account
   - Navigate to the API section

2. **Get your API key:**
   - Generate a new API key for Sui Mainnet
   - Copy the API key

3. **Add to your `.env` file:**
   ```
   BLOCKVISION_API_KEY=your_api_key_here
   USE_HTTPS=true
   ```

**Note:** If you don't have a BlockVision API key, the system will automatically use the default Sui mainnet RPC endpoint.

## Usage

### Main Menu Interface

Start the interactive menu:
```bash
npm start
```

This opens a menu with the following options:
- 💼 **Wallet Info** - View wallet balance and funding instructions
- 📋 **List Projects** - View all created projects and their status
- 🆕 **Create Project** - Create a new token project
- 🚀 **Launch Token** - Deploy and launch a token with bonding curve
- 🛒 **Buy Token** - Purchase tokens from existing bonding curves
- 💰 **Sell Token** - Sell tokens back to bonding curves for SUI
- 🎯 **Create Distribution** - Generate bundled token purchase distributions
- 🔄 **Refresh Menu** - Refresh the interface
- 🚪 **Exit** - Close the application

### Individual Commands

You can also run specific commands directly:

```bash
# Check wallet information
npm run wallet

# Create a new project
npm run create

# Launch a token
npm run launch

# Buy tokens from existing bonding curves
npm run buy

# Sell tokens back to bonding curves
npm run sell

# List all projects
npm run list

# Create token distribution (PRE-LAUNCH)
npm run distribute

# Fund distribution wallets
npm run fund

# Return SUI to master wallet
npm run return-sui
```

## Project Workflow

### 1. Create a Project
```bash
npm run create
```
- Enter token name, symbol, description
- Add icon URL and social links
- Set tags and transaction limits
- Project is saved with status "created"

### 2. Launch Token
```bash
npm run launch
```
The system automatically detects distribution status and shows appropriate launch options:

#### 🎯 Normal Launch (Always Available)
- Select a project to launch
- Set SUI amount for first buy (default: 0.1 SUI)
- Set minimum tokens to receive
- Confirm launch parameters

**Process:**
1. **Deploy Token Contract** - Creates the Move smart contract
2. **Create Bonding Curve** - Sets up the automated market maker
3. **Perform First Buy** - Bootstraps the curve with initial liquidity

#### 🎯 Launch & Bundle (Available with Funded Distribution)
When a distribution exists and wallets are funded, you'll see both options:
- **Launch Token (Normal)** - Standard launch process
- **Launch & Bundle** - Launch + immediate bundled purchases

**Bundle Process:**
1. **Normal Launch** - Completes standard deployment and dev buy
2. **Bundled Purchases** - Executes purchases from distribution wallets
3. **Progress Tracking** - Shows real-time success/failure rates
4. **Batch Processing** - Handles multiple wallets efficiently

**Auto-Detection:**
- No distribution: Shows "Normal Launch" only
- Distribution exists but unfunded: Shows "Normal Launch" only + funding reminder
- Distribution funded: Shows both "Normal Launch" and "Launch & Bundle" options

### 3. Buy Tokens from Existing Bonding Curves
```bash
npm run buy
```
Purchase tokens from any existing bonding curve on the Sui blockchain:

**Input Options:**
1. **🎯 Bonding curve address** (direct - fastest): Enter the bonding curve address directly
2. **📦 Token contract address** (via Kappa API): Enter full token type (e.g., `0x123...::module::TOKEN`)
3. **🔍 Package ID** (experimental): Enter package ID to search for token automatically

**Features:**
- **Kappa API Integration**: Automatically fetch token metadata, pricing, and bonding curve addresses
- **Multiple Input Methods**: Support for direct addresses, full contract types, or package IDs
- **Real-time Market Data**: Display current price, market cap, volume, and holder count
- **Smart Token Discovery**: Analyze blockchain transactions to find token types
- **AMM Mathematics**: Accurate token calculations using bonding curve formulas
- **Slippage Protection**: Customizable minimum token amounts
- **Comprehensive Preview**: Rich token information and purchase details
- **Gas Estimation**: Automatic gas calculation and balance validation

**Process:**
1. **Choose Input Type** - Select from three input methods above
2. **Enter Address** - Input the appropriate address or contract type
3. **Token Discovery**: 
   - Option 1: Fetch bonding curve data directly from blockchain
   - Option 2: Use Kappa API to get token data and bonding curve address
   - Option 3: Analyze package transactions to find token types, then use Kappa API
4. **Set Purchase Amount** - Enter SUI amount to spend (e.g., 0.1)
5. **Calculate Expected Tokens** - Shows expected tokens using bonding curve math
6. **Set Slippage Protection** - Define minimum tokens to receive (default: 10% slippage)
7. **Review Purchase** - Confirm token, amounts, and slippage tolerance
8. **Execute Transaction** - Complete the purchase and receive tokens

**Purchase Preview:**
- **Token Information**: Name, package ID, and contract details
- **Expected Tokens**: Calculated using current curve reserves
- **Current Reserves**: Shows SUI and token reserves in the curve
- **Slippage**: Percentage difference between expected and minimum tokens
- **Total Cost**: SUI amount + estimated gas fees

**Example (with Kappa API data):**
```
📊 Purchase Preview
==================
Token: red bull (RB)
Description: bull i s here and its red
Current Price: $0.0000000137
Market Cap: $6.85
Volume: $0.573362262
Holders: 1
SUI Amount: 0.10 SUI
Expected Tokens: 21,147,766
Current SUI Reserve: 10.099 SUI
Current Token Reserve: 2,178,433,508
Estimated Gas: ~0.01 SUI
Total Cost: ~0.11 SUI
```

**Bonding Curve Mathematics:**
- Uses proper AMM (Automated Market Maker) formula
- Accounts for 1% trading fees
- Real-time reserve calculations
- Accurate token-to-SUI conversion
- Handles curve state changes during transaction

### 4. Sell Tokens Back to Bonding Curves
```bash
npm run sell
```
Sell your tokens back to the bonding curve for SUI with comprehensive balance checking and slippage protection:

**Process Flow:**
1. **Balance Check**: Validates minimum SUI balance for gas fees (0.05 SUI)
2. **Token Contract Input**: Enter full token contract address (e.g., `0x123...::module::TOKEN`)
3. **Kappa API Integration**: Automatically fetch token metadata and bonding curve data
4. **Balance Verification**: Check your token balance across all coin objects
5. **Sell Amount**: Enter amount to sell (with balance validation)
6. **SUI Calculation**: Calculate expected SUI using bonding curve mathematics
7. **Slippage Protection**: Set minimum SUI to receive (default 10% slippage)
8. **Transaction Execution**: Complete the sell and receive SUI

**Features:**
- **Automatic Balance Detection**: Scans all coin objects to find your token balance
- **Kappa API Integration**: Fetches real-time token data, pricing, and bonding curve addresses
- **Comprehensive Balance Display**: Shows total tokens and number of coin objects
- **AMM Mathematics**: Accurate SUI calculations using `sellMath` bonding curve formulas
- **Slippage Protection**: Customizable minimum SUI amounts to protect against price changes
- **Multi-Coin Handling**: Automatically merges multiple coin objects for efficient selling
- **Rich Preview**: Displays token info, balance, expected SUI, and current reserves
- **Fallback Support**: Works even without Kappa API data (manual bonding curve handling)

**Example Sell Preview:**
```
📊 Sell Preview
===============
Token: red bull (RB)
Description: bull i s here and its red
Current Price: $0.0000000137
Market Cap: $6.85
Volume: $0.573362262
Holders: 1
Your Balance: 1,882,994 tokens
Coin Objects: 1
Tokens to Sell: 1,000,000
Expected SUI: 0.089234567 SUI
Current SUI Reserve: 10.207 SUI
Current Token Reserve: 2,155,194
Estimated Gas: ~0.01 SUI
Total Received: ~0.079234567 SUI (after gas)
```

**Technical Features:**
- **Pagination Support**: Handles wallets with many coin objects (up to 30 pages)
- **BigInt Precision**: Accurate balance calculations for large token amounts
- **Error Handling**: Comprehensive error handling for API failures and blockchain issues
- **Gas Optimization**: Efficient coin merging to minimize transaction costs
- **Human-Readable Formatting**: Token amounts displayed in billions (divided by 1,000,000,000)

### 5. Create Token Distribution (PRE-LAUNCH)
```bash
npm run distribute
```
The Distribution Manager creates bundled token purchases for PRE-LAUNCH tokens with varied distribution patterns:

**⚠️ Important: This is for PRE-LAUNCH tokens (status: created)**

**Features:**
- **Bundle Options**: 25%, 50%, 75%, 99% of 700M bonding curve tokens, or custom amount
- **Wallet Generation**: Automatically generates wallets with private keys
- **AMM-like Distribution**: Uses exponential decay with randomness for realistic distribution
- **SUI Funding Calculation**: Calculates exact SUI needed for each wallet (including gas)
- **File Organization**: Creates JSON and CSV files in organized directories

**Process:**
1. Select a created (PRE-LAUNCH) token project
2. Choose bundle percentage (% of 700M tokens)
3. Set wallet percentage range (min/max % per wallet)
4. Review distribution preview
5. Generate wallets and distribution files

**Output Files:**
- `distributions/{token_name}/distribution.json` - Complete distribution data
- `distributions/{token_name}/distribution.csv` - Spreadsheet format
- Includes wallet addresses, private keys, token amounts, and funding requirements

**Distribution Algorithm:**
- First wallet gets maximum allocation
- Subsequent wallets use exponential decay (0.8 factor)
- Random variation (±20%) for natural distribution
- Respects min/max percentage constraints
- Optimizes for realistic trading patterns

### 6. Fund Distribution Wallets
```bash
npm run fund
```
Funds all wallets in a distribution with their calculated SUI amounts:

**Process:**
1. Select a distribution to fund
2. Review funding requirements
3. Confirm funding operation
4. Master wallet funds each distribution wallet
5. Updates distribution files with funding status

**What it does:**
- Calculates precise SUI amounts using bonding curve mathematics
- Transfers exact SUI amounts to each wallet (tokens + gas + slippage buffer)
- Tracks funding status and transaction hashes
- Updates distribution JSON with funding metadata
- Provides detailed progress reporting

**SUI Calculation System:**
- Uses proper AMM (Automated Market Maker) formula for accurate pricing
- Accounts for 1% trading fees and 10% slippage buffer
- Separate calculations for PRE-LAUNCH vs POST-LAUNCH tokens
- Reverse bonding curve math: calculates SUI needed for desired tokens
- Replaces old fixed-price system (0.0001 SUI per token) with dynamic pricing

### 7. Return SUI to Master
```bash
npm run return-sui
```
Returns remaining SUI from distribution wallets back to master wallet:

**Process:**
1. Select a distribution to return SUI from
2. Checks each wallet's balance
3. Returns all SUI except minimal gas reserve
4. Transfers back to master wallet

**What it does:**
- Scans all distribution wallets for remaining SUI
- Leaves 0.001 SUI in each wallet for gas
- Returns everything else to master wallet
- Provides detailed return reporting

### 6. Complete PRE-LAUNCH Workflow
```
1. Create Project (npm run create)
2. Create Distribution (npm run distribute) 
3. Fund Wallets (npm run fund)
4. Launch Token (npm run launch)
5. Execute Bundled Purchases (manual/automated)
6. Return SUI (npm run return-sui)
```

### 4. Monitor Projects
```bash
npm run list
```
- View all projects grouped by status
- See deployment details and transaction history
- Delete projects if needed

## Project Status Flow

- 🆕 **created** - Project created, ready for launch
- 📦 **deployed** - Token contract deployed
- 📈 **curve_launched** - Bonding curve created
- 🚀 **launched** - Fully launched and trading
- ❌ **failed** - Deployment failed
- ⚠️ **curve_failed** - Curve creation failed

## Cost Estimates

- **Token Deployment**: ~0.1 SUI
- **Bonding Curve Launch**: ~0.1 SUI  
- **First Buy**: Variable (you set the amount)
- **Complete Launch**: ~0.4 SUI total (including gas)

## File Structure

```
kappa-node-sdk/
├── commands/           # CLI command implementations
│   ├── create-project.js
│   ├── launch-token.js
│   ├── list-projects.js
│   └── wallet-info.js
├── data/              # Project data storage
│   └── projects.json
├── lib/               # Core library modules
│   ├── project-manager.js
│   ├── token-deployer.js
│   └── wallet-manager.js
├── move-bytecode/     # WebAssembly bytecode manipulation
├── index.js           # Main menu interface
├── kappa.js           # Core Kappa SDK functions
└── math.js            # Bonding curve mathematics
```

## Configuration

The application uses these constants (defined in `kappa.js`):
- **Total Supply**: 1,000,000,000 tokens
- **Initial Reserves**: 10 SUI input, 2.2B token output
- **Fee**: 1% (100 basis points)
- **Network**: Sui Mainnet

## Troubleshooting

### Common Issues

1. **"MASTER_PRIVATE_KEY not found"**
   - Make sure you created a `.env` file
   - Check that your private key is correctly formatted

2. **"Insufficient SUI balance"**
   - Fund your wallet with at least 0.4 SUI
   - Check wallet info with `npm run wallet`

3. **"Token deployment failed"**
   - Verify network connectivity
   - Ensure sufficient gas fees
   - Check if private key is valid

4. **"Invalid private key format"**
   - Private key should start with `suiprivkey1`
   - Make sure there are no extra spaces or characters

### Getting Help

- Check wallet balance: `npm run wallet`
- View project status: `npm run list`
- Restart the application if it becomes unresponsive

## Security Notes

- Never share your private key
- Keep your `.env` file secure and never commit it
- The private key has full control over your wallet
- Test with small amounts first

## Advanced Usage

### Custom Launch Parameters

When launching tokens, you can customize:
- **SUI Amount**: How much SUI to use for first buy
- **Min Tokens**: Minimum tokens to receive (slippage protection)

### Project Management

- Projects are stored in `data/projects.json`
- Each project has a unique ID and timestamp
- Status is automatically updated during launch process
- Failed launches can be retried

## Contributing

This is a utility tool for the Kappa protocol. Feel free to modify and extend it for your needs.

## License

MIT License - see LICENSE file for details 