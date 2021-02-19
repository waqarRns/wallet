import * as wallet_lib from '../lib';
import * as assert from 'assert';

describe("Login", () => {
    describe('Login user', () => {
        it("Login using secret key", async () => {
            let secretkey = 'SCT4KKJNYLTQO4TVDPVJQZEONTVVW66YLRWAINWI3FZDY7U4JS4JJEI4';
            let result: any = await wallet_lib.Login.loginUser(secretkey);
            assert.strictEqual(result.error, false);
            assert.ok(result.data.token);
        });

        it("Login using invalid secret key", async () => {
            let secretkey = 'SCT4KKJNYLTQO4TVDPVJQZEONTVVW66YLRWAINWI3FZDY7U4JS4JJE4';
            let result: any = await wallet_lib.Login.loginUser(secretkey);
            assert.strictEqual(result.message, 'Invalid Key length');
        });

        it("Login using public key", async () => {
            let publickey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ';
            let result: any = await wallet_lib.Login.loginUser(publickey);
            assert.strictEqual(result.error, false);
            assert.ok(result.data.token);
        });

        it("Login using invalid public key", async () => {
            let publickey = 'GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRJ';
            let result: any = await wallet_lib.Login.loginUser(publickey);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, 'Invalid Key length');
        });

        it("Login with random key", async () => {
            let publickey = 'ACOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRJ';
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
            let secretkey = 'SCT4KKJNYLTQO4TVDPVJQZEONTVVW66YLRWAINWI3FZDY7U4JS4JJEI4';
            let result: any = await wallet_lib.Login.loginUser(secretkey);
            let verifyJWT: any = await wallet_lib.Login.verifyJWT(result.data.token);
            assert.strictEqual(verifyJWT.error, false);
            assert.strictEqual(verifyJWT.data.found, true);
            assert.strictEqual(verifyJWT.data.expired, false);
            assert.strictEqual(verifyJWT.data.publickey, "GCOQEOHAUFYUAC6G22FJ3GZRNLGVCCLESEJ2AXBIJ5BJNUVTAERPLRIJ");
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
