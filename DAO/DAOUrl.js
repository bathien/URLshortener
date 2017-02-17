/**
 * Created by bathien on 15-Feb-17.
 */

var mongoose = require('mongoose');
var collection = "urls";

module.exports.getLongUrl = function(id, callback ) {
    db.collection(collection).findOne({_id: id}, function (err, doc) {
        if (err) {
            console.log(err, null);
        }
        ;
        callback(null, doc);


    });
}
/**
 * Retrieves the current number of URLs from the database.
 *
 * @param callback			The function to execute once the database operation has completed.
 *							The number of URLs stored in the database is passed as a parameter to that function.
 */
module.exports.getURLCount = function( callback )
{
    return db.collection(collection).count(function( err, result){
        if (err) callback(err,null);
    //test.equal(1, count);
    callback(null,result);
    });
}
/**
 * Retrieves the creation date of a specified URL code.
 *
 * @param callback			The function to execute once the database operation has completed.
 *							The date is passed as a parameter to that function.
 */
module.exports.getURLDate = function( urlCode, callback )
{
    db.collection(collection).findOne({ _id: urlCode },function(err, result) {
        if (err) callback(err,null);
        console.log(result);
        callback(null, result.created_at);

    });
}
