const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("public"));






app.post("/api/auth/cadastro", async (req, res) => {
    const email = typeof req.body?.nome === "string" ? req.body.nome.trim().toLowerCase() : "";
    const senha = typeof req.body?.nome === "string" ? req.body.nome.trim() : "";

    if (email.length > 80) {
        return res.status(400).json({ erro: "Email inválido"})
    }

    if (senha.length < 8 || senha.length > 72) {
        return res.status(400).json({error: "A senha deve ter entre 8 e 72 caracteres"})
    }

    const verificaEmail = await buscarEmail(email)
    if (verificaEmail) {
        return res.status(409).json({ error: "Não foi possível cadastrar."})
    }

    const senhaHash = await bcrypt.hash(senha, 10)
    const usuarioNovo = await criarUsuario(email, senhaHash)
    res.status(201).json({usuarioNovo})
}) 







