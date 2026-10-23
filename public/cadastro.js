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
        const resposta = await fetch("/cadastro", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dados)
        })

        const resultado = await resposta.json()
        if(!resposta.ok) {
            throw new Error(resultado.erro)
        }

        alert("Cadastro realizado com sucesso!")
        formCadastro.reset();
    }catch(erro) {
        alert(erro.message)
    }
})


