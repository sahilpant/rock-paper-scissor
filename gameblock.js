
var TX = require('ethereumjs-tx');
const Web3 = require('web3')
//const web3 = new Web3('')
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/e72daeeafa5f4e8cae0110b45fed3645"));

const account1  = '0x2fb88BdA5Ad7909d62a5D3ce052414395572E37D'
const account2  = '0xF7C17c02428CcC44a35725DfDe473cCA2c4393ff'
const account3  = '0xf158F22ec9ef60A64F83Cf2BD59F6b5554E9caC4'
const account4 = '0x63580a35A6B6Da5c13c1Bf9c62C51FbCe64c806F';



const privateKey1 = new  Buffer.from('8da5c18312a064f8bb3d0aa05d12d80f4d115b2a84c15bc05f1d00c94be33a14' , 'hex');
const privateKey2 = new  Buffer.from('60d4a93d45c1b890b340db0fbc9ce48afedcee22f71433812828e5c8e8f7774c' , 'hex');
const privateKey3 = new  Buffer.from('1d74031771cabab38b07d31937bdcf279c712f0e2f358c1072bc0cf27898e004' , 'hex');
const privateKey4 = new Buffer.from('7958cb545ad3be8ad142a8f632c7c7cc5c8bc18bdd098f69998ee026e4fa525a' , 'hex');

//Game interface

const interface = [{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"stars","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"setOwner","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"nft_add","type":"address"}],"name":"set_nft_address","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"player1","type":"address"},{"name":"player2","type":"address"},{"name":"token1","type":"uint256"},{"name":"token2","type":"uint256"}],"name":"play_game","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"value","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token_add","type":"address"}],"name":"set_token_address","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"nft","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"setValue","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_of","type":"address"}],"name":"TotalCards","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_of","type":"address"}],"name":"remainingScissor","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_of","type":"address"}],"name":"remainingPaper","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"card1","type":"uint256"},{"name":"card2","type":"uint256"}],"name":"decide","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"_stars","type":"uint256"}],"name":"setStars","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"}],"name":"setToken","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_of","type":"address"}],"name":"showStars","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_of","type":"address"},{"name":"cards","type":"uint256"}],"name":"block_card","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"signup","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"starCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"NoOfTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_of","type":"address"}],"name":"remainingRock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]
var _interface = new web3.eth.Contract((interface) , '0x5aDbF49A30A8d64bBed86a91a685e4DFe17D90Fc'); //deployed address 


//NFT interface
const interface_nft = [{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"name":"","type":"address"}],
"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],
"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,
"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"player","outputs":[{"name":"cardtype","type":"uint256"},
{"name":"value","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenId",
"outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,
"inputs":[{"name":"","type":"uint256"}],"name":"approval","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"playersTokenCount","outputs":[{"name":"","type":"uint256"}],
"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},
{"name":"_tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},
{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],
"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"owner","type":"address"},
{"name":"_tokenId","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
{"constant":true,"inputs":[{"name":"_address","type":"address"},{"name":"typ","type":"uint256"},{"name":"_totalcount","type":"bool"}],
"name":"returnTokenCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
{"constant":false,"inputs":[{"name":"playeraddress","type":"address"},{"name":"cardtype","type":"uint256"},{"name":"_value","type":"uint256"}],
"name":"createToken","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],
"name":"tokenOwners","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"tokenDetails","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],
"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"contractAddress","type":"address"}],"payable":false,
"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},
{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_approved","type":"address"},
{"indexed":true,"name":"_tokenId","type":"uint256"}],"name":"Approval","type":"event"}];

var _interact = new web3.eth.Contract((interface_nft) , '0xDbe03C5DcDB823664936F406cf87Eedc625B8cF8');

//Stars interface 
const interface_stars = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newaddress","type":"address"}],"name":"changeowner","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"request","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ownerAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_reduceSupply","type":"uint256"}],"name":"DecreaseSupply","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"balanceOwnerAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newSupply","type":"uint256"}],"name":"IncreaseSupply","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"},{"name":"gameContractAddress","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]
var star = new web3.eth.Contract(interface_stars, '0x8E6BBb04A13a53beb903000F6C034e0C278Bab03');


//transcation function for game
async function run_code(data){
        
        var count = await web3.eth.getTransactionCount(account1); //change here 

        var Price =  await web3.eth.getGasPrice();
        
       
        var txData = {

        nonce: web3.utils.toHex(count),
        

        gasLimit: web3.utils.toHex(2500000),
        
        gasPrice: web3.utils.toHex(Price * 1.40),
        
        to: '0x5aDbF49A30A8d64bBed86a91a685e4DFe17D90Fc',//deployed address 
        
        from: account1, //change here 
        
        data: data
        
        };
                
        var transaction = new TX(txData, {'chain': 'rinkeby'});
        
        transaction.sign(privateKey1); //change here 
        
        var serialisedTransaction = transaction.serialize().toString('hex');
        
        const result = await  web3.eth.sendSignedTransaction('0x' + serialisedTransaction);
        console.log(result);
      
};

//transaction function for NFT Contract

const transaction = async(trx) =>{
        var count = await web3.eth.getTransactionCount("0xDbe03C5DcDB823664936F406cf87Eedc625B8cF8");
    
        
        const gasprice = await web3.eth.getGasPrice();
        console.log(gasprice);
        var howtotransfer = {
          from : '0x63580a35A6B6Da5c13c1Bf9c62C51FbCe64c806F',
          nonce : web3.utils.toHex(count),
          gasLimit : web3.utils.toHex(2500000),
          gasPrice : web3.utils.toHex(gasprice*1.30),
          to : '0xDbe03C5DcDB823664936F406cf87Eedc625B8cF8',
          data : trx
        }
        var privatekey =  new Buffer.from('7958cb545ad3be8ad142a8f632c7c7cc5c8bc18bdd098f69998ee026e4fa525a', 'hex');
        var tx = new TX(howtotransfer, {'chain': 'rinkeby' });
        tx.sign(privatekey);
        var serializedtransaction = tx.serialize().toString('hex');
        try{
          const results = await web3.eth.sendSignedTransaction('0x' + serializedtransaction);
          console.log(results);
        }
        catch(e){
          console.log(e);
        }
      } ;

//transaction function 

const Transaction = async(_data)=>{
        var gasPric= await web3.eth.getGasPrice();
        web3.eth.getTransactionCount("0x8E6BBb04A13a53beb903000F6C034e0C278Bab03").then(count => {
        var txData = {
        nonce: web3.utils.toHex(count),
        chainId:4,
        gasLimit: web3.utils.toHex(2500000),
        gasPrice: web3.utils.toHex(gasPric*1.5),
        to: '0x8E6BBb04A13a53beb903000F6C034e0C278Bab03',
        from: "0x114dF342f9649f66E3e670bA29418b4693Fe3dA3",
        data: _data
        }
        var transaction = new TX(txData, {chain: 'rinkeby' }); 
        transaction.sign(privateKey);
        
        var serialisedTransaction = transaction.serialize().toString('hex');
        web3.eth.sendSignedTransaction('0x' + serialisedTransaction);
        });
        }




//interact with game functions 
async function nft(_nftAddress){
        try{
                var data = _interface.methods.set_nft_address(_nftAddress).encodeABI();
                run_code(data);
        }
        catch{
                throw{message: "ERROR: cann't set nft contract address"};
        }
        
}
async function set_ERC20_Contract_address(starContract_address){
        try{
                var data = _interface.methods.set_token_address(starContract_address).encodeABI();
                run_code(data);
        }
        catch{
                throw{message: "ERROR: cann't set token contract address"};
        }
         
}
async function setowner(owner_address){
        try{
                var data = _interface.methods.setOwner(owner_address).encodeABI();
                run_code(data);
        }
        catch{
                throw{message: "ERROR: cann't set owner address"};
        }
}
async function setstars(_stars){
        try{
                var data = _interface.methods.setStars(_stars).encodeABI();
                run_code(data);
        }
        catch{
                throw{message: "ERROR: cann't set star ammount"};
        }
         
}
async function setvalue(_value){
        try{
                var data = _interface.methods.setValue(_value).encodeABI();
                run_code(data);
        }
        catch{
                throw{message: "ERROR: cann't set value of each nft"};
        }
        
}
async function settoken(_amount){
        try{
                var data = await _interface.methods.setToken(_amount).encodeABI();
                run_code(data);
        }
        catch{
                throw{message: "ERROR: cann't set token ammount"};
        }
}
async function signUP(){
        try{
                var data = await _interface.methods.signup().encodeABI(); 
                run_code(data); 
        }
        catch{
                throw{message: "ERROR: cann't signup"};
        }
}
async function showstars(_of){   //
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
async function totalcards( _of){
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
async function playGame( player1 ,player2 , token1 , token2 ){
        try{
                var data = await _interface.methods.play_game( player1, player2, token1 , token2).encodeABI();
                return run_code(data);
        }
        catch{
                throw{message: "ERROR: unable to process game"};
        }

}
async function CardDetails(player , tokenId){
        try{
                var data= await _interface.methods.cardDetails(player , tokenId);
                console.log(data);
                return data;
        }
        catch{
                throw{message: "token doesn't exist"};

        }
}
async function remainingRock(_of){
        try{
                var data= await _interface.methods.remainingRock(player);
                console.log(data);
                return data;
        }
        catch{
                throw{message: "rock doesn't exist"};

        }   

}
async function remainingPaper(_of){
        try{
                var data= await _interface.methods.remainingPaper(player);
                console.log(data);
                return data;
        }
        catch{
                throw{message: "rock doesn't exist"};

        }   

}

async function remainingscissor(_of){
        try{
                var data= await _interface.methods.remainingScissor(player);
                console.log(data);
                return data;
        }
        catch{
                throw{message: "rock doesn't exist"};

        }   

}


//  module.exports=gameblock
//  totalcards(account1);
// setowner('0x5aDbF49A30A8d64bBed86a91a685e4DFe17D90Fc');
// set_ERC20_Contract_address('0x8E6BBb04A13a53beb903000F6C034e0C278Bab03');
// nft('0xDbe03C5DcDB823664936F406cf87Eedc625B8cF8');
// setstars(10);
// setvalue(40);
// settoken(3);
// signUP();

var gameblock=function(account1){
showstars(account1);
}

var givetoken = function(account1)
{
        showstars(account1);
}
module.exports = gameblock,givetoken