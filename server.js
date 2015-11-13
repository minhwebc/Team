
var path = require("path");

var express = require("express");
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/teams');

var Schema = mongoose.Schema;

var teamSchema = new mongoose.Schema({
  name: String,
  members: [{type: Schema.Types.ObjectId, ref: 'Members'}]
});

mongoose.model('Post', postSchema);
var Post = mongoose.model('Post');

var commentSchema = new mongoose.Schema({
  _post: {type: Schema.Types.ObjectId, ref: 'Post'},
  name: String,
  comment: String, 
  created_at: {type: Date, default: new Date}
});

mongoose.model('Comment', commentSchema);
var Comment = mongoose.model('Comment');

app.use(express.static(path.join(__dirname, "./static")));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    Post.find({}, function(err, posts) {
      Comment.find({}, function(err, comments){
          var content = {
              posts: posts,
              comments: comments
          }
        for(i in content.posts){ 
          console.log(content.posts[i].name);
          console.log(content.posts[i].message);
          for(j in content.comments){
            console.log(content.comments[j]._post);
            console.log(content.posts[i]._id);
            if(content.comments[j]._post == content.posts[i]._id){
              console.log(content.comments[j].name);  
            }
          }
        }
        res.render('index', {content});         
      });
    });
});

//retrieve
app.get('/posts/:id', function (req, res){
// the popuate method is what grabs all of the comments using their IDs stored in the 
// comment property array of the post document!
    Post.findOne({_id: req.params.id})
        .populate('comments')
  .exec(function(err, post) {
    res.render('post', {post: post});
        });
});

//post comments
app.post('/comments/:id', function (req, res){
  Post.findOne({_id: req.params.id}, function(err, post){
      // data from form on the front end
      var comment = new Comment(req.body);
      //  set the reference like this:
      comment._post = post._id;
      post.comments.push(comment);
      // now save both to the DB
      comment.save(function(err){
          post.save(function(err){
      if(err) {
            console.log('Error');
     } else {
            res.redirect('/');
            }
          });
      });
  });
});

// route to add a post
app.post('/post', function(req, res) {

  console.log("POST DATA", req.body);

  var message = new Post({name: req.body.name, message: req.body.message});

  message.save(function(err) {
    if(err) {
      console.log('something went wrong');
    } else { 
      console.log('successfully added an info!');
      res.redirect('/');
    }
  })
})

// listen on 8000
app.listen(8000, function() {
	console.log("listening on port 8000");
})
