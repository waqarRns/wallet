import * as wallet_lib from '../lib';
import * as assert from 'assert';
import { boa_client, invalid_boa_client } from './config.test';
import { TestStoa, TestAgora } from './BOAClient.test';
import * as boasdk from 'boa-sdk-ts';
const freezing = new wallet_lib.Freezing(boa_client);
const invalid_freezing = new wallet_lib.Freezing(invalid_boa_client);

describe('Freezing', () => {
    let stoa_server: TestStoa;
    let agora_server: TestAgora;
    let stoa_port: string = '5000';
    let agora_port: string = '2826';

    before('Start TestStoa', async () => {
        stoa_server = new TestStoa(stoa_port);
        await stoa_server.start();
    });

    before('Start TestAgora', async () => {
        agora_server = new TestAgora(agora_port);
        await agora_server.start();
    });

    after('Stop TestStoa', async () => {
        await stoa_server.stop();
    });

    after('Stop TestAgora', async () => {
        await agora_server.stop();
    });

    describe('Do Freeze Transaction', () => {
        it('Do Freeze Transaction before checking other functions', async () => {
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt";
            let mainKey = "SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR";
            let createTx: any = await boa_client.createTransaction(receiver, requestedAmount, mainKey, boasdk.JSBI.BigInt(0), true);
            assert.strictEqual(createTx.error, false);
            let sendTx: any = await boa_client.sendToAgora(createTx.data.transaction, createTx.data.txHash);
            assert.strictEqual(sendTx.error, false);
        });
    });

    describe('Calculate Freeze Transaction amount', () => {
        it("Get Freeze Transaction amount", async () => {
            let units = boasdk.JSBI.BigInt(10);
            let result: any = await freezing.calculateFreezeTxAmount(units);
            assert.strictEqual(result.error, false);
            assert.ok(boasdk.JSBI.EQ(result.data.amount, boasdk.JSBI.BigInt(1400000000000)));
            assert.strictEqual(result.message, 'Success');
            assert.ok(result.data.amount);
        });
    });

    describe("Get Freeze UTXO's", () => {
        it("Get Freeze UTXO's by providing array of publicKeys", async () => {
            let publicKey = 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt';
            let freezeUtxos: any = await freezing.getFreezeUtxos([publicKey]);
            assert.strictEqual(freezeUtxos.error, false);
            assert.strictEqual(freezeUtxos.message, 'Successfull');
            assert.ok(freezeUtxos.data.freezeUtxos);
        });

        it("Get Freeze UTXO's by providing array of publicKeys expecting empty return", async () => {
            let publicKey = 'boa1xqcxu9rvrev9hmmwa8gxuzkvnlamkgyka37quglu5mnsfc42te97xlpnawp';
            let freezeUtxos: any = await freezing.getFreezeUtxos([publicKey]);
            assert.strictEqual(freezeUtxos.error, false);
            assert.strictEqual(freezeUtxos.message, 'Successfull');
            assert.ok(freezeUtxos.data.freezeUtxos);
        });

        it("Get Freeze UTXO's by providing array of invalid publicKey", async () => {
            let publicKey = 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686lop5wj2yt';
            let freezeUtxos: any = await freezing.getFreezeUtxos([publicKey]);
            assert.strictEqual(freezeUtxos.error, true);
            assert.strictEqual(freezeUtxos.message, 'This key is not valid');
        });

        it("Get Freeze UTXO's by hitting wrong URL", async () => {
            let publicKey = 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt';
            let freezeUtxos: any = await invalid_freezing.getFreezeUtxos([publicKey]);
            assert.strictEqual(freezeUtxos.error, true);
            assert.strictEqual(freezeUtxos.message, 'Error occurred in axois request');
        });
    });

    describe("Select Unfreeze UTXO's by user", () => {
        it("Select Unfreeze UTXO's by user", async () => {
            let utxoAmount = ["2000"];
            let address = "boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt";
            let result: any = await freezing.selectFreezeUtxos(utxoAmount, address);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.message, 'Successfull');
            assert.ok(result.data);
        });

        it("Select Unfreeze UTXO's by user with invalid address", async () => {
            let utxoAmount = ["2000000"];
            let address = "boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wk2yt";
            let result: any = await freezing.selectFreezeUtxos(utxoAmount, address);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });

        it("Select Unfreeze UTXO's for amount greater then the freeze amount of the address", async () => {
            let utxoAmount = ["200000000"];
            let address = "boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt";
            let result: any = await freezing.selectFreezeUtxos(utxoAmount, address);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Amount you want to unfreeze is greater than total frozen amount of current account');
        });

        it("Select Unfreeze UTXO's by hitting wrong URL", async () => {
            let utxoAmount = ["2000000"];
            let address = "boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt";
            let result: any = await invalid_freezing.selectFreezeUtxos(utxoAmount, address);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Error occurred in axois request');
        });
    });

    describe('Get hashes of Freeze Transactions', () => {
        it("Get hashes of Freeze Transactions by providing array of addresses", async () => {
            let publicKey = 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt';
            let hashes: any = await freezing.getFreezeTransactionHashes([publicKey], "", "", "", []);
            assert.strictEqual(hashes.error, false);
            assert.strictEqual(hashes.message, 'Successfull');
            assert.ok(hashes.data.history);
        });

        it("Get hashes of Freeze Transactions by providing array of addresses expecting empty return", async () => {
            let publicKey = 'boa1xqcxu9rvrev9hmmwa8gxuzkvnlamkgyka37quglu5mnsfc42te97xlpnawp';
            let hashes: any = await freezing.getFreezeTransactionHashes([publicKey], "", "", "", [""]);
            assert.strictEqual(hashes.error, false);
            assert.strictEqual(hashes.message, 'Successfull');
            assert.ok(hashes.data.history);
        });

        it("Get hashes of Freeze Transactions by providing array of addresses contained invalid address", async () => {
            let publicKey = 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5j2yt';
            let hashes: any = await freezing.getFreezeTransactionHashes([publicKey], "", "", "", [""]);
            assert.strictEqual(hashes.error, true);
            assert.ok(hashes.message, 'This key is not valid');
        });

        it("Get hashes of Freeze Transactions by providing empty array of addresses", async () => {
            let hashes: any = await freezing.getFreezeTransactionHashes([], "", "", "", [""]);
            assert.strictEqual(hashes.error, true);
            assert.strictEqual(hashes.message, 'Array length is zero');
        });

        it("Get hashes of Freeze Transactions by hitting wrong URL", async () => {
            let publicKey = 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt';
            let hashes: any = await invalid_freezing.getFreezeTransactionHashes([publicKey], "", "", "", []);
            assert.strictEqual(hashes.error, true);
            assert.strictEqual(hashes.message, 'Error occurred in axois request');
        });
    });

    describe("Get current UTXO's with unlock time", () => {
        let publicKey: string;
        let freezeUtxos: any;
        let hashes: any;

        before("Initialize freezeUtxos & hashes", async () => {
            publicKey = 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d';
            freezeUtxos = await freezing.getFreezeUtxos([publicKey]);
        });

        before("Initialize freezeUtxos & hashes", async () => {
            publicKey = 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d';
            hashes = await freezing.getFreezeTransactionHashes([publicKey], "", "", "", []);
        });

        it("By providing freezeUtxos and hahes of freeze transactions", async () => {
            let result: any = await freezing.getUnfreezeList(hashes.data.history, freezeUtxos.data.freezeUtxos);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.message, 'Successfull');
            assert.ok(result.data.frozenList);
        });

        it("By providing empty arrays of freezeUtxos and hahes of freeze transactions", async () => {
            let result: any = await freezing.getUnfreezeList([], []);
            assert.strictEqual(result.error, false);
            assert.ok(result.data.frozenList);
        });

        it("By providing freezeUtxos and hahes of freeze transactions by hitting wrong URL", async () => {
            let result: any = await invalid_freezing.getUnfreezeList(hashes.data.history, freezeUtxos.data.freezeUtxos);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Error occurred in axois request');
        });
    });

    describe('Get address of UTXO sender', () => {
        let publicKey: string;
        let freezeUtxos: any;
        let hashes: any;

        before("Initialize freezeUtxos & hashes", async () => {
            publicKey = 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d';
            freezeUtxos = await freezing.getFreezeUtxos([publicKey]);
            hashes = await freezing.getFreezeTransactionHashes([publicKey], "", "", "", []);
        });

        it("By providing freezeUtxos and hahes of freeze transactions", async () => {
            let result: any = await freezing.getSenderAddressToUnFreeze(hashes.data.history, freezeUtxos.data.freezeUtxos);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.message, 'Successfull');
            assert.ok(result.data.senderList);
        });

        it("By providing empty arrays of freezeUtxos and hahes of freeze transactions", async () => {
            let result: any = await freezing.getSenderAddressToUnFreeze([], []);
            assert.strictEqual(result.error, false);
            assert.ok(result.data.senderList);
        });

        it("By providing freezeUtxos and hahes of freeze transactions by hitting wrong URL", async () => {
            let result: any = await invalid_freezing.getSenderAddressToUnFreeze(hashes.data.history, freezeUtxos.data.freezeUtxos);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Error occurred in axois request');
        });
    });

    describe('Test for create unfreeze transaction', () => {
        let utxos: any;
        let senderAddress: string;
        before('Initialize ', async () => {
            senderAddress = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            utxos = [{
                utxo: "0x37e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b",
                amount: boasdk.JSBI.BigInt(20000)
            }];
        });

        it("Create payment transaction to unfreeze UTXO's with sender key in string with tx_Fee is 0", async () => {
            let sender = "SAJL5VXYSQDXWNY3UM5JVSTBMKCE57ETA37FOWIXXMIO4XM6RAUAFB4R";
            await freezing.createUnfreezeTransaction(utxos, sender, boasdk.JSBI.BigInt(0))
                .then((res: any) => {
                    assert.strictEqual(res.error, false);
                    assert.strictEqual(res.message, 'Transaction created Successfully');
                    assert.ok(res.data);
                });
        });

        it("Create payment transaction to unfreeze UTXO's with tx_Fee greater then 0", async () => {
            let sender = "SAJL5VXYSQDXWNY3UM5JVSTBMKCE57ETA37FOWIXXMIO4XM6RAUAFB4R";
            await freezing.createUnfreezeTransaction(utxos, sender, boasdk.JSBI.BigInt(10))
                .then((res: any) => {
                    assert.strictEqual(res.error, false);
                    assert.strictEqual(res.message, 'Transaction created Successfully');
                    assert.ok(res.data);
                });
        });
        it("Create payment transaction to unfreeze UTXO's with encrypted sender key", async () => {
            let sender = {
                iv: '7cc7732bab7df6384519b1eee8a3b20b',
                content: '6385ad44c25fc3c3a5151b3303085b677f42ecbf24bf4b1e12059611bdb0802b88c7b919778ea2209c98f9c9cd5cf5f513f16ff48f532c76'
            };
            await freezing.createUnfreezeTransaction(utxos, sender, boasdk.JSBI.BigInt(0))
                .then((res: any) => {
                    assert.strictEqual(res.error, false);
                    assert.strictEqual(res.message, 'Transaction created Successfully');
                    assert.ok(res.data);
                });
        });
    });
});
