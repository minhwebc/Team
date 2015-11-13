
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

mongoose.model('Members', memberSchema);
var Member = mongoose.model('Members');

app.use(express.static(path.join(__dirname, "./static")));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    Team.find({}, function(err, teams) {
    res.render('index', {teams});         
    });
});

app.get('/users', function(req,res) {
  Member.find({}, function(err, users) {
    res.render('users', {users});
  })
})

app.get('/user/:id', function(req,res) {
  Member.findOne({_id:req.params.id}, function(err, user){
    Team.find({}, function(err, teams) {
      var content = {};
      content.user = user;
      content.teams = teams;
      res.render('user', {content});
    })
  })
})
//retrieve
app.get('/teams/:id', function (req, res){
    Team.findOne({_id: req.params.id})
        .exec(function(err, team) {
    Member.find({_team: team.id}, function(err, members) {
        var info ={};
        info.team = team;
        info.members = members;
        console.log(info);
        res.render('show', {info});
    });
    });
});

app.post('/switchTeams/:id', function(req,res){
  console.log(req.body.teamID +" Member ID: "+ req.params.id + ' ' +req.body.assoc);
  Team.update({_id: req.body.teamID}, {$pull: {members: req.params.id}}, {new:true}, function(err, record){
    console.log("@ err ",err)
    console.log("@ record ", record)
    Member.update({_id: req.params.id}, {$set: {_team: req.body.assoc}}, {new:true}, function(err, record) {
      console.log("@ record ", record)
      Team.update({_id: req.body.assoc}, {$push: {members: req.params.id}}, {new:true}, function(err,record){
        console.log("@ record ", record)
        res.redirect('/user/'+req.params.id);
      });
    });
  });
});

//add members
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
        res.redirect('/teams/'+team._id);
      }
      });
      });
  });
});

app.post('/delete/:id', function (req, res){
  Team.update({_id: req.body.teamID}, {$pull: {members: req.params.id}}, {new:true}, function(err, record){
    Member.remove({_id: req.params.id}, function(err){
        res.redirect('/users');
    });
  });
});

app.post('/deleteTeam/:id', function (req, res){
    Team.remove({_id: req.params.id}, function(err){
        res.redirect('/');
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
app.listen(7000, function() {
	console.log("listening on port 7000");
})
