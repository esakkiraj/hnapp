var DBConnection = require('./dbconnection');
var crypto = require('crypto');
var Q = require('Q');

function getHashedPassword(password) {
  var hashObject = crypto.createHash('sha1');
  hashObject.update(password);
  return hashObject.digest();
}
module.exports = {
  'viewUserDetails': function(req, res) {
    var db = DBConnection.getDBConnection();
    try {
      var isLoggedIn = req.session ? req.session.username : null;
      if( !isLoggedIn) {
        res.direct('/');
      }
      var username = req.session.username;
      db.collection('users').find({ 'username': username }).toArray(function(err, user) {

        if( err || !Array.isArray(user) || user.length < 1 ) {
          console.log('Error occured while fetching user details');
          res.send({
            'success': false,
            'message': 'Error occured while fetching data from DB.'
          });
        }

        var time = new Date(+user[0].time);
        var joinedDate = time.getDate()+'-'+time.getMonth()+'-'+time.getFullYear();
        res.render('userdetails', {
          'username': username,
          'joineddate': joinedDate ,
          'isLoggedIn': true
        });

      });

    } catch(e) {
      console.log('Exception throw '+ e);
      res.send({
        'success': false,
        'message': 'Error occured while fetching data from DB.'
      });
    }
  },
  'createUser': function(req, res) {
    var db = DBConnection.getDBConnection();
    try {
      var username = req.body.username;
      var password = req.body.password;

      if( !username || !password ) {
        res.render('index', {
          'success': false,
          'message': 'Invalid field values.',
          'showerror': true,
        });
        return;
      }

      db.collection('users').find({ 'username': username }).toArray(function(err, user) {
       
        if( err) {
          res.render('index', {
            'success': false,
            'message': 'Error while fetching user data from DB.',
            'showerror': true
          });
          return;
        }

        if( Array.isArray(user) && user.length > 0 ) {
          res.render('index', {
            'success': false,
            'message': 'Username already exits.',
            'showerror': true
          });
          return;
        }


        db.collection('users').insert({
          'username': username,
          'password': getHashedPassword(password),
          'time': new Date().getTime()
        },
        { w: 1 },
        function(err, user ) {
          if( err) {
            res.render('index', {
              'success': false,
              'message': 'Error while inserting data into DB.',
              'showerror': true
            });
            return;
          }
          if( user ) {
            req.session.username = username;
            res.redirect('/');
          }
        });
      });
      
    } catch(e) {
      console.log('Error while creating user account. '+ e.getMessage());
      res.render('index', {
        'success': false,
        'message': 'Error in creating user account. Try again later',
        'showerror': true,
      });
    }
  },
  'authenticateUser': function(req, res) {
    var db = DBConnection.getDBConnection();
    var username = req.body.username;
    var password = req.body.password;
  
    var hashedPassword = getHashedPassword(password);
    try {
      db.collection('users').find({ 'username': username, 'password': hashedPassword }).toArray(function(err, user) {
        
        if(err) {
          res.render('index', {
            'success': false,
            'message': 'Error in fetching account details from db.',
            'showError': true,
            'prevusername': username 
          });
        }

        if( Array.isArray(user) && user.length > 0 ) {
          delete req.session.showError;
          req.session.username = username;
          res.redirect('/');
        } else {
          res.render('index', {
            'success': false,
            'message': 'Invalid credentials.',
            'showError': true,
            'prevusername': username 
          });
        }
      });
    } catch(e) {
      console.log('Error occured while authenticating user account.');
      res.render('index', {
        'success': false,
        'message': 'Error occured whilt authenticating.',
        'showError': true,
        'prevusername': username 
      });
    }
  }
}
