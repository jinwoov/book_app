'use strict';

const express = require('express');
const app = express();
const superagent = require('superagent');
require('ejs');
require('dotenv').config();
const PORT = process.env.PORT || 3001;

app.set('view engine', 'ejs');

// body parser
app.use(express.urlencoded({extended:true}));

// app.get('/hello', (request, response) => {
//   response.send('hello word');
// });

app.use('*', developerErrorHandler);
app.use(express.static('./public'));
app.get('/hello', search);
app.get('/searches/new', bookSearch);

app.post('/searches/new', bookResults);

function search(request, response) {
  response.status(200).render('./pages/index');
}

function bookSearch(request, response) {
  response.status(200).render('./pages/new');
}

function bookResults(request, response) {
  let bookResult = request.body.search;
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (bookResult[1] === 'title') {
    url += `+intitle:${bookResult}`;

  } else {
    url += `+inauthor:${bookResult}`;
  }
  superagent.get(url)
    .then(results => {
      let result = results.body.items;
      let bookList = result.map(data => {
        return new Book(data.volumeInfo);
      });
      response.status(200).render('./pages/results', {bookResultsData: bookList});
    })
    .catch(() => {
      errorHandler('Sorry, its invalid search',response)
    })
}

function Book(bookData){
  let placeImage = 'https://via.placeholder.com/200';
  this.title = bookData.title || 'no title available';

  if(bookData.authors > 1) {
    this.author = bookData.authors[0];
  } else {
    this.author = bookData.authors || 'no author available';
  }
  this.summary = bookData.description || 'no summary available';
  this.image = bookData.imageLinks.thumbnail || placeImage;
}

function errorHandler(string,response) {
  response.status(500).send(string)
}

function developerErrorHandler(request,response) {
  response.status(404).send ('sorry this request is not available yet')
}






















app.listen(PORT, () => console.log(`we are listening in ${PORT}`));

