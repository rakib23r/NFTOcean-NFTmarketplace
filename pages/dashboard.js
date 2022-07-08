import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
// import Web3Modal from "web3modal"
// import Image from 'next/image'

import {
  nftmarketaddress, nftaddress
} from '../config'

import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

export default function Dashboard() {
  const [nfts, setNfts] = useState([])
  const [message, setMessage] = useState('');

  const [sold, setSold] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {

    if (typeof window.ethereum !== 'undefined'){

      ethereum.request({ method: 'eth_accounts' }).then((accounts) =>{
        if(accounts.length !== 0){

            loadNFTs()
        }else{
          console.log("not connected")
          setLoadingState('notCon') 
        }
    }).catch(console.error);

    }else{
      setLoadingState("noMetamask")
    }
    



  }, [])
  async function loadNFTs() {

    try{

      setMessage('loading from block-chain...')


      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      console.log(chainId)
      if(chainId !== '0x5')
      {

        try{
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x5` }],
         })
    
        }catch(e){}
        

      }

      // const web3Modal = new Web3Modal( )
      //   const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
          
        const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await marketContract.fetchItemsCreated()
        
        const items = await Promise.all(data.map(async i => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId)
          const meta = await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let item = {
            price,
            itemId:i.itemId,
            name:meta.data.name,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            sold: i.sold,
            image: meta.data.image,
          }
          return item
        }))

        const soldItems = items.filter(i => i.sold)
        setSold(soldItems)
        setNfts(items)
        setLoadingState('loaded')
        setMessage('')



    }catch(e){}
 
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl min-h-screen text-gray-600 bg-slate-900">No assets created</h1>)
  if (loadingState === 'notCon') return (<h1 className="py-10 px-20 text-3xl min-h-screen text-gray-600 bg-slate-900">Not Connected - Log In First</h1>)
  if (loadingState === 'noMetamask') return (<h1 className="py-10 px-20 text-3xl min-h-screen text-gray-600 bg-slate-900">No ethereum Wallet Detected</h1>)
  return (
    <div className='px-4 bg-slate-900 min-h-screen pb-24'>

      <div className="text-green-500 bg-slate-900 text-sm text-start mx-20 pt-2 h-6">{message}</div>

      <div className="p-4 text-center">
        <h2 className="text-3xl font-body text-white pt-6 pb-8">Items Created</h2>
        <div className='flex justify-center'>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
              <a href={`/nftpage/${nft.itemId}`}>
                      <img src={nft.image} className="w-64 h-80 object-cover" />
                      <div className="p-4 bg-slate-900">
                      <p className="text-xl text-green-400 font-body uppercase pt-1 h-8">{nft.name}</p>
                </div>
                </a>
              </div>
            ))
          }
          </div>
        </div>
      </div>
        <div className="px-4 text-center">
        {
          Boolean(sold.length) && (
            <div >
              <h2 className="text-3xl font-body text-white pt-12 pb-8">Items sold</h2>
              <div className='flex justify-center'>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4">
                {
                  sold.map((nft, i) => (
                    <div key={i} className="border shadow rounded-xl overflow-hidden">
                    <a href={`/nftpage/${nft.itemId}`}>
                      <img src={nft.image} className="w-64 h-80 object-cover" />
                      <div className="p-4 bg-slate-900">
                      <p className="text-xl text-green-400 font-body uppercase pt-1 h-8">{nft.name}</p>
                    
                </div>
                </a>
              </div>
                  ))
                }
              </div>
              </div>
            </div>
          )
        }
        </div>
    </div>
  )
}