<script>
	import MatrixApp from './MatrixApp.svelte';
	import LoginPage from './LoginPage.svelte';

	import { onMount, setContext } from 'svelte';
    import { settings } from './settings/settingsstore.js';
	import { matrixcs, key } from './matrix.js';

	const currentBreakingVersion = "1";

	const roomToView = "!cVPxWApjrmEqySjnxd:hacklab.fi";

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

		// sort of a simple and hacky way to
		// logout and delete everything if the current data
		// is from before a breaking change
		if (!(localStorage.getItem('breakingVersion') == currentBreakingVersion)) {
			console.log("Breaking changes, logging out!");
			logout();
			localStorage.setItem('breakingVersion', currentBreakingVersion);
		}

		if (!localStorage.getItem('matrixLoginSession')) {
			loggedIn = false;
			return;
		} else {
			loggedIn = true;
			matrixSession = JSON.parse(localStorage.getItem('matrixLoginSession'));
		}

		matrixClient = matrixcs.createClient(
		{
			...matrixSession,
			unstableClientRelationAggregation: true,
			useAuthorizationHeader: true,
			timelineSupport: true,
		});
		matrixClient.on("sync", function(state, prevState, data) {
			switch (state) {
				case "ERROR":
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
		await matrixClient.startClient({
			filter: matrixcs.Filter.fromJson(
				matrixSession.userId,
				undefined,
				{
					presence: {
						not_types: ["*"]
					},
					room: {
						ephemeral: {
							not_types: ["*"]
						},
						rooms: [roomToView]
					}
				}
			)
			//initialSyncLimit: 20,
			//lazyLoadMembers: true,
		});
	}

	function logout() {
		try {
			matrixClient.stopClient();
		} catch (e) {}

		window.localStorage.clear();
		window.localStorage.setItem('breakingVersion', currentBreakingVersion);

		try {
			let indexedDB = window.indexedDB;
			indexedDB.deleteDatabase("matrix-js-sdk:svelte-matrix-sync");
		} catch (e) {}

		matrixClient = undefined;
		loggedIn = false;
		ready = false;
		matrixError = false;
	}
</script>

<style>
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
    margin-left: auto;
    margin-right: auto;
	box-sizing: border-box;
	position: relative;
}
:global(.light-color-scheme) {
	--main-bg-color: white;
	--main-text-color: black;
	--empty-avatar-color: lightblue;
	--hover-bg-color: rgb(240, 240, 240);
	--selected-item-color: lightblue;
	--thin-border-color: rgb(200, 200, 200);
	--box-shadow-color: rgba(0,0,0,0.5);
	--link-color: rgb(0, 73, 151);
	--dim-bg-color: rgba(0,0,0,0.5);
	scrollbar-color: light;
}
:global(.dark-color-scheme) {
	--main-bg-color: rgb(40, 40, 40);
	--main-text-color: white;
	--empty-avatar-color: rgb(83, 83, 83);
	--hover-bg-color: rgb(50, 50, 50);
	--selected-item-color: rgb(64, 64, 64);
	--thin-border-color: rgb(83, 83, 83);
	--box-shadow-color: rgba(0,0,0,0.5);
	--link-color: rgb(200, 200, 200);
	--dim-bg-color: rgba(0,0,0,0.5);
	scrollbar-color: dark;
}
main {
	margin: 0;
	padding: 0;
	width: 100%;
	height: 100%;
	background-color: var(--main-bg-color);
	color: var(--main-text-color);
}
:global(main a) {
	color: var(--link-color);
}
:global(main .fa) {
	color: var(--main-text-color);
}
</style>

<main class="dark-color-scheme">
{#if !loggedIn}
	<div class="app"><LoginPage on:loggedIn={startClient}></LoginPage></div>
{:else}
	{#if !ready}
		<div class="loading"><span>loading...</span></div>
	{:else}
		<div class="app"><MatrixApp on:logout={logout} {matrixError} currentRoom={roomToView}></MatrixApp></div>
	{/if}
{/if}
</main>
