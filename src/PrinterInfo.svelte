<script>
    import config from "./settings/EndpointSettings";
    import { onDestroy } from 'svelte';

    let printerState = {};

    function update() {
        fetch(`${config.octoPrintLocation}api/job`, { headers: { 'X-Api-Key': config.octoPrintApiKey } })
            .then(async response => {
                if (response.ok) {
                    printerState = await response.json();
                } else {
                    printerState = {};
                }
            })
            .catch(() => {
                printerState = {};
            })
    }

    const interval = setInterval(update, 1000*30);
    update();

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

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

{#if !("state" in printerState) || printerState.state === "Offline"}
printer offline
{:else if printerState.state === "Printing"}
printing {printerState.progress.completion}% ({printerState.progress.printTimeLeft} left)
{:else if printerState.state === "Paused"}
printing paused
{:else}
printer online
{/if}