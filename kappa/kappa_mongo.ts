import { snapsTransformFromDbToJson } from './kappa_dynamodb';

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/kappa');

const snapshotSchema = mongoose.Schema({
    data: Object,
    time: Number,   // in milliseconds
}, { collection: 'Snapshots' });
const snapshotModel = mongoose.model('Snapshot', snapshotSchema);

mongoose.connection.on('open', function () { console.log('mongo connected') });
mongoose.connection.on('error', function (err) { console.log('mongo error:', err); });

const getDataForEmotePlotJsonFromMongo = function (callback, model = snapshotModel) {
    model.find({}, function (err, snaps) {	// snaps = [ {time: Number, data: {emote: Number}} ]
        snapsTransformFromDbToJson(snaps, callback);
    });
}