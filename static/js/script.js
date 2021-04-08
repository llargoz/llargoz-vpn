let url = "http://localhost:3000/";

function loadStorage() {
    let body = {
        type: 0
    }
    fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        header: {
            'Content-Type': 'application/text'
        }
    }).then(response => response.json())
        .then(data => {
            if ((data === "Таблица пустая") || (data === "Таблица не существует")) {
                alert(data);
                localStorage.removeItem("data");
            } else
                localStorage.setItem("data", JSON.stringify(data));
        }).catch(console.error);
}

function createHTML() {
    loadStorage();
    let object = JSON.parse(localStorage.getItem("data"));
    let code = '';
    if (object !== null) {
        for (let i = 0; i < object.country.length; i++) {
            code = code +
                "<tr>\n" +
                "            <td data-label=\"Страна\">\n" +
                object.country[i] +
                "            </td>\n" +
                "            <td data-label=\"DDNS\">\n" +
                object.host[i] +
                "            </td>\n" +
                "            <td data-label=\"IP адрес\">\n" +
                object.ip[i] +
                "            </td>\n" +
                "            <td data-label=\"Файл OpenVPN\">\n" +
                "<a class='file_link' href=\"" + 'config_files/' + object.host[i] + '.ovpn' + "\" download>Open VPN Config File</a>" +
                "            </td>\n" +
                "        </tr>"
        }
    }
    document.write(code);
}

setTimeout(function () {
    if(window.location.hash !== '#r') {
        window.location.hash = 'r';
        window.history.back();
        window.location.reload(1);
    }
}, 300);