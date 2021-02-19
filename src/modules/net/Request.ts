/*******************************************************************************

    Contains instances of requesting data from the server

    Copyright:
        Copyright (c) 2020 BOS Platform Foundation Korea
        All rights reserved.

    License:
        MIT License. See LICENSE for details.

*******************************************************************************/

import axios from 'axios';

/**
 * @ignore
 */
const version = require('../../../package.json').version;
axios.defaults.adapter = require('axios/lib/adapters/http');

export const Request = axios.create({
    headers: {
        "X-Client-Name": "boa-sdk",
        "X-Client-Version": version,
    }
});
