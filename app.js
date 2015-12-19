/*  Server side JS - app.js
*   Umi Syam - Thesis 1: Final Prototype
*/

/*---------- BASIC SETUP ----------*/
var http = require('http'),
    express	= require('express'),
    bodyParser = require('body-parser');

var app = express();
var PORT = 5000;
var server = app.listen(PORT, function() {
    console.log('Listening on port %d', server.address().port);
});

var io = require("socket.io").listen(server);

// Body Parser
app.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded
app.use(bodyParser.json());							// parse application/json

// Express server
app.use(function(req, res, next) {
    // Setup a Cross Origin Resource sharing
    // See CORS at https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    // console.log('incoming request from ---> ' + ip);
    var url = req.originalUrl;
    // console.log('### requesting ---> ' + url);	// Show the URL user just hit by user
    next();
});

app.use('/', express.static(__dirname + '/public'));
app.get('/visualize', function (req, res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end('this is where the visualization lives')
})

/*-------------- PARSE SETUP --------------*/
var Parse = require('parse/node');
Parse.initialize("s4FFDhhYfUTNRt721JWaeydu9cgKQspV4dlLM84u", "HjAVqIRTo4wvn3BrMDB0OpYyri11B8bnzMfMeDmq");

// do some work here with the database.
io.sockets.on('connection', function (socket) {
    console.log("We have a new client: " + socket.id);

        socket.on('getFilteredResult', function (data) {
            console.log("data from getFilteredResult = " + data);

            var messageArray = [];

            var cravingDB = Parse.Object.extend("Archive_Thanksgiving15");
            var query = new Parse.Query(cravingDB);
            
            query.limit(1000);
            query.contains("text", data);

            // if we wanna limit the query by time constraints
            var da = "2015-11-25";
            var db = "T22:00:00.000Z";
            var d1 = new Date(da + db);

            var breakfast_start = "T06:00:00.000Z";
            var lunch_start = "T11:00:00.000Z";
            var dinner_start = "T16:30:00.000Z";
            var midnight_start = "T23:00:00.000Z";
            
            var da2 = "2015-11-26";
            var db2 = "T23:59:59.000Z";
            var d2 = new Date(da2 + db2);

            // query.greaterThanOrEqualTo("oriTimestamp", d1);
            // query.lessThanOrEqualTo("oriTimestamp", d2);
            
            query.count({
                success: function(number) {
                    console.log("Total Instances: "+number);
                    // for (var i=0; i<number; i+=1000) {
                        // query.skip   (i);
                        // query.greaterThanOrEqualTo("created_at", d1ms);

                        query.find ({
                                success: function(results) {

                                    console.log("results length: " +results.length);

                                    for (var j = 0; j < results.length; j++) {
                                        var item = results[j];
                                        // console.log(item);

                                        var oriDate = item.get('created_at');
                                        // console.log(item.id + ' - ' + oriDate);
                                        var parsedDate = new Date(oriDate);

                                        // This will create a new column with Date as data type
                                        item.set('oriTimestamp', parsedDate);
                                        item.save(null, {
                                            success: function(res){
                                                // console.log('Yay! Just updated an object!');
                                            },
                                            error: function(res, err){
                                                console.log(err);
                                            }
                                        });

                                        messageArray.push(item);
                                    }
                                    
                                    console.log("messageArray length: " +messageArray.length);
                                    socket.emit('filteredResults', { total: number, searchTerm: data, filteredResults: messageArray });
                                    
                                },
                                error: function(error) {
                                    console.log("There was an error:" + error.code + " " + error.message);
                                }
                            });
                    // }
                },

                error: function(error) {
                    // error is an instance of Parse.Error.
                    console.log("Parse error");
                }
            });

            // callback('error', 'message');
        });


    socket.on('disconnect', function() {
        console.log("Client has disconnected");
    });
});   // end of io.sockets.on


