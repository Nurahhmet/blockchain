// Replace with your smart contract's address and ABI
const contractAddress = "0x98Fd3EBb274A9729A252Afe2767f5fD2445c7e7B"; // Replace with your deployed contract address
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "gameHistory",
		"outputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "enum RockPaperScissors.Move",
				"name": "playerMove",
				"type": "uint8"
			},
			{
				"internalType": "enum RockPaperScissors.Move",
				"name": "computerMove",
				"type": "uint8"
			},
			{
				"internalType": "enum RockPaperScissors.Result",
				"name": "result",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getGame",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "enum RockPaperScissors.Move",
				"name": "",
				"type": "uint8"
			},
			{
				"internalType": "enum RockPaperScissors.Move",
				"name": "",
				"type": "uint8"
			},
			{
				"internalType": "enum RockPaperScissors.Result",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getGameCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum RockPaperScissors.Move",
				"name": "_playerMove",
				"type": "uint8"
			}
		],
		"name": "play",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

let web3;
let contract;
let userAccount;

// Initialize the Web3 and contract instance
async function init() {
    if (window.ethereum) {
        // Initialize Web3 with MetaMask's provider
        web3 = new Web3(window.ethereum);

        try {
            // Request the user's MetaMask account
            const accounts = await web3.eth.requestAccounts();
            userAccount = accounts[0];

            // Initialize the smart contract instance
            contract = new web3.eth.Contract(contractABI, contractAddress);

            // Display the connected account
            console.log("Connected with account:", userAccount);

            // Load and display the game history
            loadHistory();
        } catch (error) {
            console.error("User denied account access or an error occurred:", error);
            alert("Please connect your MetaMask wallet.");
        }

        // Listen for account and network changes
        window.ethereum.on('accountsChanged', function (accounts) {
            userAccount = accounts[0];  // Update the account
            console.log("Account switched to:", userAccount);
            loadHistory();  // Reload the history for the new account
        });

        window.ethereum.on('chainChanged', function (chainId) {
            console.log("Network changed:", chainId);
            loadHistory();  // Reload the history if the network changes
        });
    } else {
        alert("Please install MetaMask to interact with the smart contract.");
    }
}

// Call the smart contract's play function with the selected move
async function play(move) {
    if (!userAccount) {
        alert("Please connect your wallet first.");
        return;
    }

    try {
        // Call the 'play' function of the smart contract
        await contract.methods.play(move).send({ from: userAccount });

        // Show a confirmation to the user
        alert(`You selected: ${["Rock", "Paper", "Scissors"][move]}`);
        
        // Reload and display the game history after each play
        loadHistory();
    } catch (error) {
        console.error("Error while playing:", error);
        alert("Something went wrong while calling the smart contract.");
    }
}

// Load the game history from the smart contract
async function loadHistory() {
    try {
        // Fetch the game history from the smart contract
        const history = await contract.methods.getGameHistory().call();
        const historyList = document.getElementById("history");

        // Clear the previous history
        historyList.innerHTML = "";

        // Loop through the game history and display it
        history.forEach((game, index) => {
            const li = document.createElement("li");
            li.textContent = `Game ${index + 1}: You played ${["Rock", "Paper", "Scissors"][game.playerMove]}, Contract played ${["Rock", "Paper", "Scissors"][game.contractMove]} - Result: ${game.result}`;
            historyList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading history:", error);
        alert("Could not load game history.");
    }
}

// Initialize the application on window load
window.onload = init;
