var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var config = require('./config');
var base58 = require('./base58.js');
var async = require('async');
test = require('assert');
// grab the url model
var Url = require('./models/url');

var DAOLogVisit = require('./DAO/DAOLogVisit');
var DAOUrl = require('./DAO/DAOUrl');
log			= require( "custom-logger" ).config({ level: config.CONSOLE_LOG_LEVEL });

mongoose.connect('mongodb://' + config.db.host + '/' + config.db.name);
db = mongoose.connection;

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Middleware for parsing the real IP address from the client.
 *
 * @param req			Express.js request object
 * @param res			Express.js response object
 * @param next			Express.js next function
 */
app.use( function( req, res, next )
{
    /**
     * Set real_ip property to real IP of client if using a reverse proxy (otherwise it will return 127.0.0.1)
     * If not using proxy, it should fall back to req.ip
     */
    req.real_ip = req.header("x-real-ip") || req.ip;
    console.log(req.header("x-real-ip") || req.ip);

    next();
});

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'views/index.html'));
});

// // view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// // require and instantiate express
// app.get('/', function(req, res){
//     res.sendFile(path.join(__dirname, 'views/index.html'));
// });
//
// // uncomment after placing your favicon in /public
// //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

function validateURL(textval) { //copied from   http://stackoverflow.com/questions/1303872/trying-to-validate-url-using-javascript
    var urlregex = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
    return urlregex.test(textval);
}



app.post('/api/shorten', function(req, res){
    var longUrl = req.body.url;
    var isURL = validateURL(longUrl);
    var shortUrl = '';
    console.log(longUrl);
    if (isURL) {

                    Url.findOne({long_url: longUrl}, function (err, doc) {
                        if (doc) {
                            shortUrl = config.webhost + base58.encode(doc._id);
                            res.send({'shortUrl': shortUrl});
                            // the document exists, so we return it without creating a new entry
                        } else {
                            // since it doesn't exist, let's go ahead and create it:
                            var newUrl = Url({
                                long_url: longUrl
                            });
                            console.log(longUrl);
                            // save the new link
                            newUrl.save(function (err) {
                                if (err) {
                                    console.log(err);
                                    callback (err, null);
                                }
                                shortUrl = config.webhost + base58.encode(newUrl._id);
                                console.log(shortUrl);
                                res.send({'shortUrl': shortUrl});
                            });
                        }
                    })

    }
    else{
        console.log("You need to enter a url, beginning with 'http' or 'https' and ending in '.com' or '.org' or whatever!");
    };

// check if url already exists in database

});

app.get('/:encoded_id', function(req, res){

    var base58Id = req.params.encoded_id;

    var id = base58.decode(base58Id);
    mongoose.Promise = global.Promise;


        // check if url already exists in database
        Url.findOne({_id: id}, function (err, doc) {
            if (err) {
                console.log(err);
                conn.close();
            }
            ;

            if (doc) {
                var status = 301;
                res.writeHead( status, { "Location": doc.long_url, "Expires": (new Date).toUTCString() } );
                res.end();
                // log visitor data into database
                DAOLogVisit.logVisit(id, status, req );
                log.info( "GET request to \"" + req.path + "\" - 301: Successfully redirected user to URL \"" + doc.long_url + "\"" );
            }
                // else if there's no matching URL
            else {
                var status = 404;
                var message = "Error 404: This URL does not redirect to anything.";

                // send error message to browser
                res.send(status, message);

                // log visitor data into database
                DAOLogVisit.logVisit(id, status, req);

                // log request to the console
                log.warn("GET request to \"" + req.path + "\" - " + message);
            }
        });


});

app.get( "/stats/", function( req, res )
{
    DAOUrl.getURLCount( function(err, urls )
    {
        DAOLogVisit.getTotalVisits( function(err, count )
        {
            res.json( 200, { urls: urls, visits: count } );
            res.end();
            log.info( "GET request to \"" + req.path + "\" from client: " + req.real_ip );
        });
    });
});

/**
 * Returns stats about a specified URL in JSON format.
 */
app.get( "/stats/:urlCode", function( req, res )
{
    var base58Id = req.params.urlCode;

    var id = base58.decode(base58Id);
    mongoose.Promise = global.Promise;
    DAOUrl.getURLDate( id, function( err, date )
    {
        if ( date == undefined )
        {
            res.status(404).send("Error 404: There is no URL associated with this code." );
            res.end();
            log.info( "GET request to \"" + req.path + "\" from client: " + req.real_ip );
        }
        else
        {
            DAOLogVisit.getURLVisits( id, function( err,count )
            {
                res.status( 200).send( { created: date, visits: count } );
                res.end();
                log.info( "GET request to \"" + req.path + "\" from client: " + req.real_ip );
            });
        }
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});



var server = app.listen(8080, function(){
    console.log('Server listening on port 8080');
});
module.exports = app;
