// --- CONFIGURATION ---
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

window.onload = function() {
    initChart();
};

async function connectWallet() {
    // 1. Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
        alert("MetaMask is NOT installed!");
        return;
    }

    try {
        // 2. Force Connection
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // This is where it usually fails if the popup is blocked
        await provider.send("eth_requestAccounts", []); 
        
        signer = provider.getSigner();
        userAddress = await signer.getAddress();

        // 3. Connect to Contract
        bankContract = new ethers.Contract(bankAddress, bankABI, signer);

        // 4. Update UI - Turn Button Green
        const btn = document.querySelector(".btn-pro");
        if(btn) {
            btn.innerText = "CONNECTED";
            btn.style.background = "#3fb950";
            btn.style.boxShadow = "0 0 20px #3fb950";
            btn.style.color = "black";
        }
        
        // 5. Update Avatar
        const avatar = document.querySelector(".user-avatar");
        if(avatar) avatar.style.borderColor = "#3fb950";

        alert("Success! Connected to: " + userAddress);
        updateData();
        setInterval(updateData, 5000);

    } catch (error) {
        // --- THIS WILL SHOW THE REAL ERROR MESSAGE ---
        console.error(error);
        alert("ERROR: " + error.message); 
    }
}

async function updateData() {
    if (!bankContract) return;
    try {
        const stakedAmount = await bankContract.s_balances(userAddress);
        const earnedAmount = await bankContract.earned(userAddress);

        document.getElementById("stakedBalance").innerText = Number(stakedAmount).toLocaleString();
        document.getElementById("earnedReward").innerText = Number(earnedAmount).toLocaleString();
    } catch (error) {
        console.error("Blockchain Read Error:", error);
    }
}

// --- GRAPH SETUP ---
function initChart() {
    const ctx = document.getElementById('miningChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(88, 166, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(88, 166, 255, 0)');

    miningChart = new Chart(ctx, {
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
        const randomValue = Math.floor(Math.random() * 30) + 90;
        miningChart.data.datasets[0].data.push(randomValue);
        miningChart.data.datasets[0].data.shift();
        miningChart.update();
    }, 1000);
}
