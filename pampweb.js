const bip39 = require('bip39js');
const ethers = require('ethers');

function getEntropy() {
    return bip39.genEntropy(128);
}

function createAccount() {

    // GENERATE MNEMONIC
    const mnemonic = bip39.genMnemonic(getEntropy());

    // GET PRIVATE KEY
    let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
    const privateKey = mnemonicWallet.privateKey;

    // GET ADDRESS
    const address = mnemonicWallet.address

    return { address, privateKey, mnemonic };
}

function getAccountFromMnemonic(mnemonic) {

    try {
        if (!bip39.validMnemonic(mnemonic)) {
            error = 'Invalid Mnemonic.'
            return error;
        }
    }
    catch (err) {
        error = 'Invalid Mnemonic.'
        return error;
    }

    //Path for extra accounts
    //path = "m/44'/60'/0'/0/0"

    // Get Private Key
    let wallet = ethers.Wallet.fromMnemonic(mnemonic);
    const privateKey = wallet.privateKey;

    // Get Address
    const address = wallet.address

    return { address, privateKey, mnemonic };

}


//console.log(createAccount());
//console.log(getAccountFromMnemonic('arch hobby carbon cactus heavy stone link stem heart elevator chaos original'));// Sample Mnemonic

var CreateAccount = () => createAccount();

module.exports = {
    CreateAccount : CreateAccount
}