<script>
    import { onInterval } from './utils.js';
    
    export let stopIds;
    export let titles;
    export let lines;

    let bustimes = Array(lines);

    async function refreshStops() {
        //let response = await fetch(`https://data.foli.fi/siri/sm/${stopId}`)
        //    .catch(()=>{throw new Error("Foli server not available!");});
        let data = await Promise.all(
            stopIds.map(stopId => {
                console.log(`fetching ${stopId}`)
                return fetch(`https://data.foli.fi/siri/sm/${stopId}`)
                    .then(async response => {
                        const data = await response.json();
                        if ('status' in data && data.status == "OK") {
                            return data.result
                                .map((stopTime) => {
                                    if ('error' in stopTime) return stopTime;
                                    return {
                                        shortname: stopTime.lineref,
                                        longname: stopTime.destinationdisplay,
                                        time: new Date(stopTime.expecteddeparturetime*1000).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'}),
                                        expecteddeparturetime: stopTime.expecteddeparturetime
                                    }
                                })
                        }
                    })
                    .catch(()=>[])
            })
        )
        console.log(data)
        data = data.flat();
        data.sort((a,b) => a.expecteddeparturetime - b.expecteddeparturetime)
        bustimes = data.slice(0, lines)
    }

    onInterval(refreshStops, 30000);
    refreshStops();
</script>

<style>
h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: normal;
}
h3 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: normal;
}
ul {
    padding-left: 0;
    margin-bottom: 0;
    list-style-type: none;
}
li {
    margin-bottom: 0.2em;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
.busline {
    opacity: 0.75;
}
li:empty:before {
  content: "\200b";
}
</style>

{#each titles as title}
    <h3>{title}</h3>
{/each}

<ul>
    {#each bustimes as b}
        {#if b === undefined}
            <li></li>
        {:else if 'error' in b}
            <li class="busline">{b.error}</li>
        {:else}
            <li>{b.time} <span class="busline">- {b.shortname} {b.longname}</span></li>
        {/if}
    {/each}
</ul>