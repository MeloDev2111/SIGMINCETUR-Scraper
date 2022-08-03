// now we can get data from MINCETUR with multiple filters
async function fetchData() {
    let reqHeader = new Headers();
    reqHeader.append('Content-Type', 'text/plain; charset=utf-8');
    let initObject = {
        method: 'GET', headers: reqHeader, redirect: 'follow'
    };

    //simple http server with python and a cors proxy free service
    //python -m http.server
    const corsProxyUrl = 'https://thingproxy.freeboard.io/fetch/';
    const sigminceturUrl = 'https://sigmincetur.mincetur.gob.pe/turismo/sistema/consulta/selectData.ashx';
    //todo: automatize this
    const queryparams = "?ubigeo=02"

    var scraperRequest = new Request(corsProxyUrl + sigminceturUrl + queryparams, initObject);
    const response = await fetch(scraperRequest);
    return await response.json();
}