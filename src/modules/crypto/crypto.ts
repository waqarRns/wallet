/*******************************************************************************
    Contain definition for Crypto which is used for  Encryption of Secret seed.

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import * as crypto from 'crypto';
import { Config } from '../../config/walletConfig';
import { messages } from '../enum/ResponseMessagesEnum';

/**
 * Encryption Algorithm defined in walletConfig.
 */
const algorithm = Config.algorithm;
/**
 * Encryption Secret defined in walletConfig.
 */
const secretKey: any = process.env.SECRET_KEY ? process.env.SECRET_KEY : Config.secretKey;
/**
 * Randomly generated initialization vector.
 */
const iv = crypto.randomBytes(16);

/**
 * This class is used for the Encryption and Decryption of User Secrets.
 */
export class Crypto {

    /**
     * This function is used for Encryption of secret.
     * @param text Secret Key for Encryption.
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public static encrypt(text: any) {
        return new Promise<Object>((resolve, reject) => {
            try {
                const cipher: crypto.Cipher = crypto.createCipheriv(algorithm, secretKey, iv);
                const encrypted: Buffer = Buffer.concat([cipher.update(text), cipher.final()]);
                return resolve({
                    error: false,
                    data: {
                        iv: iv.toString('hex'),
                        content: encrypted.toString('hex')
                    },
                    message: messages.SUCCESSFULL
                });
            }
            catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    };

    /**
     * This function is used for decryption of Secret.
     * @param hash Object of type {iv , content}
     * @returns Object - Case success: { error: false, data: { ... }, message: messages.SUCCESS }, Case error : { error: true, message: messages.UNKNOWN_ERROR }
     */
    public static decrypt(hash: any) {
        return new Promise<Object>((resolve, reject) => {
            try {
                const decipher: crypto.Decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
                const decrypted: Buffer = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
                return resolve({
                    error: false,
                    data: {
                        decryptedData: decrypted.toString(),
                    },
                    message: messages.SUCCESSFULL
                });
            }
            catch (err) {
                return resolve({ error: true, message: messages.UNKNOWN_ERROR });
            }
        });
    };
}
