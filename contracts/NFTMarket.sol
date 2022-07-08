//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner;
    uint256 listingPrice = 0.00001 ether;

    constructor(){
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

   
    mapping(uint256 => MarketItem) private idToMarketItem;


    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address  seller,
        address  owner,
        uint256 price,
        bool sold
    );

    function getTotalNoItems() public view returns (uint256){
        return _itemIds.current();
    }


    function getListingPrice() public view returns (uint256){
        return listingPrice;
    }

    function setListingPrice(uint _price) public returns(uint) {
         if(msg.sender == address(this) ){
             listingPrice = _price;
         }
         return listingPrice;
    }




    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price) public payable nonReentrant{
         require(price > 0, "Price must be above zero");
         require(msg.value == listingPrice, "Price must be equal to listing price");

         _itemIds.increment();
         uint256 itemId = _itemIds.current();

         idToMarketItem[itemId] = MarketItem(
             itemId,
             nftContract,
             tokenId,
             payable(msg.sender), 
             payable(address(0)),
             price,
             false
         );


            IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);


            emit MarketItemCreated(
                itemId,
             nftContract,
             tokenId,
             msg.sender,
             address(0),
             price,
             false);

        }



        function createMarketSale(
            address nftContract,
            uint256 itemId
            ) public payable nonReentrant{
                uint price = idToMarketItem[itemId].price;
                uint tokenId = idToMarketItem[itemId].tokenId;

                require(msg.value == price, "Asking price not matched");


           idToMarketItem[itemId].seller.transfer(msg.value);


            IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);

            idToMarketItem[itemId].owner = payable(msg.sender);
            idToMarketItem[itemId].sold = true; 
            _itemsSold.increment();
            payable(owner).transfer(listingPrice);
        }




    function resellToken(address nftContract, uint256 itemId, uint256 price) public payable {
      require(idToMarketItem[itemId].owner == msg.sender, "Only item owner can perform this operation");
      require(msg.value == listingPrice, "Price must be equal to listing price");
      idToMarketItem[itemId].sold = false;
      idToMarketItem[itemId].price = price;
      idToMarketItem[itemId].seller = payable(msg.sender);
      idToMarketItem[itemId].owner = payable(address(this));
      _itemsSold.decrement();
      uint tokenId = idToMarketItem[itemId].tokenId;

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    //   _transfer(msg.sender, address(this), tokenId);
    }



    // function resell(
    //     address nftContract,
    //     uint256 itemId,
    //     uint256 price) public payable nonReentrant{
    //      require(price > 0, "Price must be above zero");
    //      require(msg.value == listingPrice, "Price must be equal to listing price");

    //     //  _itemIds.increment();
    //     //  uint256 itemId = _itemIds.current();

    //     //  idToMarketItem[itemId] = MarketItem(
    //     //      itemId,
    //     //      nftContract,
    //     //      tokenId,
    //     //      payable(msg.sender), 
    //     //      payable(address(0)),
    //     //      price,
    //     //      false
    //     //  );


    //         IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);


    //         emit MarketItemCreated(
    //             itemId,
    //          nftContract,
    //          tokenId,
    //          msg.sender,
    //          address(0),
    //          price,
    //          false);

    //     }










        function getMarketItemForId(uint256 tokenId) public view returns (MarketItem memory) {
        return idToMarketItem[tokenId];
    }

        function fetchMarketItems() public view returns (MarketItem[] memory){
            uint itemCount = _itemIds.current();

            uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
            uint currentIndex = 0;

            MarketItem[] memory items =  new MarketItem[](unsoldItemCount);


            for(uint i = 0; i < itemCount; i++){


                if(idToMarketItem[i+1].sold == false){

                    uint currentId = idToMarketItem[i + 1].itemId;
                    MarketItem storage currentItem = idToMarketItem[currentId];
                    items[currentIndex] = currentItem;
                    currentIndex += 1;

                }
            }
            return items;
        }


        function fetchMyNFTs() public view returns (MarketItem[] memory){

            uint totalItemCount = _itemIds.current();
            uint itemCount = 0;
            uint currentIndex = 0;


            for(uint i = 0; i < totalItemCount; i++){

                if(idToMarketItem[i+1].owner == msg.sender){
                    itemCount += 1;
                }
            }

            MarketItem[] memory items = new MarketItem[](itemCount);
            for(uint i = 0; i < totalItemCount; i++){
               if(idToMarketItem[i+1].owner == msg.sender){
                   uint currentId = idToMarketItem[i+1].itemId;
                   MarketItem storage currentItem = idToMarketItem[currentId];
                   items[currentIndex] = currentItem;
                   currentIndex += 1;
               }
            }
            return items;

        }






        function fetchItemsCreated() public view returns (MarketItem[] memory){

            uint totalItemCount = _itemIds.current();

            uint itemCount = 0;
            uint currentIndex = 0;


            for(uint i = 0; i < totalItemCount; i++){

                if(idToMarketItem[i+1].seller == msg.sender){
                    itemCount += 1;
                }
            }

            MarketItem[] memory items = new MarketItem[](itemCount);
            for(uint i = 0; i < totalItemCount; i++){
               if(idToMarketItem[i+1].seller == msg.sender){
                   uint currentId = idToMarketItem[i+1].itemId;
                   MarketItem storage currentItem = idToMarketItem[currentId];
                   items[currentIndex] = currentItem;
                   currentIndex += 1;
               }
            }
            return items;

        }


}