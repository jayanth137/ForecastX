import { ethers } from "ethers"
import { useEffect, useState } from "react"
import bettingABI from '../../betting.json'
function PredictionCard({name,creationTime,address}) {
    let [detail,setDetail] = useState(null)
    let [outcomePossibility,setOutcomePossibility] = useState({
        name:"",
        initialPronbability:0,
        address:""
    })
    let [outcomes,setOutcomes] = useState([])
    let [winningOutcomeIndex,setWinningOutcomeIndex] = useState(null)
    useEffect(() => {
  
        let fetchPoolDetail = async()=>{
            let ether = new ethers.BrowserProvider(window.ethereum)
            let signer = await ether.getSigner()
            let contract = new ethers.Contract(address,bettingABI,signer);
            let description = await contract.description()
            let maxLimit = await contract.maxLimit()
            let deadline = await contract.deadline()
            let usde_balance = await contract.getTokenBalance()
            let susde_balance = await contract.get_sUsde_balance()
            let dt = {
                description:description,
                maxLimit:maxLimit,
                deadline:deadline,
                usde_balance:ethers.toNumber(usde_balance),
                susde_balance:ethers.toNumber(susde_balance)
            }
            setDetail(dt)
            
        }

        let fetchOutcomes = async()=>{
            let ether = new ethers.BrowserProvider(window.ethereum)
            let signer = await ether.getSigner()
            let contract = new ethers.Contract(address,bettingABI,signer);
            let dt = await contract.getOutcomes()

            let arr = dt.map((val)=>{
                let obj ={name:val.name,totalBet:ethers.toNumber(val.totalBets),initialProbability:ethers.toNumber(val.initialProbability)}
                return (obj)
            })
            setOutcomes(arr)
        }

        
        fetchOutcomes()
fetchPoolDetail()
    }, [])

    let addOutcome = async()=>{
        let ether = new ethers.BrowserProvider(window.ethereum)
        let signer = await ether.getSigner()
        let contract = new ethers.Contract(outcomePossibility.address,bettingABI,signer);
        let dt = await contract.addOutcome(outcomePossibility.name,outcomePossibility.initialPronbability)
        console.log(dt)
    }

    let closeBet = async()=>{
  try{
    let ether = new ethers.BrowserProvider(window.ethereum)
    let signer = await ether.getSigner()
    let contract = new ethers.Contract(address,bettingABI,signer);
    let dt = await contract.closeBetting()
    console.log()
    console.log(dt)
  }catch(err){
    console.log(err)

    alert(err.reason)
  }
    }

    let resolve = async()=>{
   try{
    console.log(address)
    let ether = new ethers.BrowserProvider(window.ethereum)
    let signer = await ether.getSigner()
    let contract = new ethers.Contract(address,bettingABI,signer);
    let dt = await contract.resolve(winningOutcomeIndex)
    console.log(dt)
   }catch(err){
        alert(err.reason)
   }
    }

    let unstake = async()=>{
        let ether = new ethers.BrowserProvider(window.ethereum)
        let signer = await ether.getSigner()
        let contract = new ethers.Contract(address,bettingABI,signer);
        let dt = await contract.unstake_token()
        console.log(dt)
    }
    
    let stake = async()=>{
        let ether = new ethers.BrowserProvider(window.ethereum)
        let signer = await ether.getSigner()
        let contract = new ethers.Contract(address,bettingABI,signer);
        let approve = await contract.approve_token(process.env.REACT_APP_SUSDE_SEPOLIA_ADDRESS)
        let stake = await contract.deposit_token()
        console.log(approve,stake)
       
    }
    
    let cooldownAssets = async()=>{
        let ether = new ethers.BrowserProvider(window.ethereum)
        let signer = await ether.getSigner()
        let contract = new ethers.Contract(address,bettingABI,signer);
        let dt = await contract.cooldown_assets(detail.susde_balance)
        console.log(dt)
    }
    
    return(
       <>
     {detail === null ? <div>loading</div> :      <div className='border border-gray-300p-3 py-10 bg-white shadow rounded-md w-full mt-5 px-5'>
        <p>{name} <span className='ms-5'>80% Chance</span></p>
        <p className='mt-5 text-gray-400'>{detail.description}</p>
        <p className='mt-5'>total usede in pool:{detail.usde_balance}</p>
        <p className='mt-5'>staked susde via pool:{detail.susde_balance}</p>


        <div className='mt-5'>
            <p>Add outcomes: </p>
            <input type="text" className="w-full border border-gray-300 mt-5 p-1 py-2 rounded-md outline-none ps-2" placeholder="name" onChange={(e)=>setOutcomePossibility((prev)=>({...prev,name:e.target.value,address:address}))} />

            <input type="number" className="w-full border border-gray-300 mt-5 p-1 py-2 rounded-md outline-none ps-2" placeholder="initial probability" onChange={(e)=>setOutcomePossibility((prev)=>({...prev,initialPronbability:e.target.value}))} />
            <button onClick={()=>{addOutcome()}} className="text-white bg-black font-bold py-2 px-4 rounded mt-5 ms-4">add</button>
            <div className='mt-5'>
                <p>outcomes:</p>


<table className="table-fixed w-full mb-5">
<thead className="min-w-full border-collapse border border-gray-200">
    <tr>
      <th>Name</th>
      <th>totalBet</th>
      <th>initial Probability</th>
    </tr>
  </thead>

  <tbody className="text-center">
   {outcomes.map((val)=>{
       return (
           <tr>
               <td>{val.name}</td>
               <td>{val.totalBet}</td>
               <td>{val.initialProbability}</td>
           </tr>
       )
   })}
  </tbody>
</table>
            </div>
        </div>

        <div className='flex justify-around'>
                <div className='w-2/12'>
                    <button onClick={()=>{closeBet()}} className='text-white bg-red-600 font-bold py-2 px-4 rounded mt-5'>Close Betting</button>
                </div>
                <div className='w-10/12'>
                    <input type="number" className='border border-gray-300 mt-5 p-1 py-2 rounded-md outline-none ps-2 w-8/12' onChange={(e)=>setWinningOutcomeIndex(e.target.value)}/>
                    <button onClick={()=>{resolve()}} className='text-white bg-black font-bold py-2 px-4 rounded mt-5 ms-4'>Resolve</button>
                </div>
        </div>
        <p>{address}</p>

        <button onClick={()=>{stake()}} className="text-white bg-black font-bold py-2 px-4 rounded mt-5 ms-2">Stake</button>
        <button onClick={()=>{cooldownAssets()}} className="text-white bg-black font-bold py-2 px-4 rounded mt-5 ms-2">cool down</button>
        <button onClick={()=>{unstake()}} className="text-white bg-black font-bold py-2 px-4 rounded mt-5 ms-2">unstake</button>

     </div>}
       </>
    )
}

export default PredictionCard
    