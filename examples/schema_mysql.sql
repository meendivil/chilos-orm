-- ─── chilos-orm demo schema (MySQL) ──────────────────────────────────────────
-- Run: mysql -u root -p bookstore < schema-mysql.sql

-- Create database
CREATE DATABASE IF NOT EXISTS bookstore;
USE bookstore;

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS edition;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS author_profile;
DROP TABLE IF EXISTS author;
DROP TABLE IF EXISTS publisher;

-- ─── Publisher ───────────────────────────────────────────────────────────────

CREATE TABLE publisher (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  country         VARCHAR(100) DEFAULT '',
  founded_year    INT DEFAULT 0,
  soft_delete     BOOLEAN DEFAULT false
);

-- ─── Author ─────────────────────────────────────────────────────────────────

CREATE TABLE author (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  email           VARCHAR(255) DEFAULT '',
  country         VARCHAR(100) DEFAULT '',
  soft_delete     BOOLEAN DEFAULT false
);

-- ─── Author Profile (1:1 with Author) ───────────────────────────────────────

CREATE TABLE author_profile (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  author_id       INT NOT NULL,
  bio             TEXT,
  website         VARCHAR(255) DEFAULT '',
  born_at         DATE,
  soft_delete     BOOLEAN DEFAULT false,
  FOREIGN KEY (author_id) REFERENCES author(id)
);

-- ─── Book ───────────────────────────────────────────────────────────────────

CREATE TABLE book (
  book_id         INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  price           DECIMAL(10, 2) DEFAULT 0,
  isbn            VARCHAR(20) DEFAULT '',
  stock           INT DEFAULT 0,
  author_id       INT,
  publisher_id    INT,
  soft_delete     BOOLEAN DEFAULT false,
  FOREIGN KEY (author_id) REFERENCES author(id),
  FOREIGN KEY (publisher_id) REFERENCES publisher(id)
);

-- ─── Edition (many per Book) ────────────────────────────────────────────────

CREATE TABLE edition (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  book_id         INT NOT NULL,
  edition_number  INT NOT NULL DEFAULT 1,
  format          VARCHAR(50) DEFAULT 'hardcover',
  publish_date    DATE,
  pages           INT DEFAULT 0,
  soft_delete     BOOLEAN DEFAULT false,
  FOREIGN KEY (book_id) REFERENCES book(book_id)
);

-- ─── Seed data ──────────────────────────────────────────────────────────────

INSERT INTO publisher (name, country, founded_year) VALUES
  ('Bloomsbury', 'United Kingdom', 1986),
  ('Penguin Random House', 'United States', 2013),
  ('HarperCollins', 'United States', 1989);

INSERT INTO author (name, email, country) VALUES
  ('J.K. Rowling', 'jk@example.com', 'United Kingdom'),
  ('George R.R. Martin', 'grrm@example.com', 'United States'),
  ('Frank Herbert', 'frank@example.com', 'United States');

INSERT INTO author_profile (author_id, bio, website, born_at) VALUES
  (1, 'British author best known for the Harry Potter series.', 'https://jkrowling.com', '1965-07-31'),
  (2, 'American novelist known for A Song of Ice and Fire.', 'https://georgerrmartin.com', '1948-09-20'),
  (3, 'American science-fiction author of the Dune saga.', 'https://dunenovels.com', '1920-10-08');

INSERT INTO book (name, description, price, isbn, stock, author_id, publisher_id) VALUES
  ('Harry Potter and the Sorcerer''s Stone', 'The boy who lived.', 9.99, '0439708184', 50, 1, 1),
  ('Harry Potter and the Chamber of Secrets', 'Second year at Hogwarts.', 10.99, '0439064872', 35, 1, 1),
  ('A Game of Thrones', 'Winter is coming.', 12.50, '0553103547', 20, 2, 2),
  ('Dune', 'The spice must flow.', 14.99, '0441013597', 15, 3, 3);

INSERT INTO edition (book_id, edition_number, format, publish_date, pages) VALUES
  (1, 1, 'hardcover', '1997-06-26', 309),
  (1, 2, 'paperback', '1998-09-01', 309),
  (1, 3, 'ebook', '2012-03-27', 309),
  (2, 1, 'hardcover', '1998-07-02', 341),
  (3, 1, 'hardcover', '1996-08-01', 694),
  (3, 2, 'paperback', '1997-05-28', 694),
  (4, 1, 'hardcover', '1965-08-01', 412),
  (4, 2, 'paperback', '1990-09-01', 412),
  (4, 3, 'ebook', '2010-01-15', 412);