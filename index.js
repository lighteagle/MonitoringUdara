// bgMap
var mymap = L.map('mapid').setView([25, 121], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

/* Legenda */
var legend = new L.Control({
    position: 'bottomleft'
});
legend.onAdd = function (mymap) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};
legend.update = function () {
    this._div.innerHTML = '<h5>Legend</h5><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(103, 171, 57);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">0</text></svg> Good 0 - 50<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(255, 204, 0);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">51</text></svg> Moderate 51 - 100<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(238, 138, 25);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">101</text></svg> Unhealthy for Sensitive Groups 101 - 150<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(156, 39, 43);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">151</text></svg> Unhealthy 151 - 200<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(102, 0, 102);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">201</text></svg> Very Unheathy 201 - 300<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(102, 51, 104);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">301</text></svg> Hazardous 301 - 500<hr><small>Data Source:<br><a href="https://ci.taiwan.gov.tw/dsp/en/environmental_en.aspx/" target="_blank">Civil Taiwan Government</a></small>'
};
legend.addTo(mymap);

let lat = 0
let long = 0

const api_url =
    'https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Things?$expand=Locations&$select=name,properties&$count=true&$filter=properties/authority%20eq%20%27%E8%A1%8C%E6%94%BF%E9%99%A2%E7%92%B0%E5%A2%83%E4%BF%9D%E8%AD%B7%E7%BD%B2%27%20and%20substringof(%27%E7%A9%BA%E6%B0%A3%E5%93%81%E8%B3%AA%E6%B8%AC%E7%AB%99%27,name)'

async function getStation() {
    const response = await fetch(api_url)
    const data = await response.json()
    console.log(data.value);
    for (item of data.value) {
        console.log(item);
        long = item.Locations[0].location.coordinates[0]
        lat = item.Locations[0].location.coordinates[1]


        var lightgreenMarker = L.ExtraMarkers.icon({
            icon: 'fa-number',
            number: '0',
            markerColor: 'green-light',
            shape: 'square',
            prefix: 'fa',
            tooltipAnchor: [15, -25]
        });
        // return L.marker(latlng, {
        //     icon: lightgreenMarker,
        //     riseOnHover: true
        // });
        const marker = L.marker([lat, long], {
            icon: lightgreenMarker
        }).addTo(mymap)
        const txt = `
    Latitude : ${lat} <br>
    Longitude :  ${long} <br>
    Area Name : ${item.properties.areaName}<br>
    Authority : ${item.properties.authority}<br>
    City : ${item.properties.city}<br>
    English Name : ${item.properties.englishName}<br>
    Station ID : ${item.properties.stationID}<br>
    Station Type : ${item.properties.stationType}<br>
    Township : ${item.properties.township}<br>
    `
        marker.bindPopup(txt)
    }
}

getStation()