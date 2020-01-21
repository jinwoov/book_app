'use strict';

const express = require('express');
const app = express();

require('ejs');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');

// body parser
app.use(express.urlencoded({extended:true}));

// app.get('/hello', (request, response) => {
//   response.send('hello word');
// });


app.use(express.static('./public'));
app.get('/hello', search);
app.get('/searches/new', bookSearch);

// app.post('');

function search(request, response) {
  response.status(200).render('./pages/index');
}

function bookSearch(request, response) {
  console.log(request.body);
  response.status(200).render('./pages/new');
}




















app.listen(PORT, () => console.log(`we are listening in ${PORT}`));

