const Redis = require('ioredis');
const  { promisify } = require('util');

const redisClient = new Redis({
    host: 'localhost',
    port: 6379,
});

function getRedis(value: string) {
    const syncRedisGet = promisify(redisClient.get).bind(redisClient);
    return syncRedisGet(value);
}

function setRedis(key: string, value: string) {
    const syncRedisSet = promisify(redisClient.set).bind(redisClient);
    return syncRedisSet(key, value);
}


module.exports = redisClient, getRedis, setRedis;