/*******************************************************************************
    Contain messages for boa-sdk

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/
export let messages = {
    SUCCESS: "Success",
    SUCCESSFULL: "Successfull",
    SUCCESSFULLY_GENERATED: "Successfully Generated",
    SUCCESSFULLY_CREATED: "Successfully Created",

    INSUFFICIENT_BALANCE: "Insufficient balance",
    TRANSACTION_SENT: "Transaction sent Successfully",
    RECORD_NOT_FOUND: "Record not found",
    UNKNOWN_ERROR: "Some thing went wrong",

    STOA_URL_NOT_FOUND: "Please set STOAURL",
    ERROR_IN_AXOIS_REQUEST: "Error occurred in axois request",
    UTXO_NOT_FOUND: "UTXO's not found on given address",
    ADDRESS_NOT_FOUND: "Address not found",

    INVALID_MNEMONICS: "This mnemonic is invalid",
    INVALID_KEY: "This key is not valid",
    INVALID_KEY_LENGTH: "Invalid Key length",
    INVALID_KEY_FORMAT: "This key is not valid",
    VALID_KEY: "Key is Valid",
    SECRET_VALID_KEY: "Secret Key is Valid",
    SECRET_VALID_NOT_KEY: "Invalid key against public key",
    KEY_NOT_FOUND: "Key not found",
    TOKEN_NOT_FOUND: "Token not found",
    ARRAY_LENGTH_ZERO: "Array length is zero",
    TRANSACTION_CREATED_SUCCESSFULLY: "Transaction created Successfully",
    FEE_CALCULATED_SUCCESSFULLY: "Transaction Fee Calculated Successfully",
    UNKNOWN_KEY_TYPE: "Unknown Secret key type",

    FROZEN_AMOUNT_EXCEEDED: "Amount you want to unfreeze is greater than total frozen amount of current account",
    REQUESTED_AMOUNT_ERROR: "Requested Amount should not be less than 0.5 BOA",
    TX_FEE_LIMIT_ERROR: "Transaction Fee must be equal or greater than 0",
    UNKNOWN_TYPE: "Unknown type to perform transaction",
    INSUFFICIENT_BALANCE_IN_ACCOUNT: "Insufficient balance in account: ",
};
