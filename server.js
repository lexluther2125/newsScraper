var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");

var News = require("./models/News.js");
var Comments = require("./models/Comments.js");

var PORT = process.env.PORT || 3000;

mongoose.Promise = Promise;

var app = express();

app.use(bodyParser.urlencoded({ extended:false }));
app.engine("handlebars", exphbs({defaultLayout: "main"}));
app.set("view engine", "handlebars");

app.use(express.static("public"));

var databaseURL = "mongodb://localhost/newsScraper";
if (process.env.MONGODB_URI){
	mongoose.connect(process.env.MONGODB_URI);
}else{
	mongoose.connect(databaseURL);
}

var db = mongoose.connection;

db.on("error", function(err){
	console.log("Mongoose Says: ", err);
});

db.once("open", function(){
	console.log("Houston, we have liftoff!");
});

//When user requests the root, this route gets request and returns index or index.handlebars in this case.
app.get("/", function (req, res){
	News.find({}).sort({$natural:-1}).limit(15).exec(function(error, doc){
		if (error){
			console.log(error);
		} else {
			console.log(doc);
			res.render("index", {News: doc});
		}
	});
});


//When user clicks Scrape for New Articles this route will handle that call.
app.get("/scrapeit", function(req, res){
	var url = "http://www.npr.org/sections/news/"; //website to scrape
	
	request(url, function(err, resp, html){
		var $ = cheerio.load(html); //load the body of the document into Cheerio and assign it to $

		$("article").each(function(i, element){
			
			var result = {};

			result.title = $(element).find("h2").find("a").text();

			result.link = $(element).find("h2").find("a").attr("href");

	//now need to save freshly scraped articles to db.
			var entry = new News(result);

			console.log(entry);

			entry.save(function(err, doc){
				if(err) {
					console.log(err);
				}else{
					console.log(doc);
				}
			});
		});
	});
	res.redirect("/");
});


//save a news article
app.post('/api/savednews/:id', function(req, res){
	News.where({"_id":req.params.id}).update({$set: {saved: true}})
		.exec(function (error, news){
			if (error){
				console.log(error);
			}else{
				res.json(news);
			}
		});
});

//get saved articles from the DB
app.get("/savednews", function(req, res){
	News.find({saved: true}, function(error, doc){
		if(error){
			console.log(error);
		} else {
			res.render("news", {News: doc});
		}
		});
	});

//route for saving comments
app.post("/api/comments/:id", function(req, res){

	var newComment = new Comments(req.body);

	newComment.save(function(error, doc){
		if(error){
			console.log(error);
		}else{
			//find News Story to associate with this comment and update it with a new comment
			News.findOneAndUpdate({"_id":req.params.id}, {"comments": doc._id})
			.exec(function(error, doc){
				if (error){
					console.log(error);
				}else{
					res.send(doc);
				}
			});
		}
	});
});

//route for returning saved comments and news article for a news item
app.get("/api/savedcomment/:id", function(req, res){
	News.findOne({"_id": req.params.id})
	.populate("savedcomment")
	.exec(function(error, doc){
		if (error){
			console.log(error);
		}else{
			console.log(doc);
			res.json(doc);
		}
	});
});

//route for removing comments
app.delete("/api/removecomment/:id", function(req, res){
	Comments.findByIdAndRemove(req.params.id, function(error){
		if (error){
			console.log(error);
			res.send("Can not delete this because " + error);
		}else{
			console.log("The comment has been removed");
		}
	});
});

//route for removing saved News Article
app.delete("/api/removenews/:id", function(req, res){
	News.findByIdAndRemove(req.params.id, function(error){
		if (error){
			console.log(error);
			res.send("Can not remove this article because " + error);
		}else{
			console.log("Article removed");
			res.redirect("/news");
		}
	});
});

app.listen(PORT, function(){
	console.log("The app is listening on port " + PORT);
});