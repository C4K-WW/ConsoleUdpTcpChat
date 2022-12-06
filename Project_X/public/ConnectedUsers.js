// Get all user list connected to network and display it on UI.
let getName = new Array();

async function getUserNames() {
    if (name.textContent.toString().slice(26).trim() !== "You are not logged in") {
        let getUsers = await fetch('users');
        if (getUsers.ok) {
            arr = await getUsers.json();
            getName = arr;
        }
    }
};

const UsernameTimer = setInterval(getUserNames, 1000);