import { ethers } from "ethers";
import { useEffect, useState } from "react";

function ChainRestrictor({ children }) {
  const [chainId, setChainId] = useState(null);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setChainId(ethers.toNumber(network.chainId));
      } catch (error) {
        console.error("Error fetching network:", error);
      }
    };
    checkNetwork();
  }, []);

  const bridge = async () => {
    try {
      if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const abi = [
        "function quoteSend((uint32, bytes32, uint256, uint256, bytes, bytes, bytes), bool) view returns (uint256, uint256)",
        "function send((uint32, bytes32, uint256, uint256, bytes, bytes, bytes), (uint256, uint256), address) payable"
      ];

      const contractAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
      const oftContract = new ethers.Contract(contractAddress, abi, signer);

      const accountAddress = await signer.getAddress();
      const parsedAmount = ethers.parseEther(amount.toString());
      const minAmount = ethers.parseEther((amount - 1).toString());

      const sendParams = [
        40161, // dstEid
        ethers.zeroPadValue(accountAddress, 32), // Destination address in bytes32 format
        parsedAmount, // Amount to bridge
        minAmount, // Minimum amount to receive
        "0x0003010011010000000000000000000000000000ea60", // Adapter parameters
        "0x", // Payload
        "0x" // To
      ];

      const [messagingFee] = await oftContract.quoteSend(sendParams, false);
      console.log("Messaging Fee (ETH):", ethers.formatEther(messagingFee.toString()));

      const tx = await oftContract.send(sendParams, [messagingFee, 0], accountAddress, {
        value: messagingFee // Attach the calculated fee as ETH
      });

      console.log("Transaction Sent:", tx.hash);
      const receipt = await tx.wait();
      console.log("Transaction Confirmed:", receipt);
    } catch (error) {
      console.error("Error during bridging:", error);
    }
  };

  if (chainId === 11155111) {
    return children;
  }

  console.log(chainId)
  return (
    <>
      <p>You are not on the Sepolia network.</p>
      {chainId === 52085143 && (
        <div className="mx-2 my-2">
          <p>
            You are currently on the BLE Testnet. To participate in the pool, switch to the Sepolia network.
            If you have USDE on the BLE Testnet, use the button below to transfer it across chains.
          </p>
          <input
            type="number"
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="my-2 border border-gray-200 outline-none"
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => bridge()}
          >
            Transfer USDE
          </button>
          <p className="mt-5">Note: The transaction will take a few minutes to appear in your Sepolia wallet.</p>
        </div>
      )}
    </>
  );
}

export default ChainRestrictor;
