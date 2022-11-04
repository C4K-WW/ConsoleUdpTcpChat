let getText = {};
document.getElementsByName('message')[0].value = getText;

function displayMessage() {
    if (Object.entries(getText).length !== 0) {
        document.getElementsByName('message')[0].value += `\n${getText.user}:${getText.message}\n`;
    }
}

async function send() {
    const sendText = document.getElementsByName('send')[0].value;
    const sendNick = document.getElementsByName('sendNick')[0].value;
    let sendMessage = await fetch('get', {
        method: 'POST',
        body: (`sendMessage=${JSON.stringify(sendText)}&sendNick=${JSON.stringify(sendNick)}`),
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    })
}

async function getMessage() {
    try {
        let getMessage = await fetch('get');
        getText = await getMessage.json();
        console.log(getText);
        displayMessage();
    } catch (err) {
        console.log(`Nothing Yet`);
    }
}

// let x = setInterval(getMessage, 1000);