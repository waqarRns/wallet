/*******************************************************************************
    Contain definition for the class Freezing

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/
import { BOAClient } from '../net/BOAClient'
import { Account } from './Account';
import { messages } from '../enum/ResponseMessagesEnum';
import * as boasdk from 'boa-sdk-ts';
import { Crypto } from '../crypto/crypto';
import { ITxHashes, IUtxos, IFrozenObject, ISenderObject } from '../../@types/types';
import { BOASodium } from 'boa-sodium-ts';

/**
 * This class is used to get information from agora Blockchain
 */
export class Freezing {
    /**
     * The instance of BoaClient
     */
    public boaClient: BOAClient;

    constructor(boaClient: BOAClient) {
        this.boaClient = new BOAClient(String(boaClient.server_url), String(boaClient.agora_url))
    }

    /**
     * Calculate Amount for freeze transaction
     * @param units Units to calculate freeze transaction fee. (JSBi)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public calculateFreezeTxAmount(units: boasdk.JSBI): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                // calculate Amount using
                let calcultedAmount: boasdk.JSBI = boasdk.JSBI.multiply((boasdk.JSBI.add(boasdk.JSBI.multiply(boasdk.JSBI.BigInt(units), boasdk.JSBI.BigInt(10000)), boasdk.JSBI.BigInt(40000))), boasdk.JSBI.BigInt(10000000));
                return resolve({ error: false, data: { amount: calcultedAmount.toString() }, message: messages.SUCCESS });
            }
            catch (err) {
                return resolve({ error: true, message: err.message });
            }
        });
    }

    /**
    * This function is used to get Freeze UTXO's of the addresses.
    * @param addresses The Array Of Addresses for which freeze utxos Should be fetched. (array<string>)
    * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
    */
    public getFreezeUtxos(addresses: Array<string>): Promise<Object> {
        return new Promise<Object>(async (resolve, reject) => {
            let freezeUtxos: Array<string> = [];
            let account = new Account(this.boaClient);
            for (let i = 0; i < addresses.length; i++) {
                let accountUtxos: any = await account.getUTXOS(addresses[i]);
                if (accountUtxos.error == true) {
                    return resolve(accountUtxos);
                }

                for (let j = 0; j < accountUtxos.data.utxos.length; j++) {
                    if (accountUtxos.data.utxos[j].type === boasdk.TxType.Freeze) {
                        freezeUtxos.push(accountUtxos.data.utxos[j]);
                    }
                }
            }
            return resolve({
                error: false, data: {
                    freezeUtxos
                }, message: messages.SUCCESSFULL
            });
        });
    }

    /**
       * This function is used to retrieve the transaction history of Frozen transactions.
       * @param addresses The array of Addresses. (array<string>)
       * @param type Type for filters. (string)
       * @param timeFrom Timefrom for filter. (string)
       * @param timeTo Timeto for filter. (string)
       * @param peer Name/Address of peer. (array<string>)
       * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
       */
    public getFreezeTransactionHashes(addresses: Array<string>, type: string, timeFrom: string, timeTo: string, peer: Array<string>): Promise<Object> {
        return new Promise<Object>(async (resolve, reject) => {
            try {
                let accountsFreezeHistory: Array<{ hash: string }> = [];
                let account: Account = new Account(this.boaClient);
                if (addresses.length > 0) {
                    for (let i = 0; i < addresses.length; i++) {
                        let result = await account.getTransactionHistory(addresses[i], type, timeFrom, timeTo, peer, "", "");
                        if (result.error == true) {
                            return resolve(result);
                        }

                        if (result.error == false) {
                            if (result.data.txHistory.length != 0) {
                                for (let j = 0; j < result.data.txHistory.length; j++) {
                                    if (result.data.txHistory[j].tx_type === 'freeze') {
                                        var index: number = accountsFreezeHistory.findIndex((x: { hash: string }) =>
                                            x.hash === result.data.txHistory[j].tx_hash
                                        );
                                        index === -1 ? accountsFreezeHistory.push({ hash: result.data.txHistory[j].tx_hash }) : ""
                                    }
                                }
                            }
                        }
                        else {
                            return resolve(result);
                        }
                    }
                    return resolve({
                        error: false, data: {
                            history: accountsFreezeHistory
                        }, message: messages.SUCCESSFULL
                    });
                }
                else {
                    return resolve({ error: true, message: messages.ARRAY_LENGTH_ZERO });
                }
            } catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }

    /**
    * This function is used  to get Freeze UTXO's of Wallet.
    * @param utxosAmount Array of Selected UTXO's amount in string. (array<string>)
    * @param address Address of currently logged in user. (string)
    * Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
    */
    public selectFreezeUtxos(utxosAmount: Array<string>, address: string): Promise<Object> {
        return new Promise<Object>(async (resolve, reject) => {
            try {
                let account: Account = new Account(this.boaClient);
                let selfBalance = await account.getSelfBalance(address);
                if (selfBalance.error) {
                    return resolve(selfBalance);
                }
                else {
                    let totalFreezeAmount: boasdk.JSBI = selfBalance.data.selfBalance.frozen;
                    let balanceToUnfreeze: boasdk.JSBI = boasdk.JSBI.BigInt(0);
                    for (let i = 0; i < utxosAmount.length; i++) {
                        balanceToUnfreeze = boasdk.JSBI.add(boasdk.JSBI.BigInt(utxosAmount[i]), boasdk.JSBI.BigInt(balanceToUnfreeze));
                    }
                    if (totalFreezeAmount >= balanceToUnfreeze) {
                        return resolve({
                            error: false, data: {
                                address: address,
                                amountToBeUnfrozen: balanceToUnfreeze.toString(),
                                frozenAmount: selfBalance.data.selfBalance.frozen.toString(),
                                amount: boasdk.JSBI.subtract(boasdk.JSBI.BigInt(selfBalance.data.selfBalance.frozen), balanceToUnfreeze).toString()
                            }, message: messages.SUCCESSFULL
                        });
                    }
                    else {
                        return resolve({ error: true, message: messages.FROZEN_AMOUNT_EXCEEDED });
                    }
                }
            }
            catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }

    /**
     * This function is used to get the list of Freezed transactions which are available to unfreeze.
     * @param txHashes Object returned from method getFreezeTransactionHashes(). (array<ITxHashes>)
     * @param utxos Object returned from method getFreezeUtxos(). (array<IUtxos>)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public getUnfreezeList(txHashes: Array<ITxHashes>, utxos: Array<IUtxos>): Promise<object> {
        return new Promise<object>(async (resolve, reject) => {
            let frozenObject: IFrozenObject;
            let frozenList: Array<IFrozenObject> = [];
            let account: Account = new Account(this.boaClient);
            for (let i = 0; i < txHashes.length; i++) {
                let accountFreezeTxOverview = await account.getTransactionOverview(txHashes[i].hash);
                if (accountFreezeTxOverview.error == true) {
                    return resolve(accountFreezeTxOverview);
                }
                for (let j = 0; j < utxos.length; j++) {
                    for (let k = 0; k < accountFreezeTxOverview.data.receivers.length; k++) {
                        if (accountFreezeTxOverview.data.receivers[k].utxo === utxos[j].utxo) {
                            frozenObject = {
                                utxo: accountFreezeTxOverview.data.receivers[k].utxo,
                                blockHeight: accountFreezeTxOverview.data.height,
                                time: accountFreezeTxOverview.data.time,
                                amount: utxos[j].amount
                            }
                            frozenList.push(frozenObject);
                        }
                    }
                }
            }
            return resolve({
                error: false, data: {
                    frozenList
                }, message: messages.SUCCESSFULL
            });
        });
    }

    /**
     * This function is used to get the list of Freezed transactions senders.
     * @param txHashes Object returned from method getFreezeTransactionHashes(). (array<ITxHashes>)
     * @param utxos Object returned from method getFreezeUtxos(). (array<IUtxos>)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public getSenderAddressToUnFreeze(txHashes: Array<ITxHashes>, utxos: Array<IUtxos>): Promise<object> {
        return new Promise<Object>(async (resolve, reject) => {
            let senderObject: ISenderObject;
            let senderList: Array<ISenderObject> = [];
            let account: Account = new Account(this.boaClient);
            for (let i = 0; i < txHashes.length; i++) {
                let accountFreezeTxOverview = await account.getTransactionOverview(txHashes[i].hash);
                if (accountFreezeTxOverview.error == true) {
                    return resolve(accountFreezeTxOverview);
                }
                for (let j = 0; j < utxos.length; j++) {
                    for (let k = 0; k < accountFreezeTxOverview.data.receivers.length; k++) {
                        if (accountFreezeTxOverview.data.receivers[k].utxo === utxos[j].utxo) {
                            senderObject = {
                                utxo: accountFreezeTxOverview.data.receivers[k].utxo,
                                senderAddress: accountFreezeTxOverview.data.senders[0].address,
                                amount: utxos[j].amount
                            }
                            senderList.push(senderObject);
                        }
                    }
                }
            }
            return resolve({
                error: false, data: {
                    senderList
                }, message: messages.SUCCESSFULL
            });
        });
    }

    /**
   * Create transaction to unfreeze UTXO's
   * @param utxos  Array of objects having UTXO hash and amount of that UTXO. (array<IUtxos>)
   * @param secretkey Secret Key of Sender. (string|object)
   * @param senders Address of sender which send this transaction. (freezeSender)
   * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
   */
    public createUnfreezeTransaction(utxos: Array<IUtxos>, secretkey: string | object, tx_Fee: boasdk.JSBI): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                boasdk.SodiumHelper.assign(new BOASodium());
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        let senderkp: boasdk.KeyPair;
                        if (typeof secretkey == "string") {
                            senderkp = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(secretkey));
                        }
                        else if (typeof secretkey == "object") {
                            let decryptKey: any = await Crypto.decrypt(secretkey);
                            senderkp = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(decryptKey.data.decryptedData));
                        }
                        else {
                            return resolve({ error: true, message: messages.UNKNOWN_KEY_TYPE });
                        }

                        if (utxos.length > 0) {
                            let inputUtxo = new Array();
                            let utxosAmount = new Array();
                            let tx = new boasdk.TxBuilder(senderkp);
                            let txBuilder: any;

                            for (let i = 0; i < utxos.length; i++) {
                                inputUtxo.push(utxos[i].utxo);
                                utxosAmount.push(String(utxos[i].amount));
                                txBuilder = tx
                                    .addInput(new boasdk.Hash(utxos[i].utxo), boasdk.JSBI.BigInt(utxos[i].amount), senderkp.secret);
                            }
                            let hashes: any = await this.getFreezeTransactionHashes([senderkp.address.toString()], "", "", "", []);
                            if (hashes.error == true) {
                                return resolve(hashes);
                            }

                            let senders: any = await this.getSenderAddressToUnFreeze(hashes.data.history, utxos);
                            if (senders.error == true) {
                                return resolve(senders);
                            }

                            let boa_client: boasdk.BOAClient = new boasdk.BOAClient(this.boaClient.server_url.toString(), this.boaClient.agora_url.toString());
                            let sender: string | Buffer = senders.data.senderList[0].senderAddress;
                            if (boasdk.JSBI.NE(boasdk.JSBI.BigInt(tx_Fee), boasdk.JSBI.BigInt(0))) {
                                let utxos: boasdk.UnspentTxOutput[] = await boa_client.getUTXOs(new boasdk.PublicKey(sender));
                                let block_height: boasdk.JSBI = await boa_client.getBlockHeight();
                                // Create UTXOManager
                                let utxo_manager: boasdk.UTXOManager = new boasdk.UTXOManager(utxos);
                                // Get UTXO for the amount to need.
                                let checkBalance: boasdk.JSBI = utxo_manager.getSum(block_height)[0];

                                if (boasdk.JSBI.lessThan(checkBalance, boasdk.JSBI.BigInt(tx_Fee))) {
                                    return resolve({ error: true, message: messages.INSUFFICIENT_BALANCE_IN_ACCOUNT + sender })
                                }
                                await utxo_manager.getUTXO(boasdk.JSBI.BigInt(tx_Fee), block_height)
                                    .forEach(async (u: boasdk.UnspentTxOutput) => {
                                        await txBuilder.addInput(u.utxo, u.amount, senderkp.secret)
                                    });
                            }
                            txBuilder = tx
                                .addOutput(new boasdk.PublicKey(sender), boasdk.JSBI.BigInt(senders.data.senderList[0].amount))
                                .sign(boasdk.TxType.Payment, boasdk.JSBI.BigInt(tx_Fee))

                            let tx_size: number = txBuilder.getNumberOfBytes();
                            let txfee: object = await boa_client.getTransactionFee(tx_size);
                            let tx_hash: boasdk.Hash = boasdk.hashFull(txBuilder);

                            //converting tx in JSON
                            let tx1 = {
                                "tx": JSON.parse(JSON.stringify(txBuilder))
                            };
                            return resolve({
                                error: false, data: {
                                    txHash: tx_hash.toString(),
                                    transaction: tx1,
                                    tx_fee: txfee
                                }, message: messages.TRANSACTION_CREATED_SUCCESSFULLY
                            });
                        }
                    });
            } catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }
}
