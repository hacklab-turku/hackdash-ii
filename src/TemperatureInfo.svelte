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
    import { onInterval } from './utils.js';

    let firstTemperature;
    let firstHumidity;

    async function refreshTemperature() {
            return fetch(config.apiLocation+'temp/?a=getTemp').then(async temperatureResponse => {
                let data = await temperatureResponse.json();
                if(data.status === "OK") {
                    firstTemperature = (await data).data;
                    console.log("Temperature value: " +firstTemperature);
                }else {
                    firstTemperature = 0;
                    console.log("RefreshTemperature: " + data.status)
                }
            })
    }
    async function refreshHumidity() {
        return fetch(config.apiLocation+'humidity/?a=getHumidity').then(async humidityResponse => {
            let humidityData = await humidityResponse.json();
            if(humidityData.status === "OK") {
                firstHumidity = (await humidityData).data;
                console.log("Humidity value: " +firstHumidity);
            } else {
                firstHumidity = 0;
            }
        })
    }

    onInterval(refreshTemperature, 30000);
    refreshTemperature();
    onInterval(refreshHumidity, 30000);
    refreshHumidity();
</script>

<h2>Temperature and humidity</h2>
<p>
    Temperature: {firstTemperature} C. <br>
    Humidity: {firstHumidity} %.
</p>