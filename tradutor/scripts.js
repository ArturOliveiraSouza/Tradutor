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
let idiomaOrigem = document.querySelector("#idioma-origem")
let idioma = document.querySelector("#idioma")
let resultado = document.querySelector(".resultado")
let botaoTema = document.querySelector(".botao-tema")
let botaoTraduzir = document.querySelector(".botao-traduzir")
let botaoPdf = document.querySelector(".botao-pdf")
let botaoBaixar = document.querySelector(".botao-baixar")
let arquivoPdf = document.querySelector("#arquivo-pdf")
let estadoArquivo = document.querySelector(".estado-arquivo")
let nomeArquivoBase = "traducao"
localStorage.removeItem("usuariosLigoo")
localStorage.removeItem("usuarioLigooLogado")

if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"
}

function atualizarTema(tema) {
    let estaNoModoEscuro = tema === "escuro"
    document.body.dataset.tema = estaNoModoEscuro ? "escuro" : "claro"
    botaoTema.setAttribute("aria-pressed", String(estaNoModoEscuro))
    botaoTema.setAttribute("aria-label", estaNoModoEscuro ? "Ativar modo claro" : "Ativar modo escuro")
    botaoTema.title = estaNoModoEscuro ? "Ativar modo claro" : "Ativar modo escuro"
    botaoTema.querySelector(".texto-tema").textContent = estaNoModoEscuro ? "Modo claro" : "Modo escuro"
}

atualizarTema(localStorage.getItem("temaLigoo") || "escuro")

botaoTema.addEventListener("click", () => {
    let novoTema = document.body.dataset.tema === "escuro" ? "claro" : "escuro"
    localStorage.setItem("temaLigoo", novoTema)
    atualizarTema(novoTema)
})

arquivoPdf.addEventListener("change", carregarPdf)
botaoPdf.addEventListener("click", baixarPdf)
botaoBaixar.addEventListener("click", baixarTraducao)

async function carregarPdf(evento) {
    let arquivo = evento.target.files[0]

    if (!arquivo) {
        return
    }

    botaoBaixar.hidden = true
    estadoArquivo.textContent = "Lendo PDF..."
    nomeArquivoBase = arquivo.name.replace(/\.pdf$/i, "") || "traducao"

    try {
        if (!window.pdfjsLib) {
            throw new Error("PDF.js indisponível")
        }

        let documento = await pdfjsLib.getDocument({ data: await arquivo.arrayBuffer() }).promise
        let paginas = []

        for (let numeroPagina = 1; numeroPagina <= documento.numPages; numeroPagina++) {
            estadoArquivo.textContent = `Lendo página ${numeroPagina} de ${documento.numPages}...`
            let pagina = await documento.getPage(numeroPagina)
            let conteudo = await pagina.getTextContent()
            let textoPagina = conteudo.items
                .map((item) => item.str + (item.hasEOL ? "\n" : " "))
                .join("")
                .replace(/[ \t]+\n/g, "\n")
                .replace(/[ \t]{2,}/g, " ")
                .trim()

            if (textoPagina) {
                paginas.push(textoPagina)
            }
        }

        let textoExtraido = paginas.join("\n\n")

        if (!textoExtraido) {
            estadoArquivo.textContent = "Este PDF não tem texto selecionável."
            return
        }

        inputTexto.value = textoExtraido
        traducaoTexto.textContent = "Texto do PDF carregado."
        estadoArquivo.textContent = `${arquivo.name} · ${documento.numPages} página(s)`
    } catch (erro) {
        estadoArquivo.textContent = "Não foi possível ler este PDF."
    }
}

function dividirTexto(texto, limite = 400) {
    let trechos = []
    let inicio = 0

    while (inicio < texto.length) {
        let fim = Math.min(inicio + limite, texto.length)

        if (fim < texto.length) {
            let ultimoEspaco = texto.lastIndexOf(" ", fim)
            let ultimaQuebra = texto.lastIndexOf("\n", fim)
            let pontoDeCorte = Math.max(ultimoEspaco, ultimaQuebra)

            if (pontoDeCorte > inicio) {
                fim = pontoDeCorte + 1
            }
        }

        trechos.push(texto.slice(inicio, fim))
        inicio = fim
    }

    return trechos
}

async function traduzir() {
    let texto = inputTexto.value.trim()

    if (texto === "") {
        traducaoTexto.textContent = "Digite algo para traduzir."
        return
    }

    let trechos = dividirTexto(texto)
    let traducoes = []
    botaoTraduzir.disabled = true
    botaoPdf.hidden = true
    botaoBaixar.hidden = true
    resultado.classList.add("carregando")

    try {
        for (let indice = 0; indice < trechos.length; indice++) {
            traducaoTexto.textContent = `Traduzindo trecho ${indice + 1} de ${trechos.length}...`
            let endereco = "https://api.mymemory.translated.net/get?q="
                + encodeURIComponent(trechos[indice])
                + "&langpair=" + idiomaOrigem.value + "|"
                + idioma.value
            let resposta = await fetch(endereco)

            if (!resposta.ok) {
                throw new Error("Falha na tradução")
            }

            let dados = await resposta.json()
            let traducaoTrecho = dados.responseData?.translatedText

            if (!traducaoTrecho) {
                throw new Error("A API não retornou a tradução")
            }

            traducoes.push(traducaoTrecho)
        }

        traducaoTexto.textContent = traducoes.join("")
        botaoPdf.hidden = false
        botaoBaixar.hidden = false
    } catch (erro) {
        traducaoTexto.textContent = "Não foi possível traduzir todo o texto. Tente novamente mais tarde."
    } finally {
        resultado.classList.remove("carregando")
        botaoTraduzir.disabled = false
    }
}

function baixarPdf() {
    if (botaoPdf.hidden) {
        return
    }

    let tituloOriginal = document.title
    document.title = `${nomeArquivoBase}-traduzido`
    window.addEventListener("afterprint", () => {
        document.title = tituloOriginal
    }, { once: true })
    window.print()
}

function baixarTraducao() {
    let arquivo = new Blob([traducaoTexto.textContent], { type: "text/plain;charset=utf-8" })
    let endereco = URL.createObjectURL(arquivo)
    let link = document.createElement("a")

    link.href = endereco
    link.download = `${nomeArquivoBase}-traduzido.txt`
    document.body.append(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(endereco), 1000)
}

function ouvirVoz() {
    // ferramenta de transcricao de audio
    let voz = window.webkitSpeechRecognition

    // Deixando ela PRONTA PARA USO   
    let reconhecimentoVoz = new voz()

    // Configurando a ferramenta
    let idiomasDeVoz = {
        "pt-BR": "pt-BR",
        en: "en-US",
        es: "es-ES",
        fr: "fr-FR",
        de: "de-DE",
        it: "it-IT",
        ja: "ja-JP",
        ko: "ko-KR",
        "zh-CN": "zh-CN",
        ru: "ru-RU",
        ar: "ar-SA",
        hi: "hi-IN",
        tr: "tr-TR",
        nl: "nl-NL",
        sv: "sv-SE",
        pl: "pl-PL",
        el: "el-GR",
        he: "he-IL",
        th: "th-TH",
        vi: "vi-VN",
        id: "id-ID"
    }

    reconhecimentoVoz.lang = idiomasDeVoz[idiomaOrigem.value] || idiomaOrigem.value

    // Me avise quando ele terminou de transcrever a voz
    reconhecimentoVoz.onresult = (evento) => {
        let textoTranscricao = evento.results[0][0].transcript

        inputTexto.value = textoTranscricao

        traduzir()
    }

    reconhecimentoVoz.start()

}
