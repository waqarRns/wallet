import * as wallet_lib from '../lib';
import * as assert from 'assert';
import { boa_client, invalid_boa_client } from './config.test';
const account = new wallet_lib.Account(boa_client);
const invalid_account = new wallet_lib.Account(invalid_boa_client);
import { TestStoa, TestAgora } from './BOAClient.test';
import * as boasdk from 'boa-sdk-ts';
describe('Account', () => {
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

    describe('Get account balance summary', () => {
        it("Get account balance summary with valid data", async () => {
            let publicKey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let amountToWithdraw = boasdk.JSBI.BigInt(10);
            let result: any = await account.accountBalanceSummary(publicKey, amountToWithdraw);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.data.balance.address, publicKey);
            assert.strictEqual(result.data.balance.drawn, amountToWithdraw.toString());
            assert.notStrictEqual(result.data.balance.remaining, null);
            assert.notStrictEqual(result.data.balance.spendable, null);
            assert.notStrictEqual(result.data.balance.total, null);
            assert.strictEqual(result.message, 'Success');
        });

        it("Get account balance summary with invalid publicKey", async () => {
            let publicKey = 'GCOAEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let amountToWithdraw = boasdk.JSBI.BigInt(10);
            let result: any = await account.accountBalanceSummary(publicKey, amountToWithdraw);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });

        it("Get account balance summary with invalid publicKey", async () => {
            let publicKey = 'GCOAEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let amountToWithdraw = boasdk.JSBI.BigInt(10);
            let result: any = await account.accountBalanceSummary(publicKey, amountToWithdraw);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });

        it("Get account balance summary with withdraw amount less than 0.5", async () => {
            let publicKey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let amountToWithdraw = boasdk.JSBI.BigInt(0);
            let result: any = await account.accountBalanceSummary(publicKey, amountToWithdraw);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Requested Amount should not be less than 0.5 BOA');
        });

        it("Get account balance summary with withdraw amount greater than the spendable amount", async () => {
            let publicKey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let amountToWithdraw = boasdk.JSBI.BigInt(48799999995800000000);
            let result: any = await account.accountBalanceSummary(publicKey, amountToWithdraw);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Insufficient balance');
        });

        it("Get account balance summary with invalid account urls", async () => {
            let publicKey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let amountToWithdraw = boasdk.JSBI.BigInt(10);
            let result: any = await invalid_account.accountBalanceSummary(publicKey, amountToWithdraw);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, "Error occurred in axois request");
        });
    });

    describe("Get UTXO's", () => {
        it("Get UTXOS providing publicKey", async () => {
            let publicKey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let result: any = await account.getUTXOS(publicKey);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.message, 'Success');
            assert.ok(result.data.utxos);
        });

        it("Get UTXO's providing publicKey expecting empty", async () => {
            let publicKey = 'GAHZWHFTEBXE7JGDPBEZUWX5FAQYNBBLLTUITIN2LRHVEQYO6I2JM343';
            let result: any = await account.getUTXOS(publicKey);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.data.utxos.length, 0);
        });

        it("Get UTXO's providing invalid publicKey length", async () => {
            let publicKey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPRIJ';
            let result: any = await account.getUTXOS(publicKey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });

        it("Get UTXO's by providing invalid urls", async () => {
            let publicKey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let result: any = await invalid_account.getUTXOS(publicKey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Error occurred in axois request');
        });
    });

    describe('Get self Balance', () => {
        it("Get user self Balance by providing their public address", async () => {
            let publicKey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let result = await account.getSelfBalance(publicKey);
            assert.strictEqual(result.error, false);
            assert.notStrictEqual(result.data.selfBalance.frozen, null);
            assert.notStrictEqual(result.data.selfBalance.unspendable, null);
            assert.ok(result.data.selfBalance.total);
            assert.ok(result.data.selfBalance.spendable);
            assert.strictEqual(result.message, 'Success');
        });

        it("Get user self Balance by providing the public address expecting 0 balance", async () => {
            let publicKey = 'GAHZWHFTEBXE7JGDPBEZUWX5FAQYNBBLLTUITIN2LRHVEQYO6I2JM343';
            let result = await account.getSelfBalance(publicKey);
            assert.strictEqual(result.error, false);
            assert.strictEqual(Number(result.data.selfBalance.total), 0);
            assert.strictEqual(Number(result.data.selfBalance.spendable), 0);
            assert.strictEqual(Number(result.data.selfBalance.frozen), 0);
            assert.strictEqual(Number(result.data.selfBalance.unspendable), 0);
            assert.strictEqual(result.message, "UTXO's not found on given address");
        });

        it("Get user self Balance by hitting wrong urls providing the public address", async () => {
            let publicKey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let result: any = await invalid_account.getSelfBalance(publicKey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Error occurred in axois request');
        });
    });

    describe('Get total balance', () => {
        it("Get total balance of all the accounts present in wallet", async () => {
            let publicKeys = ['GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ', 'GDU3ZF52MKYWG53XSWVAAXU53HCTA7ACHWWPX5BGJC3YD6KSOSUXY62N', 'GDNODE2IMTDH7SZHXWDS24EZCMYCEJMRZWB3S4HLRIUP6UNGKVVFLVHQ'];
            let result: any = await account.getTotalBalance(publicKeys);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.message, 'Success');
            assert.ok(result.data.walletBalance.total);
            assert.ok(result.data.walletBalance.spendable);
            assert.ok(result.data.walletBalance.frozen);
        });

        it("Get total balance by passing invalid key", async () => {
            let publicKeys = ['GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPARIJ'];
            let result: any = await account.getTotalBalance(publicKeys);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, `This key is not valid of key : ${publicKeys[0]}`);
        });

        it("Get total balance by passing empty array of keys", async () => {
            let publicKeys: Array<string> = [];
            let result: any = await account.getTotalBalance(publicKeys);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Address not found');
        });

        it("Get total balance by hitting wrong url by passing invalid key", async () => {
            let publicKeys = ['GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ', 'GDU3ZF52MKYWG53XSWVAAXU53HCTA7ACHWWPX5BGJC3YD6KSOSUXY62N', 'GDNODE2IMTDH7SZHXWDS24EZCMYCEJMRZWB3S4HLRIUP6UNGKVVFLVHQ'];
            let result: any = await invalid_account.getTotalBalance(publicKeys);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Error occurred in axois request');
        });
    });

    describe('Get transaction history of account', () => {
        it("Get transaction history of an account", async () => {
            let address = "GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ";
            let result = await account.getTransactionHistory(address, "", "", "", [], "", "");
            assert.strictEqual(result.error, false);
            assert.ok(result.data.txHistory);
        });

        it("Get transaction history of an account by passing non existing peer", async () => {
            let address = "GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ";
            let result = await account.getTransactionHistory(address, "", "", "", ["GAHZWHFTEBXE7JGDPBEZUWX5FAQYNBBLLTUITIN2LRHVEQYO6I2JM343"], "", "");
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.message, 'Record not found');
            assert.ok(result.data.txHistory);
        });

        it("Get transaction history of an account expecting to return none", async () => {
            let address = "GAHZWHFTEBXE7JGDPBEZUWX5FAQYNBBLLTUITIN2LRHVEQYO6I2JM343";
            let result = await account.getTransactionHistory(address, "", "", "", [], "", "");
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.message, 'Record not found');
            assert.ok(result.data.txHistory);
        });

        it("Get transaction history of an account by using filters", async () => {
            let address = "GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ";
            let result = await account.getTransactionHistory(address, "inbound", "", "", ["GDU3ZF52MKYWG53XSWVAAXU53HCTA7ACHWWPX5BGJC3YD6KSOSUXY62N"], "10", "1");
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.message, 'Successfull');
            assert.ok(result.data.txHistory);
        });

        it("Get transaction history of an account with invalid key", async () => {
            let address = "GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLAIJ";
            let result = await account.getTransactionHistory(address, "", "", "", [], "", "");
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });

        it("Get transaction history of an account by hitting wrong url", async () => {
            let address = "GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ";
            let result = await invalid_account.getTransactionHistory(address, "inbound", "", "", ["GAHZWHFTEBXE7JGDPBEZUWX5FAQYNBBLLTUITIN2LRHVEQYO6I2JM343"], "10", "5");
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Error occurred in axois request');
        });
    });

    describe('Get transaction overview using txHash', () => {
        it("Get transaction history overview using txHash with payload", async () => {
            let txHash = "0xc2fed6fe6e445328bf363bb2725c23593b5ac43f0e0cd456f22bab77ef7b81a2661b9a07308a909047acf2b886522a50d7dd9195072de2272509963aeec34e52";
            let transactionOverview = await account.getTransactionOverview(txHash);
            assert.strictEqual(transactionOverview.error, false);
            assert.strictEqual(transactionOverview.message, 'Successfull');
            assert.ok(transactionOverview.data);
        });

        it("Get transaction history overview using txHash without payload", async () => {
            let txHash = "0x63341a4502434e2c89d0f4e46cb9cbd27dfa8a6d244685bb5eb6635d634b2179b49108e949f176906a13b8685254b1098ebf1adf44033f5c9dd6b4362c14b020";
            let transactionOverview = await account.getTransactionOverview(txHash);
            assert.strictEqual(transactionOverview.error, false);
            assert.strictEqual(transactionOverview.message, 'Successfull');
            assert.ok(transactionOverview.data);
        });

        it("Get transaction history overview by passing wrong txHash", async () => {
            let txHash = "0xc2fe45328bf363bb2725c23593b5ac43f0e0cd456f22bab77ef7b817308a909047acf2b886522a50d7dd9195072de2272509963aeec34e52";
            let transactionOverview = await account.getTransactionOverview(txHash);
            assert.strictEqual(transactionOverview.error, false);
            assert.strictEqual(transactionOverview.message, 'Record not found');
        });

        it("Get transaction history overview using txHash of transaction by hitting wrong url", async () => {
            let txHash = "0xc2fed6fe6e445328bf363bb2725c23593b5ac43f0e0cd456f22bab77ef7b81a2661b9a07308a909047acf2b886522a50d7dd9195072de2272509963aeec34e52";
            let transactionOverview = await invalid_account.getTransactionOverview(txHash);
            assert.strictEqual(transactionOverview.error, true);
            assert.strictEqual(transactionOverview.message, 'Error occurred in axois request');
        });
    });

    describe('Get pending transaction', () => {
        it("Get pending transaction against the address", async () => {
            let address = "GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ";
            let pendingTransactions = await account.getPendingTransactions(address);
            assert.strictEqual(pendingTransactions.error, false);
            assert.ok(pendingTransactions.data);
        });

        it("Get pending transaction against the address expecting empty", async () => {
            let address = "GAHZWHFTEBXE7JGDPBEZUWX5FAQYNBBLLTUITIN2LRHVEQYO6I2JM343";
            let pendingTransactions = await account.getPendingTransactions(address);
            assert.strictEqual(pendingTransactions.error, false);
            assert.strictEqual(pendingTransactions.message, 'Record not found');
        });

        it("Get pending transaction against the invalid address length", async () => {
            let address = "GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERLRIJ";
            let pendingTransactions = await account.getPendingTransactions(address);
            assert.strictEqual(pendingTransactions.error, true);
            assert.strictEqual(pendingTransactions.message, 'Invalid Key length');
        });

        it("Get pending transaction by hitting wrong url", async () => {
            let address = "GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ";
            let pendingTransactions = await invalid_account.getPendingTransactions(address);
            assert.strictEqual(pendingTransactions.error, true);
            assert.strictEqual(pendingTransactions.message, 'Error occurred in axois request');
        });
    });

    describe('Get pending transaction overview', () => {
        it("Get the pending transaction overview against the transaction txHash expecting data", async () => {
            let txHash = "0xc2fed6fe6e445328bf363bb2725c23593b5ac43f0e0cd456f22bab77ef7b81a2661b9a07308a909047acf2b886522a50d7dd9195072de2272509963aeec34e52";
            let pendingTransactionOverview = await account.getPendingTransactionOverview(txHash);
            assert.strictEqual(pendingTransactionOverview.error, false);
            assert.ok(pendingTransactionOverview.data);
        });

        it("Get the pending transaction overview against the txHash expecting no content", async () => {
            let txHash = '0x6887ea797c86d699abfe575f7f00256ff3d17f8579bc82a9b40fd31f66eedd2f6d1b0f7eecaacf8f220b83bbcf8f35022fd91456c6f19048699f68e940070bcf';
            let pendingTransactionOverview = await account.getPendingTransactionOverview(txHash);
            assert.strictEqual(pendingTransactionOverview.error, false);
            assert.strictEqual(pendingTransactionOverview.message, 'Record not found');
        });

        it("Get the pending transaction overview against the txHash by hitting wrong url", async () => {
            let txHash = "0xc2fed6fe6e445328bf363bb2725c23593b5ac43f0e0cd456f22bab77ef7b81a2661b9a07308a909047acf2b886522a50d7dd9195072de2272509963aeec34e52";
            let pendingTransactionOverview = await invalid_account.getPendingTransactionOverview(txHash);
            assert.strictEqual(pendingTransactionOverview.error, true);
            assert.strictEqual(pendingTransactionOverview.message, 'Error occurred in axois request');
        });
    });
});
