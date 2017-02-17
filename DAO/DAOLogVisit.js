/**
 * Created by bathien on 15-Feb-17.
 */


var mongoose = require('mongoose');
var collection = "LogVisits";
test = require('assert');
var jsesc = require("jsesc");

var moment= require('moment');

module.exports.getTotalVisits = function( callback ) {
    db.collection(collection).find({"response": "301"}).count(function (err, result) {
        if (err) callback(err, null);
        callback(null, result);
    });
}


module.exports.getURLVisits = function( urlCode, callback ) {

    db.collection(collection).find({'url_code': jsesc(urlCode), 'response': '301'}).count(function (err, result) {
        if (err) callback(err, null);
        callback(null, result);
    });
}

module.exports.logVisit = function( urlCode, status, request ) {
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    db.collection(collection).insertOne({
        url_code: jsesc(urlCode),
        response: jsesc(status),
        ip_address: jsesc(ip),
        user_agent: jsesc(request.get("user-agent")),
        referral: request.get("referrer"),
        created_at: new Date
    });
}

module.exports.dailyLast30days = function( urlCode,  callback ) {
    var last = new Date;
 //   var start = new Date("2017/01/17");//
    var start = new Date(moment().subtract(30, 'days'));
    db.collection(collection).aggregate(
        {$match: {"url_code": jsesc(urlCode), "created_at": {$gte: start, $lt: last}}},{
            $group: {
                _id : { month: { $month: "$created_at" }, day: { $dayOfMonth: "$created_at" }, year: { $year: "$created_at" } },
                count: {$sum: 1}
            }
        }
        , function (err, reply) {
            try {
                if (err) {
                    throw err;
                }
                console.log(reply);
                callback(null, reply);
            }
            catch (err) {
                callback(err, null);
            }
        });
}

module.exports.weeklyByMonth = function( urlCode,  callback ) {
    var last = new Date;
    var start = new Date(moment().subtract(1, 'months'));
    // var last = new Date;
    // var start = new Date("2017/01/17");
    db.collection(collection).aggregate(
        {$match:{
            "url_code": jsesc(urlCode), "created_at": {$gte: start, $lt: last}}},{
            $group: {
                _id : { week: { $week: "$created_at" }, month: {  $month: "$created_at" } ,year: { $year: "$created_at" } },

                count: {$sum: 1}
            }
        }
        , function (err, reply) {
            try {
                if (err) {
                    throw err;
                }
                console.log(reply);
                callback(null, reply);
            }
            catch (err) {
                callback(err, null);
            }
        });
}

module.exports.groupByCreatedDate = function( urlCode,  callback ) {
    db.collection(collection).aggregate(
        {$match: {"url_code": jsesc(urlCode)}},{
            $group: {
                _id: "$created_at",
                count: {$sum: 1}
            }
        }
        , function (err, reply) {
            try {
                if (err) {
                    throw err;
                }
                var result = [];
                for (var i = 0; i < reply.length; i++) {
                    result.push({"referral": reply[i]._id, 'Count': reply[i].count});
                }
                callback(null, result);
            }
            catch (err) {
                callback(err, null);
            }
        });
}


module.exports.groupByCreatedDate = function( urlCode,  callback ) {
    db.collection(collection).aggregate(
        {$match: {"url_code": jsesc(urlCode)}},{
            $group: {
                _id: "$created_at",
                count: {$sum: 1}
            }
        }
        , function (err, reply) {
            try {
                if (err) {
                    throw err;
                }
                var result = [];
                for (var i = 0; i < reply.length; i++) {
                    result.push({"referral": reply[i]._id, 'Count': reply[i].count});
                }
                callback(null, result);
            }
            catch (err) {
                callback(err, null);
            }
        });
}

module.exports.groupByReferal = function( urlCode,  callback ) {
    db.collection(collection).aggregate(
        {$match: {"url_code": jsesc(urlCode)}},{
            $group: {
                _id: "$referral",
                count: {$sum: 1}
            }

        }
        , function (err, reply) {
        try {
            if (err) {
                throw err;
            }
            var result = [];
            for (var i = 0; i < reply.length; i++) {
                result.push({"referral": reply[i]._id, 'Count': reply[i].count});
            }
            callback(null, result);
        }
        catch (err) {
            callback(err, null);
        }
    });
}

module.exports.logInsert = function( code, status, ipAddress ) {
    db.collection(collection).insertOne({
        url_code: jsesc(code),
        response: jsesc(status),
        ip_address: jsesc(ipAddress),
        created_at: new Date
    });
}


