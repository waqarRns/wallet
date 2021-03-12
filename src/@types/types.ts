import * as boasdk from 'boa-sdk-ts';

export interface IFreezeSender {
    data: {
        senderList: Array<{ senderAddress: string, amount: number }>
    }
}

export interface ITxHashes {
    hash: string
}

export interface IUtxos {
    utxo: string,
    amount: boasdk.JSBI
}

export interface IFrozenObject {
    utxo: string,
    blockHeight: number,
    time: Date,
    amount: boasdk.JSBI,
}

export interface ISenderObject {
    utxo: string,
    senderAddress: string,
    amount: boasdk.JSBI,
}

export interface ISender {
    drawn: boasdk.JSBI,
    secret: boasdk.KeyPair,
}

export interface IBuildTx {
    error: boolean,
    data: { builder: boasdk.TxBuilder },
    message: string,
}

export interface IErr {
    error: boolean,
    message: string,
}
