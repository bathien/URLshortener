/**
 * Created by bathien on 15-Feb-17.
 */


var mongoose = require('mongoose');
var collection = "LogVisits";
test = require('assert');
var jsesc = require("jsesc");


/**
 * Retrieves the current number of successful URL visits.
 *
 * @param callback			The function to execute once the database operation has completed.
 *							The number of successful visits logged in the database is passed as a parameter to that function.
 */
module.exports.getTotalVisits = function( callback )
{
     db.collection(collection).find({"response":"301"}).count(function( err,result){
         if (err) callback(err,null);
         callback(null,result);
    });
}

/**
 * Retrieves the current number of successful visits to a specific URL.
 *
 * @param callback			The function to execute once the database operation has completed.
 *							The number of successful visits logged in the database is passed as a parameter to that function.
 */
module.exports.getURLVisits = function( urlCode, callback )
{

    db.collection(collection).find({'url_code':jsesc(urlCode) ,'response': '301'}).count(function( err, result){
        if (err) callback(err,null);
        callback(null,result);
    });
}

module.exports.logVisit = function( urlCode, status, request, callback )
{
    var ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    db.collection(collection).insertOne({
        url_code : jsesc(urlCode),
        response : jsesc(status),
        ip_address : jsesc(ip),
        user_agent : jsesc(request.get("user-agent")),
        referral : request.get("referrer"),

    });

    // Wait for a second before finishing up, to ensure we have written the item to disk
    setTimeout(function() {

        // Fetch the document
        db.collection(collection).findOne({url_code: jsesc(urlCode)}, function(err, item) {
            test.equal(null, err);
            test.equal(jsesc(urlCode), item.url_code);
            db.close();
        })
    }, 100);
}


module.exports.logInsert = function( code, status, ipAddress, callback )
{
    db.collection(collection).insertOne({
        url_code : jsesc(code),
        response : jsesc(status),
        ip_address :  jsesc(ipAddress) ,

    });

    // Wait for a second before finishing up, to ensure we have written the item to disk
    setTimeout(function() {

        // Fetch the document
        collection.findOne({url_code: jsesc(code)}, function(err, item) {
            test.equal(null, err);
            test.equal(jsesc(code), item.url_code);
            callback(item);
            db.close();
        })
    }, 100);


}
