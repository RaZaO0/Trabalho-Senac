import express from "express";
import mysql from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import multer from "multer";
// preciso utilizar 'npm install multer', ele salva 

const app = express();
const upload = multer({ dest: "public/uploads/" });

app.use(express.json());
app.use(cookieParser());

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            scriptSrc: [
                "'self'",
                "https://cdn.jsdelivr.net",
                "https://unpkg.com"
            ]
        }
    }
}));


const configBanco = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: "",
    database: process.env.DB_NAME
});
//IMPORTANTE   'ALTER TABLE Produtos ADD imagem VARCHAR(255);'   preciso utilizar isso no banco de dados 


//verificar tudo a baixo ate o próximo  //
const TEMPO_SESSAO = 15;
const PORT = 3000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("Faltou criar o segredo JWT")
}


const opcoesCookies = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TEMPO_SESSAO * 60 * 1000
};

function login (res, usuario) {
    const token = jwt.sign(
        { sub: String(usuario.id_usuario)},
        process.env.JWT_SECRET,
        { expiresIn: `${TEMPO_SESSAO}m`}
    )  
    res.cookie("acess_token", token, opcoesCookies)
}
//



app.post("/cadastro", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const senha = typeof req.body?.senha === "string" ? req.body.senha.trim() : "";
    const confirmarSenha = typeof req.body?.confirma_senha === "string" ? req.body.confirma_senha.trim() : "";

    if (senha !== confirmarSenha) {
        return res.status(400).json({ erro: "As senhas nao coincidem"})
    }

    if (email.length > 80) {
        return res.status(400).json({ erro: "Email inválido"})
    }

    if (senha.length < 8 || senha.length > 72) {
        return res.status(400).json({erro: "A senha deve ter entre 8 e 72 caracteres"})
    }

    const verificaEmail = await buscarEmail(email)
    if (verificaEmail) {
        return res.status(409).json({ erro: "Não foi possível cadastrar."})
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
    try {
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const senha = typeof req.body?.senha === "string" ? req.body.senha : "";

        const usuarioNovo = await buscarEmail(email);

        if(!usuarioNovo) {
            return res.status(401).json({erro: "Email ou senha inválidos."})
        }

        const senhaCorreta = await bcrypt.compare(senha,usuarioNovo.senha);

        if(!senhaCorreta) {
            return res.status(401).json({error: "Email ou senha inválidos."})
        }

        login(res, usuarioNovo)
        res.json({usuarioNovo: {id: usuarioNovo.id_usuario, email: usuarioNovo.email}})
    }catch(erro) {
        console.error(erro);
        res.status(500).json({erro: "Erro no login."})
    }
})


//isaque
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



app.get("/api/auth/logado", requerLogin, async (req, res) => {
    try {
        const usuario = await buscarUsuarioID(req.idUsuario);
        if(!usuario) {
            return res.status(401).json({ error: "Usuario nao encontrado"})
        }
        res.json({id: usuario.id_usuario, email: usuario.email})

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
        error: "Erro ao verificar sessão."
    
    })};
});


// isaque
app.post("/api/auth/logout", (req,res) => {
    res.clearCookie("acess_token", opcoesCookies);
    res.json ({ message: "Logout efetuado."})
})

// verificar tabela no banco de dados
app.post("/api/cadastrarProduto", requerLogin, upload.single("imagem"), async (req, res) => {
    const { nome, categoria, preco } = req.body;

    const imagem = req.file ? "/uploads/" + req.file.filename : null;

    const [resultado] = await configBanco.execute(
        "INSERT INTO Produtos (nome_produto, categoria, valor, imagem) VALUES (?, ?, ?, ?)",
        [nome, categoria, preco, imagem]
    );

    res.status(201).json({ mensagem: "Produto cadastrado!", id: resultado.insertId });
});


app.get("/api/quantidadeProdutos", requerLogin, async (req, res) => {
    try {
        const [resultado] = await configBanco.execute(
            "SELECT COUNT(*) AS quantidade FROM Produtos"
        );

        res.json({
            quantidade: resultado[0].quantidade
        });

    } catch (erro) {
        res.status(500).json({
            erro: "Erro ao contar produtos."
        });
    }
});


app.get("/api/produtos", async (req, res) => {
    try {
        const [produtos] = await configBanco.execute(
            "SELECT nome_produto AS nome, categoria, valor AS preco, imagem FROM Produtos"
        );

        res.json(produtos);

    } catch (erro) {
        console.error(erro);
        res.status(500).json({
            erro: "Erro ao buscar produtos."
        });
    }
});


async function criarUsuario(email, senhaHash) {
    const [resultado] = await configBanco.execute(
        "INSERT INTO cadastro (email, senha) VALUES (?, ?)",
        [email, senhaHash]
    );

    return {
        id_usuario: resultado.insertId,
        email: email
    };
}

// preciso verificar a tabela no banco de dados para ver se bate
async function iniciar( ) {
    try {
        const [usuario] = await configBanco.execute("SELECT id_usuario FROM cadastro WHERE email = ?", [process.env.ADMIN_EMAIL])
        if (usuario.length === 0) {
            const senhaHash = await bcrypt.hash(process.env.ADMIN_SENHA, 10)
            await configBanco.execute ("INSERT INTO cadastro (email, senha) VALUES (?,?) ", [process.env.ADMIN_EMAIL, senhaHash]);
            console.log("Admin criado")
        } 
        } catch (erro) {
            console.log("Não foi possível conectar com o banco de dados")
    }
}

async function buscarEmail(email) {
    const [dadosEmail] = await configBanco.execute(
        "SELECT * FROM cadastro WHERE email = ?",
        [email]
    ); 

    return dadosEmail[0]
}

async function buscarUsuarioID(idUsuario) {
    const [resultado] = await configBanco.execute(
        "SELECT id_usuario, email FROM cadastro WHERE id_usuario = ?",
       [idUsuario]
    );
    
    return resultado[0];
}



app.get("/painel.html", requerLogin, (req, res) => {
    res.sendFile(process.cwd() + "/public/painel.html");
});

app.use(express.static("public"));

app.listen (PORT, () => {
    iniciar()
    console.log("Servidor rodando")
})
