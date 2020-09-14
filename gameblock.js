var TX = require('ethereumjs-tx');
const Web3 = require('web3')
//const web3 = new Web3('')
const web3 = new Web3(new Web3.providers.HttpProvider("https://rinkeby.infura.io/v3/e72daeeafa5f4e8cae0110b45fed3645"));


//Game interface
const interface = [{"constant":false,"inputs":[{"name":"spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"stars","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newOwner","type":"address"}],"name":"setOwner","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"nft_add","type":"address"}],"name":"set_nft_address","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"player1","type":"address"},{"name":"player2","type":"address"},{"name":"token1","type":"uint256"},{"name":"token2","type":"uint256"}],"name":"play_game","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"value","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"token_add","type":"address"}],"name":"set_token_address","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"nft","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"setValue","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_of","type":"address"}],"name":"TotalCards","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_of","type":"address"}],"name":"remainingScissor","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_of","type":"address"}],"name":"remainingPaper","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"card1","type":"uint256"},{"name":"card2","type":"uint256"}],"name":"decide","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":false,"inputs":[{"name":"_stars","type":"uint256"}],"name":"setStars","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_amount","type":"uint256"}],"name":"setToken","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"_of","type":"address"}],"name":"showStars","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_of","type":"address"},{"name":"cards","type":"uint256"}],"name":"block_card","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"signup","outputs":[{"name":"","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"starCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"NoOfTokens","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_of","type":"address"}],"name":"remainingRock","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]
var _interface = new web3.eth.Contract((interface) , '0x4021A83f962071f116dC700Aa388b89869F80517'); //deployed address 


//NFT interface
const interface_nft = [{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"getApproved","outputs":[{"name":"","type":"address"}],"payable":false,
"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_tokenId","type":"uint256"}],
"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,
"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"player","outputs":[{"name":"cardtype","type":"uint256"},
{"name":"value","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenId",
"outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"",
"type":"uint256"}],"name":"approval","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],"name":"playersTokenCount","outputs":[{"name":"","type":"uint256"}],
"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},
{"name":"_tokenId","type":"uint256"}],"name":"safeTransferFrom","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},
{"constant":true,"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"name":"","type":"address"}],"payable":false,
"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"uint256"}],
"name":"ownToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,
"inputs":[{"name":"owner","type":"address"},{"name":"_tokenId","type":"uint256"}],"name":"burn","outputs":[],"payable":false,
"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_address","type":"address"},{"name":"typ","type":"uint256"},
{"name":"_totalcount","type":"bool"}],"name":"returnTokenCount","outputs":[{"name":"","type":"uint256"}],"payable":false,
"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"owner","type":"address"}],"name":"returnOwnedToken",
"outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"playeraddress",
"type":"address"},{"name":"cardtype","type":"uint256"},{"name":"_value","type":"uint256"}],"name":"createToken","outputs":[],
"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"tokenOwners",
"outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,
"inputs":[{"name":"_tokenId","type":"uint256"}],"name":"tokenDetails","outputs":[{"name":"","type":"uint256"},{"name":"","type":"uint256"}],
"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"contractAddress","type":"address"}],
"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},
{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_approved","type":"address"},
{"indexed":true,"name":"_tokenId","type":"uint256"}],"name":"Approval","type":"event"}];
var _interact = new web3.eth.Contract((interface_nft) , '0xfa35faEB6C9dA21e858055b371Fa5Bca5B778EB8');


//Stars interface 
const interface_stars = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balances","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newaddress","type":"address"}],"name":"changeowner","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"request","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"ownerAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_reduceSupply","type":"uint256"}],"name":"DecreaseSupply","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"balanceOwnerAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_newSupply","type":"uint256"}],"name":"IncreaseSupply","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"},{"name":"gameContractAddress","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]
var star = new web3.eth.Contract(interface_stars, '0xe71B521027F32e861CA223d911d808AA3757DccE');


//////////////////////////////////////////////////////////////////////////////////////////////////////////

const account3  = '0x5fD574fdb828022b2a6e68C11DE371266dCBFAe1'




const privateKey3 = new  Buffer.from('9902fb0fca74a363ed5bd110e677b18ba9732404cf070ea25f82ec87232ba167' , 'hex');



//transcation function for game
async function run_code(data){
        
        var count = await web3.eth.getTransactionCount(account3); //change here 

        var Price =  await web3.eth.getGasPrice();
        
        var txData = {

        nonce: web3.utils.toHex(count),
        
        gasLimit: web3.utils.toHex(2500000),
        
        gasPrice: web3.utils.toHex(Price * 1.40),
        
        to: '0x4021A83f962071f116dC700Aa388b89869F80517',                   //---> for game 
//       to: '0xfa35faEB6C9dA21e858055b371Fa5Bca5B778EB8',                 //----->for nft     
//        to: '0xe71B521027F32e861CA223d911d808AA3757DccE',                 //----->fir stars    
        from: account3, //change here 
        
        data: data
        
        };
                
        var run_code = new TX(txData, {'chain': 'rinkeby'});
        
        run_code.sign(privateKey3); //change here 
        
        var serialisedrun_code = run_code.serialize().toString('hex');
        
        const result = await  web3.eth.sendSignedTransaction('0x' + serialisedrun_code);
        console.log(result);
      
};




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


/////////////////////////////
//nft functions 
async function tokenCreate(){ 
        try{
        var creation = await _interact.methods.createToken ('0x114dF342f9649f66E3e670bA29418b4693Fe3dA3' ,2 ,20 ).encodeABI();
       run_code(creation);
        }
        catch (e){
          throw{ message : "Token not created"};
        }
     }
     
    async function remove(){
       try{
        var cardDelete = await _interact.methods.burn('0x114dF342f9649f66E3e670bA29418b4693Fe3dA3',19).encodeABI();
        run_code(cardDelete);
       }
        catch (e){
          throw{ message : "Token not burn"};
        }
     }
     
    async function tokenCount(){
       try{
        var count = await _interact.methods.returnTokenCount('0xf158F22ec9ef60A64F83Cf2BD59F6b5554E9caC4', 1,true).call();
        //run_code(trx);
        return count;
       }
       catch(e){
         throw{ message : "Token count not return"};
       }
     }
     
    async function details(){
       try{
        var cardType;
        cardType = await _interact.methods.tokenDetails(31).call();
        //It will return both type and value both respectively
        //run_code(trx);
        console.log(cardType);
        return (cardType,cardValue);
       }
       catch(e){
         throw{ message : "Token details not given"};
       }
     }
     
     async function owner(){
       try{
        var cardOwner = await _interact.methods.ownerOf(1).call();
        //run_code(trx);
        return cardOwner;
       }
       catch (e){
         throw{ message : "Does not return owner"};
       }
    }
async function returnIDs(_address){
        try{
                var cardOwner = await _interact.methods.returnOwnedToken(_address).call();
                //run_code(trx);
                console.log(cardOwner);
                return cardOwner;
        }
        catch (e){
                throw{ message : "Does not return owner"};
        }
}



//star functions

    async function ChangeOwner(newOwner){
	try{
	 var ownerChange= await star.methods.changeowner(newOwner).encodeABI();
	run_code(ownerChange); 
}catch(err){
	throw{message : "ERROR : Owner not changed"};
}
}
async function Transfer(_to,value){
	try{
data1 = await star.methods.transfer(_to,value).encodeABI();
	run_code(data1);
}catch(err){
	throw{ message : "ERROR : Token not transferred using transfer"};
}
}
async function Approve(_spender,value){
	try{
var approved = await star.methods.approve(_spender,100).encodeABI();
	run_code(approved);
}catch(err){
	throw{ message : "ERROR : Not approved"};
}
}
async function TransferFrom(_from,_to,value){
try{
var Transferred = await star.methods.transferFrom(_from,_to,value).encodeABI();
	run_code(Transferred);
	}
catch(err){
	throw{ message : "ERROR : Token not transferred using transferFrom"};
}
}
async function increaseSupply(value){
	try{
	var increasedSupply= await star.methods.IncreaseSupply(value).encodeABI();
	run_code(increasedSupply);
}catch(err){
	throw{ message : "ERROR : Supply not increased"};
}
}
async function decreaseSupply(value){
	try{
	var _supply= await star.methods.DecreaseSupply(value).encodeABI();
	run_code(_supply);
}catch(err){
	throw{ message : "ERROR : Supply not decreased"};
}
}
async function getbalance(_address){
	try{
	balance = await star.methods.balanceOf(_address).call();
	console.log(balance);
	return balance;
}catch(err){
	throw{ message : "ERROR : Balance not retrieved"};
}
}




// returnIDs(account2);
 //totalcards(account1);
//signUP();
//showstars(account1);
// setowner('0x4021A83f962071f116dC700Aa388b89869F80517'); //game
//  nft('0xfa35faEB6C9dA21e858055b371Fa5Bca5B778EB8'); //tokens
// set_ERC20_Contract_address('0xe71B521027F32e861CA223d911d808AA3757DccE');//stars


var gameblock=function(account1){
  setowner(account1)
}

var givetoken = function(account1)
{
        showstars(account1);
}
module.exports = gameblock,givetoken