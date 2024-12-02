import {useEffect, useState} from 'react'
import PredictionCard from '../components/admin/PredictionCard';
import {useFormik} from 'formik'
import * as yup from 'yup'
import { ethers } from 'ethers';
import factoryABI from '../Factory.json'
 function Dashboard() {
    let [show, setShow] = useState(false);
let [pools, setPools] = useState([]);
    useEffect(() => {
      let fetchAllPolls = async () => {
        let provider = new ethers.BrowserProvider(window.ethereum);
        let signer = await provider.getSigner()
        console.log(signer.address)
       
    
        
        let contarct = new ethers.Contract(process.env.REACT_APP_PREDICTION_POOL_FACTORY_ADDRESS,factoryABI,provider);
        
       
        let dt = await contarct.getUserPools(signer.address)
              
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

    // this formik will get input and create the betting pool via betting pool factory contract
    let formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            maxLimit: '',
            duration: '',
        },
        validationSchema: yup.object({
            name: yup.string().required(),
            description: yup.string().required(),
            maxLimit: yup.number().required(),
            duration: yup.number().required(),
        }),
        onSubmit: async(values) => {
            let provider = new ethers.BrowserProvider(window.ethereum);
            let signer = await provider.getSigner();
            let abi = [
                "function createPool(string  _name,string  _description,uint256 _maxLimit,uint256 _durationInDays,address _tokenAddress) external  returns (address poolAddress)"
            ]

            console.log(process.env.REACT_APP_PREDICTION_POOL_FACTORY_ADDRESS )
            let contarct = new ethers.Contract(process.env.REACT_APP_PREDICTION_POOL_FACTORY_ADDRESS,abi,signer);

          let dt = await contarct.createPool(values.name, values.description, values.maxLimit, values.duration, process.env.REACT_APP_USDE_SEPOLIA_ADDRESS)
          console.log(dt)

        },
    });


    return (
        <div className="container mx-auto">
<div className='flex justify-end'>
<button onClick={() => setShow(!show)} className="bg-black  text-white font-bold py-2 px-4 rounded d-inline-block mt-10">Create Prediction</button>

</div>

            <div className={`${show ? 'block' : 'hidden'} p-3 py-10 bg-white shadow border rounded-md lg:w-6/12 mt-5 absolute lg:left-[23%] w-full`}>
                <h6 className="text-xl text-gray-600 mt-5 text-center">Create Prediction</h6>
                <form onSubmit={formik.handleSubmit}>
                <input type="text" name='name' onChange={formik.handleChange} value={formik.values.name} className="w-full border border-gray-300 mt-5 p-1 py-2 rounded-md outline-none ps-2" placeholder="Prediction Name" />

<textarea  placeholder="Description" name='description' onChange={formik.handleChange} value={formik.values.description} className="w-full border border-gray-300 mt-5 p-1 py-2 rounded-md outline-none ps-2 h-[200px]"> 

</textarea>
<div className="flex justify-around ">
<input type="number" name='maxLimit' onChange={formik.handleChange} value={formik.values.maxLimit} className="border w-5/12 border-gray-300 mt-5 p-1 py-2 rounded-md outline-none ps-2" placeholder="Max Limit" />
<input type="number" name='duration' onChange={formik.handleChange} value={formik.values.duration} className="w-5/12 border border-gray-300 mt-5 p-1 py-2 rounded-md outline-none ps-2" placeholder="Duration" />

</div>

<button className="text-white bg-black font-bold py-2 px-4 rounded mt-5 w-full">Submit</button>
                </form>
            </div>

        {pools.map((pool) => {
            return <PredictionCard name={pool.name} creationTime={pool.creationDate} address={pool.poolAdd}/>
        })}
        </div>
    );
}

export default Dashboard;