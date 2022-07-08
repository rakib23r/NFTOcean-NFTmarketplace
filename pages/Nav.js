
import React from 'react'
// import '../styles/globals.css'
import Link from 'next/link'
import { useEffect, useState } from 'react';
// import { useLocation } from 'react-router';
const ethers = require("ethers");
import Web3Modal from 'web3modal'





const Nav = () => {


const [connected, toggleConnect] = useState(false);
// const location = useLocation();
const [currAddress, updateAddress] = useState("0x");



async function getAddress() {
    
    try{

        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const addr = await signer.getAddress();
        updateAddress(addr);

    }catch(e){}

  }


  function updateButton() {
    const ethereumButton = document.querySelector('.enableEthereumButton');
    ethereumButton.textContent = "Connected";
    ethereumButton.classList.remove("hover:bg-blue-70");
    ethereumButton.classList.remove("bg-blue-500");
    ethereumButton.classList.add("hover:bg-green-70");
    ethereumButton.classList.add("bg-green-500");
  }




  async function connectWebsite() {


    if (typeof window.ethereum !== 'undefined'){

    if(currAddress === '0x'){
    try{
    // const web3Modal = new Web3Modal();
    // const connection = await web3Modal.connect();
    // const provider = new ethers.providers.Web3Provider(connection);
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    // console.log(chainId)
    if(chainId !== '0x5')
    {

      // alert('Incorrect network! Switch your metamask network to Gorli');
      
        await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x5` }],
         })
        }

                await window.ethereum.request({ method: 'eth_requestAccounts' })
                .then(() => {
                  updateButton();
                  console.log("here1");
                  getAddress();

                });
                



 

      }catch(e){
        console.log(e);
      }
    }
}else{
    alert("No ethereum wallet detected - please Install metamask from https://metamask.io/download/")
}

}



async function switchNetwork(){
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  console.log(chainId)
  if(chainId !== '0x5')
  {

    // alert('Incorrect network! Switch your metamask network to Rinkeby');
    try{
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x5` }],
     })

    }catch(e){}
     
  }
}


useEffect(() => {
    if (typeof window.ethereum !== 'undefined')
    {


      switchNetwork();


      ethereum.on('chainChanged', () => {
        document.location.reload()
      })


    ethereum.on('accountsChanged', function(accounts){
        
        if(accounts[0]){
            updateAddress(accounts[0]);
            window.location.reload();
        }else{
            window.location.reload();
        }
        })

        ethereum.request({ method: 'eth_accounts' }).then((accounts) =>{
            if(accounts.length !== 0){
                updateAddress(accounts[0]);
                updateButton();
            }
        }).catch(console.error);
    }else{
        console.log("No metaMask account detected")
    }

  });


  return (
    
    <div className='bg-slate-900'>
        <nav className='border-b p-2 flex justify-between items-center'>
        <p className='text-2xl ml-10 font-bold text-white font-body'> NFT<span className='text-green-500'>Ocean</span></p>
        <div className='flex align-middle'>
            <Link href="/">
            <a className=" mr-4 text-green-500 hover:text-gray-200 font-body">Home</a>
            </Link>
            <Link href="/createNft">
            <a className="mr-6 text-green-500 hover:text-gray-200 font-body">Create NFT</a>
            </Link>
            <Link href="/mynfts">
            <a className="mr-6 text-green-500 hover:text-gray-200 font-body">My NFTs</a>
            </Link>
            <Link href="/dashboard">
            <a className="mr-6 text-green-500 hover:text-gray-200 font-body">Dashboard</a>
            </Link>
        </div>
        <div className=''>
        <button className="enableEthereumButton bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded text-xs" onClick={connectWebsite}>{connected? "Connected":"Connect Wallet"}</button>
        <div className='text-white text-bold text-right mr-10 mt-1 text-xs'>
          {currAddress !== "0x" ? "Connected to":"Not Connected. Please login to view NFTs"} {currAddress !== "0x" ? (currAddress.substring(0,10)+'.....'+currAddress.substring(36,42)):""}
          {/* {currAddress !== "0x" ? "Connected to":"Not Connected. Please login to view NFTs"} {currAddress !== "0x" ? (currAddress):""} */}
        </div>
        </div>
        </nav>
    </div>
  )
}

export default Nav

