const Sequelize = require('sequelize');

const conexao = new Sequelize('contatosbd1', 'postgres', 'postgres.', {
    host: 'localhost',
    dialect: 'postgres',
    timezone: '-03:00'
});

module.exports = conexao;
