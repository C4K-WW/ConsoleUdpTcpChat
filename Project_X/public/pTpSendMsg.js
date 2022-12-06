// Send message to other users/group

async function p2pSendMsg() {
    const p2pMsg = document.getElementsByName('p2pSend')[0].value; // "Msg Input:" Here I store message. 
    let p2pID = document.getElementsByName('p2pID')[0].value; //"Select User/Group name:" The username/group to whom I want to send that message.
    let Sendp2p = await fetch('/user/:id', {
        method: 'POST',
        body: (`p2pMSG=${JSON.stringify(p2pMsg)}&p2pID=${JSON.stringify(p2pID)}`),
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    });
    document.getElementsByName('p2pSend')[0].value = ''; // After I send the message, I clear the MSG Input:
};