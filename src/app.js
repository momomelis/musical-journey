// State management
let walletConnected = false;
let userAddress = '';
let quantity = 1;
let totalMinted = 0;
const MAX_SUPPLY = 888;
const PRICE_PER_NFT = 0.08;
const MAX_PER_TX = 10;

// Mock leaderboard data
const leaderboardData = [
    { address: '0x742d...35A4', amount: 25 },
    { address: '0x8B3f...92C1', amount: 18 },
    { address: '0x1A2c...D8F3', amount: 15 },
    { address: '0x9E4a...B7A2', amount: 12 },
    { address: '0x3C8d...F1E9', amount: 10 }
];

// Initialize
if (typeof window !== 'undefined') {
    window.onload = function() {
        createParticles();
        updateLeaderboard();
        simulateMintingActivity();
    };
}

// Create floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Connect wallet
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            userAddress = accounts[0];
            walletConnected = true;
            updateWalletUI();
        } catch (error) {
            console.error('Wallet connection failed:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    } else {
        // Demo mode for testing without MetaMask
        userAddress = '0x' + Math.random().toString(16).substr(2, 40);
        walletConnected = true;
        updateWalletUI();
        alert('Demo mode: MetaMask not detected. Using simulated wallet.');
    }
}

// Update wallet UI
function updateWalletUI() {
    const walletSection = document.getElementById('walletSection');
    const mintButton = document.getElementById('mintButton');

    if (walletConnected) {
        const shortAddress = userAddress.substr(0, 6) + '...' + userAddress.substr(-4);
        walletSection.innerHTML = `
            <div class="wallet-status">
                🟢 Connected: ${shortAddress}
            </div>
        `;
        mintButton.textContent = 'Mint Now';
        mintButton.disabled = false;
    }
}

// Change quantity
function changeQuantity(delta) {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= MAX_PER_TX) {
        quantity = newQuantity;
        document.getElementById('quantity').textContent = quantity;
    }
}

// Mint NFT
async function mintNFT() {
    if (!walletConnected) {
        alert('Please connect your wallet first!');
        return;
    }

    const mintButton = document.getElementById('mintButton');
    mintButton.disabled = true;
    mintButton.textContent = 'Summoning...';

    // Simulate minting process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update stats
    totalMinted += quantity;
    const userBalance = parseInt(document.getElementById('userBalance').textContent) + quantity;
    document.getElementById('totalMinted').textContent = totalMinted;
    document.getElementById('userBalance').textContent = userBalance;
    updateProgress();

    // Show reveal
    showReveal();

    // Reset button
    mintButton.disabled = false;
    mintButton.textContent = 'Mint More';
}

// Show reveal modal
function showReveal() {
    const modal = document.getElementById('revealModal');
    const tokenId = totalMinted.toString().padStart(3, '0');
    document.getElementById('revealTokenId').textContent = '#' + tokenId;

    const messages = [
        'Your oracle companion awaits!',
        'The ritual is complete!',
        'Welcome to the sisterhood!',
        'Your period power activated!',
        'Strawberry magic unlocked!'
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    document.getElementById('revealMessage').textContent = randomMessage;

    modal.style.display = 'flex';
}

// Close reveal modal
function closeReveal() {
    document.getElementById('revealModal').style.display = 'none';
}

// Update progress bar
function updateProgress() {
    const percentage = (totalMinted / MAX_SUPPLY) * 100;
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = percentage + '%';
    progressBar.textContent = percentage.toFixed(1) + '%';
}

// Update leaderboard
function updateLeaderboard() {
    const container = document.getElementById('leaderboardList');
    container.innerHTML = leaderboardData.map((entry, index) => `
        <div class="leaderboard-entry">
            <div class="rank">#${index + 1}</div>
            <div class="address">${entry.address}</div>
            <div class="amount">${entry.amount} NFTs</div>
        </div>
    `).join('');
}

// Simulate minting activity
function simulateMintingActivity() {
    return setInterval(() => {
        if (totalMinted < MAX_SUPPLY - 100) {
            const randomMint = Math.floor(Math.random() * 3) + 1;
            totalMinted += randomMint;
            document.getElementById('totalMinted').textContent = totalMinted;
            updateProgress();
        }
    }, 15000);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createParticles,
        connectWallet,
        updateWalletUI,
        changeQuantity,
        mintNFT,
        showReveal,
        closeReveal,
        updateProgress,
        updateLeaderboard,
        simulateMintingActivity,
        leaderboardData,
        MAX_SUPPLY,
        PRICE_PER_NFT,
        MAX_PER_TX,
        getState: () => ({ walletConnected, userAddress, quantity, totalMinted }),
        resetState: () => {
            walletConnected = false;
            userAddress = '';
            quantity = 1;
            totalMinted = 0;
        },
        setState: (newState) => {
            if (newState.walletConnected !== undefined) walletConnected = newState.walletConnected;
            if (newState.userAddress !== undefined) userAddress = newState.userAddress;
            if (newState.quantity !== undefined) quantity = newState.quantity;
            if (newState.totalMinted !== undefined) totalMinted = newState.totalMinted;
        },
    };
}
