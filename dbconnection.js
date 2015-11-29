var MongoClient = require('mongodb').MongoClient;
var Q = require('Q');
var config = require('./config');
var util = require('./util');
var db;
var isInitialised = false;

function Initialise(processEnv) {
  var dbConfig = config.db;
  var dbURL = util.getDBURLFromConfig(dbConfig);
  var deferred = Q.defer();

  // Connection to MongoDB client is established here.
  MongoClient.connect(dbURL, function(err, client) {
    // Error 
    if(err) {
        deferred.resolve(false);
        return;
    } 

    // success
    db = client;
    isInitialised = true;
    deferred.resolve(true);
  });

  return deferred.promise;
}

function getDBConnection() {
  if( isInitialised && db ) {
    return db;
  } 
}
function getObjectID() {
  return require('mongodb').ObjectID;
}

// Exported Public API
module.exports = {
  Initialise: Initialise,
  isInitialised: isInitialised,
  getDBConnection: getDBConnection,
  getObjectID: getObjectID
}
