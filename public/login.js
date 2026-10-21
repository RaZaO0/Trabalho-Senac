const form_login = document.getElementById("caixa-login");

form_login.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const dados = {
        email: email,
        senha: senha
    }

    try {
        const resposta = await fetch("/api/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(dados)
        })

        if(!resposta.ok) {
            throw new Error(erro)
        }

    } catch(erro) {
        console.log(erro)
    }
})