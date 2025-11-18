import { MockNetworkProvider, randomUtxo, TransactionBuilder, Contract, SignatureTemplate, randomToken, randomNFT, utils } from 'cashscript'
import { stringify, hexToBin, binToHex } from '@bitauth/libauth'
import { aliceAddress, alicePkh, alicePriv, aliceTokenAddress, bobAddress, bobPkh, bobPriv, bobTokenAddress } from './keys.js'
import BattleCashArenaArtifact from './BattleCashArena.json' with {type: 'json'}
import BattleCashManagerArtifact from './BattleCashManager.json' with {type: 'json'}

function calculateWinner(utxo1, utxo2, championId1, championId2, address1, address2, nonce1, nonce2){

    const finalHashBytes = Array.from(utils.sha256(new Uint8Array([...nonce1, ...hexToBin(utxo1.txid).reverse(), ...hexToBin(utxo2.txid).reverse(), ...nonce2])));

    console.log('nonce1:', nonce1);
    console.log('nonce2:', nonce2);

    let input2Strength = 10 * (((finalHashBytes[31] & 0x7f) % 10) + 1)
    let input2Life = 10 * (((finalHashBytes[30] & 0x7f) % 10) + 1)
    let input3Strength = 10 * (((finalHashBytes[29] & 0x7f) % 10) + 1)
    let input3Life = 10 * (((finalHashBytes[28] & 0x7f) % 10) + 1)

    if(utxo1.token.category === championId1 || utxo1.token.category === championId2) {
        input2Strength *= 2;
        input2Life *= 2;
        if (utxo1.token.category === championId1) input2Strength *= 3;
        if (utxo1.token.category === championId2) input2Life *= 3;
    }
    if(utxo2.token.category === championId1 || utxo2.token.category === championId2) {
        input3Strength *= 2;
        input3Life *= 2;
        if (utxo2.token.category === championId1) input3Strength *= 3;
        if (utxo2.token.category === championId2) input3Life *= 3;
    }

    console.log(binToHex(finalHashBytes))

    return input2Life > input3Strength ? address1 : address2;
}

const BattleCashArenaBytecode = '5479009c63c3539d00ce00879100ce827701209c9a00cf0087919a6951ce827701219c51ce01207f75bc537a879a51ce01207f7751879a51cf020000879a6952ce008752c602e803a29a6900cd51c78800d200cf8800cc00c69d51d2005180567a51807e567a7e8851cd51c78851cc51c69d006576d378d09d76d178ce8876cc78c69d768b777652a26652c602e803a063c4539d52cc52c602e803949d52cd52c78852d252cf8867c4529d686d6d755167547a519dc3559d00ce827701219c00ce01207f75bc5379879a00ce01207f7751879a00cf527f75517f77010087919a6951cebc7b8751ce827701209c9a51cf00879a6952ce00879152ce827701209c9a52cf0087919a6953ce00879153ce827701209c9a53cf0087919a6954ce008754c602e803a29a69006576d2788bcf8876d3788bd09d76d1788bce8876d1788bce5279cc53798bc69d52798b537a757c6b7c6c6d7653a2665479518052c87e53c87e00cf527f75517f777ea800cf527f7752c8577a518052c87e53c87e00cf527f75517f777e5a5479011f7f77017f84815a978b955a5579011f7f75011e7f77017f84815a978b955a5679011e7f75011d7f77017f84815a978b955a577a011d7f75011c7f77017f84815a978b9552cebc5a798752cebc5c79879b6353795295547a757c6b7c6b7c6c6c52795295537a757c6b7c6c52cebc5a79876353795395547a757c6b7c6b7c6c6c6852cebc5b79876352795395537a757c6b7c6c686853cebc5a798753cebc5c79879b637852957b757c7652957753cebc5a7987637853957b757c6853cebc5b7987637653957768687b7ba06300cd0376a91458797e0288ac7e886700cd0376a91400cf527f777e0288ac7e886851cd0376a914587a7e0288ac7e8852cd0376a91400cf527f777e0288ac7e8854c602e8039c63c4539d6753cc54c602e803949d686d6d6d6d5168'
const BattleCashArenaBytecodeBin = hexToBin(BattleCashArenaBytecode) 

const provider = new MockNetworkProvider()

let aliceUtxo = randomUtxo({satoshis: 1000n, token: randomNFT()})
const aliceFee = randomUtxo()
let bobUtxo = randomUtxo({satoshis: 1000n, token: randomNFT()})
//bobUtxo.token.nft.commitment = '';
//bobUtxo.token.nft.capability = 'mutable'
//const bobUtxo = randomUtxo({satoshis: 1000n, token: randomToken()})
let bobFee = randomUtxo()
let contractUtxoPrize = randomUtxo({satoshis: 1000n, token: randomToken()})
const mintingContractUtxoState = randomUtxo({satoshis: 1000n, token: randomNFT()})
mintingContractUtxoState.token.category = contractUtxoPrize.token.category
mintingContractUtxoState.token.nft.capability = 'minting'
mintingContractUtxoState.token.nft.commitment = '0000'
//const contractUtxo = randomUtxo()

const aliceSignatureTemplate = new SignatureTemplate(alicePriv)
const bobSignatureTemplate = new SignatureTemplate(bobPriv)

const BattleCashArenaContract = new Contract(BattleCashArenaArtifact, [bobPkh, contractUtxoPrize.token.category, aliceUtxo.token.category, bobUtxo.token.category], {provider})
const BattleCashManagerContract = new Contract(BattleCashManagerArtifact, [BattleCashArenaBytecodeBin], {provider})

provider.addUtxo(aliceAddress, aliceUtxo)
provider.addUtxo(aliceAddress, aliceFee)
provider.addUtxo(bobAddress, bobUtxo)
provider.addUtxo(bobAddress, bobFee)
provider.addUtxo(BattleCashManagerContract.tokenAddress, contractUtxoPrize)
provider.addUtxo(BattleCashManagerContract.tokenAddress, mintingContractUtxoState)

console.log('prize ',stringify(contractUtxoPrize))
console.log('minting ', stringify(mintingContractUtxoState))
console.log('contract ',await BattleCashArenaContract.getUtxos())

const tx = await new TransactionBuilder({provider})
    .addInput(bobUtxo, bobSignatureTemplate.unlockP2PKH())
    .addInput(contractUtxoPrize, BattleCashManagerContract.unlock.createBattle(bobPkh, contractUtxoPrize.token.category, aliceUtxo.token.category, bobUtxo.token.category))
    .addInput(mintingContractUtxoState, BattleCashManagerContract.unlock.createBattle(bobPkh, contractUtxoPrize.token.category, aliceUtxo.token.category, bobUtxo.token.category))
    .addInput(bobFee, bobSignatureTemplate.unlockP2PKH())
    .addOutput({to: BattleCashArenaContract.tokenAddress, amount: bobUtxo.satoshis, token: {category: bobUtxo.token.category, amount: bobUtxo.token.amount, nft: {commitment: bobUtxo.token.nft.commitment, capability: bobUtxo.token.nft.capability}}})
    //.addOutput({to: BattleCashArenaContract.tokenAddress, amount: bobUtxo.satoshis, token: {category: bobUtxo.token.category, amount: bobUtxo.token.amount}})
    .addOutput({to: BattleCashManagerContract.tokenAddress, amount: contractUtxoPrize.satoshis, token: {category: contractUtxoPrize.token.category, amount: contractUtxoPrize.token.amount - 5n}})
    .addOutput({to: BattleCashManagerContract.tokenAddress, amount: mintingContractUtxoState.satoshis, token: {category: mintingContractUtxoState.token.category, amount: mintingContractUtxoState.token.amount, nft: {commitment: mintingContractUtxoState.token.nft.commitment, capability: mintingContractUtxoState.token.nft.capability}}})
    .addOutput({to: BattleCashArenaContract.tokenAddress, amount: contractUtxoPrize.satoshis, token: {category: contractUtxoPrize.token.category, amount: 5n}})
    .addOutput({to: BattleCashArenaContract.tokenAddress, amount: mintingContractUtxoState.satoshis, token: {category: mintingContractUtxoState.token.category, amount: mintingContractUtxoState.token.amount, nft: {commitment: mintingContractUtxoState.token.nft.commitment, capability: 'mutable'}}})
    .addOutput({to: bobAddress, amount: bobFee.satoshis - 2000n})
    //.addOutput({to: BattleCashManagerContract.address, amount: contractUtxoPrize.satoshis})
    .send()

console.log(tx)

let utxos = await provider.getUtxos(BattleCashArenaContract.address)

console.log("Todos ",utxos)

console.log("Antes ",contractUtxoPrize)

contractUtxoPrize = utxos.filter((utxo) => utxo.token.category === contractUtxoPrize.token.category && !utxo.token.nft)

let ContractUtxoState = utxos.filter((utxo) => utxo.token.category === contractUtxoPrize[0].token.category && utxo.token.nft)

console.log('state ', ContractUtxoState)

console.log("Despues ", contractUtxoPrize)

bobUtxo = utxos.filter((utxo) => utxo.token.category === bobUtxo.token.category)

console.log("Bob ", bobUtxo)

console.log('commit ',Buffer.from([0, 1, ...alicePkh]).toString('hex'))
const tx2 = await new TransactionBuilder({provider})
    .addInput(aliceUtxo, aliceSignatureTemplate.unlockP2PKH())
    .addInput(ContractUtxoState[0], BattleCashArenaContract.unlock.Challenge(BigInt(1), alicePkh))
    .addInput(aliceFee, aliceSignatureTemplate.unlockP2PKH())
    .addOutput({to: BattleCashArenaContract.tokenAddress, amount: aliceUtxo.satoshis, token: {category: aliceUtxo.token.category, amount: aliceUtxo.token.amount, nft: {commitment: aliceUtxo.token.nft.commitment, capability: aliceUtxo.token.nft.capability}}})
    .addOutput({to: BattleCashArenaContract.tokenAddress, amount: ContractUtxoState[0].satoshis, token: {category: ContractUtxoState[0].token.category, amount: ContractUtxoState[0].token.amount, nft: {commitment: Buffer.from([0, 1, ...alicePkh]).toString('hex'), capability: ContractUtxoState[0].token.nft.capability}}})
    .addOutput({to: aliceAddress, amount: aliceFee.satoshis - 1000n})
    .send()

utxos = await provider.getUtxos(BattleCashArenaContract.address)

console.log('All ', utxos)

ContractUtxoState = utxos.filter((utxo) => utxo.token.category === contractUtxoPrize[0].token.category && utxo.token.nft)

console.log('state  ', ContractUtxoState)

contractUtxoPrize = utxos.filter((utxo) => utxo.token.category === ContractUtxoState[0].token.category && !utxo.token.nft)

bobUtxo = utxos.filter((utxo) => utxo.token.category === bobUtxo[0].token.category)

aliceUtxo = utxos.filter((utxo) => utxo.token.category === aliceUtxo.token.category)

bobFee = await provider.getUtxos(bobAddress)

const nonce1 = 2;
const nonce2 = 1;

const hashInput = new Uint8Array([
    nonce1,
    ...hexToBin(bobUtxo[0].txid).reverse(),
    ...hexToBin(aliceUtxo[0].txid).reverse(),
    nonce2
]);

console.log(binToHex(hashInput))

console.log('Hash result:', binToHex(utils.sha256(hashInput)));
console.log(bobUtxo)
console.log(Buffer.from([nonce1, bobUtxo[0].txid.split("").reverse().join(""), bobUtxo[0].txid.split("").reverse().join(""), nonce2]).toString('hex'))

const tx3 = await new TransactionBuilder({provider})
    //.addInput(bobUtxo, bobSignatureTemplate.unlockP2PKH())
    .addInput(ContractUtxoState[0], BattleCashArenaContract.unlock.Battle(BigInt(2)))
    .addInput(contractUtxoPrize[0], BattleCashArenaContract.unlock.Battle(BigInt(2)))
    .addInput(bobUtxo[0], BattleCashArenaContract.unlock.Battle(BigInt(2)))
    .addInput(aliceUtxo[0], BattleCashArenaContract.unlock.Battle(BigInt(2)))
    .addInput(bobFee[0], bobSignatureTemplate.unlockP2PKH())
    .addOutput({to: calculateWinner(bobUtxo[0], aliceUtxo[0], bobUtxo[0].token.category, aliceUtxo[0].token.category, bobTokenAddress, aliceTokenAddress, new Uint8Array([2]), new Uint8Array([1])), amount: contractUtxoPrize[0].satoshis, token: {category: contractUtxoPrize[0].token.category, amount: contractUtxoPrize[0].token.amount}})
    .addOutput({to: bobTokenAddress, amount: bobUtxo[0].satoshis, token: {category: bobUtxo[0].token.category, amount: bobUtxo[0].token.amount, nft: {commitment: bobUtxo[0].token.nft.commitment, capability: bobUtxo[0].token.nft.capability}}})
    .addOutput({to: aliceTokenAddress, amount: aliceUtxo[0].satoshis, token: {category: aliceUtxo[0].token.category, amount: aliceUtxo[0].token.amount, nft: {commitment: aliceUtxo[0].token.nft.commitment, capability: aliceUtxo[0].token.nft.capability}}})
    .addOutput({to: aliceAddress, amount: bobFee[0].satoshis - 1000n})
    .send()

console.log(tx3)
