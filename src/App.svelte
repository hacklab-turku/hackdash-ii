<script>
	import MatrixApp from './MatrixApp.svelte';
	import LoginPage from './LoginPage.svelte';

	import { onMount, setContext } from 'svelte';
	import { matrixcs, key } from './matrix.js';

	setContext(key, {
		getClient: () => matrixClient
	});

	let matrixClient;
	let loggedIn = false;
	let ready = false;
	let matrixError = false;

	onMount(async () => {
		await startClient();
	});

	async function startClient() {
		let localStorage = window.localStorage;
		let matrixSession;

		if (!localStorage.getItem('matrixLoginSession')) {
			loggedIn = false;
			return;
		} else {
			loggedIn = true;
			matrixSession = JSON.parse(localStorage.getItem('matrixLoginSession'));
		}
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
			...matrixSession,
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
	}
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
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
	box-sizing: border-box;
    box-shadow: 0px 0px 20px 6px rgba(0, 0, 0, 0.20);
}
</style>

<main>
{#if !loggedIn}
	<div class="app"><LoginPage on:loggedIn={startClient}></LoginPage></div>
{:else}
	{#if !ready}
		<div class="loading"><span>loading...</span></div>
	{:else}
		<div class="app"><MatrixApp {matrixError}></MatrixApp></div>
	{/if}
{/if}
</main>
