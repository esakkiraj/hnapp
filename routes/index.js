var express = require('express');
var router = express.Router();
var PostAPI = require('../posts.js');
var UserAPI = require('../user.js');


router.post('/login', UserAPI.authenticateUser);

router.get('/logout', function(req, res, next) {
  delete req.session.username;

  res.redirect('/');
});

router.get('/submit', function(req, res) {
  if( !req.session.username ) {
    res.render('index', {
      'invalidlogin': true,
      'message': 'Login to submit posts'
    });
  } else {
    var responseData = {};
    var username = req.session ? req.session.username : null;
    var isLoggedIn = username && username !== '';
    if( isLoggedIn ) {
      responseData.isLoggedIn = true;
      responseData.username = username;
    }
    res.render('submit', responseData);
  }
});
router.post('/submitpost', function(req, res) {
  
  if( !req.session.username ) {
    res.render('index', {
      'invalidlogin': true,
      'message': 'Session expired'
    });
  } else {
    PostAPI.createPosts(req, res);
  }
});

// Handling User creation ajax request

// User api's
router.post('/users', UserAPI.createUser);
router.get('/users/:username', UserAPI.viewUserDetails);

// Post api's
router.get('/posts', PostAPI.getPosts);
router.post('/castvote', PostAPI.castvote);

/* GET home page. */
router.get('/', function(req, res, next) {

  var responseData = {};
  var username = req.session ? req.session.username : null;
  var isLoggedIn = username && username !== '';
  if( isLoggedIn ) {
    responseData.isLoggedIn = true;
    responseData.username = username;
  }
  res.render('index', responseData);

});
module.exports = router;
