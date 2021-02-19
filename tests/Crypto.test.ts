import * as wallet_lib from '../lib';
import * as assert from 'assert';

describe("Crypto", () => {
    describe('Encrypting Data', () => {
        it('Encrypting Secret Key', async () => {
            let secretKey = 'SCT4KKJNYLTQO4TVDPVJQZEONTVVW66YLRWAINWI3FZDY7U4JS4JJEI4';
            let result: any = await wallet_lib.Crypto.encrypt(secretKey);
            assert.strictEqual(result.error, false);
            assert.ok(result.data);
        });
    });

    describe('Decrypting Data', () => {
        it('Decrypting Secret Key', async () => {
            let secretKey = 'SCT4KKJNYLTQO4TVDPVJQZEONTVVW66YLRWAINWI3FZDY7U4JS4JJEI4';
            let result: any = await wallet_lib.Crypto.encrypt(secretKey);
            let decryptResult: any = await wallet_lib.Crypto.decrypt(result.data);
            assert.strictEqual(decryptResult.error, false);
            assert.strictEqual(decryptResult.data.decryptedData, secretKey);
        });

        it('Decrypting with invalid IV length', async () => {
            let encryptedData = {
                iv: '3f6831ef2567923fbcdb30fbe5247',
                content: '92c634cd73fb4242bae531b328b92963e2e755ac827df4a1a872ffbf0ff5e001fc833612891e887286e601af7aaa2e2f4d0402bb74198d78'
            };
            let decryptResult: any = await wallet_lib.Crypto.decrypt(encryptedData);
            assert.strictEqual(decryptResult.error, true);
            assert.ok(decryptResult.message);
        });

        it('Decrypting without IV', async () => {
            let encryptedData = {
                content: '92c634cd73fb4242bae531b328b92963e2e755ac827df4a1a872ffbf0ff5e001fc833612891e887286e601af7aaa2e2f4d0402bb74198d78'
            };
            let decryptResult: any = await wallet_lib.Crypto.decrypt(encryptedData);
            assert.strictEqual(decryptResult.error, true);
            assert.strictEqual(decryptResult.message, 'Some thing went wrong');
        });

        it('Decrypting without content', async () => {
            let encryptedData = {
                iv: '3f6831ef2567923fbcdb30fbe52475b1'
            };
            let decryptResult: any = await wallet_lib.Crypto.decrypt(encryptedData);
            assert.strictEqual(decryptResult.error, true);
            assert.strictEqual(decryptResult.message, 'Some thing went wrong');
        });
    });
});
