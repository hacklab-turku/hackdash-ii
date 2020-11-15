<style>
h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: normal;
}
p {
    margin-top: 0.75em;
}
</style>

<script>
    import config from "./settings/EndpointSettings";
    let firstTemperature;
    let firstHumidity;

    $.when(
        $.get(config.apiLocation+'temp/', {a: 'getTemp'}, function (response) {
            firstTemperature = response.data;
            log(firstTemperature);
        }, 'JSON'),
        $.get(config.apiLocation+'humidity/', {a: 'getHumidity'}, function (response) {
            firstHumidity = response.data;
            log(firstHumidity);
        }, 'JSON')

    ).then(function() {
        let temperatureData = {
            labels: ['',''],
            datasets: [
                {
                    label: 'Temperature',
                    data: [firstTemperature, firstTemperature]
                }
            ]
        };

        let humidityData = {
            labels: ['',''],
            datasets: [{
                label: 'Humidity',
                data: [firstHumidity, firstHumidity]
            }]
        };

        const options = {
            scaleShowGridLines : true,
            scaleGridLineColor : 'rgba('+config.color+',0.1)',
            scaleGridLineWidth : 1,
            scaleShowHorizontalLines: true,
            scaleShowVerticalLines: false,
            bezierCurve : true,
            bezierCurveTension : 0,
            pointDot : true,
            pointDotRadius : 3,
            pointDotStrokeWidth : 1,
            pointHitDetectionRadius : 20,
            datasetStroke : true,
            datasetStrokeWidth : 2,
            datasetFill : true,
            legendTemplate : '<ul class=\'<%=name.toLowerCase()%>-legend\'><% for (var i=0; i<datasets.length; i++){%><li><span style=\'background-color:<%=datasets[i].strokeColor%>\'></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>'
        };
    })

    let addTemperature = function(reading){
        log('addTemperature')

    }
</script>

<h2>Temperature and humidity</h2>
<p class="TemperatureData"></p>