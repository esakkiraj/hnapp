# hnapp
A Simple Hackernew Clone created using Nodejs + Expressjs + MongoDB and Deployed in Heroku.

Why Nodejs, Expressjs and MongoDB ?

Because I Love Javascript. Due to the growing interest in Javascript and MEAN(without angularjs) stack which is used for fast prototyping app, i decided to move with nodejs.

MongoDB Collections used:

To keep it simple i have only used three collections.

  1. Users: { username, password(hashed), time(account creation time) }
  2. Posts: { url, title( scrapped from the page), username( who posted the link), time }
  3. Userupvotes: { username, postid } [ This collections stores the list of users who have upvoted the posts ]


TODO:
  1. Fix upvote bug.
  2. Create root user who can be provided with stats for each posts and users actions.
  3. When some posts a link which has been posted some time ago( can be configured) suggesting already posted message. 
  4. Provide Unit test.

