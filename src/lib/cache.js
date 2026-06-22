const NodeCache = require('node-cache');

const msgRetryCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
const groupCache = new NodeCache({ stdTTL: 3600, checkperiod: 300 });
const userCache = new NodeCache({ stdTTL: 1800, checkperiod: 120 });
const antiSpamCache = new NodeCache({ stdTTL: 30, checkperiod: 10 });

module.exports = { msgRetryCache, groupCache, userCache, antiSpamCache };
