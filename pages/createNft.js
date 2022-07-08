import {useState } from 'react'
import {ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

import {
    nftaddress,nftmarketaddress
} from '../config';
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import { EtherscanProvider } from '@ethersproject/providers'
// import Image from 'next/Image'


export default function CreateNft() {
    const [fileUrl, setFileUrl] = useState(null)
    const [message, setMessage] = useState('')
    const [formInput, updateFormInput] = useState({price: '', name: '', description:''})
    const router = useRouter();
    let logedin = true;

    async function onChange(e) {
        const file = e.target.files[0]
        try{ //try uploading the file
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )
            //file saved in the url path below
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url)
        }catch(e){
            console.log('Error uploading file: ', e)
        }
    }


    async function createItem(){

        if (typeof window.ethereum !== 'undefined'){

            ethereum.request({ method: 'eth_accounts' }).then((accounts) =>{
                if(accounts.length === 0){
                    alert('not logged in')
                    logedin = false;
                }
            }).catch(console.error);

            if(logedin){


            

            const {name, description, price} = formInput;
        
   
            if(!name || !description || !price || !fileUrl) {
                return
            }
    
            const data = JSON.stringify({
                name, description, image: fileUrl
            });
    
            try{
                const added = await client.add(data)
                const url = `https://ipfs.infura.io/ipfs/${added.path}`
                
                createSale(url)
                
            }catch(error){
                console.log(`Error uploading file: `, error)
            }

            }
            

        }else{
            alert("No ethereum wallet detected - please Install metamask from https://metamask.io/download/")
        }



    }

    async function createSale(url){


        try{

        
        const  provider = new ethers.providers.Web3Provider(window.ethereum);

            const signer = provider.getSigner();
            let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
            let transaction = await contract.createToken(url);
            setMessage('Setting account..')
            let tx = await transaction.wait()


            console.log('Transaction: ',tx)
            console.log('Transaction events: ',tx.events[0])
            let event = tx.events[0]
            let value = event.args[2]
            let tokenId = value.toNumber()


        const price = ethers.utils.parseUnits(formInput.price.toString(), 'ether')

        contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

        setMessage('Connecting to ethereum...')

        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()

        
        transaction = await contract.createMarketItem(
            nftaddress, tokenId, price, {value: listingPrice }
        )

        setMessage('Minting NFT... (est. time - 1 min)')
        await transaction.wait()
        setMessage('Completed')

        router.push('/')

        }catch(e){console.log(e)}


    }

    return (
        <div className="flex justify-center bg-slate-900 min-h-screen">
            <div className="w-1/3 mt-8 h-fit flex flex-col ">
                <input 
                    placeholder="NFT Name"
                    className="mt-2 border border-gray-300 rounded p-4 bg-transparent"
                    onChange={e => updateFormInput({...formInput, name: e.target.value})}
                    />
                <textarea
                     placeholder="NFT description"
                     className="mt-2 border border-gray-300 rounded p-4 bg-transparent"
                     onChange={e => updateFormInput({...formInput, description: e.target.value})}
                     />
                <input 
                    placeholder="NFT Price in Eth"
                    className="mt-2 border border-gray-300 rounded p-4 bg-transparent"
                    type="number"
                    onChange={e => updateFormInput({...formInput, price: e.target.value})}
                    />
                    <input
                        type="file"
                        name="Asset"
                        className="my-4 bg-transparent text-sm text-gray-300"
                        onChange={onChange}
                    />
                    {
                        fileUrl && (
                            <div className='flex justify-center'>
                            <img className="rounded mt-4" width="200" src={fileUrl} />
                            </div>
                        )
                    }
                    <button onClick={createItem}
                     className="font-bold mt-4 bg-green-500 text-white rounded p-4 shadow-lg"
                     >Create NFT</button>
                     <div className="text-green-500 text-center mt-3">{message}</div>
            </div>
        </div>
    )
}