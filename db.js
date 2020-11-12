// === import of the necessary packages ===
const Sequelize = require('sequelize');
const BookModel = require('./models/books');
const UserModel = require('./models/users');

// === sequelize connection to the database ===
const sequelize = new Sequelize( process.env.DBNAME, process.env.DBUSER ,process.env.DBPASS , {
    host: 'remotemysql.com',
    dialect: 'mysql'
});

// === initialization of the models ===
const Book = BookModel(sequelize, Sequelize); // books table
const User = UserModel(sequelize, Sequelize); // users tale
const Purchases = sequelize.define('purchases', {}); // purchases made from users

// === creation of the relationship through intermmediate table ===
Book.belongsToMany(User, { through: "purchases" });
User.belongsToMany(Book, { through: "purchases" });

// === definition of function to buy books ===
Book.buyBook = async (bookId, userId) => {
    try{
        // search for the book with the id specified
        const book = await Book.findByPk(bookId);
        if (!book) {
            console.log("Book not found!");
            return null;
          }

        // then search for the user with the id specified
        const user = await User.findByPk(userId);
        if (!user) {
            console.log("User not found!");
            return null;
        }

        // finally, 'buy' the book and store it in the table
        await book.addUser(user, { through: "purchases" });
        console.log(`User ${user.id} buyed book ${book.id}!`);
        return book;

    } catch(error){
        console.log("Error buying your book!", error);
    }
  };

// each time the server starts, the tables will be deleted and recreated
sequelize.sync({ force: true })
    .then(()=> {
        console.log('tables synchronized!')
    });

// exports an object
module.exports = {
    Book,
    User,
    Purchases
}