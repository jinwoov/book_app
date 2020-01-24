DROP TABLE IF EXISTS bookApp;

CREATE TABLE bookApp (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255),
    title VARCHAR(255),
    isbn VARCHAR(255),
    image VARCHAR(255),
    summary TEXT,
    bookshelf VARCHAR(255)
);