var DBConnection = require('./dbconnection.js');
var request = require('request');
var cheerio = require('cheerio');
var config = require('./config');

module.exports = {
  'getPosts': function(req, res) {
    var db = DBConnection.getDBConnection();
    var responseData = {};

    try {
      var pagePerIndex = +(config && config.app ? config.app.noOfPostsPerPage : 10);
      var sortParam = { time: -1 };
      var queryParams = req.query;
      var pageNumber = queryParams.page && queryParams.page > 0 ? queryParams.page : 1 ;
      pageNumber = +pageNumber;
      var skipCount = pagePerIndex * (pageNumber - 1);
     
      db.collection('posts').find({}).sort(sortParam).toArray(function(err, posts) {
        if( err) {
          responseData['success'] = false;
          responseData['message'] = 'Error occured while getting Posts.';
        } else {
          responseData['success'] = true;
        }

        var postToShow = posts.slice(skipCount, skipCount+pagePerIndex);
        var hasNextPage = (skipCount+pagePerIndex) < posts.length;
        var nextPageIdx = pageNumber + 1;
        var hasPrevPage = (pageNumber > 1);
        var prevPageIdx = pageNumber - 1;

        responseData['data'] = postToShow;
        responseData['hasnextpage'] = hasNextPage;
        responseData['nextpageidx'] = nextPageIdx;
        responseData['hasprevpage'] = hasPrevPage;
        responseData['prevpageidx'] = prevPageIdx;

        res.send(responseData);
      });

    } catch(e) {
      console.log(e);
      responseData['sucess'] = false;
      responseData['message'] = 'Error occured while getting Posts.'+ e.getMessage();
      res.send(responseData);
    }
  },

  'createPosts': function(req, res) {
    var db = DBConnection.getDBConnection();
    var responseData = {};

    try {
      var url = req.body.url;

      var failCaseResponse = {
          'showerror': true,
          'message': 'Error while submiting post. Try again.'
      }
      url = url.indexOf('http') !== 0 ? 'http://'+url : url;
      request(url, function(err, response, html) {
        if( err) {
          console.log('Error occured while fetching webpage. '+err);
          res.render('submit', failCaseResponse);
        }

        if( res.statusCode === 200 ) {
         
          var $ = cheerio.load(html);
          var pageTitle = $('title').text().trim();

          var postData = {
            'url': url,
            'title': pageTitle,
            'username': req.session.username,
            'votecount': 0,
            'time': new Date().getTime()
          };

          db.collection('posts').insert(postData, { w: 1 }, function(err, post) {
            if( err) {
              console.log('Error occured while inserting record in DB. '+err);
              res.render('submit', failCaseResponse);
            }

            res.redirect('/');
          });

        } else {
          console.log('Cannot Scrap webpage details for URL : '+ url);
          res.render('submit', failCaseResponse);
        }
      });
      
    } catch(e) {
      console.log(e);
      responseData['sucess'] = false;
      responseData['message'] = 'Error occured while getting Posts.'+ e.message;
      res.send(responseData);
    }

  },
  'castvote': function(req, res) {
    try {
      var db = DBConnection.getDBConnection();
      var ObjectID = DBConnection.getObjectID();

      console.log('Cast Vote operation'); //TODO: Remove log
      var isLoggedIn = req.session ? req.session.username : null;
      if( !isLoggedIn ) {
        res.send({
            'success': false,
            'message': 'Kindly login to upvote.'
        });
        return;
      }

      var username = req.session.username;
      var postid = req.body.postid;
      db.collection('userupvotes').find({ 'username': username, 'postid': postid }).toArray(function(err, posts) {

        if( err) {
          res.send({
            'success': false,
            'messsage': 'Error in getting upvote information from DB.'
          });
        }

        // Already upvoted case
        if( Array.isArray(posts) && posts.length > 0 ) {
          // Updating the post votecount property
          db.collection('userupvotes').remove({ 'username': username, 'postid': postid });
          db.collection('posts').update({ '_id': ObjectID(postid) }, { $set: { 'votecount': posts.length - 1 } }, { w: 1 }, function(){});

          res.send({
            'success': true,
            'upvoted': false,
            'upvotecount': posts.length - 1
          });
          return;
        }

        db.collection('userupvotes').insert({ 'username': username, 'postid': postid }, { w: 1 }, function(err, upvoted) {
          if( err) {
            res.send({
              'success': false,
              'message': 'Error occured while upvoting.'
            });
            return;
          }

          if( upvoted ) {
            db.collection('userupvotes').find({ 'postid': postid }).toArray(function(err, count) { 
                var upvoteCount = Array.isArray(count) ? count.length : 0;

                // Updating the post votecount property
                db.collection('posts').update({ '_id': ObjectID(postid) }, { $set: { 'votecount': upvoteCount } }, { w: 1 }, function(e,r){});

                res.send({
                  'success': true,
                  'upvoted': true,
                  'upvotecount': upvoteCount
                });

            });
          }
        });

      });
    } catch(e) {
      console.log(e);
    }
  }
}
