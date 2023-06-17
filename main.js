const scriptUrl = 'https://script.google.com/macros/s/AKfycbzLNCcTihqZ1iOyLNn7oQB6B1xxYyTD2XvXXXBSsIZ1S19eud8N6yTmS6s34QgzTB9FOg/exec'; // Ссылка на развернутое веб-приложение gas
let dataOnSite = "";

window.onload = () => {
    showAllNotes();
}

function AdderSettings() {
    let singleNotice = document.getElementById("singleNotice");

    singleNotice.innerHTML = "<div id=\"contactForm\" class=\"ms-3 me-3\">" +
        "<div class=\"mb-2\">" +
        "<label for=\"title\" class=\"form-label\">Title<sup>*</sup></label>" +
        "<input type=\"text\" class=\"form-control\" id=\"title\" aria-describedby=\"emailHelp\" required>" +
        "<div id=\"emptyTitle\" class=\"invalid-feedback collapse\">" +
        "This field is required." +
        "</div>" +
        "</div>" +
        "<div class=\"mb-2\">" +
        "<label for=\"dateTime\" class=\"form-label\">Date Time</label>" +
        "<input type=\"datetime-local\" class=\"form-control\" id=\"dateTime\" aria-describedby=\"emailHelp\">" +
        "</div>" +
        "<div class=\"mb-2\">" +
        "<label for=\"description\" class=\"form-label\">Description</label>" +
        "<input type=\"text\" class=\"form-control\" id=\"description\" aria-describedby=\"emailHelp\" >" +
        "</div>" +
        "<div class=\"mb-2\">" +
        "<label for=\"attached\">Choose file to attach:</label>"+
        "<input type=\"text\" class=\"form-control\" id=\"attached\" aria-describedby=\"emailHelp\" >" +
        "</div>" +
        "<button type=\"submit\" class=\"btn btn-outline-dark bg-white text-dark\" id=\"btnSubmit\" onclick=\"SubmitBtn();\">Submit</button>" +
        "<button type=\"submit\" class=\"btn btn-outline-dark bg-white text-dark\" id=\"btnCancel\" onclick=\"CancelBtn();\">Cancel</button>" +
        "</div>";
}

function SubmitBtn() {
    const titleInput = document.getElementById("title");
    const oldTitleInput = document.getElementById("oldTitle");

    if (titleInput.value === "") {
        document.getElementById("title").classList.add("is-invalid");
        document.getElementById("emptyTitle").classList.remove("collapse");
        window.location.href = "index.html#title";
        return;
    }

    const dateTimeInput = document.getElementById("dateTime");
    const descriptionInput = document.getElementById("description");
    const attachedInput = document.getElementById("attached");
    addPostData(oldTitleInput, titleInput, dateTimeInput, descriptionInput, attachedInput);
}

function CancelBtn() {
    window.location.href = "index.html";
}

function addPostData(oldTitleInput, titleInput, dateTimeInput, descriptionInput, attachedInput) {
    const formData = new FormData();
    let dataOnSite = JSON.parse(localStorage.getItem("dataOnSite"));
    let length = dataOnSite.length;

    if ("index" in localStorage) {
        console.log(localStorage.getItem("index"));
        dataOnSite[localStorage.getItem("index")] = {
            "title": titleInput.value,
            "oldTitle": oldTitleInput.value,
            "dateTime": dateTimeInput.value.toString(),
            "description": descriptionInput.value,
            "attached": attachedInput.value
        };
        localStorage.removeItem("index")
        localStorage.setItem("dataOnSite", JSON.stringify(dataOnSite));
    } else {
        console.log(length);
        dataOnSite.unshift({
            "title": titleInput.value,
            "dateTime": dateTimeInput.value.toString(),
            "description": descriptionInput.value,
            "attached": attachedInput.value
        });
        localStorage.setItem("dataOnSite", JSON.stringify(dataOnSite));
    }

    formData.append('operation', 'addPostData');

    formData.append('title', titleInput.value);
    if ("index" in localStorage) {
        formData.append('oldTitle', oldTitleInput.value);
    } else {
        formData.append('oldTitle', "nullValue");
    }
    formData.append('dateTime', dateTimeInput.value.toString());
    formData.append('description', descriptionInput.value);
    formData.append('attached', attachedInput.value);

    localStorage.setItem("size", dataOnSite.length);
    addGotData(dataOnSite);
    window.location.href = "index.html";

    fetch(scriptUrl, {
        method: 'POST', body: formData
    })
        .then(res => res.json())
    localStorage.removeItem("index");
}

function showAllNotes(dataLocal = JSON.parse(localStorage.getItem("dataOnSite"))) {
    if (("dataOnSite" in localStorage)) {
       addGotData(dataLocal);
    } else {
        fetch(scriptUrl)
            .then(res => res.json())
            .then(data => {
                data = data.reverse();
                localStorage.setItem("size", data.length);
                localStorage.setItem("dataOnSite", JSON.stringify(data));
                dataOnSite = data;
                console.log(data);
                addGotData(data);
            })
    }
}

function addGotData(data) {
    let listOfNotice = document.getElementById("listOfNotice");
    listOfNotice.innerHTML = "";
    data.forEach((row, index) => {
        if (row.title !== '' && row.description !== '')
        {
            listOfNotice.innerHTML += "<div class=\"card mt-2 btn\" style='background: white' onclick=\"openNotice(this)\" data-singleNotice = '"+ JSON.stringify(row) +"'>" +
                    "<div class=\"card-body\">" +
                        "<div style='display: flex; justify-content: space-between'>"+
                            "<h5 class=\"card-title\" style=\"overflow: hidden; text-overflow: ellipsis; height: 1.5em; white-space: nowrap\">" + row.title + "</h5>" +
                            "<div>" +
                                "<button type=\"button\" class=\"btn btn-icon\" onclick=\"editNoticeFunction(this)\" data-id='" + index + "' data-singleNotice = '"+ JSON.stringify(row) +"'><span class='pen me-1'></span></button>" +
                                "<button type=\"button\" class=\"btn btn-icon\" onclick=\"deleteNoticeFunction(this)\" data-title='" + row.title + "'><span class='trash me-1'></span></button>" +
                            "</div>" +
                        "</div>"+
                        "<div class=\"card-text\" style=\"overflow: hidden; max-height: 1.5em\">" + row.description + "</div>" +
                    "</div>" +
                "</div>"
        }
    })
}

function openNotice(object) {
    let singleNotice = document.getElementById("singleNotice");
    let singleNoticeObj = JSON.parse(object.getAttribute("data-singleNotice"));

    singleNotice.innerHTML = "<div class=\"card mt-2\" style='position: relative; height: 100vh'>" +
            "<div class=\"card-body\">" +
                "<h5 class=\"card-title\">" + singleNoticeObj.title + "</h5>" +
                "<h6 class=\"card-subtitle mb-2 text-muted\">"+ singleNoticeObj.dateTime + "</h6>" +
                "<div class=\"card-text mb-3 \">" + singleNoticeObj.description + "</div>" +
                "<div class=\"card-text\" style='height: 80%; max-height: 80%'>" + "<iframe src='"+ singleNoticeObj.attached.split(/\/view|\/edit/)[0] +"/preview' allow=\"autoplay\" width='100%' height='100%'></iframe>" + "</div>" +
            "</div>" +
        "</div>";
}

function editNoticeFunction(object) {
    event.stopPropagation();

    localStorage.setItem("index", object.getAttribute("data-id"));
    let singleNotice = document.getElementById("singleNotice");
    let singleNoticeObj = JSON.parse(object.getAttribute("data-singleNotice"));

    singleNotice.innerHTML = "<div id=\"contactForm\" class=\"ms-3 me-3\">" +
        "<input type=\"text\" class=\"form-control collapse\" id=\"oldTitle\" aria-describedby=\"emailHelp\" value='"+ singleNoticeObj.title +"' required>" +
            "<div class=\"mb-2\">" +
                "<label for=\"title\" class=\"form-label\">Title<sup>*</sup></label>" +
                "<input type=\"text\" class=\"form-control\" id=\"title\" aria-describedby=\"emailHelp\" value='"+ singleNoticeObj.title +"' required>" +
                "<div id=\"emptyTitle\" class=\"invalid-feedback collapse\">" +
                "This field is required." +
                "</div>" +
            "</div>" +
            "<div class=\"mb-2\">" +
                "<label for=\"dateTime\" class=\"form-label\">Date Time</label>" +
                "<input type=\"text\" class=\"form-control\" id=\"dateTime\" aria-describedby=\"emailHelp\" value='"+ singleNoticeObj.dateTime +"'>" +
            "</div>" +
            "<div class=\"mb-2\">" +
                "<label for=\"description\" class=\"form-label\">Description</label>" +
                "<input type=\"text\" class=\"form-control\" id=\"description\" aria-describedby=\"emailHelp\" value='"+ singleNoticeObj.description +"'>" +
            "</div>" +
            "<div class=\"mb-2\">" +
                "<label for=\"attached\">Choose file to attach:</label>"+
                "<input type=\"text\" class=\"form-control\" id=\"attached\" aria-describedby=\"emailHelp\" value='"+ singleNoticeObj.attached +"'>" +
            "</div>" +
            "<button type=\"submit\" class=\"btn btn-outline-dark bg-white text-dark\" id=\"btnSubmit\" onclick=\"SubmitBtn();\">Submit</button>" +
            "<button type=\"submit\" class=\"btn btn-outline-dark bg-white text-dark\" id=\"btnCancel\" onclick=\"CancelBtn();\">Cancel</button>" +
        "</div>";
}

function deleteNoticeFunction(object) {
    let data = JSON.parse(localStorage.getItem("dataOnSite"));
    let Index = data.findIndex(o => o.title == object.getAttribute("data-title"))
    data.splice(Index, 1);
    localStorage.setItem("dataOnSite", JSON.stringify(data));
    const formData = new FormData();
    formData.append('operation', 'deleteNotice');
    formData.append('title', object.getAttribute("data-title"));
    addGotData(data);
    localStorage.setItem("size", data.length);
    fetch(scriptUrl, {
        method: 'POST', body: formData
    })

        .then(res => res.json())
}

function searchNotice() {
    const searchInput = document.getElementById("searchInput");
    const formData = new FormData();
    formData.append('operation', 'searchNotice');
    formData.append('value', searchInput.value);
    fetch(scriptUrl, {
        method: 'POST', body: formData
    })
        .then(res => res.json())
        .then(data => {
            //Выводим данные
            showAllNotes(data);
        })
}

function exportNotices() {
    let a = document.createElement("a");
    let dataOnSite = JSON.parse(localStorage.getItem("dataOnSite"));
    let file = new Blob([JSON.stringify(dataOnSite.reverse())], {type: "application/json"});
    a.href = URL.createObjectURL(file);
    a.download = "export.json";
    a.click();
}

function getImportFile() {
    let fileInput = document.getElementById("file");
    fileInput.click();
}

function importNotices() {
    let fileInput = document.getElementById("file");
    getImportFile()
    fileInput.onchange = () => {
        if (!fileInput) {
            alert("Couldn't find the file input element.");
        } else if (!fileInput.files) {
            alert("This browser doesn't seem to support the `files` property of file inputs.");
        } else if (!fileInput.files[0]) {
            alert("Please select a file before clicking 'Load'");
        } else {
            let file = fileInput.files[0];
            let fr = new FileReader();
            fr.onload = receivedText;
            fr.readAsText(file);
        }

        function receivedText(e) {
            let lines = JSON.parse(e.target.result);
            localStorage.setItem("dataOnSite", JSON.stringify(lines.reverse()));
            localStorage.setItem("size", lines.length);
            lines = e.target.result
            const formData = new FormData();
            formData.append('operation', 'importNotice'); // тип операции
            formData.append('data', lines);
            fetch(scriptUrl, {
                method: 'POST', body: formData
            })
                .then(() => {
                })
        }
    };
}

function sync() {
    localStorage.clear();
    window.location.href = "index.html";
}