'use strict';

const express = require('express');
const app = express();

require('ejs');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');

// app.get('/hello', (request, response) => {
//   response.send('hello word');
// });


app.get('/hello', search);

function search(request, response) {
  response.status(200).render('./pages/index');
}

app.use(express.static('./public'));



















app.listen(PORT, () => console.log(`we are listening in ${PORT}`));

