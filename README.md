# boa-wallet-lib
Wallet Lib to interface with the BOSAGORA blockchain
boa-wallet-lib is a TypeScript/JavaScript library for communicating with the Stoa API server and Agora.
It compose of all the functions needed for Bosagora wallet.

## Install
```bash
$ npm install --save boa-wallet-lib
```

## Import the your library
```import * as BoaWallet from "boa-wallet-lib";```

## Usage

TypeScript
```TypeScript
// Create BOA Client
let boa_client = new BoaWallet.BOAClient("https://localhost:4242", "https://localhost:4000");

let account = new BoaWallet.Account(boa_client);

let mnemonics = await BoaWallet.KeyPair.getMnemonics('english');
console.log(mnemonics);

let keyPairs = await BoaWallet.KeyPair.fromMnemonic(mnemonics.data.mnemonic);
console.log(keyPairs);

let keyPair = await BoaWallet.KeyPair.recoverKeys(mnemonics.data.mnemonic);    
console.log(keyPairs);

let token = await BoaWallet.Login.loginUser('SCT4KKJNYLTQO4TVDPVJQZEONTVVW66YLRWAINWI3FZDY7U4JS4JJEI4');
console.log(token);
.
.
.
.

```

## Documentation
[BOA-WALLET for TypeScript documentation](https://docs.google.com/document/d/1pNAh3dmYv3knkrACfOzYQ7dDs6w1DohkSlemCF0kmek/edit?skip_itp2_check=true&pli=1)

## Testing
```bash
$ git clone https://github.com/wallet-lib.git
$ npm install
$ npm run build
$ npm test
```