const Application = require('./app');
const {HOST, PORT} = require('./config');

let app = new Application();
app.expressApp.listen(PORT, HOST, function () {
	console.log(`App listening at port ${PORT}`);
});