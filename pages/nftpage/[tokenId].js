import { useRouter } from "next/dist/client/router";
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Image from 'next/image'

import {
  nftmarketaddress, nftaddress
} from '../../config'

import Market from '../../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../../artifacts/contracts/NFT.sol/NFT.json'


import React from 'react'

const TokenId = () => {

    const router = useRouter();
    const {tokenId} = router.query

    const [data, updateData] = useState({});
    const [message, setMessage] = useState('');

    const [dataFetched, setDataFetched] = useState(false);
    const [outofIndex, setOutofIndex] = useState(false);
    const [loadingState, setLoadingState] = useState('not-loaded')

 


    async function loadNFT() {
        try{

            setMessage('loading NFTs from block-chain...')
            let provider;
            if (typeof window.ethereum === 'undefined')
            {
            // const web3Modal = new Web3Modal();
            // const connection = await web3Modal.connect();
            // provider = new ethers.providers.Web3Provider(connection);

            // provider = ethers.getDefaultProvider('goerli')
            provider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/7efe8d8622564fadb1e40e4df0484f1d');

        }else{
            
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                console.log(chainId)
                if(chainId !== '0x5')
                {
                    provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/vogwSr83PKQV6GwJwmt2eh2bPoR6qCXj');
            
                }else{
          
                  provider = new ethers.providers.Web3Provider(window.ethereum);
                }
          
              

            }

      

            const contract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
            const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)

            const nItems = await contract.getTotalNoItems();
            const nItem = nItems.toNumber();

            if(nItem < tokenId){
                setOutofIndex(true)
                return
            }

       
            console.log(tokenId)
            const listedToken = await contract.getMarketItemForId(tokenId);
            
           
            const tokenURI = await tokenContract.tokenURI(listedToken.tokenId);
            const meta = await axios.get(tokenURI);
            
            meta = meta.data;
          
            let price = ethers.utils.formatUnits(listedToken.price.toString(), 'ether')
        
            let item = {
                price,
                tokenId: listedToken.tokenId.toNumber(),
                seller: listedToken.seller,
                owner: listedToken.owner,
                image: meta.image,
                name: meta.name,
                description: meta.description,
            }
            data = item;
    

            setMessage('')
 
        console.log(item.description)
        console.log(item.tokenId)
        //   setNfts(item)
        updateData(item);
        setDataFetched(true)
        
        //   setLoadingState('loaded') 
    
        }catch(e){
            // console.log(e)
        }
    
      }
    

    //   loadNFT();

      useEffect(() => {
        loadNFT()
      },[router.isReady])

      if (outofIndex) return (<h1 className="py-10 px-20 text-3xl">No assets Found</h1>)


    return(
        <div className="bg-slate-900 min-h-screen">
            <div className="text-green-500 bg-slate-900 text-xs text-start mx-20 pt-2 h-6">{message}</div>

            <div className="flex  ml-20 pt-20">
                <img src={data.image} alt="" className="w-1/5 border-2" />
                <div className="text-l ml-20 space-y-8 text-gray-500 shadow-xl rounded-lg border-2 p-5">
                    <div>
                    <p className="text-xl text-green-400 font-body uppercase pt-1 h-8">{data.name}</p>
                    </div>
                    <div>
                    <p className="text-md text-gray-200 font-body uppercase pt-1 h-28">{data.description}</p>
                    </div>
                    <div>
                    <div className='flex items-center'>
                
 
 
                {/* .cls-1{fill:#343434;}.cls-2{fill:#8c8c8c;}.cls-3{fill:#3c3c3b;}.cls-4{fill:#141414;}.cls-5{fill:#393939;} */}

                <svg id="Layer_1" className='w-12 h-12' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 311.39 507.11"><defs><style></style></defs><title>ethereum-eth</title><polygon class="cls-1" className='fill-slate-800' points="155.65 0 152.25 11.56 152.25 346.87 155.65 350.26 311.3 258.26 155.65 0"/><polygon class="cls-2" className='fill-slate-700' points="155.65 0 0 258.26 155.65 350.27 155.65 187.51 155.65 0"/><polygon class="cls-3" className='fill-slate-800' points="155.65 379.74 153.73 382.07 153.73 501.52 155.65 507.11 311.39 287.78 155.65 379.74"/><polygon class="cls-2" className='fill-slate-700' points="155.65 507.11 155.65 379.73 0 287.78 155.65 507.11"/><polygon class="cls-4" className='fill-slate-900' points="155.65 350.26 311.3 258.26 155.65 187.51 155.65 350.26"/><polygon class="cls-5"  className='fill-slate-800' points="0 258.26 155.65 350.26 155.65 187.51 0 258.26"/></svg>
                {/* <img src="ethereum.svg" width='20px'/> */}
                {/* <svg style="color: rgb(76, 81, 93);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" fill="#4c515d"></path></svg> */}
                  <p className="text-l font-bold text-white mx-2">{data.price}</p>
                  </div>
                    </div>
                    <div>
                        <p>Owner : <span className="text-xs font-bold  text-gray-200">{data.owner}</span></p>
                        <p>Seller : <span className="text-xs font-bold text-gray-200">{data.seller}</span> </p>
                    </div>
                    <div>
                    {/* { currAddress == data.owner || currAddress == data.seller ?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm" onClick={() => buyNFT(tokenId)}>Buy this NFT</button>
                        : <div className="text-emerald-700">You are the owner of this NFT</div>
                    } */}
                    
                    {/* <div className="text-green text-center mt-3">{message}</div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TokenId