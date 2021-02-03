const { Param } = require('@nestjs/common');
var TX = require('ethereumjs-tx');
const { async } = require('rxjs');
const Web3 = require('web3')
//const web3 = new Web3('')
var providerURL = "https://rinkeby.infura.io/v3/e72daeeafa5f4e8cae0110b45fed3645"
const web3 = new Web3(new Web3.providers.HttpProvider(providerURL));

var gameContractAddress = '0xf0448292f85E83F2E05115fEF6fF6DB0B00364aa'
var nftContractAddress = '0x6b2d33cad9a385E9E547b9563d08E739B85f83D8'
var starsContractAddress = '0xAA8743536F70c16fFabBF1CAf6782A4c300173F5'
var marketContractAddress = '0x5033572146Df4BaeB9C57A7A374C2f514B399a57'

//Game interface
const interfac =[{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"NoOfTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_of","type":"address"}],"name":"TotalCards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_of","type":"address"},{"internalType":"uint256","name":"_count","type":"uint256"}],"name":"blockStars","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"cardDetails","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenID1","type":"uint256"},{"internalType":"uint256","name":"tokenID2","type":"uint256"},{"internalType":"bool","name":"status","type":"bool"}],"name":"clearTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"nft","outputs":[{"internalType":"contract NFT","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_of","type":"address"}],"name":"remainingPaper","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_of","type":"address"}],"name":"remainingRock","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_of","type":"address"}],"name":"remainingScissor","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_stars","type":"uint256"}],"name":"setStars","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"setToken","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"setValue","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"nft_add","type":"address"}],"name":"set_nft_address","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token_add","type":"address"}],"name":"set_token_address","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_of","type":"address"}],"name":"showStars","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"}],"name":"signUp","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"starCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stars","outputs":[{"internalType":"contract Interface_stars","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"player","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"transferBack","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"value","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]
var _interface = new web3.eth.Contract((interfac) , gameContractAddress); //deployed address 


//NFT interface
const interface_nft =[{"inputs":[{"internalType":"uint256","name":"supply","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"approved","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"operator","type":"address"},{"indexed":false,"internalType":"bool","name":"approved","type":"bool"}],"name":"ApprovalForAll","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":true,"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"SellerApproveMarket","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"approval","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_supply","type":"uint256"}],"name":"changeSeason","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"playeraddress","type":"address"}],"name":"countMakeUp","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"playeraddress","type":"address"},{"internalType":"uint256","name":"cardtype","type":"uint256"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"createToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"currentSeason","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"playerAddress","type":"address"},{"internalType":"uint256","name":"_tokenId","type":"uint256"},{"internalType":"uint256","name":"purchasedValue","type":"uint256"},{"internalType":"string","name":"image_add","type":"string"},{"internalType":"string","name":"ipfs_link","type":"string"},{"internalType":"address","name":"sponsor","type":"address"}],"name":"freeCardOrPurchased","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"minted_supply_token","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"minted_tokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"ownToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"player","outputs":[{"internalType":"uint256","name":"cardtype","type":"uint256"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"free","type":"uint256"},{"internalType":"string","name":"image_address","type":"string"},{"internalType":"string","name":"ipfs_contract_link","type":"string"},{"internalType":"address","name":"sponsor","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"playersTokenCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"returnAllDetails","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"returnOwnedToken","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"returnSeason","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"},{"internalType":"uint256","name":"typ","type":"uint256"},{"internalType":"bool","name":"_totalcount","type":"bool"}],"name":"returnTokenCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"bytes","name":"_data","type":"bytes"}],"name":"safeTransferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"contractAddress","type":"address"}],"name":"setGameContractAddress","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"setMarketAddress","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"supply_of_each_token","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_tokenId","type":"uint256"}],"name":"tokenDetails","outputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"index","type":"uint256"}],"name":"tokenOfOwnerByIndex","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"tokenOwners","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token_Id","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"total_supply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"transferFrom","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unminted_tokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]


//Stars interface 
const interface_stars = [{"inputs":[{"internalType":"uint256","name":"_initialSupply","type":"uint256"},{"internalType":"address","name":"_gameContractAddress","type":"address"},{"internalType":"address","name":"market","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_owner","type":"address"},{"indexed":true,"internalType":"address","name":"_spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"},{"indexed":false,"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"uint256","name":"_reduceSupply","type":"uint256"}],"name":"DecreaseSupply","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_newSupply","type":"uint256"}],"name":"IncreaseSupply","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"Seller_Approve_Market","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"request","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"balances","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"changeSeason","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_newaddress","type":"address"}],"name":"changeowner","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"currentSeason","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"gameContractAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"marketAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ownerAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"returnSeason","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"payable","type":"function"}]

const interface_market = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"available_token_count","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"token_id","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"auction_type","type":"uint256"}],"name":"bidOnToken","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"bidderDetails","outputs":[{"internalType":"bool","name":"is_available","type":"bool"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"uint256","name":"max_bid","type":"uint256"},{"internalType":"uint256","name":"reserve_price","type":"uint256"},{"internalType":"address","name":"bid_winner","type":"address"},{"internalType":"bool","name":"bid_close","type":"bool"},{"internalType":"bool","name":"ownershipOnly","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"token_type","type":"uint256"}],"name":"buyCardFromAdmin","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenid_","type":"uint256"},{"internalType":"string","name":"ipfs_contract","type":"string"}],"name":"buy_Card","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"new_commision","type":"uint256"}],"name":"changeFiniteGamesCommision","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"closeBidding","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"uint256","name":"token_reserve_price","type":"uint256"},{"internalType":"uint256","name":"auction_type","type":"uint256"}],"name":"enlist_token_for_auction","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getBidStatus_for_token","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"getBidStatus_for_token_ownership","outputs":[{"internalType":"bool","name":"","type":"bool"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenid","type":"uint256"}],"name":"get_Bid_winner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"},{"internalType":"string","name":"ipfs_contract","type":"string"}],"name":"get_your_bidded_card","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"nft","outputs":[{"internalType":"contract NFT","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner_address","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenid_","type":"uint256"}],"name":"revokeCard","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenid_","type":"uint256"}],"name":"revokeCard_Auction","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenid_","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"selling_type","type":"uint256"}],"name":"sell_Card","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_address","type":"address"}],"name":"setNftAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"show_Available_Token_For_Selling","outputs":[{"internalType":"string[]","name":"available","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"show_Available_Token_For_Selling_OwnerShip_only","outputs":[{"internalType":"string[]","name":"available","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"token_details","outputs":[{"internalType":"bool","name":"is_available","type":"bool"},{"internalType":"address","name":"buyer","type":"address"},{"internalType":"address","name":"seller","type":"address"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"bool","name":"ownershipOnly","type":"bool"}],"stateMutability":"view","type":"function"}]

//////////////////////////////////////////////////////////////////////////////////////////////////////////ACCOUNTS USED////////////

const account1  = '0xF51632261987F4578425Ca91a48117E11516a4CF'
const account2  = '0xF7C17c02428CcC44a35725DfDe473cCA2c4393ff'
const account3  = '0xf158F22ec9ef60A64F83Cf2BD59F6b5554E9caC4'
const account4 = '0x63580a35A6B6Da5c13c1Bf9c62C51FbCe64c806F';
const transferacc = '0xFcb269E2798C48CF4B93aAeCDF8CEc143AcC29b4';




const privateKey1 = new  Buffer.from('bbe63d1fba1794a8c74bfd779c1ae2535a1d5953a6ee6aec609c2351db57fff8' , 'hex');
const privateKey2 = new  Buffer.from('60d4a93d45c1b890b340db0fbc9ce48afedcee22f71433812828e5c8e8f7774c' , 'hex');
const privateKey3 = new  Buffer.from('1d74031771cabab38b07d31937bdcf279c712f0e2f358c1072bc0cf27898e004' , 'hex');
const privateKey4 = new Buffer.from('7958cb545ad3be8ad142a8f632c7c7cc5c8bc18bdd098f69998ee026e4fa525a' , 'hex');
const privatekeymine = new Buffer.from('f8e9cf0d026ae4b1eb8b38c717ba090a37576dbfa9dbd51e0f2542e12c573e57' , 'hex');

//////////////////////////////////////////////////////////transcation function for game////////////////////////////////////////////
async function runCode(data , account , privateKey,  deployedAddress){
        
        var count = await web3.eth.getTransactionCount(account); 

        var Price =  await web3.eth.getGasPrice();
        
       
        var txData = {

                nonce: web3.utils.toHex(count),
                

                gasLimit: web3.utils.toHex(2500000),
                
                gasPrice: web3.utils.toHex(Price * 1.40),
                
                to: deployedAddress,                    
       
                from: account,  
                
                data: data
        
        };
                
        var run_code = new TX(txData, {'chain': 'rinkeby'});
        
       run_code.sign(privateKey); //change here 
        
        const serialisedrun_code =   run_code.serialize().toString('hex');
        
        const result = await  web3.eth.sendSignedTransaction('0x' + serialisedrun_code);
        console.log(result);
      
};




//////////////////////////////////////////////////////////////////////////////interact with game functions //////////////////////////////////////////
async function setNftAddress(_nftAddress , account , privateKey , deployedAddress){    ///function to link nft with game contract ///not to be used, it's already set
        try{
                var data = _interface.methods.set_nft_address(_nftAddress).encodeABI();
                runCode(data , account , privateKey , deployedAddress);
        }
        catch{
                throw{message: "ERROR: cann't set nft contract address"};
        }
        
}
async function setERC20Contractaddress(starContract_address ,  account , privateKey , deployedAddress){ ///function to link stars conttract with game contract //not to be used , already set
        try{
                var data = _interface.methods.set_token_address(starContract_address).encodeABI();
                runCode(data , account , privateKey , deployedAddress);
        }
        catch{
                throw{message: "ERROR: cann't set token contract address"};
        }
         
}
async function setOwner(owner_address , account , privateKey , deployedAddress){ /////function to set the owner of the game contract , not to be used already set
        try{
                var data = _interface.methods.setOwner(owner_address).encodeABI();
                runCode(data , account , privateKey , deployedAddress);
        }
        catch{
                throw{message: "ERROR: cann't set owner address"};
        }
}
async function setStars(_stars ,account , privateKey , deployedAddress ){ //////set initial stars to be  given to player, not to be used already set
        try{
                var data = _interface.methods.setStars(_stars).encodeABI();
                runCode(data , account , privateKey , deployedAddress);
        }
        catch{
                throw{message: "ERROR: cann't set star ammount"};
        }        
}
async function setValue(_value , account , privateKey , deployedAddress){///////set initial card value to be supplied to player , already set not to be used
        try{
                var data = _interface.methods.setValue(_value).encodeABI();
                runCode(data , account , privateKey , deployedAddress);
        }
        catch{
                throw{message: "ERROR: cann't set value of each nft"};
        }
        
}
async function setToken(_amount , account , privateKey , deployedAddress){   ////set token count (supply_ not be used already set)
        try{
                var data = await _interface.methods.setToken(_amount).encodeABI();
                runCode(data , account , privateKey , deployedAddress);
        }
        catch{
                throw{message: "ERROR: cann't set token ammount"};
        }
}
	async function signUP(player , account , privateKey , deployedAddress){ //// takes 4 argumets for signup , account of player  
	try{
			try
			{																//// , account, private key to be used for transaction and game contract addresss
			var data = await _interface.methods.signUp(player).encodeABI(); 
			await runCode(data , account , privateKey , deployedAddress); 
			return 1
			}
			catch(e)
			{
				return 0
			}
			
		}
        catch{
                throw{message: "ERROR: cann't signup"};
        }
	}									
async function totalCards( _of ){ //// argument : address returns : total cards given account address is holding
        try{
                var data = await _interface.methods.TotalCards(_of).call();
                //run_code(data);
                console.log(data);
                return data;
        }
        catch{
                throw{message: "ERROR: cann't show total cards this account is holding"};
        }
}

async function showStars(_of){   //  argument: address returns : total stars given account is holding
        try{
                var data = await _interface.methods.showStars(_of).call(); 
                //run_code(data);
                console.log(data);
                return data;
        }
        catch{
                throw{message: "ERROR: cann't show how many stars this address is holding "};
        }
}
async function remainingRock(_of){/////argument : address   returns: total rock cards of account
        try{
                var data= await _interface.methods.remainingRock(player);
                console.log(data);
                return data;
        }
        catch{
                throw{message: "rock doesn't exist"};

        }   

}
async function remainingPaper(_of){//////argumets : address    returns: totak paper cards of account
        try{
                var data= await _interface.methods.remainingPaper(player);
                console.log(data);
                return data;
        }
        catch{
                throw{message: "rock doesn't exist"};

        }   

}

async function remainingScissor(_of){ //////arguments: address  return: total scissor cards account is holding
        try{
                var data= await _interface.methods.remainingScissor(player);
                console.log(data);
                return data;
        }
        catch{
                throw{message: "rock doesn't exist"};

        }   

}



///////////////////////////////////////////////////////////////////nft functions//////////////////////////////////////////////////////////
     
      async function burn(tokenId , account , privateKey , deployedAddress){  ///burns the card , and card will no longer be accessible 
         try{
                 let cardDelete = await _interact.methods.burn(tokenId).encodeABI();
                runCode(cardDelete , account , privateKey , deployedAddress);
         }
          catch (e){
                throw{ message : "Token not burn"};
          }
	   }
	   
	   async function createNewToken(playerAddress,cardType,value, account , privateKey , deployedAddress){  ///burns the card , and card will no longer be accessible 
		try{
				let cardCreate = await _interact.methods.createToken(playerAddress,cardType,value).encodeABI();
			   runCode(cardCreate , account , privateKey , deployedAddress);
		}
		 catch (e){
			   throw{ message : "Token not Created"};
		 }
		}
       async function details(tokeId){ ////argument : tokenID   returns: card type ie rock . paper or scissor and card value
        try{
                var cardType;
                cardType = await _interact.methods.tokenDetails(tokeId).call();
                //It will return both type and value both respectively
				//console.log(cardType);
				// console.log("this is card type" + cardType)
                return (cardType);
        }
        catch (e) {
                 throw{ message : "Token details not given"};
        }
      }
      
      async function returnOwnedToken(_address){ //// argument : address   returns : array of Ids given account address is holding
        try{
                let tokenList = await _interact.methods.returnOwnedToken(_address).call();
				console.log(tokenList);
				return tokenList;
                
        }
        catch(e){
                throw{message : "Owner not returned"};
        }
      }
      
   
       async function ownerOf(tokeId){////argument : tokenId    returns: account address of the owner of given tokenID
         try{
                let cardOwner = await _interact.methods.ownerOf(tokeId).call();
				//transaction(trx);
				console.log(cardOwner);
                return cardOwner;
         }
         catch (e){
                throw{ message : "Does not return owner"};
         }
      }
      
      async function transfer(_address,tokeId , account , privateKey , deployedAddress){/////trasnfer token from self to other account
        try{
		
                let transfer = await _interact.methods.transfer(_address,tokeId).encodeABI();
                runCode(transfer , account , privateKey , deployedAddress);
        }
        catch(e){
          throw{ message : "Transfer not successfull"};
        }
      }
      
      async function safeTransferFrom(_address, __address, tokenId , account , privateKey , deployedAddress){/////transfer token from other account to someone else account // requires approval
        try{
                let transfer = await _interact.methods.safeTransferFrom(_address, __address, tokenId).encodeABI();
                runCode(transfer , account , privateKey , deployedAddress);
        }
        catch(e){
          throw{message : "Transfer not successfull"};
        }
      }    
///////////////////////////////////////////////////////////stars contract functions/////////////////////////////////

async function Transfer(_to,value, account , privateKey , deployedAddress){ ///transfer stars from self to other
	try{

		console.log("this is address" + _to +"amount" + value + "account"+ account + "address" + deployedAddress)
                var data = await star.methods.transfer(_to,value).encodeABI();
                runCode(data , account , privateKey , deployedAddress);
        }catch(err){
	        throw{ message : "ERROR : Token not transferred using transfer"};
}
}

async function TransferFrom(_from,_to,value , account , privateKey , deployedAddress){////transfer stars from other to someone else account ///approval needed 
        try{
                 var Transferred = await star.methods.transferFrom(account1,"0xFcb269E2798C48CF4B93aAeCDF8CEc143AcC29b4",70).encodeABI();
                runCode(Transferred , account , privateKey , deployedAddress);
        }
        catch(err){
                throw{ message : "ERROR : Token not transferred using transferFrom"};
        }
}

async function getbalance(_address){ //// argument: address returns : total stars account is holding
	try{
                balance = await star.methods.balanceOf(_address).call();
                console.log(balance);
                return balance;
        }catch(err){
                throw{ message : "ERROR : Balance not retrieved"};
        }
}


async function getAllDetails(address){
	const obj = {};
	const x = await returnOwnedToken(address);
	const y = x.toString().split(',');
	for(let i = 0 ; i < y.length ; ++i)
	{
		const z =  await details(y[i]);
		if(z[0] == '1') obj[y[i]] = 'rock';
		else if (z[0] == '2') obj[y[i]] = 'paper';
		else obj[y[i]] = 'scissor';
	}
	return obj;
}


var sign_up = async function(address,gameContractAddress) { return await signUP(address,account1,privateKey1,gameContractAddress); }
var show_stars = async function(address) { return await showStars(address);}
var total_cards = async function (address) { return await totalCards(address); }
var returnownedTokens = async function(playerAddress) { return await returnOwnedToken(playerAddress) }
var detailOfCard = async function(tokenId) { return await details(tokenId)}
var ownerof = async function(tokenId) { return await ownerOf(tokenId)}
var transferstar =async function(_to,value,gameContractAddress) { await Transfer(_to,value,account1,privateKey1,gameContractAddress)}
var transferfrom = async function(_from,_to,value, gameContractadd) {await TransferFrom(_from,_to,value , account2 , privateKey2 , gameContractadd)}
var Burn = async function(tokenId,gameContractAddress) {  await burn(tokenId,account1,privateKey1,gameContractAddress)}
var getalldetails = async function(address) { await getAllDetails(address) }

total_cards("0xd8f0BC6D001F90e52bc84daa0E9D150b7622E108").then((res)=>{
	console.log(res);
})
// transferstar(transferacc,1,account1,privateKey1,"0x0A27A7370D14281152f7393Ed6bE963C2019F5fe").then((data)=>{
// 	console.log(data);
// });

// transferfrom("0x984C21390376b2CB0cE40fA80CCa2cFBd86C14B7",transferacc, 1,"0x0A27A7370D14281152f7393Ed6bE963C2019F5fe").then((data)=>{
// 	console.log(data);
// },
// (err)=>{
// 	console.log("error")
// });
// console.log("rrererr")
// detailOfCard('1460');
// detailOfCard(1620).then((data)=>{
// 	console.log(data)
// });

// transferstar("0x00552dd9014394aE4cb97efDdf688bbfC6B7cd2C",80000,'0x00552dd9014394aE4cb97efDdf688bbfC6B7cd2C').then((data)=>{
// 	console.log(data);
// });
// console.log( show_stars("0x95B01B8c39D2431519361cf0Ec81B89096D8c6F7"));
module.exports = {
        sign_up:sign_up,
        show_stars:show_stars,
        total_cards:total_cards,
		returnownedTokens:returnownedTokens,
		detailOfCard:detailOfCard,
		ownerof:ownerof,
		Transfer:Transfer,
		burn:burn,
		getalldetails:getalldetails,
		transferstar:transferstar
}

//  for(var i=1;i<5;i++)
//  {
//var d = createNewToken("0xFcb269E2798C48CF4B93aAeCDF8CEc143AcC29b4",3,40,account1,privateKey1,nftContractAddress);
//   }
//returnOwnedToken("0xFcb269E2798C48CF4B93aAeCDF8CEc143AcC29b4");

//signUP("0xF51632261987F4578425Ca91a48117E11516a4CF",account1,privateKey1,gameContractAddress);