/*******************************************************************************
    Contain definition for the class Account

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/
import * as request from 'request';
import { Request } from '../net/Request';
import { BOAClient } from '../net/BOAClient'
import { AxiosResponse } from 'axios';
import uri from 'urijs';
import * as moment from 'moment';
import * as boasdk from 'boa-sdk-ts';
import { messages } from '../enum/ResponseMessagesEnum';
import { KeyPair } from './KeyPair';

/**
 * This class is used to get information from agora Blockchain
 */
export class Account {
    public boaClient: BOAClient;

    /**
     * Constructor
     * @param boaClient The instance of BOAClient
     */
    constructor(boaClient: BOAClient) {
        this.boaClient = new BOAClient(String(boaClient.server_url), String(boaClient.agora_url))
    }

    /**
      * This function is used to get the balance summary of the address
      * @param address Address to get self balance. (string)
      * @param amount Amount to be drawn from this account. (JSBI)
      * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
      */
    public accountBalanceSummary(address: string, amount: boasdk.JSBI): Promise<Object> {
        return new Promise<Object>(async (resolve, reject) => {
            try {
                let validateKey: any = await KeyPair.validPublickey(address);
                if (validateKey.error == true) {
                    return resolve(validateKey);
                }

                if (boasdk.JSBI.LE(amount, boasdk.JSBI.BigInt(0))) {
                    return resolve({ error: true, message: messages.REQUESTED_AMOUNT_ERROR });
                }

                let selfBalance = await this.getSelfBalance(address);
                if (selfBalance.error == true) {
                    return resolve(selfBalance);
                }

                let remaining: boasdk.JSBI = boasdk.JSBI.subtract(boasdk.JSBI.BigInt(selfBalance.data.selfBalance.spendable), boasdk.JSBI.BigInt(amount));
                if (boasdk.JSBI.GT(0, remaining)) {
                    return resolve({ error: true, message: messages.INSUFFICIENT_BALANCE });
                }

                return resolve({
                    error: false,
                    data: {
                        balance: {
                            address: address,
                            drawn: amount.toString(),
                            remaining: remaining.toString(),
                            spendable: selfBalance.data.selfBalance.spendable,
                            total: selfBalance.data.selfBalance.total
                        }
                    },
                    message: messages.SUCCESS
                });
            }
            catch (err) {
                return resolve({ error: true, message: err.message });
            }
        })
    }

    /**
      * This function is used to get UTXO's of an address
      * @param address Address to get UTXO's. (string)
      * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
      */
    public getUTXOS(address: string): Promise<Object> {
        return new Promise<Object>(async (resolve, reject) => {
            try {
                let validateKey: any = await KeyPair.validPublickey(address);
                if (validateKey.error == true) {
                    return resolve(validateKey);
                }

                if (!String(this.boaClient.server_url)) {
                    return resolve({ error: true, message: messages.STOA_URL_NOT_FOUND });
                }
                else {
                    let url: uri = uri(this.boaClient.server_url)
                        .directory("utxo")
                        .filename(address);

                    request.get(url.toString(), (err: string, res) => {
                        if (err) {
                            return resolve({ error: true, message: messages.ERROR_IN_AXOIS_REQUEST });
                        }
                        else {
                            if (res.statusCode == 200) {
                                return resolve({ error: false, data: { utxos: JSON.parse(res.body) }, message: messages.SUCCESS });
                            }
                            else if (res.statusCode != 200 && res.body == '') {
                                return resolve({ error: false, data: { utxos: [] }, message: messages.UTXO_NOT_FOUND });
                            }
                            else {
                                return resolve({ error: true, message: res.body });
                            }
                        }
                    });
                }
            }
            catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        })
    }

    /**
      * Get balance of the specified address
      * @param address Address for which balance is to be fetched. (string)
      * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
      */
    public getSelfBalance(address: string): any {
        return new Promise(async (resolve, reject) => {
            try {
                let validateKey: any = await KeyPair.validPublickey(address);
                if (validateKey.error == true) {
                    return resolve(validateKey);
                }

                if (!String(this.boaClient.server_url)) {
                    return resolve({ error: true, message: messages.STOA_URL_NOT_FOUND });
                }
                else {
                    let getUtxos: any = await this.getUTXOS(address);
                    if (getUtxos.error == true) {
                        return resolve(getUtxos);
                    }
                    else {
                        if (getUtxos.data.utxos.length == 0) {
                            return resolve({
                                error: false,
                                data: {
                                    selfBalance: {
                                        total: boasdk.JSBI.BigInt(0).toString(),
                                        spendable: boasdk.JSBI.BigInt(0).toString(),
                                        frozen: boasdk.JSBI.BigInt(0).toString(),
                                        unspendable: boasdk.JSBI.BigInt(0).toString()
                                    }
                                },
                                message: messages.UTXO_NOT_FOUND
                            });
                        }
                        else {
                            let utxos: Array<boasdk.UnspentTxOutput> = new Array<boasdk.UnspentTxOutput>();
                            getUtxos.data.utxos.forEach((elem: any) => {
                                let utxo: boasdk.UnspentTxOutput = new boasdk.UnspentTxOutput();
                                utxo.fromJSON(elem);
                                utxos.push(utxo);
                            });
                            let boa_client: boasdk.BOAClient = new boasdk.BOAClient(this.boaClient.server_url.toString(), this.boaClient.agora_url.toString());
                            let block_height: boasdk.JSBI = await boa_client.getBlockHeight();
                            let utxo_manager: boasdk.UTXOManager = new boasdk.UTXOManager(utxos);
                            let getSum: Array<boasdk.JSBI> = utxo_manager.getSum(block_height);
                            let totalAccountBalance: boasdk.JSBI = boasdk.JSBI.add((boasdk.JSBI.add(getSum[0], getSum[1])), getSum[2]);
                            let totalSelfPayment: boasdk.JSBI = boasdk.JSBI.BigInt(getSum[0]);
                            let totalSelfFreeze: boasdk.JSBI = boasdk.JSBI.BigInt(getSum[1]);
                            let totalSelfPaymentUnspendable: boasdk.JSBI = boasdk.JSBI.BigInt(getSum[2]);
                            return resolve({
                                error: false,
                                data: {
                                    selfBalance: {
                                        total: totalAccountBalance.toString(),
                                        spendable: totalSelfPayment.toString(),
                                        frozen: totalSelfFreeze.toString(),
                                        unspendable: totalSelfPaymentUnspendable.toString()
                                    }
                                },
                                message: messages.SUCCESS
                            });
                        }
                    }
                }
            }
            catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        })
    }

    /**
     *  Get balance of the addresses
     * @param addresses List of addresses of wallet for balance. (Array<string>)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public getTotalBalance(addresses: Array<string>): Promise<Object> {
        let totalPayment: boasdk.JSBI = boasdk.JSBI.BigInt(0);
        let totalFreeze: boasdk.JSBI = boasdk.JSBI.BigInt(0);
        let totalUnspendable: boasdk.JSBI = boasdk.JSBI.BigInt(0);
        return new Promise<Object>(async (resolve, reject) => {
            try {
                if (!String(this.boaClient.server_url)) {
                    return resolve({ error: true, message: messages.STOA_URL_NOT_FOUND });
                }
                else {
                    if (addresses.length == 0) {
                        return resolve({ error: true, message: messages.ADDRESS_NOT_FOUND });
                    }
                    else {
                        for (let i = 0; i < addresses.length; i++) {
                            let validateKey: any = await KeyPair.validPublickey(addresses[i]);
                            if (validateKey.error == true) {
                                return resolve({ error: true, message: validateKey.message + ' of key : ' + addresses[i] });
                            }

                            let result = await this.getSelfBalance(addresses[i]);
                            if (result.error == true) {
                                return resolve(result);
                            }
                            else {
                                totalPayment = boasdk.JSBI.add(totalPayment, boasdk.JSBI.BigInt(result.data.selfBalance.spendable));
                                totalFreeze = boasdk.JSBI.add(totalFreeze, boasdk.JSBI.BigInt(result.data.selfBalance.frozen));
                                totalUnspendable = boasdk.JSBI.add(totalUnspendable, boasdk.JSBI.BigInt(result.data.selfBalance.unspendable));
                            }
                        }
                        return resolve({
                            error: false, data: {
                                walletBalance: {
                                    total: boasdk.JSBI.add(boasdk.JSBI.add(totalPayment, totalFreeze), totalUnspendable).toString(),
                                    spendable: totalPayment.toString(),
                                    frozen: totalFreeze.toString(),
                                    unspendable: totalUnspendable.toString()
                                }
                            },
                            message: messages.SUCCESS
                        });
                    }
                }
            }
            catch (err) {
                return resolve({ error: true, message: err });
            }
        })
    }

    /**
     * Get Transaction history of an address
     * @param address Address for which history is to fetched. (string)
     * @param type Type for filters. (string)
     * @param beginDate TimeFrom for filter. (string)
     * @param endDate TimeTo for filter. (string)
     * @param peer Name/Address of peers. (array<string>)
     * @param pageSize size for page. (max = 30) (string)
     * @param page page to be fetched from stoa. (string)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public getTransactionHistory(address: string, type: string, beginDate: string, endDate: string, peer: Array<string>, pageSize: string, page: string): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                let validateKey: any = await KeyPair.validPublickey(address);
                if (validateKey.error == true) {
                    return resolve(validateKey);
                }

                type == "both" ? type = "" : type;
                var url: uri = uri(this.boaClient.server_url)
                    .directory("/wallet/transactions/history")
                    .filename(address);

                let overviewData: any = await this.getpagesandTotalRecord(url);
                type ? url.addQuery({ type: type }) : "";
                beginDate ? url.addQuery({ beginDate: Number(beginDate) }) : "";
                endDate ? url.addQuery({ endDate: Number(endDate) }) : "";
                page ? url.addQuery({ page: page }) : "";
                pageSize ? url.addQuery({ pageSize: pageSize }) : "";

                Request.get(url.toString())
                    .then((response: AxiosResponse) => {
                        if (response.status == 200) {
                            if (response.data) {
                                if (response.data.length > 0) {
                                    let history: Array<string> = [];
                                    if (peer.length > 0) {
                                        peer.forEach(element => {
                                            for (let i = 0; i < response.data.length; i++) {
                                                if (response.data[i].peer === element) {
                                                    history.push(response.data[i]);
                                                }
                                            }
                                        });
                                    }
                                    if (history.length == 0 && peer.length != 0) {
                                        return resolve({
                                            error: false,
                                            data: {
                                                txHistory: [],
                                                totalPages: 0,
                                                totalRecords: 0
                                            },
                                            message: messages.RECORD_NOT_FOUND
                                        });
                                    }
                                    history.length > 0 ? response.data = history : response.data;
                                    for (let i = 0; i < response.data.length; i++) {
                                        response.data[i]["Transaction_type"] = response.data[i]["display_tx_type"];
                                        delete (response.data[i]["display_tx_type"]);
                                        response.data[i]["Block_height"] = response.data[i]["height"];
                                        delete (response.data[i]["height"]);
                                        response.data[i]["Time"] = moment.utc((response.data[i]["time"]) * 1000).format("hh:mm:ss");
                                        delete (response.data[i]["time"]);
                                        response.data[i]["Amount"] = response.data[i]["amount"];
                                        delete (response.data[i]["amount"]);
                                        response.data[i]["Peer"] = response.data[i]["peer"];
                                        delete (response.data[i]["peer"]);
                                        response.data[i]["Account"] = response.data[i]["address"];
                                        delete (response.data[i]["address"]);
                                        response.data[i]["Lock_period"] = moment.utc((response.data[i]["unlock_time"]) * 1000).format("DD-MM-YYYY hh:mm:ss");
                                        delete (response.data[i]["unlock_time"]);
                                    }
                                    return resolve({
                                        error: false, data: {
                                            txHistory: response.data,
                                            totalPages: overviewData.data.totalPages,
                                            totalRecords: overviewData.data.totalRecords
                                        }, message: messages.SUCCESSFULL
                                    });
                                }
                                else
                                    return resolve({
                                        error: false,
                                        data: {
                                            txHistory: [],
                                            totalPages: 0,
                                            totalRecords: 0
                                        },
                                        message: messages.RECORD_NOT_FOUND
                                    });
                            }
                        }
                        else if (response.status == 204 && response.statusText.includes('No Content')) {
                            return resolve({
                                error: false,
                                data: { txHistory: [], totalPages: 0, totalRecords: 0 },
                                message: messages.RECORD_NOT_FOUND
                            });
                        }
                        else {
                            return resolve({ error: true, message: new Error(response.statusText) });
                        }
                    }).catch((err) => {
                        return resolve({ error: true, message: messages.ERROR_IN_AXOIS_REQUEST });
                    });

            } catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }

    /**
     * @param address  This address for which totalPages and Records should be fetched.
     * @param url stoa url.
     * @return Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public getpagesandTotalRecord(url: any): Promise<Object> {
        return new Promise<Object>(async (resolve, reject) => {
            let totalPages: number = 0;
            let totalRecords: number = 0;
            let iterationLength: number = 0;
            let page: number = 1;
            url.addQuery({ page: page })
            do {
                url.setQuery({ page: page })
                await Request.get(url.toString())
                    .then((response: AxiosResponse) => {
                        if (response.status == 200) {
                            if (response.data.length >= 1) {
                                iterationLength = response.data.length;
                                totalPages++;
                                totalRecords += response.data.length;
                                page++;
                            }
                        }
                        else if (response.status == 204 && response.statusText.includes('No Content')) {
                            iterationLength = response.data.length;
                        }
                    }).catch((err) => {
                        return resolve({ error: true, message: messages.ERROR_IN_AXOIS_REQUEST });
                    });
            }
            while (iterationLength === 10);
            url.removeQuery({ page: page });
            return (resolve({ error: false, data: { totalPages, totalRecords }, message: messages.SUCCESS }));
        });
    }

    /**
      * This function is used to get a overview of a transaction based on Hash.
      * @param txHash Hash of transaction for which Overview is to be fetched. (string)
      * Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
      */
    public getTransactionOverview(txHash: string): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                let url: uri = uri(this.boaClient.server_url)
                    .directory("/wallet/transaction/overview")
                    .filename(txHash);

                Request.get(url.toString())
                    .then(async (response: AxiosResponse) => {
                        if (response.status === 200) {
                            const utcDate1: Date = new Date(response.data.time * 1000);
                            response.data.time = utcDate1;
                            if (response.data.payload) {
                                // Convert payload to string
                                let payload: boasdk.DataPayload = new boasdk.DataPayload(response.data.payload);
                                const payloadString: Buffer = payload.toBinary(boasdk.Endian.Little);
                                response.data.payload = payloadString.toString();
                                return resolve({ error: false, data: response.data, message: messages.SUCCESSFULL });
                            }
                            else {
                                return resolve({ error: false, data: response.data, message: messages.SUCCESSFULL });
                            }
                        }
                        else if (response.status === 204 && response.statusText.includes('No Content')) {
                            return resolve({ error: false, data: { txHistory: [] }, message: messages.RECORD_NOT_FOUND });
                        }
                        else {
                            return resolve({ error: true, message: new Error(response.statusText) });
                        }
                    }).catch((err) => {
                        return resolve({ error: true, message: messages.ERROR_IN_AXOIS_REQUEST });
                    });
            } catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }

    /**
      * This function is used to get a pending transactions against the specified address.
      * @param address Address to which pending transactions to be fetched. (string)
      * Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
      */
    public getPendingTransactions(address: string): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                let validateKey: any = await KeyPair.validPublickey(address);
                if (validateKey.error == true) {
                    return resolve(validateKey);
                }

                let url: uri = uri(this.boaClient.server_url)
                    .directory("/wallet/transactions/pending/")
                    .filename(address);

                Request.get(url.toString())
                    .then(async (response: AxiosResponse) => {
                        if (response.status === 200) {
                            let blockHeaderUrl: uri = uri(this.boaClient.server_url)
                                .directory("/wallet/blocks/header");
                            // .filename(block_height.toString());
                            Request.get(blockHeaderUrl.toString())
                                .then(async (res: AxiosResponse) => {
                                    if (res.status === 200) {
                                        let block_height_at: number = res.data.time_stamp;
                                        for (let i = 0; i < response.data.length; i++) {
                                            let delayBlock: number = Number(boasdk.JSBI.divide((boasdk.JSBI.subtract(boasdk.JSBI.BigInt(block_height_at), boasdk.JSBI.BigInt(response.data[i]["submission_time"]))), boasdk.JSBI.BigInt(6000)).toString());
                                            response.data[i]["submission_time"] = moment.utc((response.data[i]["submission_time"]) * 1000).utc().format('LTS') + ' ' + 'UTC';
                                            response.data[i]["block_delay"] = delayBlock;
                                            response.data[i]["target"] = response.data[i]["address"];
                                            delete (response.data[i]["address"]);
                                        }
                                        return resolve({ error: false, data: { pendingTxs: response.data }, message: messages.SUCCESSFULL });
                                    }
                                    else {
                                        return resolve({ error: true, message: new Error(response.statusText) });
                                    }
                                });
                        }
                        else if (response.status === 204 && response.statusText.includes('No Content')) {
                            return resolve({ error: false, data: { pendingTxs: [] }, message: messages.RECORD_NOT_FOUND });
                        }
                        else {
                            return resolve({ error: true, message: new Error(response.statusText) });
                        }
                    }).catch((err) => {
                        return resolve({ error: true, message: messages.ERROR_IN_AXOIS_REQUEST });
                    });
            } catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }

    /**
      * This function is used to get a overview of a pending transaction based on Hash.
      * @param txHash txHash to which overview of pending transaction to be fetched. (string)
      * Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
      */
    public getPendingTransactionOverview(txHash: string): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            try {
                let url: uri = uri(this.boaClient.server_url)
                    .directory("transaction/pending/")
                    .filename(txHash);

                Request.get(url.toString())
                    .then(async (response: AxiosResponse) => {
                        if (response.status === 200) {
                            return resolve({ error: false, data: { pendingTxOverview: response.data }, message: messages.SUCCESSFULL });
                        }
                        else if (response.status === 204 && response.statusText.includes('No Content')) {
                            return resolve({ error: false, data: { pendingTxOverview: [] }, message: messages.RECORD_NOT_FOUND });
                        }
                        else {
                            return resolve({ error: true, message: new Error(response.statusText) });
                        }
                    }).catch((err) => {
                        return resolve({ error: true, message: messages.ERROR_IN_AXOIS_REQUEST });
                    });
            } catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    }
}
