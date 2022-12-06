// Login Panel.

let loginPanel = document.getElementById('login');
let inputXML = new Array();
let count = 1;
inputXML.push(`<form action="/suc" method="POST">`);
inputXML.push(`<input type="text" placeholder="Username" name="name" required>`);
inputXML.push(`<input type="password" id="password" placeholder="Password" name="password" required>`);
inputXML.push(`<input type="submit" value="LogIn">`);
inputXML.push(`</form>`);

function loginPan() {
    if (count === 1) {
        loginPanel.innerHTML += inputXML.toString().replaceAll(',', '');
        count = 0;
    } else if (count === 0) {
        loginPanel.innerHTML = '';
        count = 1;
    }
};

// LogOut Panel.

let logoutPanel = document.getElementById('panel');
let inputML = new Array();
inputML.push(`<button onclick="logOut()">Logout</button>`);
let name = document.getElementById('name');

function logOutButton() {
    if (name.textContent.toString().slice(26).trim() !== "You are not logged in") {
        logoutPanel.innerHTML = inputML;
    }
};

logOutButton();

async function logOut() {
    let logOut = await fetch('logout', {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    });
    location.reload();
};