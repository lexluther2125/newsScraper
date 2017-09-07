var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
	comments: [{body: String, date: Date}]
});

var Comments = mongoose.model("Comment", CommentSchema);

module.exports = Comments;