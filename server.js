'use strict';

const express = require('express');
const app = express();
const superagent = require('superagent');
require('ejs');
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const pg = require('pg');

app.set('view engine', 'ejs');

// body parser
app.use(express.urlencoded({extended:true}));

/////// Client

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error('error'));

app.use(express.static('./public'));
app.get('/hello', search);
app.get('/searches/new', bookSearch);
app.post('/searches/new', bookResults);
// app.get('/books', detailBook)
app.post('/books', addFavBook)
app.get('/books/:book_id', getOneBook);
app.post('/', getBooks);

function search(request, response) {
  response.status(200).render('./pages/index');
}

function bookSearch(request, response) {
  response.status(200).render('./pages/searches/new');
}

function getBooks(request,response) {
  let SQL = 'SELECT * FROM bookApp;';
  return client.query(SQL)
    .then(results => response.render('./pages/index', { result: results.rows }))
    .catch(err => errorHandler(err, response))
}

function bookResults(request, response) {
  let bookResult = request.body.search;
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if (bookResult[1] === 'title') {
    url += `+intitle:${bookResult[0]}`;

  } else {
    url += `+inauthor:${bookResult[0]}`;
  }
  superagent.get(url)
    .then(results => {
      let result = results.body.items;
      let SQL = `INSERT INTO bookApp (author, title, isbn, image_url, descriptions, bookshelf) VALUES ($1, $2, $3, $4, $5, $6);`;
      let bookList = result.map(data => {
        let bookLists = new Book(data.volumeInfo);
        let safeValue = [bookLists.author, bookLists.title, bookLists.isbn, bookLists.image, bookLists.summary, bookLists.bookshelf]
       client.query(SQL, safeValue)
        return bookLists
      });
      // console.log(bookList)
      response.status(200).render('./pages/searches/results', {bookResultsData: bookList});

    })
    .catch(() => {
      errorHandler('Sorry, its invalid search',response)
    })
}

function getOneBook(request,response) {
  let SQL = 'SELECT * FROM bookApp where id=$1;';
  let safeValue = [request.params.book_id]

  return client.query(SQL, safeValue)
    .then(result => {
      console.log(result)
      return response.render('pages/books/detail', { oneBook: result.row[0]});
    }) .catch(err => errorHandler(err, response))
}

////adding book

function addFavBook(request, response) {
  console.log(request)
}

function Book(bookData){
  let placeImage = 'https://via.placeholder.com/200';
  this.title = bookData.title || 'no title available';

  if(bookData.authors > 1) {
    this.author = bookData.authors.join(', ');
  } else {
    this.author = bookData.authors || 'no author available';
  }
  this.summary = bookData.description || 'no summary available';
  this.image = bookData.imageLinks.thumbnail || placeImage;
  this.isbn = bookData.industryIdentifiers[0].identifier || 'no isbn available';
  if(bookData.categories.length > 1) {
    this.bookshelf = bookData.categories.join(', ');
  } else {
    this.bookshelf = bookData.categories || 'no category is available';
  }
}

function errorHandler(string,response) {
  response.status(500).send(string)
}

function developerErrorHandler(request,response) {
  response.status(404).send ('sorry this request is not available yet')
}














app.use('*', developerErrorHandler);

app.listen(PORT, () => console.log(`we are listening in ${PORT}`));

