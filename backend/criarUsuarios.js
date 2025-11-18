const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Usuario = require("./models/usuario.js");

mongoose.connect('mongodb://localhost:27017/helloNeighDB');

async function criar() {
    await Usuario.create({
        username: "sindico",
        password: bcrypt.hashSync("123", 10),
        role: "sindico"
    }); 

    await Usuario.create({
        username: "porteiro",
        password: bcrypt.hashSync("123", 10),
        role: "funcionario"
    });

    console.log("Usuários criados.");
    process.exit();
}

criar();
