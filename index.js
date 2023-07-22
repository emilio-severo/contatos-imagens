const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const Sequelize = require('sequelize');
const conexao = require('./bd/conexao');
const Categorias = require('./bd/Categorias');
const Contatos = require('./bd/Contatos');
const Usuarios = require('./bd/Usuarios');
const formataData = require('./public/js/util');
const autorizacao = require('./autorizacao/autorizacao');


const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "public/imagens");
    },
    filename: function (req, file, callback) {
        callback(null,   'imagem' + Date.now() + '.png')
    },
    fileFilter: function (req, file, callback) {
        if ('image/png' == file.mimetype)
            return callback(null, true);
        return callback(null, false);
    }
});
const imagens = multer({ storage });


const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(session({ secret: "Um$&gr&D0.", resave: true, saveUninitialized: true }));

conexao.authenticate();

app.get("/", function (req, res) {
    res.render("login", { mensagem: "" });
});

app.post("/login", function (req, res) {
    Usuarios
        .findOne({ where: { email: req.body.login } })
        .then(function (usuario) {
            if (usuario != undefined) {
                if (usuario.senha == req.body.senha) {
                    req.session.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email };
                    res.redirect("/index");
                }
                else
                    res.render("login", { mensagem: "Usuário ou senha inválidos." });
            }
            else
                res.render("login", { mensagem: "Usuário ou senha inválidos." });
        });
});

app.get("/logout", autorizacao, function (req, res) {
    req.session.usuario = undefined;
    res.redirect("/");
});

app.get("/usuario/novo", function (req, res) {
    res.render("usuarios");
});

app.post("/usuarios/salvar", function (req, res) {
    let nome = req.body.nome;
    let email = req.body.email;
    let senha = req.body.senha;
    Usuarios
        .create({ nome: nome, email: email, senha: senha })
        .then(
            res.render("login", { mensagem: "Usuário cadastrado." }
            ));
});

app.get("/index", autorizacao, function (req, res) {
    res.render("index");
});

app.get("/categorias/lista/:mensagem?", autorizacao, function (req, res) {
    Categorias
        .findAll({ order: ["descricao"] })
        .then(function (categorias) {
            if (req.params.mensagem)
                res.render("categorias/categorias", { categorias: categorias, mensagem: "Não foi possível, pois já há um contato relacionado a esta categoria." });
            else
                res.render("categorias/categorias", { categorias: categorias, mensagem: "" });
        });
});

app.get("/categorias/novo", autorizacao, function (req, res) {
    res.render("categorias/novo", { mensagem: "" });
})

app.post("/categorias/salvar", autorizacao, function (req, res) {
    let descricao = req.body.descricao;
    Categorias
        .create({ descricao: descricao })
        .then(
            res.render("categorias/novo", { mensagem: "Categoria incluida" }
            ));
});

app.get("/categorias/editar/:id", autorizacao, function (req, res) {
    let id = req.params.id;
    Categorias
        .findByPk(id)
        .then(function (categoria) {
            res.render("categorias/editar", { categoria: categoria });
        })

});

app.post("/categorias/atualizar", autorizacao, function (req, res) {
    let id = req.body.id;
    let descricao = req.body.descricao;
    Categorias
        .update({ descricao: descricao }, { where: { id: id } })
        .then(function () {
            res.redirect("/categorias/lista");
        })
});

app.get("/categorias/excluir/:id", autorizacao, function (req, res) {
    let id = req.params.id;
    Categorias
        .destroy({ where: { id: id } })
        .then(function () {
            res.redirect("/categorias/lista");
        })
        .catch(function (erro) {
            if (erro instanceof Sequelize.ForeignKeyConstraintError) {
                console.log('Restrição de integridade referencial.');
                res.redirect("/categorias/lista/erro");
            }
        });
});

app.get("/contatos", autorizacao, function (req, res) {
    Contatos
        .findAll({ order: ["nome"], where: { usuarioId: req.session.usuario.id }, include: [{ model: Categorias }] })
        .then(function (contatos) {
            res.render("contatos/contatos", { contatos: contatos, formataData: formataData });
        });
});

app.get("/contatos/novo/:mensagem?", autorizacao, function (req, res) {
    Categorias
        .findAll({ order: ["descricao"] })
        .then(function (categorias) {
            if (req.params.mensagem)
                res.render("contatos/novo", { mensagem: "Contato incluído", categorias: categorias });
            else
                res.render("contatos/novo", { mensagem: "", categorias: categorias });
        })

})

app.post("/contatos/salvar", imagens.single("foto"), function (req, res) {
    let nome = req.body.nome;
    let email = req.body.email;
    let nascimento = req.body.nascimento;
    let categoria = req.body.categoria;
    let foto = `imagens/${req.file.filename}` 
    console.log(foto);
    Contatos
        .create({ nome: nome, email: email, nascimento: nascimento, foto: foto, categoriaId: categoria, usuarioId: req.session.usuario.id })
        .then(
            res.redirect("/contatos/novo/incluido")
        );
});

app.get("/contatos/editar/:id", autorizacao, function (req, res) {
    let id = req.params.id;
    Contatos
        .findByPk(id)
        .then(function (contato) {
            Categorias
                .findAll()
                .then(function (categorias) {
                    res.render("contatos/editar", { contato: contato, categorias: categorias, formataData: formataData });
                })
        });
});

app.post("/contatos/atualizar", autorizacao, function (req, res) {
    let id = req.body.id;
    let nome = req.body.nome;
    let email = req.body.email;
    let nascimento = req.body.nascimento;
    let categoria = req.body.categoria;
    Contatos
        .update({ nome: nome, email: email, nascimento: nascimento, categoriaId: categoria }, { where: { id: id } })
        .then(function () {
            res.redirect("/contatos");
        });
});

app.get("/contatos/excluir/:id", autorizacao, function (req, res) {
    let id = req.params.id;
    Contatos
        .destroy({ where: { id: id } })
        .then(function () {
            res.redirect("/contatos");
        })
});

app.get("/home/emilio/NodeProjects/contatos/public/imagens/imagem1599253634294.png", (req, res) => {
    res.sendFile("/home/emilio/NodeProjects/contatos/public/imagens/imagem1599253634294.png");
});

app.listen(3000);

