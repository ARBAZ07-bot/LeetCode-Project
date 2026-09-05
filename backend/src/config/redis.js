const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'table-scenic-pumice-79617.db.redis.io',
        port: 14962
    }
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

module.exports = redisClient;