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

export default function MyNFTs() {
  
  const [nfts, setNfts] = useState([])
  const [nftPrice, setNftPrice] = useState(0.0001)
  const [showIn, setShowIn] = useState('')
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {


    if (typeof window.ethereum !== 'undefined'){



    

      ethereum.request({ method: 'eth_accounts' }).then((accounts) =>{
        if(accounts.length !== 0){
            // updateAddress(accounts[0]);
            // updateButton();
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

  async function sellNft(nft){

    // console.log(nftPrice)

    try{

      const  provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();
      let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);


      const price = ethers.utils.parseUnits(nftPrice.toString(), 'ether')

      
      // let pricee = ethers.utils.formatUnits(price.toString(), 'ether')
      // console.log(price)
      let listingPrice = await contract.getListingPrice()
      // console.log(listingPrice)
      listingPrice = listingPrice.toString()

      

      console.log(listingPrice)
      // setMessage('Minting NFT... (est. time - 1 min)')
        let transaction = await contract.resellToken(
            nftaddress, nft.itemId, price, {value: listingPrice }
        )

        setShowIn('Listing NFT...')
        await transaction.wait()
        setShowIn('')
        window.location.reload()
        // router.push('/')
        





    }catch(e){
      console.e
    }

    

  }

  async function loadNFTs() {


    try{

      setShowIn('loading..')

      let provider
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

        provider = new ethers.providers.Web3Provider(window.ethereum);


      // const web3Modal = new Web3Modal()
      // const connection = await web3Modal.connect()
      // const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
        
      const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
      const data = await marketContract.fetchMyNFTs()
      
      const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          itemId:i.itemId,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          name:meta.data.name,
          image: meta.data.image,
        }
        return item
      }))
      setNfts(items)
      setLoadingState('loaded') 
      setShowIn('')

    }catch(e){
      console.log('e',e)
    }

  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl min-h-screen text-gray-600 bg-slate-900">No assets owned</h1>)
  if (loadingState === 'notCon' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl min-h-screen text-gray-600 bg-slate-900">Not Connected - Log In First</h1>)
  if (loadingState === 'noMetamask' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl min-h-screen text-gray-600 bg-slate-900">No ethereum Wallet Detected</h1>)
  return (
    <div className='bg-slate-900 min-h-screen'>
        <div className="text-green-500 bg-slate-900 text-sm text-start mx-20 pt-2 h-6">{showIn}</div>

    <div className='flex flex-col justify-center w-full items-center bg-slate-900'>
    <p className='text-white'>Enter Asking Price for Selling NFTs (price in ETH)</p>
    <input
                    placeholder='0.0001'
                    className="mt-2 w-1/3 p-1 border text-sm border-gray-300 bg-transparent rounded "
                    type="number"
                    onChange={e => setNftPrice(e.target.value)}
                    />
        {/* <div className="text-green-500 text-center mt-3">{showIn}</div> */}

    </div>
    <div className='flex justify-center mt-6'>
      <div className="p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
         

              <a href={`/nftpage/${nft.itemId}`}>
              <img src={nft.image} className="w-64 h-80 object-cover" />
              </a>
                
                <div className="p-3 bg-slate-900 text-center">
                <p className="text-xl text-green-400 font-body uppercase h-8">{nft.name}</p>
                <button className="mt-1 w-full p-1 bg-green-500 text-white font-bold rounded" onClick={() => sellNft(nft)}>Sell</button>

                  {/* <p className="text-2xl font-bold text-white">Price - {nft.price} ETH</p> */}
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