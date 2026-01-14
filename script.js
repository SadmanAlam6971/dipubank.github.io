// --- CONFIGURATION ---
// IMPORTANT: These must match your Remix Deployed Contracts
const bankAddress = "0xe882a6128287565cb042b0c9ec29dee24ae650f9"; 
const bankABI = [
    "function s_balances(address) view returns (uint256)",
    "function earned(address) view returns (uint256)"
];

let provider;
let signer;
let bankContract;
let userAddress;
let miningChart;

// --- 1. STARTUP ---
window.onload = function() {
    console.log("DASHBOARD VERSION 2.0 LOADED"); // Check console for this
    initChart();
};

// --- 2. CONNECT FUNCTION (Debug Version) ---
async function connectWallet() {
    // VISUAL CHECK: Prove the new code is running
    alert("VERSION 2.0: Attempting Connection...");

    // A. Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
        alert("CRITICAL ERROR: MetaMask is not installed or not detected!");
        return;
    }

    try {
        // B. Force Connection
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Request Access
        await provider.send("eth_requestAccounts", []);
        
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        console.log("Connected User:", userAddress);

        // C. Connect to Contract
        bankContract = new ethers.Contract(bankAddress, bankABI, signer);

        // D. Update UI (The Green Glow)
        const btn = document.querySelector(".btn-pro");
        if(btn) {
            btn.innerText = "CONNECTED";
            btn.style.background = "#3fb950";
            btn.style.boxShadow = "0 0 20px #3fb950";
            btn.style.color = "white";
        }
        
        const avatar = document.querySelector(".user-avatar");
        if(avatar) {
            avatar.style.borderColor = "#3fb950";
        }

        // E. Success Message
        alert("SUCCESS! Connected to: " + userAddress + "\nNow fetching balance...");
        updateData();
        setInterval(updateData, 5000);

    } catch (error) {
        // --- ERROR TRAP ---
        console.error("FULL ERROR DETAILS:", error);
        
        // This gives you the EXACT reason it failed
        alert("CONNECTION FAILED!\n\nReason: " + (error.data ? error.data.message : error.message));
    }
}

// --- 3. FETCH DATA ---
async function updateData() {
    if (!bankContract) return;
    try {
        const stakedAmount = await bankContract.s_balances(userAddress);
        const earnedAmount = await bankContract.earned(userAddress);

        document.getElementById("stakedBalance").innerText = Number(stakedAmount).toLocaleString();
        document.getElementById("earnedReward").innerText = Number(earnedAmount).toLocaleString();
    } catch (error) {
        console.error("DATA ERROR:", error);
        // If this happens, your contract address is probably wrong
    }
}

// --- 4. GRAPH ANIMATION ---
function initChart() {
    const ctx = document.getElementById('miningChart');
    if(!ctx) return; // Safety check

    const context = ctx.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(88, 166, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(88, 166, 255, 0)');

    miningChart = new Chart(context, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                label: 'Hashrate',
                data: Array(20).fill(100),
                borderColor: '#58a6ff',
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } },
            animation: { duration: 0 }
        }
    });

    setInterval(() => {
        if (!miningChart) return;
        const val = Math.floor(Math.random() * 30) + 90;
        miningChart.data.datasets[0].data.push(val);
        miningChart.data.datasets[0].data.shift();
        miningChart.update();
    }, 1000);
}
