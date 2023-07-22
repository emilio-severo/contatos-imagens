const Sequelize = require('sequelize');
const conexao = require('./conexao');

const Categorias = conexao.define('categorias', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    descricao: Sequelize.STRING
});

Categorias.sync({force: false});

module.exports = Categorias;
