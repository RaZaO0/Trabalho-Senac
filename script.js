if (typeof AOS !== "undefined") {
    AOS.init();
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
        this.id = id,
        this.nome = nome,
        this.gmail = gmail,
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
formProdutos.addEventListener("submit", (e) => {
    e.preventDefault();
 
    const nomeProduto = document.getElementById("nome").value;
    const categoriaProduto = document.getElementById("categoria").value;
    const precoProduto = document.getElementById("preco").value;
 
    objetoGerenciador.adicionaProduto(
        nomeProduto,
        categoriaProduto,
        precoProduto
    );
    alert("Produto cadastrado com sucesso!");
    formProdutos.reset()
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
  
 
 
const mostrarFiltros = (event) => {
    event.preventDefault();
    const caixaFiltros = document.getElementById("caixa-filtros");
    caixaFiltros.style.display = caixaFiltros.style.display === "flex" ? "none" : "flex";
}
 
const filtrarPreco = (precoMax) => {
    const produtos = [...document.querySelectorAll(".caixa-produto")];

        if (precoMax === "todos") {
        produtos.forEach((produto) => {
            produto.style.display = "block";
        });

        return;
    }
 
    const dentroDoFiltro = produtos.filter(
        (produto) => Number(produto.dataset.preco) <= precoMax
    );
    const foraDoFiltro = produtos.filter(
        (produto) => Number(produto.dataset.preco) > precoMax
    );
 
    dentroDoFiltro.forEach((produto) => produto.style.display = "block");
    foraDoFiltro.forEach((produto) => produto.style.display = "none");
}
 