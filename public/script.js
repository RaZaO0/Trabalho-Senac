if (typeof AOS !== "undefined") {
    const initAos = () => {
        AOS.init({
            duration: 900,
            once: false,
            offset: 80
        });
        AOS.refreshHard();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initAos);
    } else {
        initAos();
    }
}

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    if (document.querySelector("#titulo-inicial-branco")) {
        gsap.to("#titulo-inicial-branco", {
            scale: 2,
            opacity: 0,
            ease: "none",

            scrollTrigger: {
                trigger: "#caixa-texto-titulo-header",
                start: "top top",
                end: "+=1000",
                scrub: 1,
                pin: true
            }
        });
    }
}

class Produtos {
    constructor(id, nome, categoria, preco){
    this.id = id;
    this.nome = nome;
    this.categoria = categoria;
    this.preco = preco
    }
}
 
class Pessoas {
    constructor(id, nome, gmail, senha ){
        this.id = id;
        this.nome = nome;
        this.gmail = gmail;
        this.senha = senha
    }
}
 
let pessoas
 
class Gerenciador {
    constructor() {
        this.produtos = [];
        this.pessoas = [];
        this.proximoIdPessoa = 1;
        this.proximoIdProduto = 1;
    }
 
    adicionaProduto(nome, categoria, preco) {
        const novoProduto = new Produtos(
            this.proximoIdProduto,
            nome,
            categoria,
            preco
        );

        this.produtos.push(novoProduto);
        this.proximoIdProduto++;
        this.exibir();

        localStorage.setItem(
            "produtos",
            JSON.stringify(this.produtos)
        );
        
    }
 
    exibir() {
        if (!listaProdutos) {
        return;
    } 
        for(let i = 0; i < this.produtos.length; i++) {
            const produto = this.produtos[i];
            listaProdutos.innerHTML += `
            <div class="caixa-produto" data-preco="${produto.preco}">

                <div>
                    <img src="fotos/produto.jpg" alt="" class="fotos">
                </div>

                <div class="caixa-nome-preço">
                    <h4 class="nome-produto">
                        ${produto.nome}
                    </h4>

                    <h4 class="preco-produto">
                        R$ ${Number(produto.preco).toFixed(2)}
                    </h4>
                </div>

                <p class="texto-informativo">
                    ${produto.categoria}
                </p>

            </div>
            `
        }
    }
}
 
 
const objetoGerenciador = new Gerenciador();
const listaProdutos = document.getElementById("produtos")
const produtosSalvos = JSON.parse(
    localStorage.getItem("produtos")
);

if (produtosSalvos) {
    objetoGerenciador.produtos = produtosSalvos;
    objetoGerenciador.exibir();
}

 

const formProdutos = document.getElementById("formProdutos")

if (formProdutos) {
formProdutos.addEventListener("submit", async (e) => {
    e.preventDefault();
 
    const nomeProduto = document.getElementById("nome").value;
    const categoriaProduto = document.getElementById("categoria").value;
    const precoProduto = document.getElementById("preco").value;

    const dados = {
        nome: nomeProduto,
        categoria: categoriaProduto,
        preco: precoProduto
    }

    try {
        const resposta = await fetch("/api/cadastrarProduto", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dados)
        })

        const resultado = await resposta.json();
        
        if(!resposta.ok) {
            throw new Error(resultado.erro)
        } 
 
    objetoGerenciador.adicionaProduto(
        nomeProduto,
        categoriaProduto,
        precoProduto
    );
    alert("Produto cadastrado com sucesso!");
    formProdutos.reset()
} catch(erro) {
    alert(erro)
}
})
}
 
 
const caixaLogin = document.getElementById("caixa-login");
const painelAdm = document.getElementById("PainelAdmin");

if (caixaLogin && painelAdm) {
caixaLogin.addEventListener("submit", (e) => {
    e.preventDefault();
 
    caixaLogin.style.display = "none"
    painelAdm.style.display = "block"
})
}
  
 
 

const botaoFiltro = document.getElementById("botao-filtro");
const caixaFiltros = document.getElementById("caixa-filtros");

if (botaoFiltro && caixaFiltros) {
    botaoFiltro.addEventListener("click", () => {
        if (caixaFiltros.style.display === "flex") {
            caixaFiltros.style.display = "none";
        } else {
            caixaFiltros.style.display = "flex";
        }
    });
}

document.querySelectorAll(".botao-filtro").forEach((botao) => {
    botao.addEventListener("click", () => {
        const precoMax = botao.dataset.preco;
        const produtos = document.querySelectorAll(".caixa-produto");

        produtos.forEach((produto) => {
            const preco = Number(produto.dataset.preco);

            if (precoMax === "todos" || preco <= Number(precoMax)) {
                produto.style.display = "";
            } else {
                produto.style.display = "none";
            }
        });

        caixaFiltros.style.display = "none";
    });
});

function abrirMenu() {
    const menu = document.querySelector(".links-navbar");

    menu.classList.toggle("ativo");
}

//isaque
const botaoSair = document.getElementById("botaoSair");

if (botaoSair) {
    botaoSair.addEventListener("click", async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } finally {
            location.href = "index.html";
        }
    });
}

//isaque
async function verificarLogin() {
    if (window.location.pathname !== "/painel.html") {
        return;
    }

    const resposta = await fetch("/api/auth/logado");

    if (!resposta.ok) {
        alert("Você precisa fazer login para acessar o painel!");
        window.location.href = "/login.html";
    }
}

async function mostrarQuantidadeProdutos() {
    const elemento = document.getElementById("quantidadeProdutos");

    if (!elemento) return;

    try {
        const resposta = await fetch("/api/quantidadeProdutos");

        if (!resposta.ok) {
            throw new Error("Erro ao buscar quantidade de produtos.");
        }

        const dados = await resposta.json();

        elemento.textContent = dados.quantidade;

    } catch (erro) {
        console.error(erro);
        elemento.textContent = "Erro ao carregar";
    }
}
async function iniciarPainel() {
    if (window.location.pathname === "/painel.html") {
        await verificarLogin();

        if (window.location.pathname === "/painel.html") {
            await mostrarQuantidadeProdutos();
        }
    }
}

iniciarPainel();