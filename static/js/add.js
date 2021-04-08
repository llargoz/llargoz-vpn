const check_btn = document.getElementById("check_btn");
const add_btn = document.getElementById("add_btn");
const ddns = document.getElementById("ddns");
const msg = document.getElementById("msg");

function foo() {
    ddns.value = '';
    msg.value = '';
    add_btn.disabled = true;
    console.log('??');
}


let url = new URL(window.location.href)
const realUrl = url.protocol + "//" + url.host

async function newFetch(url, data) {
    let res = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })

    //response from server "resData"
    let resData
    if (res.ok) {
        resData = await res.json();
    } else {
        alert("Ошибка HTTP: " + res.status);
    }

    return resData
}

check_btn.addEventListener("click", click)

async function click (){
    const data = {
        type: 1,
        host: ddns.value
    }
    let resData = await newFetch(realUrl, data)
    if (resData > -1) {
        alert(resData)
    } else
        alert(resData)
}

msg.oninput = () => {
    if(msg.value.charAt(0).match(/\s/)) {
        msg.value = '';
    }
}