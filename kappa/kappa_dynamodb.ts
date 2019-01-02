

import AWS from "aws-sdk";

AWS.config.update({
    region: "us-east-1"
});

const docClient = new AWS.DynamoDB.DocumentClient();


export const getDataForEmotePlotJsonFromDynamodb = function (callback, errCallback) {
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

    docClient.scan(params, (err, result) => onScan(err, result, callback, errCallback));
}

export const snapsTransformFromDbToJson = function (snaps, callback) {
    if (snaps.length == 0) {
        callback({});
    } else {
        let emotes = Object.keys(snaps[0].Data || []);
        let emoteData = {}; // {emote : {x : [], y : [], name : String}}
        emotes.forEach(function (e) {
            emoteData[e] = { name: e, x: [], y: [] };
        });
        let runningsum = emotes.map(e => 0);
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
        let ret = [];
        emotes.forEach(function (e) {
            ret.push(emoteData[e]);
        });
        ret.reverse();  // alphabetical order
        callback(ret);
    }
}

const onScan = function (err, data, callback, errorCallback) {
    if (err) {
        console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        errorCallback(err);
        return;
    } else {
        // print all the movies
        // console.log("Scan succeeded.");
        //		console.log(data.Items);
        snapsTransformFromDbToJson(data.Items, callback);
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