// exports a function
module.exports = (sequelize, type) => {
    // this function defines and returns a model
    return sequelize.define('book', { // named 'book' with the fields:
        id: {
            type: type.UUID,
            defaultValue: type.UUIDV4,
            primaryKey: true,
        },
        isbn: type.STRING,
        title: type.STRING,
        description: type.STRING,
        author: type.STRING,
        file: type.STRING,
        price: type.INTEGER
    });
}