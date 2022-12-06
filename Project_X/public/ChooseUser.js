// You choose from what user/group you want to get msg.
async function GetMsgFromID() {
    let p2pIDselect = document.getElementsByName('p2pID')[0].value; // From input "Select User/Group name:" I get the username/group from where I have to get msg.
    const MsgFromID = await fetch('/ChooseUser/:id/:name', {
        method: 'POST',
        body: (`p2pIDselect=${JSON.stringify(p2pIDselect)}`),
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    });
};