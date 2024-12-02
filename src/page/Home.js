import {useEffect, useState} from 'react'

import { ethers } from 'ethers';
import factoryABI from '../Factory.json'
import { useNavigate } from 'react-router-dom';
function Home(){
let [pools,setPools] = useState([])
let nav = useNavigate()
    useEffect(() => {
        let fetchAllPolls = async () => {
          let provider = new ethers.BrowserProvider(window.ethereum);
          let signer = await provider.getSigner()
          console.log(signer.address)
         
      
          
          let contarct = new ethers.Contract(process.env.REACT_APP_PREDICTION_POOL_FACTORY_ADDRESS,factoryABI,provider);
          
         
          let dt = await contarct.getAllPools()
                console.log(dt)
          let arr = dt.map((val)=>{
              return {
                   poolAdd:val.poolAddress,
                  owner: val.owner,
                  name:val.name,
                  creationTime:val.creationTime
              }
          })
          console.log(arr)
  setPools(arr)
          }
  
        fetchAllPolls()
  
      }, []);

    return(
        <>
        <div className="container mx-auto">
            <div className="flex gap-4 flex-wrap">
            {/* list of pools */}
             {
               pools.map((val)=>{
                return(
                    <div className="p-3  bg-white shadow rounded-md mt-2 w-full lg:w-3/12">
                    <p className="text-xl font-semibold text-center">{val.name}</p>
                    <p className="mt-2">contract address: <span className="ms-2 bg-gray-200  rounded-full p-1 px-2">{val.poolAdd.slice(0,7)}...{val.poolAdd.slice(-7)}</span></p>
                    <button onClick={()=>nav(`/pool/${val.poolAdd}`)} className="bg-black text-white rounded-full p-1 px-2 w-full  mt-5 ">Know more</button>
        </div>
                )
               })
             }

            </div>
        </div>
        </>
    )
}
export default Home