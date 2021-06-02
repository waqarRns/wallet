/*******************************************************************************
    Contain definition for the class BoaClient

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/
import { Request } from './Request';
import { AxiosResponse } from 'axios';
import uri from 'urijs';
import * as boasdk from 'boa-sdk-ts';
import { messages } from '../enum/ResponseMessagesEnum';
import { Crypto } from '../crypto/crypto';
import { Account } from '../data/Account';
import { ISender, IBuildTx, IReciever, IErr } from '../../@types/types';
import e from 'express';

export class BOAClient {
    /**
     * The Stoa server URL
     */
    public readonly server_url: uri;

    /**
     * The Agora URL
     */
    public readonly agora_url: uri;

    /**
     * Constructor
     * @param server_url The Stoa server URL
     * @param agora_url  The Agora server URL
     */
    constructor(server_url: string, agora_url: string) {
        this.server_url = uri(server_url);
        this.agora_url = uri(agora_url);
    }

    /**
     * Calculate fee for payload
     * @param data The data for which fee should be calculated.
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public calculateDataFee(data: string): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                let dataPayload: boasdk.DataPayload = new boasdk.DataPayload(Buffer.from(data.trim()), boasdk.Endian.Little);
                let fee: boasdk.JSBI = boasdk.TxPayloadFee.getFee(dataPayload.data.length);
                return resolve({ error: false, data: { fee: fee }, message: messages.SUCCESS });
            }
            catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }

    /**
     * Save Data to Agora blockchain
     * @param receiverAddress The receiver address. (string)
     * @param requestedAmount The amount for transaction. (JSBI)
     * @param senderKey The secret key of account used to build & sign transaction. (string|encryped object)
     * @param data The data to store on agora. (data)
     * @param payloadFee  The fee for storing data. (JSBI)
     * @param tx_Fee  Transaction fee. (JSBI)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public createData(receiverAddress: string, requestedAmount: boasdk.JSBI, senderKey: string | object, data: string, payloadFee: boasdk.JSBI, tx_Fee: boasdk.JSBI): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        if (boasdk.JSBI.LE(requestedAmount, boasdk.JSBI.BigInt(0))) {
                            return resolve({ error: true, message: messages.REQUESTED_AMOUNT_ERROR });
                        }

                        if (boasdk.JSBI.LT(tx_Fee, boasdk.JSBI.BigInt(0))) {
                            return resolve({ error: true, message: messages.TX_FEE_LIMIT_ERROR });
                        }

                        let mainkp: boasdk.KeyPair;
                        if (typeof senderKey == "string") {
                            mainkp = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(senderKey));
                        }
                        else if (typeof senderKey == "object") {
                            let decryptKey: any = await Crypto.decrypt(senderKey);
                            mainkp = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(decryptKey.data.decryptedData));
                        }
                        else {
                            return resolve({ error: true, message: messages.UNKNOWN_KEY_TYPE });
                        }

                        let totalRequestedAmount: boasdk.JSBI = boasdk.JSBI.add(boasdk.JSBI.BigInt(requestedAmount), boasdk.JSBI.BigInt(payloadFee));
                        totalRequestedAmount = boasdk.JSBI.add(boasdk.JSBI.BigInt(totalRequestedAmount), boasdk.JSBI.BigInt(tx_Fee));
                        let builder = new boasdk.TxBuilder(mainkp);
                        let txBuilder: any;
                        let sender: ISender = { drawn: totalRequestedAmount, secret: mainkp }
                        // call build transaction
                        // let result = await this.buildTransaction(builder, sender);
                        // if (result.error == true) {
                        //     return resolve(result);
                        // }

                        let receiverPublickey: boasdk.PublicKey = new boasdk.PublicKey(receiverAddress);
                        let tx_fee: boasdk.JSBI = boasdk.JSBI.BigInt(tx_Fee);
                        let payload_data: boasdk.DataPayload = new boasdk.DataPayload(Buffer.from(data.trim()), boasdk.Endian.Little);
                        txBuilder = builder.addOutput(receiverPublickey, boasdk.JSBI.BigInt(requestedAmount))
                            .assignPayload(payload_data)
                            .sign(boasdk.TxType.Payment, tx_fee, boasdk.JSBI.BigInt(payloadFee));
                        // Calculate tx size to calculate tx fee
                        let tx_size: number = txBuilder.getNumberOfBytes();
                        let boa_client: boasdk.BOAClient = new boasdk.BOAClient(this.server_url.toString(), this.agora_url.toString());
                        let txfee = await boa_client.getTransactionFee(tx_size);

                        let txHash: boasdk.Hash = await boasdk.hashFull(txBuilder);
                        return resolve({
                            error: false, data: {
                                txHash: txHash.toString(),
                                transaction: txBuilder,
                                tx_fee: txfee
                            }, message: messages.TRANSACTION_CREATED_SUCCESSFULLY
                        });
                    });
            } catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }
    /**
     * Send transaction to agora Blockchain
     * @param receiverAddress The receiver address. (string)
     * @param requestedAmount  The amount for transaction. (JSBI)
     * @param senderKey The secret key of account used to build & sign transaction. (string|encryped object)
     * @param tx_Fee  Transaction fee. (JSBI)
     * @param type  Transaction type. (boolean)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public createRawTransaction(receiverAddress: string, requestedAmount: boasdk.JSBI, senderKey: object): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        if (boasdk.JSBI.LE(requestedAmount, boasdk.JSBI.BigInt(0))) {
                            return resolve({ error: true, message: messages.REQUESTED_AMOUNT_ERROR });
                        }
                        let mainkp: boasdk.KeyPair;
                        let boa_client: boasdk.BOAClient = new boasdk.BOAClient(this.server_url.toString(), this.agora_url.toString());
                        let decryptKey: any = await Crypto.decrypt(senderKey);
                        mainkp = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(decryptKey.data.decryptedData));

                        let builder: boasdk.TxBuilder = new boasdk.TxBuilder(mainkp);
                        let block_height: boasdk.JSBI = await boa_client.getBlockHeight();  
                        let utxos: boasdk.UnspentTxOutput[] = await boa_client.getUTXOs(mainkp.address);
                        let utxo_manager: boasdk.UTXOManager = new boasdk.UTXOManager(utxos);
                        let balance: boasdk.JSBI = utxo_manager.getSum(block_height)[0];

                        if (boasdk.JSBI.LT(balance, requestedAmount)) {
                            return resolve({ error: true, message: messages.INSUFFICIENT_BALANCE_IN_ACCOUNT + mainkp.address.toString() })
                        }
                        await utxo_manager.getUTXO(boasdk.JSBI.BigInt(requestedAmount), block_height)
                            .forEach(async (u: boasdk.UnspentTxOutput) => {
                                await builder.addInput(u.utxo, u.amount, mainkp.secret)
                            });

                        let tx: boasdk.Transaction;    
                        let receiverPk: boasdk.PublicKey = new boasdk.PublicKey(receiverAddress);
                        builder.addOutput(receiverPk, boasdk.JSBI.BigInt(requestedAmount));

                        return resolve({
                            error: false, data: {
                                builder: builder,
                            }, message: messages.TRANSACTION_CREATED_SUCCESSFULLY
                        });
                    });
            } catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }

    /**
     * Send transaction to agora Blockchain
     * @param receiverAddress The receiver address. (string)
     * @param requestedAmount  The amount for transaction. (JSBI)
     * @param senderKey The secret key of account used to build & sign transaction. (string|encryped object)
     * @param tx_Fee  Transaction fee. (JSBI)
     * @param type  Transaction type. (boolean)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public estimateTxFee(inputs : number, outputs: number ): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        let boa_client: boasdk.BOAClient = new boasdk.BOAClient(this.server_url.toString(), this.agora_url.toString());  
                        let estimatedSize = boasdk.Transaction.getEstimatedNumberOfBytes(inputs,outputs,0)
                        let txfee = await boa_client.getTransactionFee(estimatedSize);
                        return resolve({
                            error: false, data: {
                                tx_fee: txfee
                            }, message: messages.TRANSACTION_CREATED_SUCCESSFULLY
                        });
                    });
            } catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }
    /**
     * Send transaction to agora Blockchain
     * @param builder The transaction builder send by createData or createTransaction.
     * @param sender  The array of objects contains amount (selected to send from an account) and sender address.
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public buildTransaction(builder: boasdk.TxBuilder, type: boasdk.TxType, txFee : number): Promise<Object> {
        return new Promise<Object>(async (resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        boasdk.TxType.Payment
                       let transaction = builder.sign(type, boasdk.JSBI.BigInt(txFee));
                       let txHash = await boasdk.hashFull(transaction);
                       return resolve({
                            error: false, data: {
                                txHash: txHash,
                                transaction: transaction
                            }, message: messages.TRANSACTION_CREATED_SUCCESSFULLY
                        });
                    })
            }
            catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }

    /**
     * This function sends transaction to Agora Network
     * @param data Object of transaction to send. (object)
     * @param txHash String of Transaction hash. (string)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public sendToAgora(data: Object, txHash: string): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                let url: uri = uri(this.agora_url)
                    .filename("transaction");
                Request.put(url.toString(), { tx:data })
                    .then((response: AxiosResponse) => {
                        if (response.status == 200) {
                            return resolve({
                                error: false, data: {
                                    txHash: txHash.toString()
                                }, message: messages.TRANSACTION_SENT
                            });
                        }
                        else {
                            return resolve({ error: true, message: response.statusText });
                        }
                    }).catch((err) => {
                        console.log(err);
                        return resolve({ error: true, message: messages.ERROR_IN_AXOIS_REQUEST });
                    });
            }
            catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }
}
