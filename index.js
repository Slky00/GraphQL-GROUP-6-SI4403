import { ApolloServer, gql } from 'apollo-server';
import mysql from 'mysql';

// Create a MySQL connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'eaibook',
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the database');
  }
});

// Definisikan skema GraphQL
const typeDefs = gql`
  type Book {
    id: Int
    title: String
    author: String
    pages: Int
    category: String
  }

  input BookInput {
    title: String
    author: String
    pages: Int
    category: String
  }

  type Query {
    books: [Book]
    book(title: String!): Book
  }

  type Mutation {
    createBook(input: BookInput): Book
    updateBook(title: String!, input: BookInput): Book
    deleteBook(title: String!): Book
  }
`;

// Resolver untuk operasi CRUD
const resolvers = {
  Query: {
    books: () => {
      return new Promise((resolve, reject) => {
        // Perform a SELECT query to retrieve all books
        connection.query('SELECT * FROM books', (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      });
    },
    book: (parent, args) => {
      return new Promise((resolve, reject) => {
        // Perform a SELECT query to retrieve a book by title
        connection.query('SELECT * FROM books WHERE title = ?', [args.title], (error, results) => {
          if (error) {
            reject(error);
          } else {
            if (results.length > 0) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          }
        });
      });
    },
  },
  Mutation: {
    createBook: (parent, args) => {
      return new Promise((resolve, reject) => {
        // Perform an INSERT query to create a new book
        connection.query('INSERT INTO books SET ?', args.input, (error, results) => {
          if (error) {
            reject(error);
          } else {
            const newBook = { title: args.input.title, author: args.input.author, pages: args.input.pages, category: args.input.category };
            resolve(newBook);
          }
        });
      });
    },
    updateBook: (parent, args) => {
      return new Promise((resolve, reject) => {
        const { title, input } = args;
        // Perform an UPDATE query to update a book
        connection.query('UPDATE books SET ? WHERE title = ?', [input, title], (error, results) => {
          if (error) {
            reject(error);
          } else {
            // Check if any rows were affected by the update query
            if (results.affectedRows > 0) {
              // Fetch the updated book from the database
              connection.query('SELECT * FROM books WHERE title = ?', [title], (error, results) => {
                if (error) {
                  reject(error);
                } else {
                  // Resolve with the updated book
                  resolve(results[0]);
                }
              });
            } else {
              // No rows were affected, resolve with null indicating no book was updated
              resolve(null);
            }
          }
        });
      });
    },
    
    deleteBook: (parent, args) => {
      return new Promise((resolve, reject) => {
        // Perform a DELETE query to delete a book
        connection.query('DELETE FROM books WHERE title = ?', [args.title], (error, results) => {
          if (error) {
            reject(error);
          } else {
            if (results.affectedRows > 0) {
              // Book was deleted, resolve with null
              resolve(null);
            } else {
              // No book was deleted, resolve with null
              resolve(null);
            }
          }
        });
      });
  }}}
// Inisialisasi server Apollo
const server = new ApolloServer({ typeDefs, resolvers });

// Jalankan server pada port 4000
server.listen().then(({ url }) => {
  console.log(`Server ready at: ${url}`);
});