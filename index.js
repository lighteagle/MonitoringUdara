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
    this._div.innerHTML = '<h5>Legend</h5><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(103, 171, 57);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">0</text></svg> 000 - 050 Good<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(255, 204, 0);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">51</text></svg> 051 - 100 Moderate<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(238, 138, 25);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">101</text></svg> 101 - 150 Unhealthy for Sensitive Groups<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(156, 39, 43);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">151</text></svg> 151 - 200 Unhealthy<br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(102, 0, 102);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">201</text></svg> 201 - 300 Very Unheathy <br><svg width="42" height="20"><rect width="42" height="17" style="fill:rgb(102, 51, 104);stroke-width:0.1;stroke:rgb(0,0,0)" /><text x="7" y="13.5" font-family="Verdana" font-size="14" fill="white">301</text></svg> 301 - 500 Hazardous<hr><small>Data Source:<br><a href="https://ci.taiwan.gov.tw/dsp/en/environmental_en.aspx/" target="_blank">Civil Taiwan Government</a></small>'
};
legend.addTo(mymap);

let lat = 0
let long = 0
let pm25 = 0
let setPM25 = []
let staName = ""
let obsTime = ""
let dataChart = []
let dataHeat = []

const api_url_station =
    'https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Things?$expand=Locations&$select=name,properties&$count=true&$filter=properties/authority%20eq%20%27%E8%A1%8C%E6%94%BF%E9%99%A2%E7%92%B0%E5%A2%83%E4%BF%9D%E8%AD%B7%E7%BD%B2%27%20and%20substringof(%27%E7%A9%BA%E6%B0%A3%E5%93%81%E8%B3%AA%E6%B8%AC%E7%AB%99%27,name)'

const api_url_pm25 =
    "https://sta.ci.taiwan.gov.tw/STA_AirQuality_v2/v1.0/Datastreams?$expand=Thing,Observations($orderby=phenomenonTime%20desc;$top=1)&$filter=name%20eq%20%27PM2.5%27%20and%20Thing/properties/authority%20eq%20%27%E8%A1%8C%E6%94%BF%E9%99%A2%E7%92%B0%E5%A2%83%E4%BF%9D%E8%AD%B7%E7%BD%B2%27%20and%20substringof(%27%E7%A9%BA%E6%B0%A3%E5%93%81%E8%B3%AA%E6%B8%AC%E7%AB%99%27,Thing/name)&$count=true"


async function getStation() {
    setPM25 = []
    dataChart = []
    dataHeat = []
    const response = await fetch(api_url_pm25)
    const data = await response.json()

    for (item of data.value) {


        const response = await fetch(item.Thing["@iot.selfLink"] + "/Locations")
        const data = await response.json()
        long = data.value[0].location.coordinates[0]
        lat = data.value[0].location.coordinates[1]
        pm25 = item.Observations[0].result
        obsTime = item.Observations[0].phenomenonTime
        staName = item.Thing.properties.englishName

        setPM25 = [...setPM25, {
            staName,
            pm25,
            obsTime
        }]
        dataHeat = [...dataHeat, [lat, long, pm25]]
        dataChart = [...dataChart, [staName, pm25]]
        // console.log(item.Observations[0].phenomenonTime)
        console.log(dataChart)

        var lightgreenMarker = L.ExtraMarkers.icon({
            icon: 'fa-number',
            number: pm25.toString(),
            markerColor: 'green-light',
            shape: 'square',
            prefix: 'fa',
            tooltipAnchor: [15, -25]
        });

        var geojsonMarkerOptions = {
            radius: pm25 * 5,
            fillColor: "green",
            color: "none",
            weight: 0.7,
            opacity: pm25 / 200,
            fillOpacity: pm25 / 200
        };
        const markerCircle = L.circleMarker([lat, long], geojsonMarkerOptions).addTo(mymap)
        const marker = L.marker([lat, long], {
            icon: lightgreenMarker
        }).addTo(mymap)
        //     const txt = `
        // Latitude : ${lat} <br>
        // Longitude :  ${long} <br>
        // Area Name : ${item.properties.areaName}<br>
        // Authority : ${item.properties.authority}<br>
        // City : ${item.properties.city}<br>
        // English Name : ${item.properties.englishName}<br>
        // Station ID : ${item.properties.stationID}<br>
        // Station Type : ${item.properties.stationType}<br>
        // Township : ${item.properties.township}<br>
        // `
        //     marker.bindPopup(txt)
    }
    dataChart.sort((function (index) {
        return function (a, b) {
            return (a[index] === b[index] ? 0 : (a[index] < b[index] ? -1 : 1));
        };
    })(1))
    // lat, lng, intensity
    // const grad = {
    //     0.4: 'purple',
    //     0.65: 'red',
    //     1: 'green'
    // }
    // let heat = L.heatLayer(dataHeat, {
    //     radius: 100,
    //     gradient: grad
    // }).addTo(mymap);

    // H-Chart
    Highcharts.chart('h-chart', {
        chart: {
            type: 'bar'
        },
        title: {
            text: 'PM 2.5 - EPA station'
        },
        subtitle: {
            text: 'Source: <a href="https://ci.taiwan.gov.tw/dsp/en/environmental_air_epa_en.aspx">ci.taiwan.gov.tw</a>'
        },
        xAxis: {
            type: 'category',
            labels: {
                // rotation: -90,
                style: {
                    fontSize: '12px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'PM 2.5'
            }
        },
        legend: {
            enabled: false
        },
        series: [{
            name: 'PM2.5',
            data: dataChart,
            // dataLabels: {
            //     enabled: true,
            //     rotation: -90,
            //     color: '#FFFFFF',
            //     align: 'right',
            //     format: '{point.y:.1f}', // one decimal
            //     y: 10, // 10 pixels down from the top
            //     style: {
            //         fontSize: '13px',
            //         fontFamily: 'Verdana, sans-serif'
            //     }
            // }
        }]
    })
}

getStation()