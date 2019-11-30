<script>
	import MatrixApp from './MatrixApp.svelte';

	import { onMount, setContext } from 'svelte';
	import { matrixcs, key } from './matrix.js';
	import creds from './temp-creds.js';

	setContext(key, {
		getClient: () => matrixClient
	});

	let matrixClient;
	let ready = false;
	let matrixError = false;

    let width;
    let narrowView;
    $: narrowView = width<768;

	onMount(async () => {
        let indexedDB;
        try {
            indexedDB = window.indexedDB;
        } catch (e) {}

        let storeOpts = {};
        if (indexedDB && localStorage) {
            storeOpts.store = new matrixcs.IndexedDBStore({
                indexedDB: indexedDB,
                dbName: "svelte-matrix-sync",
            });
            await storeOpts.store.startup();
        }

		matrixClient = matrixcs.createClient(
		{
            ...storeOpts,
			...creds,
			unstableClientRelationAggregation: true,
            useAuthorizationHeader: true,
            timelineSupport: true,
		});
		matrixClient.on("sync", function(state, prevState, data) {
			switch (state) {
				case "ERROR":
					console.log("ERROR!!!");
					matrixError = true;
					break;
				case "SYNCING":
					matrixError = false;
					ready = true;
					break;
				case "PREPARED":
					matrixError = false;
					ready = true;
					break;
			}
		});
		window.mxcUrlToHttp = matrixClient.mxcUrlToHttp;
		matrixClient.startClient();
	});
</script>

<style>
main {
	margin: 0;
	padding: 0;
	width: 100%;
	height: 100%;
}
.loading {
	width: 100%;
	height: 100%;
	display: flex;
	text-align: center;
	flex-direction: column;
	justify-content: center;
}
.app {
    height: 100%;
    width: 100%;
    max-width: 1024px;
    margin-left: auto;
    margin-right: auto;
    box-shadow: 0px 0px 20px 6px rgba(0, 0, 0, 0.20);
}
</style>

<main bind:clientWidth={width}>
{#if !ready}
<div class="loading"><span>loading...</span></div>
{:else}
        <div class="app"><MatrixApp {matrixError} {narrowView}></MatrixApp></div>
{/if}
</main>
