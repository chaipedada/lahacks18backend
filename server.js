const express = require('express');
const bodyParser = require('body-parser');
const app = express();

/*
const port = 8000;
app.listen(port, () => {
  console.log('We are live on ' + port);
});
*/
require('./app/routes')(app, {});
const port = 8080;
app.listen(port, () => {
  console.log('We are live on ' + port);
});
/*
const server = app.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`App listening at http://${host}:${port}`);
});
*/