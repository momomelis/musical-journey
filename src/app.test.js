/**
 * Test suite for Momo Candie Girls NFT minting app.
 *
 * Coverage areas:
 *  - changeQuantity: boundary enforcement (min 1, max MAX_PER_TX)
 *  - updateProgress: percentage calculation and DOM updates
 *  - showReveal / closeReveal: modal visibility and content
 *  - updateWalletUI: address truncation and mint button state
 *  - mintNFT: wallet guard, state updates, button lifecycle
 *  - updateLeaderboard: HTML rendering from leaderboard data
 *  - simulateMintingActivity: supply cap enforcement
 *  - connectWallet: MetaMask present/absent branches
 */

// Minimal DOM structure required by app.js
const HTML_FIXTURE = `
  <div id="particles"></div>
  <div id="walletSection">
    <button class="connect-wallet-btn">Connect Wallet</button>
  </div>
  <div id="totalMinted">0</div>
  <div id="userBalance">0</div>
  <div id="progressBar" style="width: 0%">0.0%</div>
  <div id="quantity">1</div>
  <button id="mintButton" disabled>Connect Wallet to Mint</button>
  <div id="leaderboardList"></div>
  <div id="revealModal" style="display: none;">
    <div id="revealTokenId">#001</div>
    <div id="revealMessage">Your Momo Candie Girl has arrived!</div>
  </div>
`;

let app;

beforeEach(() => {
    document.body.innerHTML = HTML_FIXTURE;
    jest.resetModules();
    app = require('./app');
    app.resetState();
});

afterEach(() => {
    jest.clearAllTimers();
});

// ---------------------------------------------------------------------------
// changeQuantity
// ---------------------------------------------------------------------------
describe('changeQuantity', () => {
    test('increments quantity by 1 from default', () => {
        app.changeQuantity(1);
        expect(app.getState().quantity).toBe(2);
        expect(document.getElementById('quantity').textContent).toBe('2');
    });

    test('decrements quantity by 1', () => {
        app.setState({ quantity: 5 });
        app.changeQuantity(-1);
        expect(app.getState().quantity).toBe(4);
        expect(document.getElementById('quantity').textContent).toBe('4');
    });

    test('does not decrement below 1', () => {
        // quantity starts at 1
        app.changeQuantity(-1);
        expect(app.getState().quantity).toBe(1);
        expect(document.getElementById('quantity').textContent).toBe('1');
    });

    test('does not increment beyond MAX_PER_TX (10)', () => {
        app.setState({ quantity: 10 });
        app.changeQuantity(1);
        expect(app.getState().quantity).toBe(10);
        // DOM should remain unchanged
        expect(document.getElementById('quantity').textContent).toBe('1'); // fixture default
    });

    test('allows quantity to reach exactly MAX_PER_TX', () => {
        app.setState({ quantity: 9 });
        app.changeQuantity(1);
        expect(app.getState().quantity).toBe(10);
    });

    test('allows quantity to reach exactly 1 (minimum)', () => {
        app.setState({ quantity: 2 });
        app.changeQuantity(-1);
        expect(app.getState().quantity).toBe(1);
    });
});

// ---------------------------------------------------------------------------
// updateProgress
// ---------------------------------------------------------------------------
describe('updateProgress', () => {
    test('shows 0.0% when nothing has been minted', () => {
        app.setState({ totalMinted: 0 });
        app.updateProgress();
        const bar = document.getElementById('progressBar');
        expect(bar.style.width).toBe('0%');
        expect(bar.textContent).toBe('0.0%');
    });

    test('calculates the correct percentage for a partial mint', () => {
        // 444 / 888 = 50%
        app.setState({ totalMinted: 444 });
        app.updateProgress();
        const bar = document.getElementById('progressBar');
        expect(bar.style.width).toBe('50%');
        expect(bar.textContent).toBe('50.0%');
    });

    test('shows 100.0% when fully minted', () => {
        app.setState({ totalMinted: app.MAX_SUPPLY });
        app.updateProgress();
        const bar = document.getElementById('progressBar');
        expect(bar.style.width).toBe('100%');
        expect(bar.textContent).toBe('100.0%');
    });

    test('rounds percentage to one decimal place', () => {
        // 1 / 888 ≈ 0.112612613...%
        app.setState({ totalMinted: 1 });
        app.updateProgress();
        const bar = document.getElementById('progressBar');
        expect(bar.textContent).toBe('0.1%');
    });
});

// ---------------------------------------------------------------------------
// showReveal
// ---------------------------------------------------------------------------
describe('showReveal', () => {
    const VALID_MESSAGES = [
        'Your oracle companion awaits!',
        'The ritual is complete!',
        'Welcome to the sisterhood!',
        'Your period power activated!',
        'Strawberry magic unlocked!'
    ];

    test('makes the reveal modal visible', () => {
        app.setState({ totalMinted: 1 });
        app.showReveal();
        expect(document.getElementById('revealModal').style.display).toBe('flex');
    });

    test('formats token ID with three-digit zero-padding', () => {
        app.setState({ totalMinted: 7 });
        app.showReveal();
        expect(document.getElementById('revealTokenId').textContent).toBe('#007');
    });

    test('formats token ID for two-digit numbers', () => {
        app.setState({ totalMinted: 42 });
        app.showReveal();
        expect(document.getElementById('revealTokenId').textContent).toBe('#042');
    });

    test('formats token ID for three-digit numbers without padding', () => {
        app.setState({ totalMinted: 100 });
        app.showReveal();
        expect(document.getElementById('revealTokenId').textContent).toBe('#100');
    });

    test('sets a message from the predefined list', () => {
        app.setState({ totalMinted: 1 });
        app.showReveal();
        const message = document.getElementById('revealMessage').textContent;
        expect(VALID_MESSAGES).toContain(message);
    });
});

// ---------------------------------------------------------------------------
// closeReveal
// ---------------------------------------------------------------------------
describe('closeReveal', () => {
    test('hides the reveal modal', () => {
        const modal = document.getElementById('revealModal');
        modal.style.display = 'flex';
        app.closeReveal();
        expect(modal.style.display).toBe('none');
    });
});

// ---------------------------------------------------------------------------
// updateWalletUI
// ---------------------------------------------------------------------------
describe('updateWalletUI', () => {
    test('truncates a wallet address to "0xABCD...1234" format', () => {
        app.setState({ walletConnected: true, userAddress: '0xABCDEF1234567890ABCDEF1234567890ABCD1234' });
        app.updateWalletUI();
        expect(document.getElementById('walletSection').innerHTML).toContain('0xABCD...1234');
    });

    test('enables the mint button when connected', () => {
        app.setState({ walletConnected: true, userAddress: '0x1234567890abcdef1234567890abcdef12345678' });
        app.updateWalletUI();
        expect(document.getElementById('mintButton').disabled).toBe(false);
    });

    test('sets mint button text to "Mint Now" when connected', () => {
        app.setState({ walletConnected: true, userAddress: '0x1234567890abcdef1234567890abcdef12345678' });
        app.updateWalletUI();
        expect(document.getElementById('mintButton').textContent).toBe('Mint Now');
    });

    test('does not modify the DOM when wallet is not connected', () => {
        const before = document.getElementById('walletSection').innerHTML;
        app.setState({ walletConnected: false });
        app.updateWalletUI();
        expect(document.getElementById('walletSection').innerHTML).toBe(before);
    });
});

// ---------------------------------------------------------------------------
// mintNFT
// ---------------------------------------------------------------------------
describe('mintNFT', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        global.alert = jest.fn();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('alerts and returns early if wallet is not connected', async () => {
        app.setState({ walletConnected: false });
        const mintPromise = app.mintNFT();
        jest.runAllTimers();
        await mintPromise;
        expect(global.alert).toHaveBeenCalledWith('Please connect your wallet first!');
        expect(app.getState().totalMinted).toBe(0);
    });

    test('increases totalMinted by the current quantity', async () => {
        app.setState({ walletConnected: true, quantity: 3, totalMinted: 10 });
        const mintPromise = app.mintNFT();
        jest.runAllTimers();
        await mintPromise;
        expect(app.getState().totalMinted).toBe(13);
        expect(document.getElementById('totalMinted').textContent).toBe('13');
    });

    test('increments user balance in the DOM', async () => {
        document.getElementById('userBalance').textContent = '5';
        app.setState({ walletConnected: true, quantity: 2 });
        const mintPromise = app.mintNFT();
        jest.runAllTimers();
        await mintPromise;
        expect(document.getElementById('userBalance').textContent).toBe('7');
    });

    test('disables the mint button during minting', async () => {
        app.setState({ walletConnected: true, quantity: 1 });
        const mintPromise = app.mintNFT();
        // Before timers advance the button should be disabled
        expect(document.getElementById('mintButton').disabled).toBe(true);
        expect(document.getElementById('mintButton').textContent).toBe('Summoning...');
        jest.runAllTimers();
        await mintPromise;
    });

    test('re-enables the mint button after minting completes', async () => {
        app.setState({ walletConnected: true, quantity: 1 });
        const mintPromise = app.mintNFT();
        jest.runAllTimers();
        await mintPromise;
        expect(document.getElementById('mintButton').disabled).toBe(false);
        expect(document.getElementById('mintButton').textContent).toBe('Mint More');
    });

    test('shows the reveal modal after a successful mint', async () => {
        app.setState({ walletConnected: true, quantity: 1 });
        const mintPromise = app.mintNFT();
        jest.runAllTimers();
        await mintPromise;
        expect(document.getElementById('revealModal').style.display).toBe('flex');
    });

    test('updates the progress bar after minting', async () => {
        app.setState({ walletConnected: true, quantity: 444, totalMinted: 0 });
        const mintPromise = app.mintNFT();
        jest.runAllTimers();
        await mintPromise;
        expect(document.getElementById('progressBar').style.width).toBe('50%');
    });
});

// ---------------------------------------------------------------------------
// updateLeaderboard
// ---------------------------------------------------------------------------
describe('updateLeaderboard', () => {
    test('renders an entry for each item in leaderboardData', () => {
        app.updateLeaderboard();
        const entries = document.querySelectorAll('.leaderboard-entry');
        expect(entries.length).toBe(app.leaderboardData.length);
    });

    test('displays correct rank numbers (1-indexed)', () => {
        app.updateLeaderboard();
        const ranks = document.querySelectorAll('.rank');
        ranks.forEach((el, i) => {
            expect(el.textContent).toBe(`#${i + 1}`);
        });
    });

    test('displays addresses from leaderboardData', () => {
        app.updateLeaderboard();
        const addresses = document.querySelectorAll('.address');
        app.leaderboardData.forEach((entry, i) => {
            expect(addresses[i].textContent).toBe(entry.address);
        });
    });

    test('displays NFT amounts from leaderboardData', () => {
        app.updateLeaderboard();
        const amounts = document.querySelectorAll('.amount');
        app.leaderboardData.forEach((entry, i) => {
            expect(amounts[i].textContent).toBe(`${entry.amount} NFTs`);
        });
    });
});

// ---------------------------------------------------------------------------
// simulateMintingActivity
// ---------------------------------------------------------------------------
describe('simulateMintingActivity', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('does not increase totalMinted when at the supply cap threshold', () => {
        // Threshold is MAX_SUPPLY - 100 = 788
        app.setState({ totalMinted: 788 });
        app.simulateMintingActivity();
        jest.advanceTimersByTime(15000);
        expect(app.getState().totalMinted).toBe(788);
    });

    test('does not increase totalMinted when above the supply cap threshold', () => {
        app.setState({ totalMinted: 800 });
        app.simulateMintingActivity();
        jest.advanceTimersByTime(15000);
        expect(app.getState().totalMinted).toBe(800);
    });

    test('increases totalMinted when below the supply cap threshold', () => {
        app.setState({ totalMinted: 0 });
        app.simulateMintingActivity();
        jest.advanceTimersByTime(15000);
        // Random mint adds 1–3; any increase is valid
        expect(app.getState().totalMinted).toBeGreaterThan(0);
    });

    test('updates the totalMinted DOM element after each interval tick', () => {
        app.setState({ totalMinted: 0 });
        app.simulateMintingActivity();
        jest.advanceTimersByTime(15000);
        const domValue = parseInt(document.getElementById('totalMinted').textContent, 10);
        expect(domValue).toBe(app.getState().totalMinted);
    });
});

// ---------------------------------------------------------------------------
// connectWallet
// ---------------------------------------------------------------------------
describe('connectWallet', () => {
    beforeEach(() => {
        global.alert = jest.fn();
    });

    test('enters demo mode and sets walletConnected when MetaMask is absent', async () => {
        delete global.window.ethereum;
        await app.connectWallet();
        expect(app.getState().walletConnected).toBe(true);
        expect(app.getState().userAddress).toMatch(/^0x[0-9a-f]+$/i);
        expect(global.alert).toHaveBeenCalledWith(
            'Demo mode: MetaMask not detected. Using simulated wallet.'
        );
    });

    test('sets wallet address and connected state when MetaMask approves', async () => {
        const mockAddress = '0xDEADBEEF00000000000000000000000000000001';
        global.window.ethereum = {
            request: jest.fn().mockResolvedValue([mockAddress]),
        };
        await app.connectWallet();
        expect(app.getState().walletConnected).toBe(true);
        expect(app.getState().userAddress).toBe(mockAddress);
        delete global.window.ethereum;
    });

    test('does not set walletConnected when MetaMask rejects the request', async () => {
        global.window.ethereum = {
            request: jest.fn().mockRejectedValue(new Error('User rejected')),
        };
        global.console.error = jest.fn();
        await app.connectWallet();
        expect(app.getState().walletConnected).toBe(false);
        expect(global.alert).toHaveBeenCalledWith('Failed to connect wallet. Please try again.');
        delete global.window.ethereum;
    });
});

// ---------------------------------------------------------------------------
// createParticles
// ---------------------------------------------------------------------------
describe('createParticles', () => {
    test('creates exactly 50 particle elements inside #particles', () => {
        app.createParticles();
        const particles = document.querySelectorAll('#particles .particle');
        expect(particles).toHaveLength(50);
    });

    test('each particle has a left style set to a percentage value', () => {
        app.createParticles();
        const particles = document.querySelectorAll('#particles .particle');
        particles.forEach((p) => {
            expect(p.style.left).toMatch(/^\d+(\.\d+)?%$/);
        });
    });
});
