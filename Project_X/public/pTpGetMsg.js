//Display msg and user connected to network

let response;
async function pTpGetMsg() {
    if (name.textContent.toString().slice(26).trim() !== "You are not logged in") { // Get Msg from backend only if you are logged in.
        GetMsgFromID(); // This function is on file "ChooseUser.js".
        let GetpTpMsg = await fetch('/user/:id'); // I get the 
        res = await GetpTpMsg.json();
        response = res.dbp2p
    } else if (name.textContent.toString().slice(26).trim() === "You are not logged in") { // Otherwise display to "Msg Output:" that you are not logged in.
        response = 'You are not logged in!'
    }

};


function displaypTp() {
    document.getElementsByName('message')[0].value = `${response}`;

};


function usersDisplay() {
    document.getElementsByName('users')[0].value = `${getName.toString().replaceAll(',','')}`
};


setInterval(() => {
    pTpGetMsg();
    usersDisplay();
}, 1100);

setInterval(() => {
    displaypTp();
}, 1200);