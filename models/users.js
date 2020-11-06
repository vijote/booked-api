


module.exports = (sequelize, type) => {
    return sequelize.define('user', {
        id: {
            type: type.UUID,
            defaultValue: type.UUIDV4,
            primaryKey: true,
        },
        mac: {
            type: type.STRING(50),
        },
        email: type.STRING(50),
        password: type.STRING(150)
    });
}