const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.querySelector('buttoaskButton')
const iaResponse = document.getElementById('iaResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.converter()
    return converter.makeHtml(text)
}

const perguntarIA = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL =`https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`
    const pergunta = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}.

    ## Tarega
    Sua tarefa é responder perguntas do usuario com base no seu conhecimento do jogo, estratégias, build e dicas ${game}.
    
    ## Regras
    - Se você não sabe a resposta, responda com "Desculpe, não sei a resposta para isso.".
    - Se a pergunta não for sobre o jogo ${game}, responda com "Desculpe, essa pergunta não é sobre ${game}.".
    - Considere a data atual %{new Date().toLocaleDateString()} e o ano atual ${new Date().getFullYear()}.
    - Faça pesquisa atualizadas sobre o patch atual, baseado na data atual para dar uma resposta coerente.
    - Nunca resposta itens que você não tenha certeza de que existe no patche atual.
    - Sempre responda com base no patch atual do jogo ${game}.
    
    ## Resposta
    Economize na resposta, seja direto e claro. Use uma linguagem simples e evite jargões técnicos.
    Responda em markdown, para que o usuário possa ler facilmente.
    Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.


    ## Exemplo de resposta
    Resposta: a build mais atual é: \n\n **itens**: \n\n coloque os itens aqui. \n\n** runas:** \n\n exemplo de runas\n\n
    
    ---
    Pergunta: ${question}
    `    
    const contents = [{
        role: 'user',
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search:{}
    }]
    // chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })
    
    const data = await response.json()
    return data.candidate[0].content.parts[0].test
}

const enviarFormulario = async (event) => {
    event.preventDefault() // Impede o envio do formulário padrão
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value


    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campops.')
        return
    }
    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try{
      const text = await  perguntarIA (question, game, apiKey)
      iaResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
      iaResponse.classList.remove('hidden')
    } catch (error) {
        console.log('Erro: ', error)
}   finally {
    askButton.disabled = false
    askButton.textContent = 'Perguntar'
    askButton.classList.remove('loading')
    }
}
form.addEventListener('submit', enviarFormulario)