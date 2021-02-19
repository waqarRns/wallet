import * as wallet_lib from '../lib';
import * as assert from 'assert';

describe("Keypair", () => {
    describe('Get mnemonics', () => {
        it('Get mnemonics', async () => {
            let language = 'english';
            let result: any = await wallet_lib.KeyPair.getMnemonics(language);
            assert.strictEqual(result.error, false);
            assert.ok(result.data.mnemonic);
        });

        it('Invalid entropy', async () => {
            let language = 'urdu';
            let result: any = await wallet_lib.KeyPair.getMnemonics(language);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, `Could not find wordlist for language "${language}"`);
        });
    });

    describe('From mnemonics', () => {
        it('Get key pairs from mnemonics', async () => {
            let mnemonics = "field frost scare team stereo library squirrel admit razor soda parrot upgrade";
            let secretkey = "SA3UKSGY36CXVQXKSQK4MLJGZOYMZKEL44GUOUK53LH2JJH6GKZQHBQZ";
            let publickey = "GA3M3HPC3Y235CNN4D4DRJVCFEIXJC4X2PPOETAEPEMYH227MIQIY3SE";
            let result: any = await wallet_lib.KeyPair.fromMnemonic(mnemonics);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.data.secretkey, secretkey);
            assert.strictEqual(result.data.publickey, publickey);
        });
    });

    describe('KeyPair recovery', () => {
        it('Get key pairs from valid mnemonics', async () => {
            let mnemonics = "field frost scare team stereo library squirrel admit razor soda parrot upgrade";
            let secretkey = "SA3UKSGY36CXVQXKSQK4MLJGZOYMZKEL44GUOUK53LH2JJH6GKZQHBQZ";
            let publickey = "GA3M3HPC3Y235CNN4D4DRJVCFEIXJC4X2PPOETAEPEMYH227MIQIY3SE";
            let result: any = await wallet_lib.KeyPair.recoverKeys(mnemonics);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.data.secretkey, secretkey);
            assert.strictEqual(result.data.publickey, publickey);
        });

        it('Get key pairs from invalid mnemonics exceeds length greater then 12 words', async () => {
            let mnemonics = "field frost scare team stereo library squirrel admit razor soda parrot upgrade squirrel";
            let result: any = await wallet_lib.KeyPair.recoverKeys(mnemonics);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This mnemonic is invalid');
        });

        it('Get key pairs from invalid mnemonics less then 12 words', async () => {
            let mnemonics = "field frost scare team stereo library squirrel admit razor soda parrot upgrade squirrel";
            let result: any = await wallet_lib.KeyPair.recoverKeys(mnemonics);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This mnemonic is invalid');
        });

        it('Get key pairs from invalid mnemonics less then 12 words', async () => {
            let mnemonics = "field frost scare team stereo library squirrel admit razor soda parrot upgrade squirrel";
            let result: any = await wallet_lib.KeyPair.recoverKeys(mnemonics);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This mnemonic is invalid');
        });

        it('Get key pairs from invalid mnemonics having word length less then 3', async () => {
            let mnemonics = "field fro scare team stereo library squirrel admit razor soda parrot upgrade squirrel";
            let result: any = await wallet_lib.KeyPair.recoverKeys(mnemonics);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This mnemonic is invalid');
        });

        it('Get key pairs from invalid mnemonics having word length less then 2', async () => {
            let mnemonics = "field fr scare team stereo library squirrel admit razor soda parrot upgrade squirrel";
            let result: any = await wallet_lib.KeyPair.recoverKeys(mnemonics);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This mnemonic is invalid');
        });
    });

    describe('Check public key validation', () => {
        it('Valid public key', async () => {
            let publickey = "GAGM465LXAD6RGGI7EZRIWOMDQ47UB5J45OQS3757M2WZMTTHRWZGUKU";
            let result: any = await wallet_lib.KeyPair.validPublickey(publickey);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.data, 'Key is Valid');
            assert.strictEqual(result.message, 'Key is Valid');
        });

        it('Invalid public key not start with G', async () => {
            let publickey = "AAGM465LXAD6RGGI7EZRIWOMDQ47UB5J45OQS3757M2WZMTTHRWZGUKU";
            let result: any = await wallet_lib.KeyPair.validPublickey(publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });

        it('Invalid public key length (greater length)', async () => {
            let publickey = "GAGM465LXAD6RGGI7EZRIWOMDQ47UB5J45OQS3757M2WZMTTHRWZGUKUA";
            let result: any = await wallet_lib.KeyPair.validPublickey(publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });

        it('Invalid public key length (short length)', async () => {
            let publickey = "GAGM465LXAD6RGGI7EZRIWOMDQ47UB5J45OQS3757M2WZMTTHRWZGUKUA";
            let result: any = await wallet_lib.KeyPair.validPublickey(publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });
    });

    describe('Get public key against secret key', () => {
        it('Valid key', async () => {
            let secretkey = "SCSGXZ5CIL3JDT2RFSUC2CCZHZ7XNMYKE7HVUUBOXVZJSLG74BG52FDW";
            let result: any = await wallet_lib.KeyPair.getPublicKey(secretkey);
            assert.strictEqual(result.error, false);
            assert.ok(result.data.publicKey);
        });

        it('Invalid key length', async () => {
            let secretkey = "SCSGXZ5CIL3JDT2RFSUC2CCZHZ7XNMYKE7HVUUBOXVZJSLG74BG52FD";
            let result: any = await wallet_lib.KeyPair.getPublicKey(secretkey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });
    });

    describe('Checking secret key Validation', () => {
        it('Validate the secret key', async () => {
            let secretkey = "SCSGXZ5CIL3JDT2RFSUC2CCZHZ7XNMYKE7HVUUBOXVZJSLG74BG52FDW";
            let result: any = await wallet_lib.KeyPair.validSecretkey(secretkey);
            assert.strictEqual(result.error, false);
        });

        it('Invalid secret key not start with S', async () => {
            let secretkey = "QCSGXZ5CIL3JDT2RFSUC2CCZHZ7XNMYKE7HVUUBOXVZJSLG74BG52FDW";
            let result: any = await wallet_lib.KeyPair.validPublickey(secretkey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });

        it('Invalid secret key length (greater length)', async () => {
            let secretkey = "SCSGXZ5CIL3JDT2RFSUC2CCZHZ7XNMYKE7HVUUBOXVZJSLG74BG52FDWA";
            let result: any = await wallet_lib.KeyPair.validPublickey(secretkey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });

        it('Invalid secret key length (short length)', async () => {
            let secretkey = "SCSGXZ5CIL3JDT2RFSUC2CCZHZ7XNMYKE7HVUUBOXVZJSLG74BG52FD";
            let result: any = await wallet_lib.KeyPair.validPublickey(secretkey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });
    });

    describe('Check the validation of Secret key against the public key', () => {
        it('Validate the secret key against public key', async () => {
            let secretkey = "SCSGXZ5CIL3JDT2RFSUC2CCZHZ7XNMYKE7HVUUBOXVZJSLG74BG52FDW";
            let publickey = "GAGM465LXAD6RGGI7EZRIWOMDQ47UB5J45OQS3757M2WZMTTHRWZGUKU";
            let result: any = await wallet_lib.KeyPair.validateSecretAgainstPublickey(secretkey, publickey);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.data, 'Secret Key is Valid');
            assert.strictEqual(result.message, 'Secret Key is Valid');
        });

        it('Invalid public key against secret key', async () => {
            let secretkey = "SCSGXZ5CIL3JDT2RFSUC2CCZHZ7XNMYKE7HVUUBOXVZJSLG74BG52FDW";
            let publickey = "GDXYPNBKNWJINCESFV7OJWHZGDRJXTZHDXDDS54QZSBQPARY52W4FSY7";
            let result: any = await wallet_lib.KeyPair.validateSecretAgainstPublickey(secretkey, publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid key against public key');
        });

        it('Invalid public key address', async () => {
            let secretkey = "SCSGXZ5CIL3JDT2RFSUC2CCZHZ7XNMYKE7HVUUBOXVZJSLG74BG52FDW";
            let publickey = "GAGM465LXAD6RGGI7EZRIWOMDQ47UB5J45OQS3757M2WZMTTHRWZGUAU";
            let result: any = await wallet_lib.KeyPair.validateSecretAgainstPublickey(secretkey, publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });
    });
});
