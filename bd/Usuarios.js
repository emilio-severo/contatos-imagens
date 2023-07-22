const Sequelize = require('sequelize');
const conexao = require('./conexao');

const Usuarios = conexao.define('usuarios', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: Sequelize.STRING,
    email: Sequelize.STRING,
    senha: Sequelize.STRING
});

Usuarios.sync({force: false});

module.exports = Usuarios;
