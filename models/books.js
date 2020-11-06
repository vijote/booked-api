const express = require('express');
const location = __dirname + '/static';

module.exports = (sequelize, type) => {
    return sequelize.define('book', {
        id: {
            type: type.UUID,
            defaultValue: type.UUIDV4,
            primaryKey: true,
        },
        isbn: type.STRING,
        title: type.STRING,
        description: type.STRING,
        author: type.STRING,
        file: {
            type: type.STRING,
            defaultValue: location
        }
    });
}