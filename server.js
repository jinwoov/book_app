'use strict';

const express = require('express');
const app = express();
const superagent = require('superagent');
require('ejs');
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const pg = require('pg');
const methodOverride = require('method-override');


app.set('view engine', 'ejs');

// body parser
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

/////// Client

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error('error'));

app.use(express.static('./public'));
app.get('/searches/new', bookSearch);
app.post('/searches/new', bookResults);
app.post('/books', addFavBook);
app.get('/books/:book_id', getOneBook);
app.get('/', getBooks);
app.put('/update/:book_id', updateBook)
app.delete('/delete/:book_id', deleteBook)

function updateBook(request, response) {
  let values = request.params.book_id;
  let { image, title, author, isbn, summary, bookshelf } = request.body;
  let SQL = `UPDATE bookApp SET author=$1, title=$2, isbn=$3, summary=$4, bookshelf=$5 WHERE id=$6;`;
  let safeValue = [author, title, isbn, summary, bookshelf, values];

  return client.query(SQL, safeValue)
    .then(response.redirect(`/books/${request.params.book_id}`))
    .catch(err => errorHandler(err, response));
}

function deleteBook(request, response) {
  let SQL = 'DELETE FROM bookApp where id=$1;';
  let values = [request.params.book_id];
  return client.query(SQL,values)
    .then(response.redirect('/'))
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
      let bookLists= result.map(data => {
        return new Book(data.volumeInfo)
      })
      response.status(200).render('./pages/searches/results', {bookResultsData: bookLists})
    })
    .catch(() => {
      errorHandler('Sorry, its invalid search',request ,response)
    })
}

////adding book

function addFavBook(request, response) {

  let {image, title, author, isbn, summary, bookshelf} = request.body;

  let SQL = `INSERT INTO bookApp (author, title, isbn, image, summary, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`;
  let safeValue = [author, title, isbn, image, summary, bookshelf];
  return client.query(SQL, safeValue)
    .then(result => {
      response.redirect(`/books/${result.rows[0].id}`)});
}


function getOneBook(request,response) {
  let SQL = 'SELECT * FROM bookApp where id=$1;';
  let values = [request.params.book_id];
  client.query(SQL, values)
    .then(result => {
      response.render('./pages/books/show', { oneBook: result.rows[0]});
    }).catch(() => {
      errorHandler('Sorry, its invalid search',request ,response)
    })
}

function Book(bookData){
  let placeImage = 'https://via.placeholder.com/200';
  bookData.title !== undefined ? this.title = bookData.title : 'no title available';
  bookData.authors !== undefined ? this.author = bookData.authors.toString(', ') : this.author = 'no author available'
  bookData.description !== undefined ? this.summary = bookData.description : this.summary = 'no summary available';
  bookData.imageLinks !== undefined ? this.image = bookData.imageLinks.thumbnail.replace('http:', 'https:') : this.image = placeImage;
  this.isbn = bookData.industryIdentifiers[0].identifier || 'no isbn available';
  bookData.bookshelf !== undefined ? this.bookshelf = bookData.categories.toString(', ') : this.bookshelf = 'no category is available';
}

function errorHandler(err, request, response) {
  response.status(500).send('Sorry, something went wrong');
}

function developerErrorHandler(request,response) {
  response.status(404).send ('sorry this request is not available yet')
}









app.use('*', developerErrorHandler);
app.get((error, req, res) => errorHandler(error, res)); // handle errors

app.listen(PORT, () => console.log(`we are listening in ${PORT}`));

