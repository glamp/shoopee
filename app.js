
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , _ = require('underscore')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , Reviews = require('./lib/reviews');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('layout', 'layout');
app.set('partials', { });
app.enable('view cache');
app.engine('html', require('hogan-express'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


restrict = function(req, res, next) {
  if (req.session.passport.user) {
    next();
  } else {
    req.session.redirect_to = '/';
    req.session.error = 'Access denied!';
    res.redirect('/login');
  }
};

passport.use(new LocalStrategy(
      function(username, password, done) {
        if (username!="maria" & password!="poop") {
          return done(null, false, { message: 'Incorrect credentials.' });
        } else {
          return done(null, { username: "maria", password: "poop"} );
        }
      }
));


passport.serializeUser(function(user, done) {
  done(null, 1);
});

passport.deserializeUser(function(id, done) {
  done(null, { username: "maria", pasword: "poop" });
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
  res.locals = { title: "Shoopee | Home" , isAuth: req.session.passport.user!=undefined};
  res.render("home");
});

app.get('/login', function(req, res) {
  res.locals = { title: "Shoopee | Login" };
  res.render('login');
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    req.login(user, function(err) {
      if (err) {
        next();
      } else {
        return res.redirect('/');
      }
    });
  })(req, res, next)
});

app.get('/search', function(req, res) {
  Reviews.find({}, function(err, allreviews) {
    var landlords = _.pluck(allreviews, "name");
    var results = [];
    _.each(landlords, function(landlord) {
      Reviews.findOne({name: landlord}, function(err, review) {
        results.push(review);
      });
    });
    res.locals = { results: results, title: "Shoopee | Search" };
    res.render("search-results");
  });
});

app.post('/search', function(req, res) {
  Reviews.find({}, function(err, allreviews) {
    var landlords = _.pluck(allreviews, "name");
    var results = [];
    _.each(landlords, function(landlord) {
      Reviews.findOne({name: landlord}, function(err, review) {
        results.push(review);
      });
    });
    res.locals = { results: results, title: "Shoopee | Search" };
    res.render("search-results");
  });
});

app.get('/landlords/:name', function(req, res) {
  var name = req.params.name;
  Reviews.find({name: name}, function(err, reviews) {
    res.locals = {
      title: "Shoopee | " + name,
      name: name, about: " Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut ",
      reviews: reviews
    }
    res.render("landlord-profile");
  });
});

app.post('/landlord/review', function(req, res) {
  var review = req.body;
  var reviewer = req.session.passport.user || {};
  passport.deserializeUser(reviewer, function(err, user) {
    review.reviewer = user.username || "Guest";
    Reviews.add(review, function(err) {
      if (err) {
        console.log("could not save review");
      }
      console.log(review);
      res.send(review);
    });
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
