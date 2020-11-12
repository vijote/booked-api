// exports a function 
module.exports = (sequelize, type) => {
    // this function creates and returns a model
    return sequelize.define('user', { // the name is 'user' and the fields:
        id: {
            type: type.UUID,
            defaultValue: type.UUIDV4,
            primaryKey: true,
        },
        device: {
            type: type.UUID,
            defaultValue: type.UUIDV4,
        },
        email: type.STRING(50),
        password: type.STRING(150)
    });
}