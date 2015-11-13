
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

mongoose.model('Team', teamSchema);
var Team = mongoose.model('Team');

var memberSchema = new mongoose.Schema({
  _team : {type: Schema.Types.ObjectId, ref: 'Team'},
  name: String,
  created_at: {type: Date, default: new Date}
});

mongoose.model('Member', memberSchema);
var Member = mongoose.model('Member');

app.use(express.static(path.join(__dirname, "./static")));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    Team.find({}, function(err, teams) {
        for(i in content.teams){ 
          console.log(content.teams[i].name);
        }
    res.render('index', {content});         
    });
});

//retrieve
app.get('/teams/:id', function (req, res){
// the popuate method is what grabs all of the comments using their IDs stored in the 
// comment property array of the post document!
    Team.findOne({_id: req.params.id})
        .populate('members')
        .exec(function(err, team) {
        res.render('team', {team: team});
    });
});

//post comments
app.post('/members/:id', function (req, res){
  Team.findOne({_id: req.params.id}, function(err, team){
      // data from form on the front end
      var member = new Member(req.body);
      //  set the reference like this:
      member._team = team._id;
      team.members.push(member);
      // now save both to the DB
      member.save(function(err){
          team.save(function(err){
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
app.post('/team', function(req, res) {

  console.log("POST DATA", req.body);

  var team = new Team({name: req.body.name});

  team.save(function(err) {
    if(err) {
      console.log('something went wrong');
    } else { 
      console.log('successfully added an team!');
      res.redirect('/');
    }
  })
})

// listen on 8000
app.listen(8000, function() {
	console.log("listening on port 8000");
})
