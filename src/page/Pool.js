import { ethers } from "ethers"
import { useState,useEffect } from "react"
import { useParams } from "react-router-dom"
import bettingABI from '../betting.json'
function Pool(){
    let {contractAddress} = useParams()
    let [poolDetail,setPoolDetail] = useState(null)
    let [outcomes,setOutcomes] = useState([])
    let [bets,setBets] = useState({
        outcomeIndex:null,
        amount:0
    })
    let [myBets,setMyBets] = useState([])
    let [chances,setChances] = useState([])
    useEffect(() => {
        let fetchPoolDetail = async()=>{
            let ether = new ethers.BrowserProvider(window.ethereum);
            let signer = await ether.getSigner()
            let contract = new ethers.Contract(contractAddress,bettingABI,signer);
            let name = await contract.name()
            let description = await contract.description()
            let maxLimit = await contract.maxLimit()
            let deadline = await contract.deadline()
            let owner = await contract.owner()
            let usde_balance = await contract.getTokenBalance()
            let susde_balance = await contract.get_sUsde_balance()
            const timestamp = ethers.toNumber(deadline); // Unix timestamp in seconds
const date = new Date(timestamp * 1000); // Convert to milliseconds
const day = date.getDate().toString().padStart(2, '0'); // Ensure two digits
const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
const year = date.getFullYear();
            let dt = {
                name:name,
                description:description,
                maxLimit:ethers.toNumber(maxLimit),
                deadline: `${day}/${month}/${year}`,
                owner:owner,
                usde_balance:ethers.toNumber(usde_balance),
                susde_balance:ethers.toNumber(susde_balance)
            }
            console.log(dt)
            setPoolDetail(dt)

        }
        fetchPoolDetail()
    },[contractAddress])

    useEffect(() => {
        let fetchOutcomes = async()=>{
            let ether = new ethers.BrowserProvider(window.ethereum)
            let signer = await ether.getSigner()
            let contract = new ethers.Contract(contractAddress,bettingABI,signer);
            let dt = await contract.getOutcomes()
           
            let arr = dt.map((val)=>{
                let obj ={name:val.name,totalBet:ethers.toNumber(val.totalBets),initialProbability:ethers.toNumber(val.initialProbability)}
                return (obj)
            })
            console.log("outcomes",arr)
            setOutcomes(arr)
        }
        fetchOutcomes()
    }, [])

    useEffect(() => {
        let fetchBets = async()=>{
            let ether = new ethers.BrowserProvider(window.ethereum)
            let signer = await ether.getSigner()
            let contract = new ethers.Contract(contractAddress,bettingABI,signer);
            let dt = await contract.getBettorBets(signer.address)
            let arr = dt.map((val)=>{
                return ethers.toNumber(val)
            })
            console.log(arr)
            let dt_2 = await contract.getProbabilities()
            let arr_2 = dt_2.map((val)=>{
                return ethers.toNumber(val)
            })
            setMyBets(arr)
            setChances(arr_2)
        }
        fetchBets()
    }, [])

    let approve = async()=>{
        const ERC20_ABI = [
            "function approve(address spender, uint256 amount) public returns (bool)"
          ];
        let ether = new ethers.BrowserProvider(window.ethereum)
        let signer = await ether.getSigner()
        let contract = new ethers.Contract(process.env.REACT_APP_USDE_SEPOLIA_ADDRESS,ERC20_ABI,signer);
        let dt = await contract.approve(contractAddress, ethers.parseUnits(bets.amount, 18))
        console.log(dt)
    }
    let placeBet = async()=>{
        console.log(parseInt(bets.outcomeIndex), parseInt(bets.amount))
        let ether = new ethers.BrowserProvider(window.ethereum)
        let signer = await ether.getSigner()
        let contract = new ethers.Contract(contractAddress,bettingABI,signer);
        let dt = await contract.placeBet(parseInt(bets.outcomeIndex), parseInt(bets.amount))
        console.log(dt)
    }

    let claim = async()=>{
     try{
        let ether = new ethers.BrowserProvider(window.ethereum)
        let signer = await ether.getSigner()
        let contract = new ethers.Contract(contractAddress,bettingABI,signer);
        let dt = await contract.claimWinnings()
        console.log(dt)
         alert("claim success")
     }catch(err){
         alert(err.reason)
     }
     }
        
    
     let bridge = async () => {
        try {
            //let browserProvider = new ethers.JsonRpcProvider("https://testnet.rpc.ethena.fi/");
            let browserProvider = new ethers.BrowserProvider(window.ethereum);
            let signer = await browserProvider.getSigner(); // Get the signer
    
            const abi = [
                "function quoteSend((uint32, bytes32, uint256, uint256, bytes, bytes, bytes), bool) view returns (uint256, uint256)",
                "function send((uint32, bytes32, uint256, uint256, bytes, bytes, bytes), (uint256, uint256), address) payable"
            ];
    
            let contractAddress = "0x426E7d03f9803Dd11cb8616C65b99a3c0AfeA6dE";
    
            let oftContract = new ethers.Contract(contractAddress, abi, signer);
    
            let accountAddress = await signer.getAddress();
    
            
            let sendParams = [
                40161, // dstEid
                ethers.zeroPadValue(accountAddress, 32), // Destination address in bytes32 format
                ethers.parseEther("50.0"), // Amount to bridge (1 USDe)
                ethers.parseEther("49.0"), // Minimum amount to receive
                "0x0003010011010000000000000000000000000000ea60", // Adapter parameters
                "0x", // Payload
                "0x" // To
            ];
    
            let [messagingFee] = await oftContract.quoteSend(sendParams, false);
            console.log("Messaging Fee (ETH):", ethers.formatEther(messagingFee.toString()));
    
            let tx = await oftContract.send(sendParams, [messagingFee, 0], accountAddress, {
                value: messagingFee // Attach the calculated fee as ETH
            });
    
            console.log("Transaction Sent:", tx.hash);
    
            let receipt = await tx.wait();
            console.log("Transaction Confirmed:", receipt);
        } catch (error) {
            console.error("Error:", error);
        }
    };

     return(
        <>
       {poolDetail === null? <p>loading</p>:
       <div className="container mx-auto">
        <p>pool name: {poolDetail.name}</p>
        <p>pool description: {poolDetail.description}</p>
        <p>pool max limit: {poolDetail.maxLimit}</p>
        <p>pool deadline: {poolDetail.deadline}</p>
        <p>pool owner: {poolDetail.owner}</p>
        <p>pool usde balance: {poolDetail.usde_balance}</p>
        <p>pool susde balance: {poolDetail.susde_balance}</p>
        <p>Pool total volume: -</p>
        </div>}

        <table className="table-fixed w-full mb-5 mt-5 ">
<thead className="min-w-full border-collapse border border-gray-200">
    <tr>
      <th>Name</th>
      <th>totalBet</th>
      <th>initial Probability</th>
      <th>chances(%)</th>
      <th>my bets</th>
    </tr>
  </thead>

  <tbody className="text-center">
   {outcomes.map((val,index)=>{
       return (
           <tr>
               <td>{val.name}</td>
               <td>{val.totalBet}</td>
               <td>{val.initialProbability}</td>
               <td>{(chances[index])/100}%</td>
               <td>{myBets[index]}</td>
           </tr>
       )
   })}
  </tbody>
</table>

{outcomes.length > 0 && <>
  <div>
  <select onChange={(e)=>{setBets({...bets,outcomeIndex:e.target.value})}} className="border border-gray-400 p-2">
    <option value={null}>select outcome</option>
    {outcomes.map((val,index)=>{
        return (
            <option value={index}>{val.name}</option>
        )
    })}
</select>
<input onChange={(e)=>{setBets({...bets,amount:e.target.value})}} className="border border-gray-400 p-2 ps-3 pe-3 ms-2 " type="number"/>
<button className="border  bg-black text-white  border-gray-400 p-2 ps-3 pe-3 ms-2 " onClick={()=>{approve()}} >Approve</button>
<button className="border  bg-black text-white  border-gray-400 p-2 ps-3 pe-3 ms-2 " onClick={()=>{placeBet()}}>place bet</button>
<button className="border  bg-green-600 text-white  border-gray-400 p-2 ps-3 pe-3 ms-2 " onClick={()=>{claim()}}>claim</button>

<br />
<p className="mt-5 mb-3">do you have usde in your bridge network? let's send usde to sepolia</p>
<button className="border  bg-black text-white  border-gray-400 p-2 ps-3 pe-3 ms-2 " onClick={()=>{bridge()}}>send USDE from bridge to sepolia</button>
  </div>

  
</>}
        </>
    )   
}
export default Pool