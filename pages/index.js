
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from "web3modal";
import { nftaddress, nftmarketaddress } from '../config';
import styles from '../styles/Home.module.css'
import Link from 'next/dist/client/link';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faAdobe } from '@fortawesome/free-brands-svg-icons/faAdobe'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import NFTMarket from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';

export default function Home() {

  const [nfts, setNfts] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingState, setLoadingState] = useState('not-loaded');

  useEffect(()=>{
    loadNFTs();

  }, []);

  async function loadNFTs(){

    setMessage('loading NFTs from block-chain...')
    let provider;
    if (typeof window.ethereum === 'undefined')
    {
    provider = new ethers.providers.JsonRpcProvider('https://eth-goerli.g.alchemy.com/v2/vogwSr83PKQV6GwJwmt2eh2bPoR6qCXj');
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

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, provider);

    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        itemId:i.itemId,
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }

      return item;
   }));

   setNfts(items);
   setLoadingState('loaded');
   setMessage('')

  }



   async function buyNFT(nft){

    try{
      if (typeof window.ethereum !== 'undefined'){


        

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
    
        
        const signer = provider.getSigner();
        let contract = new ethers.Contract(nftmarketaddress, NFTMarket.abi, signer);
    
        
        const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

        
    
        


        
        let transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
          value: price
        });
        setMessage('Buying NFT...')
        await transaction.wait();
        setMessage('')
        // loadNFTs();
        window.location.reload();
      }else{
        alert("No ethereum wallet detected - please Install metamask from https://metamask.io/download/")
      }



    }catch(e){
      console.e
    }

  }



   if(loadingState === 'loaded' && !nfts.length) return ( <h1 className="px-20 py-10 text-3xl"> No NFTs for Sale </h1> )

  

   return (
    <div className='bg-slate-900 min-h-screen'>
    <div className="text-green-500 bg-slate-900 text-xs text-start mx-20 pt-2 h-6">{message}</div>
    <div className='flex justify-center pt-12'>
    
    {/* <div className="text-green-500 text-center mt-3">{message}</div> */}
    </div>
    <div className="flex justify-center">
    
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        
          {
            nfts.map((nft, i) => (
              
              
              <div key={i} className="border shadow rounded-xl overflow-hidden">
              <a href={`/nftpage/${nft.itemId}`}>
              <img src={nft.image} className="w-64 h-80 object-cover" />
                <div className=" text-center bg-gray-800">
                  {/* <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p> */}
                  <p className="text-xl text-green-400 font-body uppercase pt-1 h-8">{nft.name}</p>
                  {/* <div  className="h-8 overflow-y-auto">
                    <p className="text-gray-400">{nft.description}</p>
                  </div> */}
                </div>
                </a>
                <div className="p-2 bg-slate-600 text-center">
                <div className='flex items-center justify-center'>
                
 
 
                {/* .cls-1{fill:#343434;}.cls-2{fill:#8c8c8c;}.cls-3{fill:#3c3c3b;}.cls-4{fill:#141414;}.cls-5{fill:#393939;} */}

                <svg id="Layer_1" className='w-6 h-6' data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 311.39 507.11"><defs><style></style></defs><title>ethereum-eth</title><polygon  className='fill-slate-800' points="155.65 0 152.25 11.56 152.25 346.87 155.65 350.26 311.3 258.26 155.65 0"/><polygon className='fill-slate-700' points="155.65 0 0 258.26 155.65 350.27 155.65 187.51 155.65 0"/><polygon  className='fill-slate-800' points="155.65 379.74 153.73 382.07 153.73 501.52 155.65 507.11 311.39 287.78 155.65 379.74"/><polygon  className='fill-slate-700' points="155.65 507.11 155.65 379.73 0 287.78 155.65 507.11"/><polygon  className='fill-slate-900' points="155.65 350.26 311.3 258.26 155.65 187.51 155.65 350.26"/><polygon className='fill-slate-800' points="0 258.26 155.65 350.26 155.65 187.51 0 258.26"/></svg>
                {/* <img src="ethereum.svg" width='20px'/> */}
                {/* <svg style="color: rgb(76, 81, 93);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" fill="#4c515d"></path></svg> */}
                  <p className="text-l font-bold text-white mx-2">{nft.price}</p>
                  </div>
                  <button className="mt-2 w-full bg-green-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNFT(nft)}>Buy</button>
                </div>
              
              </div>
              
            ))
          }
        </div>
      </div>
      </div>
    </div>
  )
}
