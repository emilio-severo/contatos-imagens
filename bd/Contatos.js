const Sequelize = require('sequelize');
const conexao = require('./conexao');
const Categorias = require('./Categorias');
const Usuarios = require('./Usuarios');

const Contatos = conexao.define('contatos', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: Sequelize.STRING,
    email: Sequelize.STRING,
    nascimento: Sequelize.DataTypes.DATEONLY,
    foto: Sequelize.STRING
});

Categorias.hasMany(Contatos, {
     onDelete: 'RESTRICT',
     onUpdate: 'CASCADE',
 });

 Contatos.belongsTo(Categorias);

Usuarios.hasMany(Contatos, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
});

Contatos.belongsTo(Usuarios);

Contatos.sync({force: false});

module.exports = Contatos;