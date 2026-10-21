import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser"
import helmet from "helmet";
import rateLimit from "express-rate-limit"
import "dotenv/config"

const express = require("express");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("public"));


//verificar tudo a baixo ate o próximo  //
const TEMPO_SESSAO = 15;
const PORT = process.env.PORT;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("Faltou criar o segredo JWT")
}

app.use(express.json());
app.use(cookieParser());
app.use(helmet());


const opcoesCookies = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TEMPO_SESSAO * 60 * 1000
};

function login (res, usuario) {
    const token = jwt.sign(
        { sub: String(usuario.id)},
        process.env.JWT_SECRET,
        { expiresIn: `${TEMPO_SESSAO}m`}
    )  
    res.cookie("acess_token", token, opcoesCookies)
}
//



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

const limiteLogin = rateLimit({
    windowMs: 900000,
    limit: 5,
    message: { error: "Tentativas excedidas. Aguarde 15 minutos."}
})

app.post("/api/auth/login", limiteLogin, async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const senha = typeof req.body?.senha === "string" ? req.body.senha : "";

    const usuarioNovo = await buscarEmail(email);
    const verificar = usuarioNovo && await bcrypt.compare(senha, usuarioNovo.senhaHash);

    if(!verificar) {
        return res.status(401).json({error: "Email ou senha inválidos."})
    }
})


//Verificar abaixo
function requerLogin (req, res, next) {
    const token = req.cookies.acess_token;
    if (!token) {
        return res.status(401).json({error: "Faça login para continuar"})
    }
    try {
        const valor = jwt.verify(token, process.env.JWT_SECRET);
        req.idUsuario = Number(valor.sub);
        next();
    } catch {
        res.status(401).json({ error: "Sessão expirada ou inválida."})
    }
}


//criar o "buscarUsuarioID"
app.get("/api/auth/logado", requerLogin, async (req, res) => {
    const usuario = await buscarUsuarioID();
    if(!usuario) {
        return res.status(401).json({ error: "Usuario nao encontrado"})
    }
    res.json({usuario})
})




