var http = require('http'),
	express = require('express'),
	methodOverride = require('method-override'),
	bodyParser = require('body-parser'),
	errorhandler = require('errorhandler'),
	path = require('path'),
	MongoClient = require ('mongodb').MongoClient,
	Server = require('mongodb').Server,
	CollectionDriver = require('./collectionDriver').CollectionDriver;

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname,'views'));
app.set('view engine','jade');
//app.use(logger('dev'));
app.use(methodOverride());
app.use(bodyParser.json());


var mongoHost = 'localHost'; //A
var mongoPort = 27017;
var collectionDriver;

var mongoClient = new MongoClient(new Server(mongoHost,mongoPort));
mongoClient.open(function(err,mongoClient){
	if (!mongoClient) {
		console.error('Error! Existing... Must start MongoDB first');
		process.exit(1);
	}
	var db = mongoClient.db("anabi");
	collectionDriver = new CollectionDriver(db);
});

app.use(express.static(path.join(__dirname,'public')));
// app.get('/', function(req,res){
// 	res.send('<html><body>Hello world</body></html>');
// });

app.get ('/:collection',function(req,res){
	var params = req.params;
	collectionDriver.findAll(req.params.collection,function(error,objs){
		if (error) {
			res.send(400,error);
		}else {
			if (req.accepts('html')) {
				res.render('data',{objects:objs, collection:req.params.collection});
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

app.post('/:collection', function(req,res){
	var object = req.body;
	var collection = req.params.collection;
	collectionDriver.save(collection,object, function(err,docs){
		if (err) {
			res.send(400,err);
		} else {
			res.send(201,docs);
		}
	});
});
// update method
app.put('/:collection/:entity', function(req,res){
	var params = req.params,
	 	 entity = params.entity,
		 collection = params.collection;
		if (entity) {
			collectionDriver.update(collection, req.body, entity, function(err,objs){
				if (err) {
					res.send(400,err);
				} else {
					res.send(201,objs);
				}
			});
		} else {
			var error = {"message":"Cannot PUT a whole collection"};
			res.send(400,error);
		}
});
// delete method
app.delete('/:collection/:entity', function(req,res){
	var params = req.params,
	 	 entity = params.entity,
		 collection = params.collection;
		if (entity) {
			collectionDriver.delete(collection, entity, function(err,objs){
				if (err) {
					res.send(400,err);
				} else {
					res.send(200,objs);
				}
			});
		} else {
			var error = {"message":"Cannot DELETE a whole collection"};
			res.send(400,error);
		}
});

app.use(function(req,res){
	res.render('404',{url:req.url});
});

http.createServer(app).listen(app.get('port'),function(){
	// res.writeHead(200,{'Content-type': 'text/plain'});
	// res.end('Hello Node.js\n');
	console.log ('Express server listening on port '+ app.get('port'));
});
