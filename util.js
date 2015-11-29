//Util function to construct DB URL from given config object
function getDBURLFromConfig(dbConfig) {
  var dbHost = dbConfig.host || 'localhost';
  var dbPort = dbConfig.port || 27017;
  var dbName = dbConfig.dbname || 'hnapp';
  var dbUsername = dbConfig.dbusername || 'esakkiraj';
  var dbPassword = dbConfig.dbpassword || 'esakkiraj';
  var dbURL = 'mongodb://'+dbUsername+':'+dbPassword+'@'+ dbHost +':'+ dbPort +'/'+ dbName;

  return dbURL;
}

module.exports = {
  getDBURLFromConfig: getDBURLFromConfig
}
