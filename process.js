class TuriAppData {
    constructor(nombre, provincia, ubigeo, longitud, latitud) {
        this.nombre = nombre;
        this.provincia = provincia;
        this.ubigeo = ubigeo;
        this.longitud = longitud;
        this.latitud = latitud;
    }
}

// u can use data.js or request.js
fetchData().then(data => {
    let locations = data.features.map(f=>f.properties);

    // DATA CLEANING
    // Step 1: Remove irrelevant data.
    let availables = removeNullLatLng(locations);

    /*Despriorizado
    Step 2: Deduplicate your data.
    Step 3: Fix structural errors.
    Step 4: Deal with missing data.
    Step 5: Filter out data outliers.
    Step 6: Validate your data.
    */

    //DATA TRANSFORMATION (Despriorizado)
    //dict de mapeos a terminos de nuestro proyecto(Despriorizado)

    //PARSE
    let dataParsed = parse(availables);

    //DATA REDUCTION (Priorizado)
    let selected = select(dataParsed)

    // at the end
    sendData(selected);
});


function removeNullLatLng(data) {
    let availables = data.filter(loc => loc.x && loc.y);
    //console.log(availables.length); // 389 -> 346
    return availables
}

function parse(data) {
    let dataParsed = [];
    data.forEach(element => {
        let location = new TuriAppData(element.nombre, element.desprov, element.desubigeo, element.x, element.y);
        dataParsed.push(location);
    });
    //console.table(dataParsed);
    return dataParsed;
}

function select(data) {
    //console.table(data);
    return data.filter(loc => loc.provincia == "Santa");
}


//downloadObjectAsJson(dataParsed, "data");
// call this function when u need to download
function downloadObjectAsJson(exportObj, exportName){
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    //document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

async function sendData(obj) {
    const st = JSON.stringify(obj);
    const blob = new Blob([st], { type: 'application/json' });
    const file = new File([ blob ], 'data.json');

    const formData = new FormData();
    formData.append('file', file, 'data.json');

    let initObject = {
        method: 'POST', redirect: 'follow', body: formData
    };

    const back_TuriApp_URL = 'http://127.0.0.1:5000/files';
    var sendRequest = new Request(back_TuriApp_URL, initObject);
    const response = await fetch(sendRequest);
    //console.log(response);
    return response;
}

function sendDataRustic(obj) {
    let inp = document.getElementById("inp");
    let btn = document.getElementById("btn");
    
    const st = JSON.stringify(obj);
    const blob = new Blob([st], { type: 'application/json' });
    const file = new File([ blob ], 'data.json');

    const dT = new DataTransfer();
    dT.items.add(file);
    inp.files = dT.files;

    btn.click();
}
