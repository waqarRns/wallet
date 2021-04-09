import * as wallet_lib from '../lib';
import * as assert from 'assert';

describe("Login", () => {
    describe('Login user', () => {
        it("Login using secret key", async () => {
            let secretkey = 'SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR';
            let result: any = await wallet_lib.Login.loginUser(secretkey);
            assert.strictEqual(result.error, false);
            assert.ok(result.data.token);
        });

        it("Login using invalid secret key", async () => {
            let secretkey = 'SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CR';
            let result: any = await wallet_lib.Login.loginUser(secretkey);
            assert.strictEqual(result.message, 'Invalid Key length');
        });

        it("Login using public key", async () => {
            let publickey = 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d';
            let result: any = await wallet_lib.Login.loginUser(publickey);
            assert.strictEqual(result.error, false);
            assert.ok(result.data.token);
        });

        it("Login using invalid public key", async () => {
            let publickey = 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9gls0d';
            let result: any = await wallet_lib.Login.loginUser(publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });

        it("Login with random key", async () => {
            let publickey = 'boa1xpess3t9us5xen52asdlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d';
            let result: any = await wallet_lib.Login.loginUser(publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'This key is not valid');
        });

        it("Try to login with empty input", async () => {
            let result: any = await wallet_lib.Login.loginUser('');
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Key not found');
        });
    });

    describe('Verify token', () => {
        it("Verify json web token", async () => {
            let secretkey = 'SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR';
            let result: any = await wallet_lib.Login.loginUser(secretkey);
            let verifyJWT: any = await wallet_lib.Login.verifyJWT(result.data.token);
            assert.strictEqual(verifyJWT.error, false);
            assert.strictEqual(verifyJWT.data.found, true);
            assert.strictEqual(verifyJWT.data.expired, false);
            assert.strictEqual(verifyJWT.data.publickey, "boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt");
        });

        it("Verify invalid token", async () => {
            let token = 'JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdWJsaWNrZXkiOiJHQ09RRU9IQVVGWVVBQzZHMjJGSjNHWlJOTEdWQ0NMRVNFSjJBWEJJSjVCSk5VVlRBRVJQTFJJSiIsInNlY3JldCI6eyJpdiI6IjQzZDU3MmQ2NmZmODAzZWM2YTA5Njk2ZThkZWQ4YzU4IiwiY29udGVudCI6IjQxMTRlYzAwOWYzZjc1ZTA4NzZhZjVjYWJlMDE5YzI1NTIxMWVkNzVkM2FhZTdkYzJjNzUyYmVjOGNlZTdiMmQ1NjFhNTMxMDRkNmNjYjlmYjhiMzliYTRhYzBmYTdmY2RlOWU1ZDRkYTFkNTU5OGUifSwiaWF0IjoxNjEzMTA1MjI5LCJleHAiOjE2MTMxMTYwMjl9.Ru0NvXtNIYEXPBbYCld6D4M7Fx8wjJjVO8AYJ3Aq_jQ';
            let verifyJWT: any = await wallet_lib.Login.verifyJWT(token);
            assert.strictEqual(verifyJWT.error, true);
            assert.strictEqual(verifyJWT.message, 'invalid token');
        });

        it("Pass empty token", async () => {
            let verifyJWT: any = await wallet_lib.Login.verifyJWT('');
            assert.strictEqual(verifyJWT.error, true);
            assert.strictEqual(verifyJWT.message, 'Token not found');
        });
    });
});
