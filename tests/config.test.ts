import * as wallet_lib from '../lib';
export let boa_client = new wallet_lib.BOAClient("http://localhost:5000", "http://localhost:2826");
export let invalid_boa_client = new wallet_lib.BOAClient("http://localhost:444/", "http://localhost:400/");
