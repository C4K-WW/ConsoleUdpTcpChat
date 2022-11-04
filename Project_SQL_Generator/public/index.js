let mainID = document.getElementById('mainCont');
const table_Field_Name = new Array();
const inputHTML = new Array();

inputHTML.push(`<div id ="id-0" class="row offRow ">`);
inputHTML.push(`<input type="text" name="" class="txtfield" placeholder="Enter field name">`);
inputHTML.push(`<select name="options1" class="typefield">`);
inputHTML.push(`<option value="firstName">First Name</option>`);
inputHTML.push(`<option value="lastName">Last Name</option>`);
inputHTML.push(`<option value="email">Email</option>`);
inputHTML.push(`<option value="gender">Gender</option>`);
inputHTML.push(`<option value="country">Country</option>`);
inputHTML.push(`<option value="city">City</option>`);
inputHTML.push(`<option value="car">Car Model</option>`);
inputHTML.push(`<option value="pet">Pet</option>`);
inputHTML.push(`<option value="date">Date</option>`);
inputHTML.push(`<option value="price">Price</option>`);
inputHTML.push(`<option value="domain">Domain</option>`);
inputHTML.push(`<option value="carName">Car Name</option>`);
inputHTML.push(`</select>`);
inputHTML.push(`<a href="javascript:void(0)" class="turnOff" onclick="rem()">x</a>`);
inputHTML.push(`</div>`);

let count = 0;
msg = document.getElementById('msg-text')

function addField() {
    count++;
    if (count < 10) {
        mainID.innerHTML += inputHTML.toString().replaceAll(',', '');
        console.log(count)
    } else {
        msg.style.color = 'red'
        msg.style.marginTop = '10px'
        msg.textContent = 'You have reached the maximum number of rows!!!';
    }
}
//--Display 3 fields 
for (let i = 0; i < 3; i++) {
    addField();
}



function rem() {
    count--;
    let el = document.getElementsByClassName('offRow')
    el[count].style.display = 'none';
}



async function send() {

    let table = new Array();
    let data = new Array();
    let length = document.getElementsByClassName('txtfield').length
    let table_name = document.getElementsByName('table_name')[0].value;
    let table_rows = document.getElementsByName('rows')[0].value;
    let table_format = document.getElementsByName('options5')[0].value;
    let create_table = document.getElementsByName('create_table')[0].checked;
    let x = ``;
    let rowMsg = document.getElementById('errormsg');
    let window = document.getElementById('mydiv');

    if (table_rows > 1000) {
        table_rows = 1000;
        rowMsg.style.color = 'red';
        rowMsg.style.marginTop = '10px'
        rowMsg.textContent = 'Table rows cannot be more than 1000';
    }
    for (let i = 0; i < length; i++) {

        table[i] = document.getElementsByClassName('txtfield')[i].value;
        x = document.getElementsByClassName('typefield')[i].value;

        if (x === "firstName") {
            const firstName = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                firstName.push(listOfData[i][0]);
            }
            table_Field_Name.push(firstName);

        } else if (x === "lastName") {
            const lastName = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                lastName.push(listOfData[i][1]);
            }
            table_Field_Name.push(lastName);

        } else if (x === "email") {
            const email = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                email.push(listOfData[i][2]);
            }
            table_Field_Name.push(email);

        } else if (x === "gender") {
            const gender = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                gender.push(listOfData[i][3]);
            }
            table_Field_Name.push(gender);

        } else if (x === "country") {
            const country = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                country.push(listOfData[i][4]);
            }
            table_Field_Name.push(country);

        } else if (x === "city") {
            const city = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                city.push(listOfData[i][5]);
            }
            table_Field_Name.push(city);
        } else if (x === "car") {
            const car = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                car.push(listOfData[i][6]);
            }
            table_Field_Name.push(car);
        } else if (x === "pet") {
            const pet = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                pet.push(listOfData[i][7]);
            }
            table_Field_Name.push(pet);
        } else if (x === "date") {
            const date = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                date.push(listOfData[i][8]);
            }
            table_Field_Name.push(date);
        } else if (x === "price") {
            const price = new Array();
            for (let i = 0; i < listOfData.length; i++) {

                price.push(listOfData[i][9]);
            }
            table_Field_Name.push(price);
        } else if (x === "domain") {
            const domain = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                domain.push(listOfData[i][10]);
            }
            table_Field_Name.push(domain);
        } else if (x === "carName") {
            const carName = new Array();
            for (let i = 0; i < listOfData.length; i++) {
                carName.push(listOfData[i][11]);
            }
            table_Field_Name.push(carName);
        }
    }


    if (table_Field_Name.length === 1) {
        for (let i = 0; i < 1000; i++) {
            data.push(`${table_Field_Name[0][i]}`);
        }
    } else if (table_Field_Name.length === 2) {
        for (let i = 0; i < 1000; i++) {
            data.push(`${table_Field_Name[0][i]},${table_Field_Name[1][i]}`);
        }
    } else if (table_Field_Name.length === 3) {
        for (let i = 0; i < 1000; i++) {
            data.push(`${table_Field_Name[0][i]},${table_Field_Name[1][i]},${table_Field_Name[2][i]}`);
        }

    } else if (table_Field_Name.length === 4) {
        for (let i = 0; i < 1000; i++) {
            data.push(`${table_Field_Name[0][i]},${table_Field_Name[1][i]},${table_Field_Name[2][i]},${table_Field_Name[3][i]}`);
        }
    } else if (table_Field_Name.length === 5) {
        for (let i = 0; i < 1000; i++) {
            data.push(`${table_Field_Name[0][i]},${table_Field_Name[1][i]},${table_Field_Name[2][i]},${table_Field_Name[3][i]},${table_Field_Name[4][i]}`);
        }
    } else if (table_Field_Name.length === 6) {
        for (let i = 0; i < 1000; i++) {
            data.push(`${table_Field_Name[0][i]},${table_Field_Name[1][i]},${table_Field_Name[2][i]},${table_Field_Name[3][i]},${table_Field_Name[4][i]},${table_Field_Name[5][i]}`);
        }
    } else if (table_Field_Name.length === 7) {
        for (let i = 0; i < 1000; i++) {
            data.push(`${table_Field_Name[0][i]},${table_Field_Name[1][i]},${table_Field_Name[2][i]},${table_Field_Name[3][i]},${table_Field_Name[4][i]},${table_Field_Name[5][i]},${table_Field_Name[6][i]}`);
        }
    } else if (table_Field_Name.length === 8) {
        for (let i = 0; i < 1000; i++) {
            data.push(`${table_Field_Name[0][i]},${table_Field_Name[1][i]},${table_Field_Name[2][i]},${table_Field_Name[3][i]},${table_Field_Name[4][i]},${table_Field_Name[5][i]},${table_Field_Name[6][i]},${table_Field_Name[7][i]}`);
        }
    } else if (table_Field_Name.length === 9) {
        for (let i = 0; i < 1000; i++) {
            data.push(`${table_Field_Name[0][i]},${table_Field_Name[1][i]},${table_Field_Name[2][i]},${table_Field_Name[3][i]},${table_Field_Name[4][i]},${table_Field_Name[5][i]},${table_Field_Name[6][i]},${table_Field_Name[7][i]},${table_Field_Name[8][i]}`);
        }
    }


    let xml = new XMLHttpRequest();
    xml.open("POST", "/dashboard", true);
    xml.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    xml.send(`table_data=${JSON.stringify(table)}&table_name=${JSON.stringify(table_name)}&table_rows=${JSON.stringify(table_rows)}&table_format=${JSON.stringify(table_format)}&data=${JSON.stringify(data)}&create_table=${JSON.stringify(create_table)}`);


    setTimeout(() => { window.style.display = 'block', display() }, 1500);
}


async function display() {

    shpw = document.getElementById('show');
    let display = await fetch('test');
    let response = await display.json();
    shpw.innerText += await response.test;
}


async function deleteSQL() {
    let deleteSQL = await fetch('closeWindow', {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        }
    });
}

function logout() {
    let logout = true;
    let xml = new XMLHttpRequest();
    xml.open("POST", "/", true);
    xml.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    xml.send(`logout=${JSON.stringify(logout)}`)
}

function img() {
    let imginfo = document.getElementById('img-info')

    if (imginfo.style.display === "none") {
        imginfo.style.display = 'block'
    } else if (imginfo.style.display === 'block') {
        imginfo.style.display = 'none'
    }


}


function download() {
    let checkDownload = true;
    let xml = new XMLHttpRequest();
    xml.open("POST", "/download1", true);
    xml.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
    xml.send(`checkDownload=${JSON.stringify(checkDownload)}`);
}



function noCheck() {
    let downloadMsg = document.getElementById('download-msg');
    downloadMsg.style.color = 'red';
    downloadMsg.style.marginTop = '5px';
    downloadMsg.textContent = 'You need to login if you wish to download it.';
}


function closeWindow() {
    document.getElementById('mydiv').style.display = 'none';
    deleteSQL();
}


dragElement(document.getElementById("mydiv"));

function dragElement(elmnt) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}