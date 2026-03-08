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

async function traduzir() {

    // endereco do servidor com o texto que eu quero traduzir
    let endereco = "https://api.mymemory.translated.net/get?q="
        + inputTexto.value
        + "&langpair=pt-BR|"
        + idioma.value

    // resposta do servidor
    let resposta = await fetch(endereco)

    // converto a resposta para um formato mais amigavel
    let dados = await resposta.json()

    traducaoTexto.textContent = dados.responseData.translatedText

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

        inputTexto.textContent = textoTranscricao

        traduzir()
    }

    reconhecimentoVoz.start()

}
// clicou no botao -> chama a funcao -> monto o enderco ->
// chamo o servidor -> peco esperar -> responde 