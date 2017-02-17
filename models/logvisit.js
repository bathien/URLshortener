/**
 * Created by bathien on 15-Feb-17.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogVisitSchema = Schema({
    url_code: String,
    response: String,
    ip_address: String,
    referral: String,
    user_agent: String,
    created_at:Date
});

var LogVisit = mongoose.model('LogVisits', LogVisitSchema);
// create a schema for our links

module.exports = LogVisit;