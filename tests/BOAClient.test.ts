import * as assert from 'assert';
import { boa_client, invalid_boa_client } from './config.test';
import * as boasdk from 'boa-sdk-ts';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleNetworkError } from 'boa-sdk-ts';
import bodyParser from 'body-parser';
import express from 'express';
import * as http from 'http';

/**
 * Sample UTXOs
 */
let sample_address = "boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt";
let sample_address1 = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
let sample_txHash = "0xc2fed6fe6e445328bf363bb2725c23593b5ac43f0e0cd456f22bab77ef7b81a2661b9a07308a909047acf2b886522a50d7dd9195072de2272509963aeec34e52";
let sample_txHash1 = "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814";
let sample_txHash2 = "0x63341a4502434e2c89d0f4e46cb9cbd27dfa8a6d244685bb5eb6635d634b2179b49108e949f176906a13b8685254b1098ebf1adf44033f5c9dd6b4362c14b020";

let sample_utxo =
    [
        {
            "utxo": "0x6d85d61fd9d7bb663349ca028bd023ad1bd8fa65c68b4b1363a9c7406b4d663fd73fd386195ba2389100b5cd5fc06b440f053fe513f739844e2d72df302e8ad0",
            "type": 0,
            "height": "0",
            "time": 1577836800000,
            "unlock_height": "1",
            "amount": "6100000000"
        },
        {
            "utxo": "0xc3780f9907a97c20a2955945544e7732a60702c32d81e016bdf1ea172b7b7fb96e9a4164176663a146615307aaadfbbad77e615a7c792a89191e85471120d314",
            "type": 0,
            "height": "5",
            "time": 1577839800000,
            "unlock_height": "6",
            "amount": "200000"
        },
        {
            "utxo": "0xcfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2",
            "type": 1,
            "height": "8",
            "time": 1577841600000,
            "unlock_height": "9",
            "amount": "200000"
        }
    ];

let sample_utxo1 =
    [
        {
            "utxo": "0x37e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b",
            "type": 1,
            "height": "8",
            "time": 1577841600000,
            "unlock_height": "9",
            "amount": "200000"
        }
    ];

let sample_transaction_history =
    [
        {
            "display_tx_type": "inbound",
            "address": 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt',
            "peer": 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d',
            "peer_count": 1,
            "height": "9",
            "tx_hash": "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814",
            "tx_type": "payment",
            "amount": "610000000000000",
            "unlock_height": "10"
        },
        {
            "display_tx_type": "inbound",
            "address": 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt',
            "peer": 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d',
            "peer_count": 1,
            "height": "9",
            "tx_hash": "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814",
            "tx_type": "payment",
            "amount": "610000000000000",
            "unlock_height": "10"
        },
        {
            "display_tx_type": "inbound",
            "address": 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt',
            "peer": 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d',
            "peer_count": 1,
            "height": "9",
            "tx_hash": "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814",
            "tx_type": "payment",
            "amount": "610000000000000",
            "unlock_height": "10"
        },
        {
            "display_tx_type": "inbound",
            "address": 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt',
            "peer": 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d',
            "peer_count": 1,
            "height": "9",
            "tx_hash": "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814",
            "tx_type": "freeze",
            "amount": "200000",
            "unlock_height": "10"
        }
    ];

let sample_transaction_history1 =
    [
        {
            "display_tx_type": "inbound",
            "address": 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d',
            "peer": 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d',
            "peer_count": 1,
            "height": "9",
            "tx_hash": "0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814",
            "tx_type": "freeze",
            "amount": "200000",
            "unlock_height": "10"
        }
    ];

let sample_tx_overview = {
    "height": '9',
    "time": 1601553600,
    "tx_hash": '0xc2fed6fe6e445328bf363bb2725c23593b5ac43f0e0cd456f22bab77ef7b81a2661b9a07308a909047acf2b886522a50d7dd9195072de2272509963aeec34e52',
    "tx_type": "payment",
    "unlock_height": '10',
    "unlock_time": 1601554200,
    "payload": '0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff',
    "senders": [
        {
            "address": 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt',
            "amount": 610000000000000,
            "utxo": '0xb0383981111438cf154c7725293009d53462c66d641f76506400f64f55f9cb2e253dafb37af9fafd8b0031e6b9789f96a3a4be06b3a15fa592828ec7f8c489cc'
        }
    ],
    "receivers": [
        {
            "address": 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d',
            "amount": 610000000000000,
            "utxo": '0xefed6c1701d1195524d469a3bbb058492a7922ff98e7284a01f14c0a32c31814f4ed0d6666aaf7071ae0f1eb615920173f13a63c8774aa5955a3af77c51e55e9'
        }
    ],
    "fee": '0'
};

let sample_tx_overview1 = {
    "height": '9',
    "time": 1601553600,
    "tx_hash": '0xf3a013153900f6416af03efc855df3880e3927fff386b3635bf46cd6e2c54769f88bd24128b6b935ab95af803cc41412fe9079b4ed7684538d86840115838814',
    "tx_type": "payment",
    "unlock_height": '10',
    "unlock_time": 1601554200,
    "payload": '0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff',
    "senders": [
        {
            "address": 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt',
            "amount": 20000,
            "utxo": '0xcfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2'
        }
    ],
    "receivers": [
        {
            "address": 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d',
            "amount": 20000,
            "utxo": '0x37e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b'
        }
    ],
    "fee": '0'
};

let sample_tx_overview2 = {
    "height": '9',
    "time": 1601553600,
    "tx_hash": '0x63341a4502434e2c89d0f4e46cb9cbd27dfa8a6d244685bb5eb6635d634b2179b49108e949f176906a13b8685254b1098ebf1adf44033f5c9dd6b4362c14b020',
    "tx_type": "payment",
    "unlock_height": '10',
    "unlock_time": 1601554200,
    "payload": '',
    "senders": [
        {
            "address": 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt',
            "amount": 20000,
            "utxo": '0xcfa89b7a9cd48fddc16cdcbbf0ffa7a9fd14d89c96bc3da0151db0bd7e453fe031f8a1e4d575a299c16942d9c96fbafff2497332bc48532aa7e0acf6122be0e2'
        }
    ],
    "receivers": [
        {
            "address": 'boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d',
            "amount": 20000,
            "utxo": '0x37e17420b4bfd8be693475fbbe8b53bb80904dd3e45f3080c0d0b912b004324a27693559d884b943830f6a21b05c69061f453e8b9f03d56f3b6fd5b0c6fc2f8b'
        }
    ],
    "fee": '0'
};

let sample_pending_transaction = [{
    "tx_hash": '0xc2fed6fe6e445328bf363bb2725c23593b5ac43f0e0cd456f22bab77ef7b81a2661b9a07308a909047acf2b886522a50d7dd9195072de2272509963aeec34e52',
    "address": 'boa1xrxydyju2h8l3sfytnwd3l8j4gj4jsa0wj4pykt37yyggtl686ugy5wj2yt',
    "amount": 610000000000000,
    "fee": '0',
    "submission_time": 1596152600
}];

let sample_block_header = {
    "height": "0",
    "hash": "0x5a96a9276526cdf9a52e100ed59a24ca5e5d3940db85b1080c66573877a86be8534937aece796354bcee3d6cee0895553e82d53f7dbaec9a3d9e0f578ba98163", "merkle_root": "0xb12632add7615e2c4203f5ec5747c26e4fc7f333f95333ddfa4121a66b84499d35e5ce022ab667791549654b97a26e86054b0764ec23ee0cd3830de8f3f73364",
    "time_stamp": 1596153600
};

let sample_pending_transaction_overview = {
    "type": 0,
    "inputs": [
        {
            "utxo": "0x831e492f4401df05832b5958e54a7d248b69b7366e1e5723e36da97559a8213ac313ac32526001e4ae72f83f3bb7553d616049838b91f31be1daeab935eee82e",
            "unlock": {
                "bytes": "wIfYJe+CcV2OTtmubkl0AFqxH8NKYw/CenZgU7/TRxxNC5XuYEc8N+GIdSzp79lsOI6dqrtMlHvf7nfSyWIrAA=="
            },
            "unlock_age": 0
        }
    ],
    "outputs": [
        {
            "value": "1663400000",
            "lock": {
                "type": 0,
                "bytes": "nMY5oTUvd/IlFgxC/4kaavpbRqEaaalJIIbXeAZ29Co="
            }
        },
        {
            "value": "24398336600000",
            "lock": {
                "type": 0,
                "bytes": "0D1r5Jne5i4rQeo0ybJNVjlwfANw6h7vYbVrEy3qXc8="
            }
        }
    ],
    "payload": "0x000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f404142434445464748494a4b4c4d4e4f505152535455565758595a5b5c5d5e5f606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecfd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeeff0f1f2f3f4f5f6f7f8f9fafbfcfdfeff",
    "lock_height": "0"
};


/**
 * This is a client for testing.
 * Test codes can easily access error messages received from the server.
 */
export class TestClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create();
    }

    public get(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse> {
        return new Promise<AxiosResponse>((resolve, reject) => {
            this.client.get(url, config)
                .then((response: AxiosResponse) => {
                    resolve(response);
                })
                .catch((reason: any) => {
                    reject(handleNetworkError(reason));
                });
        });
    }
}

/**
 * This allows data transfer and reception testing with the server.
 * When this is executed, the local web server is run,
 * the test codes are performed, and the web server is shut down.
 */
export class TestStoa {
    /**
     * The bind port
     */
    private readonly port: number;

    /**
     * The application of express module
     */
    protected app: express.Application;

    /**
     * The Http server
     */
    protected server: http.Server | null = null;

    /**
     * Constructor
     * @param port The bind port
     */
    constructor(port: number | string) {
        if (typeof port == "string")
            this.port = parseInt(port, 10);
        else
            this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start(): Promise<void> {

        // http://localhost/utxo
        this.app.get("/utxo/:address",
            (req: express.Request, res: express.Response) => {
                let address: boasdk.PublicKey = new boasdk.PublicKey(req.params.address);

                if (sample_address == address.toString()) {
                    res.status(200).send(JSON.stringify(sample_utxo));
                    return;
                }
                else if (sample_address1 == address.toString()) {
                    res.status(200).send(JSON.stringify(sample_utxo1));
                    return;
                }
                res.status(400).send();
            });

        // http://localhost/wallet/blocks/header
        this.app.get("/wallet/blocks/header",
            (req: express.Request, res: express.Response) => {
                res.status(200).send(JSON.stringify(sample_block_header));
                return;
            });

        // http://localhost/wallet/transactions/history/:address
        this.app.get("/wallet/transactions/history/:address",
            (req: express.Request, res: express.Response) => {
                let address: boasdk.PublicKey = new boasdk.PublicKey(req.params.address);
                if (sample_address == address.toString()) {
                    res.status(200).send(JSON.stringify(sample_transaction_history));
                    return;
                }
                else if (sample_address1 === address.toString()) {
                    res.status(200).send(JSON.stringify(sample_transaction_history1));
                    return;
                }
                else if (sample_address !== address.toString()) {
                    res.status(204).send('No Content');
                    return;
                }
                res.status(400).send();
            });

        // http://localhost/wallet/transaction/overview/:txHash
        this.app.get("/wallet/transaction/overview/:txHash",
            (req: express.Request, res: express.Response) => {
                let txHash: boasdk.Hash = new boasdk.Hash(req.params.txHash);

                if (sample_txHash == txHash.toString()) {
                    res.status(200).send(JSON.stringify(sample_tx_overview));
                    return;
                }
                else if (sample_txHash1 == txHash.toString()) {
                    res.status(200).send(JSON.stringify(sample_tx_overview1));
                    return;
                }
                else if (sample_txHash2 == txHash.toString()) {
                    res.status(200).send(JSON.stringify(sample_tx_overview2));
                    return;
                }
                else if (sample_txHash !== txHash.toString()) {
                    res.status(204).send('No Content');
                    return;
                }
                res.status(400).send();

            });

        // http://localhost/wallet/transactions/pending/:address
        this.app.get("/wallet/transactions/pending/:address",
            (req: express.Request, res: express.Response) => {
                let address: boasdk.PublicKey = new boasdk.PublicKey(req.params.address);

                if (sample_address == address.toString()) {
                    res.status(200).send(JSON.stringify(sample_pending_transaction));
                    return;
                }
                else if (sample_address !== address.toString()) {
                    res.status(204).send('No Content');
                    return;
                }
                res.status(400).send();
            });

        // http://localhost/transaction/pending/:txHash
        this.app.get("/transaction/pending/:txHash",
            (req: express.Request, res: express.Response) => {
                let txHash: boasdk.Hash = new boasdk.Hash(req.params.txHash);
                if (sample_txHash == txHash.toString()) {
                    res.status(200).send(JSON.stringify(sample_pending_transaction_overview));
                    return;
                }
                else if (sample_txHash !== txHash.toString()) {
                    res.status(204).send('No Content');
                    return;
                }
                res.status(400).send();
            });

        // http://localhost/transaction/pending/:txHash
        this.app.get("/transaction/fees/:tx_size",
            (req: express.Request, res: express.Response) => {
                let size: number = Number(req.params.tx_size);
                let tx_size = boasdk.JSBI.BigInt(size);
                let factor = boasdk.JSBI.BigInt(200);
                let minimum = boasdk.JSBI.BigInt(100_000);     // 0.01BOA
                let medium = boasdk.JSBI.multiply(tx_size, factor);
                if (boasdk.JSBI.lessThan(medium, minimum))
                    medium = boasdk.JSBI.BigInt(minimum);

                let width = boasdk.JSBI.divide(medium, boasdk.JSBI.BigInt(10));
                let high = boasdk.JSBI.add(medium, width);
                let low = boasdk.JSBI.subtract(medium, width);
                if (boasdk.JSBI.lessThan(low, minimum))
                    low = boasdk.JSBI.BigInt(minimum);

                let data: any = {
                    tx_size: boasdk.JSBI.toNumber(tx_size),
                    high: high.toString(),
                    medium: medium.toString(),
                    low: low.toString()
                };
                if (size) {
                    res.status(200).send(JSON.stringify(data));
                    return;
                }
                res.status(400).send();
            });

        // http://localhost/block_height
        this.app.get("/block_height",
            (req: express.Request, res: express.Response) => {
                res.status(200).send("10");
            });

        this.app.set('port', this.port);

        // Listen on provided this.port on this.address.
        return new Promise<void>((resolve, reject) => {
            // Create HTTP server.
            this.server = http.createServer(this.app);
            this.server.on('error', reject);
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.server != null)
                this.server.close((err?) => {
                    err === undefined ? resolve() : reject(err);
                });
            else
                resolve();
        });
    }
}


/**
 * This is an Agora node for testing.
 * The test code allows the Agora node to be started and shut down.
 */
export class TestAgora {
    /**
     * The bind port
     */
    private readonly port: number;

    /**
     * The application of express module
     */
    protected app: express.Application;

    /**
     * The Http server
     */
    protected server: http.Server | null = null;

    /**
     * Constructor
     * @param port The bind port
     */
    constructor(port: number | string) {
        if (typeof port == "string")
            this.port = parseInt(port, 10);
        else
            this.port = port;

        this.app = express();
    }

    /**
     * Start the web server
     */
    public start(): Promise<void> {
        // parse application/x-www-form-urlencoded
        this.app.use(bodyParser.urlencoded({ extended: false }))
        // parse application/json
        this.app.use(bodyParser.json())

        this.app.put("/transaction",
            (req: express.Request, res: express.Response) => {
                if (req.body.tx === undefined) {
                    res.status(400).send("Missing 'tx' object in body");
                    return;
                }
                res.status(200).send();
            });

        this.app.set('port', this.port);

        // Listen on provided this.port on this.address.
        return new Promise<void>((resolve, reject) => {
            // Create HTTP server.
            this.server = http.createServer(this.app);
            this.server.on('error', reject);
            this.server.listen(this.port, () => {
                resolve();
            });
        });
    }

    public stop(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this.server != null)
                this.server.close((err?) => {
                    err === undefined ? resolve() : reject(err);
                });
            else
                resolve();
        });
    }
}

describe('BOA Client', () => {
    let stoa_server: TestStoa;
    let agora_server: TestAgora;
    let stoa_port: string = '5000';
    let agora_port: string = '2826';

    before('Wait for the package libsodium to finish loading', async () => {
        await boasdk.SodiumHelper.init();
    });

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

    describe('Get data fee', () => {
        it("Get data fee", async () => {
            let data = "Bosagora testing";
            let fee = boasdk.JSBI.BigInt(800000);
            let result: any = await boa_client.calculateDataFee(data);
            assert.strictEqual(result.error, false);
            assert.ok(boasdk.JSBI.EQ(result.data.fee, fee));
        });
    });

    describe('Create transaction', () => {
        it("Create payment transfer transaction", async () => {
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = "SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR";
            let result: any = await boa_client.createTransaction(receiver, requestedAmount, senderKey, boasdk.JSBI.BigInt(0), false);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.message, "Transaction created Successfully");
            assert.ok(result.data);
        });

        it("Create payment transfer transaction by passing encrypted sender key", async () => {
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = {
                iv: '346bce7f27f86b3775e3833393a8f16d',
                content: '2afe6523c4c7b8b1fb3ae9a5bb4f3a96c787e9f6dcdf2792ae06505beddc0f2bf729d432a9f1b36bbd35f693aad3999ed74b262b67d900c9'
            };
            let result: any = await boa_client.createTransaction(receiver, requestedAmount, senderKey, boasdk.JSBI.BigInt(0), false);
            assert.strictEqual(result.error, false);
            assert.strictEqual(result.message, "Transaction created Successfully");
            assert.ok(result.data);
        });

        it("Create payment transfer transaction for amount less than 0.5", async () => {
            let requestedAmount = boasdk.JSBI.BigInt(0);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = "SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR";
            let result: any = await boa_client.createTransaction(receiver, requestedAmount, senderKey, boasdk.JSBI.BigInt(0), false);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, "Requested Amount should not be less than 0.5 BOA");
        });

        it("Create payment transfer transaction for txFee less than 0", async () => {
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = "SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR";
            let result: any = await boa_client.createTransaction(receiver, requestedAmount, senderKey, boasdk.JSBI.BigInt(-1), false);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, "Transaction Fee must be equal or greater than 0");
        });

        it("Create payment transfer transaction for account having no balance", async () => {
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = "SAVTYXSBHWHSQDCNP3UAVK5WO6PZBYTDWI3FUVPT3O6H4OAW3U4QDWRI";
            let senderPublicKey = "boa1xrqddytrj9agugde9uzgy0fv8nrljd0uxam75rpufndacmz84luljjdsxza";
            let result: any = await boa_client.createTransaction(receiver, requestedAmount, senderKey, boasdk.JSBI.BigInt(0), false);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, `Insufficient balance in account: ${senderPublicKey}`);
        });

        it("Create payment transfer transaction by hitting wrong URL", async () => {
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = "SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR";
            let result: any = await invalid_boa_client.createTransaction(receiver, requestedAmount, senderKey, boasdk.JSBI.BigInt(0), false);
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, "Error occurred in axois request");
        });
    });

    describe('Create a save data transaction', () => {
        it("Create save data transaction", async () => {
            let data = "Bosagora testing";
            let fee = boasdk.JSBI.BigInt(400000);
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = "SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR";
            let result: any = await boa_client.createData(receiver, requestedAmount, senderKey, data, fee, boasdk.JSBI.BigInt(0));
            assert.strictEqual(result.error, false);
            assert.ok(result.data);
        });

        it("Create save data transaction  by passing encrypted secret sender key", async () => {
            let data = "Bosagora testing";
            let fee = boasdk.JSBI.BigInt(400000);
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = {
                iv: '346bce7f27f86b3775e3833393a8f16d',
                content: '2afe6523c4c7b8b1fb3ae9a5bb4f3a96c787e9f6dcdf2792ae06505beddc0f2bf729d432a9f1b36bbd35f693aad3999ed74b262b67d900c9'
            };
            let result: any = await boa_client.createData(receiver, requestedAmount, senderKey, data, fee, boasdk.JSBI.BigInt(0));
            assert.strictEqual(result.error, false);
            assert.ok(result.data);
        });

        it("Create save data transaction for amount 0", async () => {
            let data = "Bosagora testing";
            let fee = boasdk.JSBI.BigInt(0);
            let requestedAmount = boasdk.JSBI.BigInt(0);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = "SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR";
            let result: any = await boa_client.createData(receiver, requestedAmount, senderKey, data, fee, boasdk.JSBI.BigInt(0));
            assert.strictEqual(result.error, true);
            assert.ok(result.message, "Requested Amount should not be less than 0.5 BOA");
        });

        it("Create save data transaction for amount 0", async () => {
            let data = "Bosagora testing";
            let fee = boasdk.JSBI.BigInt(0);
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = "SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR";
            let result: any = await boa_client.createData(receiver, requestedAmount, senderKey, data, fee, boasdk.JSBI.BigInt(-1));
            assert.strictEqual(result.error, true);
            assert.ok(result.message, "Transaction Fee must be equal or greater than 0");
        });

        it("Create save data transaction on hitting wrong URL", async () => {
            let data = "Bosagora testing";
            let fee = boasdk.JSBI.BigInt(800000);
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = "SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR";
            let result: any = await invalid_boa_client.createData(receiver, requestedAmount, senderKey, data, fee, boasdk.JSBI.BigInt(0));
            assert.strictEqual(result.error, true);
            assert.strictEqual(result.message, "Error occurred in axois request");
        });
    });

    describe('Send transaction to Agora', () => {
        let createTx: any;
        before("Create a transaction", async () => {
            let requestedAmount = boasdk.JSBI.BigInt(30000);
            let receiver = "boa1xpess3t9us5xen526edlsdd29gfq4rq9wsj3taf8797scktsf2y9glkcp0d";
            let senderKey = "SA4SEDSUCKXWKQDZWXKE4F4UWQDQS2PNTNHKDPY3MGBNCLGK6XIA3CDR";
            createTx = await boa_client.createTransaction(receiver, requestedAmount, senderKey, boasdk.JSBI.BigInt(0), false);
        });

        it("Send payment transfer transaction", async () => {
            let sendTx: any = await boa_client.sendToAgora(createTx.data.transaction, createTx.data.txHash);
            assert.strictEqual(sendTx.error, false);
            assert.ok(sendTx.data);
        });

        it("Send payment transfer transaction on wrong URL", async () => {
            let sendTx: any = await invalid_boa_client.sendToAgora(createTx.data.transaction, createTx.data.txHash);
            assert.strictEqual(sendTx.error, true);
            assert.ok(sendTx.message, "Error occurred in axois request");
        });
    });
});
