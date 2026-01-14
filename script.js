// CONFIGURATION
const bankAddress = "0xe882a6128287565cb042b0c9ec29dee24ae650f9"; 
const bankABI = [
    "function s_balances(address) view returns (uint256)",
    "function earned(address) view returns (uint256)"
];

let provider, signer, bankContract, userAddress, miningChart;

window.onload = function() {
    initChart();
};

async function connectWallet() {
    // 1. Check for MetaMask
    if (typeof window.ethereum === 'undefined') {
        alert("MetaMask is NOT installed!");
        return;
    }

    // 2. Check for Ethers Library (The fix for your error)
    if (typeof ethers === 'undefined') {
        alert("CRITICAL: Ethers.js library failed to load. Refresh the page.");
        return;
    }

    try {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Request Access
        
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        
        // Connect Contract
        bankContract = new ethers.Contract(bankAddress, bankABI, signer);

        // Update UI
        document.querySelector(".btn-pro").innerText = "CONNECTED";
        document.querySelector(".btn-pro").style.background = "#3fb950";
        document.getElementById("statusText").innerText = "Connected: " + userAddress.substring(0,6);
        
        alert("CONNECTED! Loading Balance...");
        updateData();
        setInterval(updateData, 5000);

    } catch (error) {
        console.error(error);
        alert("ERROR: " + error.message);
    }
}

async function updateData() {
    if (!bankContract) return;
    try {
        const staked = await bankContract.s_balances(userAddress);
        const earned = await bankContract.earned(userAddress);
        
        document.getElementById("stakedBalance").innerText = Number(staked).toLocaleString();
        document.getElementById("earnedReward").innerText = Number(earned).toLocaleString();
    } catch (e) { console.error(e); }
}

function initChart() {
    const ctx = document.getElementById('miningChart').getContext('2d');
    miningChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array(20).fill(''),
            datasets: [{
                label: 'Hashrate', data: Array(20).fill(100),
                borderColor: '#58a6ff', borderWidth: 2, tension: 0.4
            }]
        },
        options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
    });
    setInterval(() => {
        if(!miningChart) return;
        miningChart.data.datasets[0].data.push(Math.random() * 30 + 90);
        miningChart.data.datasets[0].data.shift();
        miningChart.update();
    }, 1000);
}
