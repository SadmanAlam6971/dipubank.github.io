// --- CONFIGURATION ---
const bankAddress = "0xe882a6128287565cb042b0c9ec29dee24ae650f9"; // Your Bank Contract
const coinAddress = "0x879589A5adF1B33652D916cA1B3267B8D2d888D9"; // Your Coin Contract

// ABI (The instructions for the code)
const bankABI = [
    "function s_balances(address) view returns (uint256)",
    "function earned(address) view returns (uint256)"
];

let provider;
let signer;
let bankContract;
let userAddress;
let miningChart;

// --- 1. INITIALIZE ON LOAD ---
window.onload = async function() {
    initChart(); 

    
    if(window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
            connectWallet();
        }
    }
};

// --- 2. CONNECT WALLET FUNCTION ---
async function connectWallet() {
    if (window.ethereum) {
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []); // Force popup
            signer = provider.getSigner();
            userAddress = await signer.getAddress();

            // Setup Contract
            bankContract = new ethers.Contract(bankAddress, bankABI, signer);

            // --- UPDATE UI SPECIFIC TO YOUR CHOSEN DESIGN ---
            
            // 1. Find the PRO button and turn it Green
            const btn = document.querySelector(".btn-pro");
            if(btn) {
                btn.innerText = "CONNECTED";
                btn.style.background = "#3fb950"; // Neon Green
                btn.style.boxShadow = "0 0 20px #3fb950";
                btn.style.color = "white";
            }

            // 2. Find the Avatar and give it a Green Glow
            const avatar = document.querySelector(".user-avatar");
            if(avatar) {
                avatar.style.borderColor = "#3fb950";
                avatar.style.boxShadow = "0 0 15px #3fb950";
            }

            // 3. Update Status Text (if exists)
            console.log("Wallet Connected!", userAddress);
            updateData(); // Load balances immediately

            // Auto-refresh data every 5 seconds
            setInterval(updateData, 5000); 

        } catch (error) {
            console.error(error);
            alert("Connection Failed! See console for details.");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

// --- 3. UPDATE DASHBOARD NUMBERS ---
async function updateData() {
    if (!bankContract) return;

    try {
        // Get Staked Balance
        const stakedAmount = await bankContract.s_balances(userAddress);
        const stakedDisplay = document.getElementById("stakedBalance");
        // Update text and formatting (e.g. 1,000,000)
        if(stakedDisplay) stakedDisplay.innerText = Number(stakedAmount).toLocaleString(); 

        // Get Earned Rewards
        const earnedAmount = await bankContract.earned(userAddress);
        const earnedDisplay = document.getElementById("earnedReward");
        if(earnedDisplay) earnedDisplay.innerText = Number(earnedAmount).toLocaleString();
        
    } catch (error) {
        console.error("Error fetching blockchain data:", error);
    }
}

// --- 4. LIVE SCI-FI MINING GRAPH ---
function initChart() {
    const ctx = document.getElementById('miningChart').getContext('2d');
    
    // Create a Gradient for the line (Glowing Effect)
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(88, 166, 255, 0.5)'); // Neon Blue top
    gradient.addColorStop(1, 'rgba(88, 166, 255, 0)');   // Transparent bottom

    miningChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''), // 20 blank labels for spacing
            datasets: [{
                label: 'Hashrate',
                data: Array(20).fill(100), // Start with flat data
                borderColor: '#58a6ff', // Neon Blue Line
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0, 
                fill: true,
                tension: 0.4 // Smooth curves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }, // Hide legend
            scales: {
                x: { display: false }, // Hide X axis
                y: { 
                    display: false, // Hide Y axis for cleaner look
                }
            },
            animation: { duration: 0 } // Disable default animation for smooth real-time updates
        }
    });

    // Start the Animation Loop
    setInterval(updateChart, 1000); // Update every 1 second
}

function updateChart() {
    if (!miningChart) return;

    // Simulate Mining Fluctuation (Random Sci-Fi Data)
    const randomValue = Math.floor(Math.random() * 30) + 90;

    // Add new data, remove old data
    miningChart.data.datasets[0].data.push(randomValue);
    if (miningChart.data.datasets[0].data.length > 20) {
        miningChart.data.datasets[0].data.shift();
    }

    miningChart.update();
}
