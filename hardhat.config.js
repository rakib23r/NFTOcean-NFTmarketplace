require("@nomiclabs/hardhat-waffle");
const fs = require("fs");
const privateKey = fs.readFileSync(".sec").toString();


module.exports = {

  networks : {
    hardhat:{
      chainId : 1337
    },
    goerli: {
      url : `https://eth-goerli.g.alchemy.com/v2/vogwSr83PKQV6GwJwmt2eh2bPoR6qCXj`,
      accounts : [privateKey]
    }
  },
  solidity: "0.8.4",
};
