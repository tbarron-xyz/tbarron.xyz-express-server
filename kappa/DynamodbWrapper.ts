

import AWS from "aws-sdk";

AWS.config.update({
    region: "us-east-1"
});

class emoteData {
    x: number[]
    y: number[]
    name: string
};

export default class DynamodbWrapper {
    private docClient: AWS.DynamoDB.DocumentClient;

    constructor() {
        this.docClient = new AWS.DynamoDB.DocumentClient();
    }

    getDataForEmotePlotJsonFromDynamodb(callback: (e: emoteData[]) => void, errCallback: (err: any) => void) {
        let params = {
            TableName: "emotehistory",
            /*
            ProjectionExpression: "#yr, title, info.rating",
            FilterExpression: "#yr between :start_yr and :end_yr",
            ExpressionAttributeNames: {
                "#yr": "year",
            },
            ExpressionAttributeValues: {
                 ":start_yr": 1950,
                 ":end_yr": 1959 
            }
            */
        };

        this.docClient.scan(params, (err, result) => DynamodbWrapper.onScan(err, result, callback, errCallback));
    }

    static snapsTransformFromDbToJson = function (snaps: AWS.DynamoDB.DocumentClient.AttributeMap[], callback: (e: emoteData[]) => void) {
        if (snaps.length == 0) {
            callback([]);
        } else {

            let emotes = Object.keys(snaps[0].Data || []);
            let emoteData: { [key: string]: emoteData } = {}; // {emote : {x : [], y : [], name : String}}
            emotes.forEach(function (e) {
                emoteData[e] = { name: e, x: [], y: [] };
            });
            let runningsum: { [key: string]: number } = {};
            snaps.concat().sort((snap1, snap2) => snap1.Time - snap2.Time).forEach(function (s, i) {
                emotes.forEach(function (e) {
                    runningsum[e] += s.Data[e];
                    if (i % 4 == 3) {	// window width: 4 snaps
                        emoteData[e].x.push(s.Time);
                        emoteData[e].y.push(runningsum[e] / 4);
                        runningsum[e] = 0;
                    }
                    // emoteData[e].x.push(s.time);
                    // emoteData[e].y.push(s.data[e]);
                });
            });
            let ret: emoteData[] = [];
            emotes.forEach(function (e) {
                ret.push(emoteData[e]);
            });
            ret.reverse();  // alphabetical order
            callback(ret);
        }
    }

    static onScan = function (err: AWS.AWSError, data: AWS.DynamoDB.DocumentClient.ScanOutput, callback: (e: emoteData[]) => void, errorCallback: (er: AWS.AWSError) => void) {
        if (err) {
            console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
            errorCallback(err);
            return;
        } else {
            // print all the movies
            // console.log("Scan succeeded.");
            //		console.log(data.Items);
            DynamodbWrapper.snapsTransformFromDbToJson(data.Items, callback);
            // continue scanning if we have more movies, because
            // scan can retrieve a maximum of 1MB of data
            /*
            if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                docClient.scan(params, onScan);
            }
            */
        }
    }
}