/*******************************************************************************
    Contain defination of Login Class

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/
import * as jwt from 'jsonwebtoken';
import { Config } from '../../config/walletConfig';
import { messages } from '../enum/ResponseMessagesEnum';
import * as boasdk from 'boa-sdk-ts';
import { KeyPair } from './KeyPair';
import { Crypto } from '../crypto/crypto';
import { BOASodium } from 'boa-sodium-ts';

/**
 * Login class manages login for a user
 */
export class Login {
    /**
     * Public key or secret seed for login
     */
    private static loginKey: string;

    /**
     * Login function accepts login key and return jwt token.
     * @param key Public key or secret seed for login. (string)
     *  Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public static loginUser(key: string): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                boasdk.SodiumHelper.assign(new BOASodium());
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        if (key) {
                            Login.loginKey = key;
                            const keyTrim: string = Login.loginKey.trim();
                            let token: string;
                            if (keyTrim[0] === 'b') {
                                let publicKey: any = await KeyPair.validPublickey(keyTrim);
                                if (publicKey.error == true) {
                                    return resolve(publicKey)
                                }
                                else {
                                    Login.loginKey = keyTrim;
                                    token = jwt.sign({
                                        publickey: Login.loginKey,
                                        secret: ""
                                    }, Config.jwt_secret, {
                                        expiresIn: Config.access_token_life
                                    });
                                }
                            }
                            else if (keyTrim[0] === 'S') {
                                let keyPair: any = await KeyPair.validSecretkey(keyTrim);
                                if (keyPair.error === true) {
                                    return resolve(keyPair)
                                }
                                else {
                                    const keyPair: boasdk.KeyPair = await boasdk.KeyPair.fromSeed(new boasdk.SecretKey(keyTrim));
                                    Login.loginKey = keyPair.address.toString();
                                    let encryptKey: any = await Crypto.encrypt(keyPair.secret.toString(false));
                                    if (encryptKey.error == true) {
                                        return resolve(encryptKey);
                                    }

                                    token = jwt.sign({
                                        publickey: Login.loginKey,
                                        secret: encryptKey.data
                                    }, Config.jwt_secret, {
                                        expiresIn: Config.access_token_life
                                    });
                                }
                            }
                            else {
                                return resolve({ error: true, message: messages.INVALID_KEY_FORMAT });
                            }
                            return resolve({ error: false, data: { token: token }, message: messages.SUCCESSFULLY_CREATED });
                        }
                        else {
                            return resolve({ error: true, message: messages.KEY_NOT_FOUND });
                        }
                    });
            }
            catch (err) {
                return resolve({ error: true, message: err });
            }
        });
    }

    /**
     * Login method verifies the token.
     * @param token Token allocated at the time of login. (string)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public static verifyJWT(token: string): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                if (token) {
                    try {
                        let decode: any = jwt.verify(token, Config.jwt_secret);
                        return resolve({
                            error: false, data: {
                                found: true,
                                expired: false,
                                publickey: decode.publickey,
                                secret: decode.secret
                            }, message: messages.SUCCESSFULL
                        });
                    }
                    catch (err) {
                        return resolve({ error: true, message: err.message });
                    }
                }
                else {
                    return resolve({ error: true, message: messages.TOKEN_NOT_FOUND });
                }
            }
            catch (err) {
                return resolve({ error: true, message: err.message });
            }
        });
    }
}
