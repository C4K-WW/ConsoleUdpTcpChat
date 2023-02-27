const server = require('net').createServer();
const c = require('ansi-colors');
const { Pool } = require('pg');

const db = []; // Keep objects with properties of user Nickname and his related Socket.
const users = new Set(); // Keep the nickname of users who are currently connected to the network. 
const msgDB = {};
const pairs = new Map(); // Keep pairs in both direction.
const alone = {}; // Keep pair only in one direction.
const inbox = {}; // Keep Inbox messages.
const spam = {}; // Keep Spam messages.

connectionString = 'postgresql://dbstudent:dbstudent@localhost:5432/list';
const pool = new Pool({ connectionString: connectionString });

let userDB = [];
async function result() {

    const extract = await new Promise((resolve, reject) => {
        pool.query(`select * from list`,
            (err, result) => {
                if (err) {
                    return reject(err);
                };
                resolve(result.rows);
            })
    });
    for (let value of extract) {
        const userFullDetails = {};
        userFullDetails.user = value.name;
        userFullDetails.password = value.password;
        userFullDetails.away = value.away ? value.away.toString() : '';
        userFullDetails.friends = value.friends ? value.friends.split(',') : [];
        userDB.push(userFullDetails);
    };

};

server.on('connection', (socket) => {
    userDB = [];
    console.log(c.green('Client: ') + socket.remoteAddress + ':' + socket.remotePort + c.greenBright(' is connected.'));
    getUsernameFromUI();

    // Keep the user and password after client is loggin in:
    let userName = '';
    let userPassword = '';

    // To whom you want to send a msg:
    let toUsername = '';
    let keepTrack = '';

    // Here it starts the logg in process: username() & password() and display()

    // Get username from UI:
    function getUsernameFromUI() {
        socket.write('\nEnter your username:', setUserName);
    };

    function setUserName() {
        const user = (data) => {
            userName = data.toString().trim();
            getPasswordFromUI();
        };
        socket.once('data', user);
    };
    //End.

    // Get password from UI:
    function getPasswordFromUI() {
        socket.write('Enter your password:', setUserPassword);
    };

    function setUserPassword() {
        socket.once('data', password);
    };

    async function password(data) {
        await result();
        userPassword = data.toString().trim();
        for (let passwdVar of userDB) {
            if (passwdVar.user === userName && passwdVar.password === userPassword) {
                createInboxSpam();
                display();
                return msg();
            }
        };
        socket.write(c.red('username or password is wrong, bYe.'));
        return socket.destroy();
    };


    //End.

    // Display info after log in:
    function display() {
        const ib = inbox[userName].size;
        const sp = spam[userName].size;
        const onln = onlineFriends().length;
        const loginTime = new Date().getTime();
        socket.write(c.greenBright('You have successfuly logged in as ') + c.bold(`${userName}.\n`));
        const spider = `
            Welcome to the network! 
--------------------------------------------------
                User:  ${userName}                      
|   / _ \\     Online:  ${onln}        Type: '.online ' |
| \\_\\(_)/_/    Inbox:  ${ib}        Type: '.inbox  ' |
|  _//"\\\\_      Spam:  ${sp}        Type: '.spam   ' |
|   /   \\                                        |
|              Type '.help' to see all commands. |
--------------------------------------------------
          `;
        socket.write(spider.trim());

        socket.write(c.bold.yellow(`\n[You]`) + `: `);
        db.push({ socket: socket, username: userName, time: loginTime });
        online();
    };
    // End of log in.


    // Here it starts the part of capturing/send data from/to UI :

    // Check if it is a command or a simple msg:
    function isDirectMessage(msg) {
        return msg[0] !== '.';
    };

    // Extract the actual message from 'data' variable:
    function inputDataToMessage(data) {
        const uiMsg = data.toString().trim().toLowerCase();
        const userIndex = uiMsg.indexOf(':');
        return uiMsg.substr(userIndex + 1, ).trim();
    };

    // Capture the data from UI and check if it is a direct msg or a shell command.
    // If it is a direct msg then call function checkIfUserIsSet(): 
    function msg() {
        socket.on('data', (data) => {
            let addMsg = {};
            const theMsg = inputDataToMessage(data);
            // Send MSG s to UI:
            if (isDirectMessage(theMsg)) {
                checkIfUserIsSet(theMsg, addMsg)
            } else {
                // Command list:
                menu(theMsg);
            };
        });
    };

    // If the data is a direct msg then check if the target Username is set
    // and call the function 'checkIfUserIsOnline()':
    function checkIfUserIsSet(theMsg, addMsg) {
        if (toUsername) {
            addMsg.msg = theMsg;
            addMsg.username = userName;
            addMsg.time = new Date(Date.now()).getHours() + ':' + new Date(Date.now()).getMinutes();
            return checkIfUserIsOnline(theMsg, addMsg);
        } else {
            socket.write(c.bgRedBright(" Error:\n"));
            socket.write(c.italic(" You haven`t choosed to whom you want to send msg!\n"));
            socket.write(c.yellow.underline.bold("HINT:\n"));
            socket.write(c.italic(" .online   'To see who is online'\n"));
            socket.write(c.italic(" .user     'To set username.'\n"));
            socket.write(c.bold.yellow(`[You]`) + `:`);
        };
    };

    // If the target Username is set, then check if the current Username is online
    // and call function sendTheMessage():
    function checkIfUserIsOnline(theMsg, addMsg) {
        for (let value of db) {
            if (value.username === toUsername) {
                return sendTheMessage(value, theMsg, addMsg);
            }
        };
        // Save all msg to history if user is not online:
        return answerWithAnOffline(addMsg);
    };

    // Check if the target Username is not enganged in another conversation,
    // if it is then send the notification to the target and save your msg in
    // inbox if you are in his friend list, otherwise save it in spam:
    function sendTheMessage(value, theMsg, addMsg) {
        const getVal = pairs.get(toUsername);
        const timeNow = ` at ${new Date(Date.now()).getHours() +':'+new Date(Date.now()).getMinutes()}.`
        if (getVal === userName & alone[toUsername] === userName) {
            value.socket.write(c.bold(`\nFrom[`) + c.underline.bold.greenBright(`${userName}`) + c.bold(`]: `) + `${theMsg}` + c.dim.italic(`${timeNow}\n`));
            socket.write(c.bold.yellow(`\n[You]`) + c.bold(` To `) + c.bold(`[${toUsername}]`) + `:`);
            return saveMsg(value.username, addMsg);
        } else {
            addInboxAndSpam(userName);
            return saveMsg(value.username, addMsg);
        }
    };
    // End of UI.


    // From this point below are difined all commands that belongs to menu: '.help' 

    // All online users:
    function online() {
        for (let onlineVar of db) {
            users.add(onlineVar.username);
        }
    };
    // End.


    // Display a list of all your friends:   
    function displayAllfriends() {
        const all = userDB.find((totalFriendsVar) => {
            if (totalFriendsVar.user === userName) {
                return totalFriendsVar
            };
        });
        return all.friends.toString()
    };
    // End.

    // Online friends:'Return an array'.
    function onlineFriends() {
        let i = 0;
        const arrOfon = [];
        const online = Array.from(users);
        const getUserFriends = userDB.find((onFriendVar) => {
            return onFriendVar.user === userName
        });
        const getOnline = getUserFriends.friends.find((onFriendVar) => {
            for (oneByOne of online) {
                if (onFriendVar === oneByOne) {
                    arrOfon.push(onFriendVar);
                };
            };
        });
        return arrOfon
    };
    // End.

    // Set the username to whom you want to send a msg & and display history: toUsername & msgDB.
    function setUsername(data) {
        toUsername = data.toString().trim();
        keepTrack = data.toString().trim();
        addpair();
        socket.write(c.yellow.bold(`Username: `) + c.underline(`${toUsername}`) + ` has been set.\n`);

        if (msgDB.hasOwnProperty(userName)) {
            for (let setUserVar of msgDB[userName]) {
                if (setUserVar.username === toUsername) {
                    socket.write(c.bold(`\nFrom[`) + c.underline.bold.greenBright(`${toUsername}`) + c.bold(`]: `) + c.italic(`${setUserVar.msg}`) + c.dim.italic(` at ${setUserVar.time}.\n`));
                };
            };
        }
        socket.write(c.bold.yellow(`\n[You]`) + c.bold(` To `) + c.bold(`[${toUsername}]`) + `:`);
        deleteMsgFromInboxAndSpam(toUsername);
    };

    // Save all client`s msg in history: msgDB.
    function saveMsg(username, addMsg) {
        const bol = Object.keys(msgDB).find(saveVar => { return username === saveVar });
        if (!bol) {
            msgDB[username] = [];
        };
        msgDB[username].push(addMsg);
    };
    // End.

    // When user is not online you will get an offline msg:
    function answerWithAnOffline(addMsg) {
        for (let offlineVar of userDB) {
            if (offlineVar.user === toUsername) {
                saveMsg(offlineVar.user, addMsg);
                if (offlineVar.away) {
                    socket.write(c.bold(`\nFrom[`) + c.underline.bold.greenBright(`${toUsername}`) + c.bold(`]: `) + `${offlineVar.away}\n`);
                }
                addInboxAndSpam(userName);
                socket.write(c.bold.yellow(`\n[You]`) + c.bold(` To `) + c.bold(`[${toUsername}]`) + `:`);
            }
        }
        toUsername = keepTrack;
    };
    // End.

    // Set an away msg:
    function setAwayMsg(data) {
        awayMsg = data.toString().trim()
        return new Promise((resolve, reject) => {
            pool.query(`update list set away=$1 where name=$2`, [awayMsg, userName],
                (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    resolve('ok');
                    socket.write(c.bgGreen("\n Info:"));
                    socket.write(c.yellow.bold(`\n away: `) + c.italic(`"${awayMsg}"`) + ` has been set.\n`);
                    socket.write(c.bold.yellow(`[You]`) + `:`);
                }
            )
        })
    };
    // End.

    // Save pairs of users who currently are having communication:
    function addpair() {
        const bol = pairs.has(`${keepTrack}`);
        const getVal = pairs.has(userName);
        const key = pairs.get(userName);
        if (getVal & key !== keepTrack) {
            pairs.delete(userName);
            pairs.delete(key);
        };
        if (!bol) {
            pairs.set(`${keepTrack}`, `${userName}`);
            pairs.set(`${userName}`, `${keepTrack}`);
            console.log(pairs);
        };

        alone[userName] = keepTrack;
    };
    // End.

    // User goes out:
    function logout() {
        users.delete(userName);
        for (let i = 0; i < db.length; i++) {
            if (db[i].username === userName) {
                db.splice(i, 1);
            }
        };
        const key = pairs.get(userName);
        pairs.delete(userName);
        pairs.delete(key);
        delete alone[userName];
    };
    // End.

    // Create Inbox and Spam objects:
    function createInboxSpam() {
        if (!inbox[userName] || !spam[userName]) {
            const inboxIn = new Set();
            const spamIn = new Set();
            inbox[userName] = inboxIn;
            spam[userName] = spamIn;
        };
    };

    // Add a msg to Inbox and Spam: Saved in Inbox & Spam.
    function addInboxAndSpam(isInList) {
        if (!inbox[toUsername] || !spam[toUsername]) {
            const inboxIn = new Set();
            const spamIn = new Set();
            inbox[toUsername] = inboxIn;
            spam[toUsername] = spamIn;
        };
        const isAFriend = userDB.find((inboxVariable) => {
            if (inboxVariable.user === toUsername) {
                for (let user of inboxVariable.friends) {
                    if (user === isInList) {
                        return inbox[toUsername].add(isInList);
                    };
                };
            }
        });
        if (!isAFriend) {
            notification(isAFriend);
            return spam[toUsername].add(isInList);
        };
        notification(isAFriend);

    };

    // Delete message from Inbox and Spam after reading:
    function deleteMsgFromInboxAndSpam(delUser) {
        if (inbox[userName].has(delUser)) {
            inbox[userName].delete(delUser);
        };
        if (spam[userName].has(delUser)) {
            spam[userName].delete(delUser);
        };
    };


    // Notification when there is a new msg in Inbox or Spam:
    function notification(isORnot) {
        for (notificationVar of db) {
            if (notificationVar.username === toUsername) {
                spamOrInbox(isORnot);
            }
        }
    };

    function spamOrInbox(isORnot) {
        const inBox = Array.from(inbox[toUsername]).toString();
        const inSpam = Array.from(spam[toUsername]).toString();
        if (isORnot) {
            notificationVar.socket.write(`\n[${c.bold.yellow('Inbox')}:${inBox}] New msg from: ` + c.underline(`${userName}\n`));
            socket.write(c.bold.yellow(`\n[You]`) + c.bold(` To `) + c.bold(`[${toUsername}]`) + `:`);
            return
        };
        if (!isORnot) {
            notificationVar.socket.write(`\n[${c.bold.yellow('Spam')}:${inSpam}] New msg from: ` + c.underline(`${userName}\n`));
            socket.write(c.bold.yellow(`\n[You]`) + c.bold(` To `) + c.bold(`[${toUsername}]`) + `:`);
            return
        };
    };
    // End.

    // Clear history:
    function clearOneUserHistory() {
        if (msgDB[userName]) {
            let i = 0;
            while (i < msgDB[userName].length) {
                if (msgDB[userName][i].username === toUsername) {
                    msgDB[userName].splice(i, 1);
                    i = 0;
                };
                i++;
            };
            socket.write(c.yellow.bold(' All messages from: ') + `${toUsername} is deleted.\n`);
            socket.write(c.bold.yellow(`\n[You]`) + c.bold(` To `) + c.bold(`[${toUsername}]`) + `:`);
        };

        if (!msgDB[userName]) {
            socket.write(c.yellow.bold(' No messages from: ') + `${toUsername}.\n`);
            socket.write(c.bold.yellow(`\n[You]`) + c.bold(` To `) + c.bold(`[${toUsername}]`) + `:`);
        }

        if (!toUsername) {
            socket.write(c.bgRedBright("\n Error:\n"));
            socket.write(c.italic(" You haven`t choosed a username from where you want to delete history!\n"));
            socket.write(c.yellow.underline.bold("HINT:\n"));
            socket.write(c.italic(" .online   'To see who is online'\n"));
            socket.write(c.italic(" .user     'To set username.'\n"));
            socket.write(c.bold.yellow(`[You]`) + `:`);
        };

    };
    // End.


    // Add a new friend:
    async function addFriend(friend) {
        userDB = [];
        await result();
        let addToCurrentFriends = '';
        const listOfFriends = extractFriends();
        if (listOfFriends.friends.length !== 0) {
            addToCurrentFriends = `${listOfFriends.friends.toString().trim()},${friend.toString().trim()}`;
        } else {
            addToCurrentFriends = friend.toString().trim();
        };
        await connectAndUpdated(addToCurrentFriends);
        socket.write(c.yellow.bold(`Username: `) + c.underline(`${friend.toString().trim()}`) + ` has been added.\n`);
        socket.write(c.bold.yellow(`[You]`) + `:`);
        userDB = [];
        await result();
    };

    // Delete a friend:
    async function deleteFriend(friend) {
        let userIndex = '';
        const listOfFriends = extractFriends();
        if (listOfFriends.friends.length !== 0) {
            userIndex = listOfFriends.friends.findIndex((findUserIndex) => {
                return findUserIndex === friend.toString().trim()
            });
        } else {
            socket.write(c.yellow.bold(`Username: `) + ` You do not have any friend in your list.\n`);
            socket.write(c.bold.yellow(`[You]`) + `:`);
            return
        };
        if (userIndex !== -1) {
            listOfFriends.friends.splice(userIndex, 1);
            const removeFromCurrentFriends = listOfFriends.friends.toString().trim();
            await connectAndUpdated(removeFromCurrentFriends);
        } else {
            socket.write(c.yellow.bold(`Username: `) + c.underline(`${friend.toString().trim()}`) + ` doesn't exist on your friends list.\n`);
            socket.write(c.bold.yellow(`[You]`) + `:`);
            return
        };
        socket.write(c.yellow.bold(`Username: `) + c.underline(`${friend.toString().trim()}`) + ` has been deleted.\n`);
        socket.write(c.bold.yellow(`[You]`) + `:`);
        userDB = [];
        await result();
    };

    // Extract only friends list from userDB:
    function extractFriends() {
        return userDB.find((extractAllFriends) => {
            return extractAllFriends.user === userName
        });
    };

    // This function connects to the DB and update friends list of the selected user:
    async function connectAndUpdated(valueToUpdate) {
        const user = valueToUpdate.trim();
        await new Promise(async(resolve, reject) => {
            pool.query(`update list set friends=$1 where name=$2`, [user, userName],
                (err, result) => {
                    if (err) {
                        reject(err);
                    };
                    resolve(result);
                }
            );
        });
    };
    // End.

    // This function allow user to change his own password:
    function updatePassword(data) {
        const newPassword = data.toString().trim();
        return new Promise((resolve, reject) => {
            pool.query(`update list set password=$1 where name=$2`, [newPassword, userName],
                (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    resolve('ok');
                    socket.write(c.yellow.bold(`Password: `) + c.underline(`${newPassword}`) + ` has been set.\n`);
                    socket.write(c.bold.yellow(`[You]`) + `:`);
                })
        })
    };
    // End.

    // Get full information about selected user:
    function whois(user) {
        const name = user.toString().trim();
        let date1 = '';
        let IP = '';
        let PORT = '';
        let IP_Version = '';
        for (infoUser of db) {
            if (infoUser.username === name) {
                IP = infoUser.socket.remoteAddress;
                PORT = infoUser.socket.remotePort;
                IP_Version = infoUser.socket.remoteFamily;
                date1 = infoUser.time;
            }
        };
        if (IP) {
            socket.write(c.bgGreen(" Info:\n"));
            socket.write(c.bold.yellow(`  Name:`) + ` ${name}\n`);
            socket.write(c.bold.yellow(`Uptime:`) + ` ${userUpTime(date1)}\n`);
            socket.write(c.bold.yellow(`   IPv:`) + ` ${IP_Version}\n`);
            socket.write(c.bold.yellow(`    IP:`) + ` ${IP}\n`);
            socket.write(c.bold.yellow(`  Port:`) + ` ${PORT}\n`);
            socket.write(c.bold.yellow(`[You]`) + `:`);
        } else {
            socket.write(c.bold.yellow(`Status:`) + ` Offline\n`);
            socket.write(c.bold.yellow(`[You]`) + `:`);
            userUpTime();
        };

        toUsername = keepTrack;
    };

    // Get uptime for function:"whois()".
    function userUpTime(date1) {
        date2 = new Date();
        let difference = date2.getTime() - date1;
        let daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
        difference -= daysDifference * 1000 * 60 * 60 * 24;
        let hoursDifference = Math.floor(difference / 1000 / 60 / 60);
        difference -= daysDifference * 1000 * 60 * 60;
        let minutesDifference = Math.floor(difference / 1000 / 60);

        return daysDifference + ' day/s ' + hoursDifference + ' hour/s ' + minutesDifference + ' minute/s'
    };
    // End.

    // Command list:
    function menu(theMsg) {
        switch (theMsg) {
            case '.all':
                socket.write(c.bgGreen(" Info:\n"));
                socket.write(c.yellow.bold(' Online users: ') + `${Array.from(users).toString()}\n`);
                socket.write(c.bold.yellow(`[You]`) + `:`);
                break;

            case '.inbox':
                socket.write(c.bgGreen(" Info:\n"));
                socket.write(c.yellow.bold(' Messages from: ') + `${Array.from(inbox[userName]).toString()}\n`);
                socket.write(c.bold.yellow(`[You]`) + `:`);
                break;

            case '.spam':
                socket.write(c.bgGreen(" Info:\n"));
                socket.write(c.yellow.bold(' Messages from: ') + `${Array.from(spam[userName]).toString()}\n`);
                socket.write(c.bold.yellow(`[You]`) + `:`);
                break;

            case '.user':
                socket.write('Enter username:');
                toUsername = 'n0Wher3';
                socket.once('data', setUsername);
                break;

            case '.to':
                socket.write('Enter username:');
                toUsername = 'n0Wher3';
                socket.once('data', setUsername);
                break;

            case '.usr':
                socket.write('Enter username:');
                toUsername = 'n0Wher3';
                socket.once('data', setUsername);
                break;

            case '.away':
                toUsername = 'n0Wher3';
                socket.write('Enter away msg:');
                socket.once('data', setAwayMsg);
                break;

            case '.clear':
                clearOneUserHistory();
                break;

            case '.online':
                socket.write(c.bgGreen(" Info:\n"));
                socket.write(c.yellow.bold(' List of friends:  ') + `${displayAllfriends()}\n`);
                socket.write(c.yellow.bold(' From them online: ') + `${onlineFriends().toString()}\n`);
                socket.write(c.bold.yellow(`[You]`) + `:`);
                break;

            case '.whois':
                toUsername = 'n0Wher3';
                socket.write('Enter username:');
                socket.once('data', whois);
                break;

            case '.add':
                toUsername = 'n0Wher3';
                socket.write('Enter username:');
                socket.once('data', addFriend);
                break;

            case '.del':
                toUsername = 'n0Wher3';
                socket.write('Enter username:');
                socket.once('data', deleteFriend);
                break;

            case '.password':
                toUsername = 'n0Wher3';
                socket.write('Enter new password:');
                socket.once('data', updatePassword);
                break;

            case '.passwd':
                toUsername = 'n0Wher3';
                socket.write('Enter new password:');
                socket.once('data', updatePassword);
                break;

            case '.exit':
                socket.write(c.red(`bYe ${userName}.`));
                logout();
                return socket.destroy();
                break;

            case '.end':
                socket.write(c.red(`bYe ${userName}.`));
                logout();
                return socket.destroy();
                break;

            case '.help':
                socket.write(c.bgGreen(" Info:\n"));
                socket.write(` These shell commands are defined internally.\n`);
                socket.write(c.italic(" .online   'To see who is online'\n"));
                socket.write(c.italic(" .inbox    'To see inbox messages'\n"));
                socket.write(c.italic(" .spam     'To see spam messages'\n"));
                socket.write(c.italic(" .user     'To set username with whom you want to talk.'\n"));
                socket.write(c.italic(" .add      'To add a new friend to your list.'\n"));
                socket.write(c.italic(" .del      'To delete a friend from your list.'\n"));
                socket.write(c.italic(" .away     'Auto message when you are not online.'\n"));
                socket.write(c.italic(" .clear    'Clear history from a specific user.'\n"));
                socket.write(c.italic(" .password 'To change your password.'\n"));
                socket.write(c.italic(" .exit     'End connection to the chat.'\n"));
                socket.write(c.bold.yellow(`[You]`) + `:`);
                break;

            case '.author':
                socket.write(` This chat was built by an Moldovan-Romanian citizen Diaconu Sandu in 2023.\n`);
                socket.write(c.bold.yellow(`[You]`) + `:`);
                break;

            default:
                socket.write(c.bgRedBright(" Error:\n"));
                socket.write(c.italic(` Command `) + c.bold(`${theMsg}`) + c.italic(` does not exist.\n`));
                socket.write(c.yellow.underline.bold("HINT:\n"));
                socket.write(c.italic(" .help   'To see list of all commands'\n"));
                socket.write(c.bold.yellow(`[You]`) + `:`);
        };
    };
    // End of command define.

    socket.on('end', () => {
        console.log(c.green('Client: ') + socket.remoteAddress + c.redBright(' is disconnected.'));
        logout();
    });

});

server.listen(3000, () => {
    console.log(c.yellowBright('Server is On'));
});