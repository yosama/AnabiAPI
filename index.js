var http = require('http'),
	express = require('express'),
	path = require('path')
	MongoClient = require ('mongodb').MongoClient,
	Server = require('mongodb').Server,
	CollectionDriver = require('./collectionDriver').collectionDriver;



var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname,'anabiServer/views'));
app.set('view engine','jade');

var mongoHost='localHost';
var mongoPort = 27017;
var collectionDriver;

var mongoClient = new MongoClient(new Server(mongoHost,mongoPort));
mongoClient.prototype.open(function(err,mongoClient){
	if (!mongoClient) {
		console.error('Error! Existing... Must start MongoDB first');
		process.exit(1);
	}
	var db = mongoClient.db("db");
	collectionDriver = new CollectionDriver(db);
});

app.use(express.static(path.join(__dirname,'anabiServer/public')));

// app.get('/', function(req,res){
// 	res.send('<html><body>Hello world</body></html>');
// });

app.get ('/:collection',function(req,res){
	var params = req.params;
	collectionDriver.findAll(params.collection,function(error,objs){
		if (error) {
			res.send(400,error);
		}else {
			if (req.accepts('html')) {
				res.render('data',{objects:objs, collection:params.collection});
			} else {
				res.set('Content-type','application/json');
				res.send(200,objs);
			}
		}
	});
});


app.get ('/:collection/:entity',function(req,res){
	var params = req.params;
	var collection = params.collection;
	var entity = params.entity;

	if (entity) {
		collectionDriver.get(collection,entity,function(error,objs){
			if (error){
				res.send(400, error);
			} else {
				res.send(200,objs);
			}
		});
	} else {
		res.send(400, {error:'bad url',url:req.url});
	}
});


app.get('/:a?/:b?/:c?', function (req,res) {
	res.send(req.params.a+' '+req.params.b+' '+req.params.c);
});

app.use(function(req,res){
	res.render('404',{url:req.url});
});

http.createServer(app).listen(app.get('port'),function(){
	// res.writeHead(200,{'Content-type': 'text/plain'});
	// res.end('Hello Node.js\n');
	console.log ('Express server listening on port '+ app.get('port'));
});
