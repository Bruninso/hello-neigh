const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Usuario = require("../models/usuario");

const router = express.Router();
const SECRET = "HELLO_NEIGHBOR_SECRET";

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
        return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const senhaValida = await bcrypt.compare(password, usuario.password);
    if (!senhaValida) {
        return res.status(401).json({ error: "Senha incorreta" });
    }

    const token = jwt.sign(
        {
            id: usuario._id,
            role: usuario.role,
            username: usuario.username
        },
        SECRET,
        { expiresIn: "8h" }
    );

    res.json({ token });
});

module.exports = router;
