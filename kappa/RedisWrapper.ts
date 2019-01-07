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

const compare1 = (a: [any, number] | [any, number, any], b: [any, number] | [any, number, any]) => b[1] - a[1];

export default class RedisWrapper {
    static getDataForJSON = (
        callback: (data: [string, number, number][]) => void,
        errCallback = (err: Error) => { },
        redisobj = redisclient
    ) => {
        redisobj.get('channels', (err, res) => {
            if (err) {
                errCallback(err);
                return;
            }
            let channels = JSON.parse(res) as string[];
            if (channels == null) { callback(null); } else {
                redisobj.hmget('curEmoteCountByChannel:Kappa', channels, (err, res) => {
                    if (err) {
                        errCallback(err);
                        return;
                    }
                    let currentKappas: { [key: string]: number } = {};
                    for (let i in channels) {
                        currentKappas[channels[i]] = parseInt(res[i]);
                    }
                    redisobj.mget(channels.map(i => 'curUsers:' + i), (err, res) => {
                        if (err) {
                            errCallback(err);
                            return;
                        }
                        let curUsers: { [key: string]: number } = {};
                        for (let i in channels) {
                            curUsers[channels[i]] = parseInt(res[i]);
                        }
                        let ret: [string, number, number][] = [];   // [channel name, curKappas, per capita]
                        for (let i in currentKappas) {
                            ret.push([i,
                                currentKappas[i] ? currentKappas[i] : 0,
                                (curUsers[i] && currentKappas[i] && currentKappas[i] != 0) ?
                                    (currentKappas[i] / curUsers[i] * 100) :
                                    0]);    // '0' bool is true
                        }
                        ret.sort(compare1);
                        callback(ret);
                    });
                });
            }
        });
    };

    static getDataForByEmoteJSON = function (
        callback: (data: [string, number][]) => void,
        errCallback = (err: Error) => { },
        redisobj = redisclient
    ) {
        redisobj.hgetall('curEmoteCountOverall', function (err, res) { // res = {emotename: count}
            if (err) {
                errCallback(err);
                return;
            }
            if (res == null) { callback(null) } else {
                let ret = Object.keys(res).map(i => [i, parseInt(res[i])] as [string, number]);
                ret.sort(compare1);
                callback(ret);
            }
        });
    };

    static getDataForEmoteByChannelJSON = function (emote: string, callback: (data: [string, number][]) => void, errCallback = (err: Error) => { }, redisobj = redisclient) {

        redisobj.hgetall('curEmoteCountByChannel:' + emote, function (err, res) {  // res = {channel: count}
            if (err) {
                errCallback(err);
                return;
            }
            let ret = [];
            for (let i in res) {
                ret.push([i, parseInt(res[i])] as [string, number]);
            }
            ret.sort(compare1);
            callback(ret.slice(0, 25));
        });
    };



    static getDataForStatsJSON = function (callback: (data: StatsJSON) => void, errCallback = (err: Error) => { }, redisobj = redisclient) {
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
            } as StatsJSON;
            callback(ret);
        });
    };
}

interface StatsJSON {
    'uptime': number,
    // 'msgsInMemory': lastFiveMinutes.length,
    // 'msgsInDb':     msgCountInDB, 
    'emoticons': number,
    'channels': string[],
    'node_version': string,
    'go_version': string,
    'messages_last_5_minutes': number,
    'total_messages_since_start': number,
    'etcdata': string,
    //			'threadno':	argv['threadno'] || 0,
};