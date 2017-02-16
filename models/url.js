/**
 * Created by bathien on 14-Feb-17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CounterSchema = Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 9999 }
});

var counter = mongoose.model('counters', CounterSchema);
// create a schema for our links
var urlSchema = new Schema({
    _id: {type: Number, index: true},
    long_url: String,
    created_at: Date
});

urlSchema.pre('save', function(next){
    var doc = this;
    counter.findByIdAndUpdate({'_id': 'url_count'}, {$inc: {'seq': 1} },{ "upsert": true, "new": true }, function(error, counter) {
        if (error)
            return next(error);
        doc.created_at = new Date();
        doc._id = counter.seq;
        next();
    });
});



var Url = mongoose.model('urls', urlSchema);

module.exports = Url;