import { ethers } from 'ethers'
function Test() {

    let approve = async()=>{
        const ERC20_ABI = [
            "function approve(address spender, uint256 amount) public returns (bool)"
          ];
        let ether = new ethers.BrowserProvider(window.ethereum)
        let signer = await ether.getSigner()
        let contract = new ethers.Contract("0xf805ce4F96e0EdD6f0b6cd4be22B34b92373d696",ERC20_ABI,signer);
        let dt = await contract.approve("0x8b1752D5f37e0cdE19c533e60B156A01B2BF4D6c", ethers.parseUnits("50", 18))
        console.log(dt)
    }

    return (
      <div> 
      <button onClick={()=>(approve())} className='bg-blue-500 text-white py-2 px-4 rounded'>approve</button>
      </div>    
    );      
  } 
  
  export default Test