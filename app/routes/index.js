const noteRoutes = require('./notes_routes');

module.exports = function(app, db){
	noteRoutes(app, db);
};