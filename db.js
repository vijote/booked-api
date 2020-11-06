const Sequelize = require('sequelize');
const BookModel = require('./models/books');
const UserModel = require('./models/users');


const sequelize = new Sequelize('2iuHvivVDt', '2iuHvivVDt', 'KRWNCWpt2L', {
    host: 'remotemysql.com',
    dialect: 'mysql'
});

const Book = BookModel(sequelize, Sequelize);
const User = UserModel(sequelize, Sequelize);

Book.belongsToMany(User, { through: "book_user" });

User.belongsToMany(Book, { through: "book_user" });

Book.buyBook = async (bookId, userId) => {
    try{
        const book = await Book.findByPk(bookId);
        if (!book) {
            console.log("Book not found!");
            return null;
          }

        const user = await User.findByPk(userId);
        if (!user) {
            console.log("User not found!");
            return null;
        }

        await book.addUser(user, { through: "book_user" });
        console.log(`User ${user.id} buyed book ${book.id}!`);
        return book;

    } catch(error){
        console.log("Error buying your book!", error);
    }
  };

sequelize.sync({ force: true })
    .then(()=> {
        console.log('tables synchronized!')
    });

module.exports = {
    Book,
    User
}