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
            let mnemonics = "load apart toilet target congress concert pony fatal oppose catch blanket gap";
            let secretkey = "SCFSCWJ6CUAQK3OEOFRB4GRT72OL44SGPBB5JF4FVR2VCTMXJ4WQIM4U";
            let publickey = "boa1xzfp8cxjntsshgds4n0frkmn873yfc2fg2gmzvwccn37taedf3v8qjfdhfg";
            let result: any = await wallet_lib.KeyPair.fromMnemonic(mnemonics);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.data.secretkey, secretkey);
            assert.strictEqual(result.data.publickey, publickey);
        });
    });

    describe('KeyPair recovery', () => {
        it('Get key pairs from valid mnemonics', async () => {
            let mnemonics = "gain rather shaft people ride mirror term old layer stuff margin cradle";
            let secretkey = "SAJL5VXYSQDXWNY3UM5JVSTBMKCE57ETA37FOWIXXMIO4XM6RAUAFB4R";
            let publickey = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
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
            let publickey = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let result: any = await wallet_lib.KeyPair.validPublickey(publickey);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.data, 'Key is Valid');
            assert.strictEqual(result.message, 'Key is Valid');
        });

        it('Invalid public key not start with b', async () => {
            let publickey = "xoa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let result: any = await wallet_lib.KeyPair.validPublickey(publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });

        it('Invalid public key length (greater length)', async () => {
            let publickey = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcsddf0d";
            let result: any = await wallet_lib.KeyPair.validPublickey(publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });

        it('Invalid public key length (short length)', async () => {
            let publickey = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2";
            let result: any = await wallet_lib.KeyPair.validPublickey(publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });
    });

    describe('Get public key against secret key', () => {
        it('Valid key', async () => {
            let secretkey = "SAJL5VXYSQDXWNY3UM5JVSTBMKCE57ETA37FOWIXXMIO4XM6RAUAFB4R";
            let result: any = await wallet_lib.KeyPair.getPublicKey(secretkey);
            assert.strictEqual(result.error, false);
            assert.ok(result.data.publicKey);
        });

        it('Invalid key length', async () => {
            let secretkey = "SAJL5VXYSQDXWNY3UM5JVSTBMKCE57ETA37FOWIXXMIO4XM6RAUAFB";
            let result: any = await wallet_lib.KeyPair.getPublicKey(secretkey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });
    });

    describe('Checking secret key Validation', () => {
        it('Validate the secret key', async () => {
            let secretkey = "SAJL5VXYSQDXWNY3UM5JVSTBMKCE57ETA37FOWIXXMIO4XM6RAUAFB4R";
            let result: any = await wallet_lib.KeyPair.validSecretkey(secretkey);
            assert.strictEqual(result.error, false);
        });

        it('Invalid secret key not start with S', async () => {
            let secretkey = "PAJL5VXYSQDXWNY3UM5JVSTBMKCE57ETA37FOWIXXMIO4XM6RAUAFB4R";
            let result: any = await wallet_lib.KeyPair.validSecretkey(secretkey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });

        it('Invalid secret key length (greater length)', async () => {
            let secretkey = "SAJL5VXYSQDXWNY3UM5JVSTBMKCE57ETA37FOWIXXMIO4XM6RAUAFB4RFS";
            let result: any = await wallet_lib.KeyPair.validPublickey(secretkey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });

        it('Invalid secret key length (short length)', async () => {
            let secretkey = "SAJL5VXYSQDXWNY3UM5JVSTBMKCE57ETA37FOWIXXMIO4XM6RAUA";
            let result: any = await wallet_lib.KeyPair.validPublickey(secretkey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });
    });

    describe('Check the validation of Secret key against the public key', () => {
        it('Validate the secret key against public key', async () => {
            let secretkey = 'SAJL5VXYSQDXWNY3UM5JVSTBMKCE57ETA37FOWIXXMIO4XM6RAUAFB4R';
            let publickey = 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d';
            let result: any = await wallet_lib.KeyPair.validateSecretAgainstPublickey(secretkey, publickey);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.data, 'Secret Key is Valid');
            assert.strictEqual(result.message, 'Secret Key is Valid');
        });
        it('Invalid public key address', async () => {
            let secretkey = "SCSGXZ5CIL3JDT2RFSUC2CCZHZ7XNMYKE7HVUUBOXVZJSLG74BG52FDW";
            let publickey = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp7y";
            let result: any = await wallet_lib.KeyPair.validateSecretAgainstPublickey(secretkey, publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });
    });
});
