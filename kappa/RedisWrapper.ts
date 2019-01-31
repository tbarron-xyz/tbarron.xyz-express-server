import redis from 'redis';
const redisclient = redis.createClient();

redisclient.on('ready', () => { console.log('redis connected') });
redisclient.on('error', (err) => { console.log('redis error:', err) });


/*
KEYS THIS CODE WANTS: (c=channel name)
'channels' (get: JSON)
'curUsers:'+c (get)
'curEmoteCountOverall' (hget, keyed by emote)
'curEmoteCountByChannel:'+e (hget, keyed by channel)
*/

const compare1 = (a: [any, number] | [any, number, any], b: [any, number] | [any, number, any]) => b[1] - a[1];

export default class RedisWrapper {
    static async getDataForJSON(redisobj = redisclient): Promise<[string, number, number][]> {
        return new Promise((resolve, reject) => {
            redisobj.get('channels', (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                let channels = JSON.parse(res) as string[];
                if (channels == null) { resolve(null); } else {
                    redisobj.hmget('curEmoteCountByChannel:Kappa', channels, (err, res) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        let currentKappas: { [key: string]: number } = {};
                        for (let i in channels) {
                            currentKappas[channels[i]] = parseInt(res[i]);
                        }
                        redisobj.mget(channels.map(i => 'curUsers:' + i), (err, res) => {
                            if (err) {
                                reject(err);
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
                            resolve(ret);
                        });
                    });
                }
            });
        });
    };

    static async getDataForByEmoteJSON(redisobj = redisclient): Promise<[string, number][]> {
        return new Promise((resolve, reject) => {
            redisobj.hgetall('curEmoteCountOverall', (err, res) => { // res = {emotename: count}
                if (err) {
                    reject(err);
                    return;
                }
                if (res == null) {
                    resolve(null);
                } else {
                    let ret = Object.keys(res).map(i => [i, parseInt(res[i])] as [string, number]);
                    ret.sort(compare1);
                    resolve(ret);
                }
            });
        });
    };

    static async getDataForEmoteByChannelJSON(emote: string, redisobj = redisclient): Promise<[string, number][]> {
        return new Promise((resolve, reject) => {
            redisobj.hgetall('curEmoteCountByChannel:' + emote, (err, res) => {  // res = {channel: count}
                if (err) {
                    reject(err);
                    return;
                }
                let ret = [];
                for (let i in res) {
                    ret.push([i, parseInt(res[i])] as [string, number]);
                }
                ret.sort(compare1);
                resolve(ret.slice(0, 25));
            });
        })
    };



    static async getDataForStatsJSON(redisobj = redisclient): Promise<StatsJSON> {
        return new Promise((resolve, reject) => {
            redisclient.mget(['serverStartTime', 'emotes', 'channels', 'goVersion', 'messagesLast5Minutes', 'totalMessagesSinceStart', 'etcdata'], (err, res) => {
                if (err) {
                    reject(err);
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
                resolve(ret);
            });
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