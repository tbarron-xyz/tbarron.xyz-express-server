import redis from 'redis';
const redisclient = redis.createClient();

redisclient.on('ready', function () { console.log('redis connected') });
redisclient.on('error', function (err) { console.log('redis error:', err) });


/*
KEYS THIS CODE WANTS: (c=channel name)
'channels' (get: JSON)
'curUsers:'+c (get)
'curEmoteCountOverall' (hget, keyed by emote)
'curEmoteCountByChannel:'+e (hget, keyed by channel)
*/

const compare1 = (a, b) => b[1] - a[1];

export default class RedisWrapper {
    static getDataForJSON = function (callback, errCallback = (err) => { }, redisobj = redisclient) {
        redisobj.get('channels', function (err, res) {
            if (err) {
                errCallback(err);
                return;
            }
            let channels = JSON.parse(res);
            if (channels == null) { callback(null); } else {
                redisobj.hmget('curEmoteCountByChannel:Kappa', channels, function (err, res) {
                    if (err) {
                        errCallback(err);
                        return;
                    }
                    let curKappas = {};
                    for (let i in channels) {
                        curKappas[channels[i]] = parseInt(res[i]);
                    }
                    redisobj.mget(channels.map(i => 'curUsers:' + i), function (err, res) {
                        if (err) {
                            errCallback(err);
                            return;
                        }
                        let curUsers = {};
                        for (let i in channels) {
                            curUsers[channels[i]] = res[i];
                        }
                        let ret = [];   // [channel name, curKappas, per capita]
                        for (let i in curKappas) {
                            ret.push([i, curKappas[i] ? curKappas[i] : 0,
                                (curUsers[i] && curKappas[i] && curKappas[i] != '0') ? (curKappas[i] / curUsers[i] * 100) : 0]);    // '0' bool is true
                        }
                        ret.sort(compare1);
                        callback(ret);
                    });
                });
            }
        });
    };

    static getDataForByEmoteJSON = function (callback, errCallback = (err) => { }, redisobj = redisclient) {
        redisobj.hgetall('curEmoteCountOverall', function (err, res) { // res = {emotename: count}
            if (err) {
                errCallback(err);
                return;
            }
            if (res == null) { callback(null) } else {
                let ret = Object.keys(res).map(i => [i, parseInt(res[i])]);
                ret.sort(compare1);
                callback(ret);
            }
        });
    };

    static getDataForEmoteByChannelJSON = function (emote, callback, errCallback = (err) => { }, redisobj = redisclient) {

        redisobj.hgetall('curEmoteCountByChannel:' + emote, function (err, res) {  // res = {channel: count}
            if (err) {
                errCallback(err);
                return;
            }
            let ret = [];
            for (let i in res) {
                ret.push([i, parseInt(res[i])]);
            }
            ret.sort(compare1);
            callback(ret.slice(0, 25));
        });
    };
    
    static getDataForStatsJSON = function (callback, errCallback = (err) => { }, redisobj = redisclient) {
        redisclient.mget(['serverStartTime', 'emotes', 'channels', 'goVersion', 'messagesLast5Minutes', 'totalMessagesSinceStart', 'etcdata'], function (err, res) {
            if (err) {
                errCallback(err);
                return;
            }
            let startTime = parseInt(res[0]) || 0;
            let emoticons = JSON.parse(res[1]) || [];
            let channels = JSON.parse(res[2]) || [];
            let go_version = res[3];
            let messagesLast5Minutes = res[4];
            let totalMessagesSinceStart = res[5];
            let etcdata = res[6];
            // let [startTime,emoticons,channels] = res;
            const ret = {
                'uptime': Date.now() - startTime,
                // 'msgsInMemory': lastFiveMinutes.length,
                // 'msgsInDb':     msgCountInDB, 
                'emoticons': emoticons.length,
                'channels': channels,
                'node_version': process.version,
                'go_version': go_version,
                'messages_last_5_minutes': parseInt(messagesLast5Minutes),
                'total_messages_since_start': parseInt(totalMessagesSinceStart),
                'etcdata': etcdata,
                //			'threadno':	argv['threadno'] || 0,
            };
            callback(ret);
        });
    };
}