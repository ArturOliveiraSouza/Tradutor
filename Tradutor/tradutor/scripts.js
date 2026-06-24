/* 
padrao =  https://api.mymemory.translated.net/get?q=
   traduzir =  Hello World!
   idioma = &langpair=pt-BR|en

   fetch / ferramenta do javascript para entrar em contato com um servidor
   await (Espere) - async (async & await)
   json (formato mais amigavel)
*/

// pegando o texto dentro do text area
let inputTexto = document.querySelector(".input-texto")
let traducaoTexto = document.querySelector(".traducao")
let idioma = document.querySelector(".idioma")
let resultado = document.querySelector(".resultado")
let telaLogin = document.querySelector(".login")
let caixaTradutor = document.querySelector(".caixa-maior")
let formularioLogin = document.querySelector(".form-login")
let campoEmail = document.querySelector("#email")
let campoSenha = document.querySelector("#senha")
let campoConfirmarSenha = document.querySelector("#confirmar-senha")
let mensagemLogin = document.querySelector(".mensagem-login")
let botaoSair = document.querySelector(".botao-sair")
let usuarioLogado = localStorage.getItem("usuarioLigooLogado")
let estaNoLogin = formularioLogin !== null
let tipoFormulario = formularioLogin ? formularioLogin.dataset.tipo : ""

function pegarUsuarios() {
    return JSON.parse(localStorage.getItem("usuariosLigoo")) || []
}

function salvarUsuarios(usuarios) {
    localStorage.setItem("usuariosLigoo", JSON.stringify(usuarios))
}

function mostrarMensagemLogin(texto, erro = false) {
    if (!mensagemLogin) {
        return
    }

    mensagemLogin.textContent = texto
    mensagemLogin.classList.toggle("erro", erro)
}

function mostrarTradutor() {
    if (telaLogin) {
        telaLogin.classList.add("escondido")
    }

    if (caixaTradutor) {
        caixaTradutor.classList.remove("escondido")
    }

    if (botaoSair) {
        botaoSair.classList.remove("escondido")
    }
}

function mostrarLogin() {
    if (telaLogin) {
        telaLogin.classList.remove("escondido")
    }

    if (caixaTradutor) {
        caixaTradutor.classList.add("escondido")
    }

    if (botaoSair) {
        botaoSair.classList.add("escondido")
    }
}

function entrar(email) {
    localStorage.setItem("usuarioLigooLogado", email)
    formularioLogin.reset()
    window.location.href = "index.html"
}

if (formularioLogin) {
    formularioLogin.addEventListener("submit", (evento) => {
        evento.preventDefault()

        let email = campoEmail.value.trim().toLowerCase()
        let senha = campoSenha.value.trim()
        let usuarios = pegarUsuarios()
        let usuarioEncontrado = usuarios.find((usuario) => usuario.email === email)

        if (tipoFormulario === "cadastro") {
            if (usuarioEncontrado) {
                mostrarMensagemLogin("Esse email ja esta cadastrado.", true)
                return
            }

            if (campoConfirmarSenha.value.trim() !== senha) {
                mostrarMensagemLogin("As senhas nao sao iguais.", true)
                return
            }

            usuarios.push({ email, senha })
            salvarUsuarios(usuarios)
            entrar(email)
            return
        }

        if (!usuarioEncontrado || usuarioEncontrado.senha !== senha) {
            mostrarMensagemLogin("Email ou senha incorretos.", true)
            return
        }

        entrar(email)
    })
}

if (botaoSair) {
    botaoSair.addEventListener("click", () => {
        localStorage.removeItem("usuarioLigooLogado")
        window.location.href = "login.html"
    })
}

if (usuarioLogado) {
    if (estaNoLogin) {
        window.location.href = "index.html"
    } else {
        mostrarTradutor()
    }
} else {
    if (estaNoLogin) {
        mostrarLogin()
    } else {
        window.location.href = "login.html"
    }
}

async function traduzir() {
    if (inputTexto.value.trim() === "") {
        traducaoTexto.textContent = "Digite algo para traduzir."
        return
    }

    resultado.classList.add("carregando")
    traducaoTexto.textContent = "Traduzindo"

    // endereco do servidor com o texto que eu quero traduzir
    let endereco = "https://api.mymemory.translated.net/get?q="
        + encodeURIComponent(inputTexto.value)
        + "&langpair=pt-BR|"
        + idioma.value

    try {
        // resposta do servidor
        let resposta = await fetch(endereco)

        // converto a resposta para um formato mais amigavel
        let dados = await resposta.json()

        traducaoTexto.textContent = dados.responseData.translatedText
    } catch (erro) {
        traducaoTexto.textContent = "Nao foi possivel traduzir agora."
    } finally {
        resultado.classList.remove("carregando")
    }

    // textContent = conteudo do texto
}

function ouvirVoz() {
    // ferramenta de transcricao de audio
    let voz = window.webkitSpeechRecognition

    // Deixando ela PRONTA PARA USO   
    let reconhecimentoVoz = new voz()

    // Configurando a ferramenta
    reconhecimentoVoz.lang = "pt-BR"

    // Me avise quando ele terminou de transcrever a voz
    reconhecimentoVoz.onresult = (evento) => {
        let textoTranscricao = evento.results[0][0].transcript

        inputTexto.value = textoTranscricao

        traduzir()
    }

    reconhecimentoVoz.start()

}
// clicou no botao -> chama a funcao -> monto o enderco ->
// chamo o servidor -> peco esperar -> responde 
