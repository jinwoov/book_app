DROP TABLE IF EXISTS bookApp;

CREATE TABLE bookApp (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255),
    title VARCHAR(255),
    isbn VARCHAR(255),
    image_url VARCHAR(255),
    descriptions VARCHAR(255),
    bookshelf VARCHAR(255)
);