/*******************************************************************************
    Contain defination of KeyPair Class

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/
import * as boasdk from 'boa-sdk-ts';
import { messages } from '../enum/ResponseMessagesEnum';
import * as bip39 from "bip39";

/**
 * This class is used for the generation of creditionals for new user
 */
export class KeyPair {
    /**
     * The public key
     */
    public address: boasdk.PublicKey;

    /**
     * The secret key
     */
    public secret: boasdk.SecretKey;

    /**
     * Constructor
     * @param address The instance of PublicKey
     * @param secret  The instance of SecretKey
     * @param seed    The instance of Seed
     */
    constructor(address: boasdk.PublicKey, secret: boasdk.SecretKey) {
        this.address = address;
        this.secret = secret;
    }

    /**
     * generate Fresh mnemonic
     * @param language Language in which mnemonic should be generated.
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public static getMnemonics(language: string): Promise<Object> {
        return new Promise((resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        try {
                            bip39.setDefaultWordlist(language)
                            let mnemonic: string = bip39.generateMnemonic();
                            return resolve({ error: false, data: { mnemonic: mnemonic }, message: messages.SUCCESSFULLY_GENERATED });
                        }
                        catch (err) {
                            return resolve({ error: true, message: err.message });
                        }
                    });
            }
            catch (err) {
                return resolve({ error: true, message: err });
            }
        });
    }

    /**
     * Return secret seed and public key from mnemonic
     * @param mnemonic  Generated mnemonic from getMnemonics() method. (string)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public static fromMnemonic(mnemonic: string): Promise<Object> {
        return new Promise((resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        const seed: Buffer = await bip39.mnemonicToSeed(mnemonic);
                        const c1: Buffer = seed.slice(0, 32);
                        const c2: Buffer = seed.slice(32, 64);
                        const c: Buffer = boasdk.SodiumHelper.sodium.crypto_core_ed25519_scalar_mul(c1, c2)
                        const bosagoraKeyPair: boasdk.KeyPair = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(Buffer.from(c)));
                        const keys: object = {
                            secretkey: bosagoraKeyPair.secret.toString(false),
                            publickey: bosagoraKeyPair.address.toString(),
                        };
                        return resolve({ error: false, data: keys, message: messages.SUCCESSFULLY_GENERATED });
                    });
            }
            catch (err) {
                return resolve({ error: true, message: err });
            }
        });
    }

    /**
     * This function recover keys from mnemonic.
     * @param mnemonic : Previously generated mnemonic using `getMnemonics()` method from which keys will be recovered.
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public static recoverKeys(mnemonic: string) {
        return new Promise((resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        try {
                            let mnemonicWords: Array<string> = mnemonic.split(' ');
                            if (mnemonicWords.length != 12) {
                                return resolve({ error: true, message: messages.INVALID_MNEMONICS });
                            }
                            mnemonicWords.forEach(element => {
                                if (element.length < 3) {
                                    return resolve({ error: true, message: messages.INVALID_MNEMONICS });
                                }
                            });
                            const seed: Buffer = await bip39.mnemonicToSeed(mnemonic);
                            const c1: Buffer = seed.slice(0, 32);
                            const c2: Buffer = seed.slice(32, 64);
                            const c: Buffer = boasdk.SodiumHelper.sodium.crypto_core_ed25519_scalar_mul(c1, c2)
                            const bosagoraKeyPair: boasdk.KeyPair = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(Buffer.from(c)));
                            const keys: object = {
                                secretkey: bosagoraKeyPair.secret.toString(false),
                                publickey: bosagoraKeyPair.address.toString(),
                            };
                            return resolve({ error: false, data: keys, message: messages.SUCCESSFULLY_GENERATED });
                        }
                        catch (err) {
                            return resolve({ error: true, message: err.message });
                        }
                    });
            }
            catch (err) {
                return resolve({ error: true, message: err });
            }
        });

    }

    /**
     * Get the result of public key for verification
     * @param publicKey Public key of type boasdk.PublicKey. (string)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public static validPublickey(publicKey: string): Promise<Object> {
        return new Promise<object>((resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        try {
                            let keyTrim: string = publicKey.trim();
                            if (keyTrim.length != 63) {
                                return resolve({ error: true, message: messages.INVALID_KEY_LENGTH });
                            }

                            if (keyTrim[0] != 'b') {
                                return resolve({ error: true, message: messages.INVALID_KEY_FORMAT });
                            }

                            new boasdk.PublicKey(keyTrim);
                            return resolve({ error: false, data: messages.VALID_KEY, message: messages.VALID_KEY });
                        }
                        catch (err) {
                            return resolve({ error: true, message: messages.INVALID_KEY });
                        }
                    });
            }
            catch (err) {
                return resolve({ error: true, message: err });
            }
        });
    }

    /**
     * Get public key against secret seed
     * @param secretkey Secret key of type boasdk.SecretKey. (string)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public static getPublicKey(secretkey: string): Promise<Object> {
        return new Promise<object>((resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        try {
                            let validateKey: any = await this.validSecretkey(secretkey);
                            if (validateKey.error == true) {
                                return resolve(validateKey);
                            }

                            let keyPair: boasdk.KeyPair = await boasdk.KeyPair.fromSeed(new boasdk.SecretKey(secretkey));
                            return resolve({ error: false, data: { publicKey: keyPair.address.toString() }, message: messages.VALID_KEY });
                        }
                        catch (err) {
                            return resolve({ error: true, message: messages.INVALID_KEY });
                        }
                    });
            }
            catch (err) {
                return resolve({ error: true, message: err });
            }
        });
    }

    /**
     * Check secret key validation
     * @param secretKey Secret key of type boasdk.SecretKey. (string)
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public static validSecretkey(secretKey: string): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        try {
                            let keyTrim = secretKey.trim();
                            if (keyTrim.length != 56) {
                                return resolve({ error: true, message: messages.INVALID_KEY_LENGTH });
                            }

                            if (keyTrim[0] != 'S') {
                                return resolve({ error: true, message: messages.INVALID_KEY_FORMAT });
                            }
                            new boasdk.SecretKey(keyTrim);
                            return resolve({ error: false, data: messages.VALID_KEY, message: messages.VALID_KEY });
                        }
                        catch (err) {
                            return resolve({ error: true, message: messages.INVALID_KEY });
                        }
                    });
            }
            catch (err) {
                return resolve({ error: true, message: err });
            }
        });
    }

    /**
     * This function validates secret key against public key
     * @param secretKey Instance of secret key. (string)
     * @param publickey Instance of secret key. (string)
     */
    public static validateSecretAgainstPublickey(secretKey: string, publickey: string): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            try {
                boasdk.SodiumHelper.init()
                    .then(async () => {
                        try {
                            let validPubkey: any = await KeyPair.validPublickey(publickey);
                            let validSeckey: any = await KeyPair.validSecretkey(secretKey);
                            if (validPubkey.error || validSeckey.error) {
                                return resolve({ error: true, message: messages.INVALID_KEY });
                            }

                            const bosagoraKeyPair: boasdk.KeyPair = boasdk.KeyPair.fromSeed(new boasdk.SecretKey(secretKey));
                            let generatedPublickey: string = bosagoraKeyPair.address.toString();
                            if (generatedPublickey === publickey) {
                                return resolve({ error: false, data: messages.SECRET_VALID_KEY, message: messages.SECRET_VALID_KEY });
                            }
                            else
                                return resolve({ error: true, message: messages.SECRET_VALID_NOT_KEY });
                        }
                        catch (err) {
                            return resolve({ error: true, message: messages.UNKNOWN_ERROR });
                        }
                    });
            }
            catch (err) {
                return resolve({ error: true, message: err });
            }
        });
    }
}
