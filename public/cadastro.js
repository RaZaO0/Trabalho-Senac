const formCadastro = document.getElementById("form-cadastro")

formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;
    const confirma_senha = document.getElementById("confirme-senha").value;

    const dados = {
        email: email,
        senha: senha,
        confirma_senha: confirma_senha
    }

    try {
        const resposta = await fetch("/api/auth/cadastro", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dados)
        })

        if(!resposta.ok) {
            throw new Error(erro)
        }

        formCadastro.reset();
    }catch(erro) {
        alert(erro.message)
    }
})


