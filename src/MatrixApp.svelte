<script>
	import { createEventDispatcher, tick, onMount, onDestroy, getContext } from 'svelte';
    import { key } from './matrix.js';
    import { onInterval } from './utils.js';

    import { getPreviewEvent } from './event-utils.js';

    import RoomListItem from './RoomListItem.svelte';
    import RoomView from './RoomView.svelte';
    import SettingsView from './settings/SettingsView.svelte';
    import BusTimes from './BusTimes.svelte';
    import TemperatureInfo from './TemperatureInfo.svelte';
    import LightsInfo from './LightsInfo.svelte';
    import PrinterInfo from './PrinterInfo.svelte';
    
    const dispatch = createEventDispatcher();

	const { getClient } = getContext(key);
    const client = getClient();
    
    export let matrixError;

    let favoriteRooms = [];
    let otherRooms = [];

    let chatViewActive = false;

    let sidebarMenuOpened = false;
    let settingsOpened = false;

    export let currentRoom = undefined;

    function logout() {
        currentRoom = undefined;
        client.logout();
        dispatch("logout");
    }

    let now = new Date();
    onInterval(() => {
        now = new Date();
    }, 1000);
</script>

<style>
.header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0 0.9em;
}
.title {
    flex-grow: 1;
}
.time {
    flex-grow: 0;
}
h1 {
    margin: 0;
    font-weight: normal;
}
.container {
    padding: 1em;
    display: grid;
    grid-template-columns: 6fr 2fr;
    grid-template-rows: 3em 1fr 1fr 1fr auto auto auto;
    grid-column-gap: 1em;
    grid-row-gap: 1em; 
    height: 100%;
    box-sizing: border-box;
}
.small-tile {
    border: 1px solid var(--thin-border-color);
    box-sizing: border-box;
    border-radius: 0.5em;
    padding: 1em;
    overflow: hidden;
}
.chatview {
    grid-area: 2 / 1 / 8 / 2;
}
.header {
    grid-area: 1 / 1 / 2 / 3;
}
.temperature {
    grid-area: 2 / 2 / 3 / 3;
}
.lights {
    grid-area: 3 / 2 / 4 / 3;
}
.printer {
    grid-area: 4 / 2 / 5 / 3;
}
.bus1 {
    grid-area: 5 / 2 / 6 / 3;
}
.bus2 {
    grid-area: 6 / 2 / 7 / 3;
}
.bus3 {
    grid-area: 7 / 2 / 8 / 3;
}
</style>

<div class="container">
    <div class="header">
        <h1 class="title">Turku Hacklab</h1><h1 class="time">{(now.getHours()+'').padStart(2,'0')}:{(now.getMinutes()+'').padStart(2,'0')}</h1>
    </div>
    <div class="chatview">
        <RoomView roomId={currentRoom}></RoomView>
    </div>
    <div class="small-tile temperature"><TemperatureInfo></TemperatureInfo></div>
    <div class="small-tile lights"><LightsInfo></LightsInfo></div>
    <div class="small-tile printer"><PrinterInfo></PrinterInfo></div>
    <div class="small-tile bus1"><BusTimes stopIds={[1528,779]} titles={["1528, 779 Hepokankare"]} lines={4}></BusTimes></div>
    <div class="small-tile bus2"><BusTimes stopIds={[967,972]} titles={["967, 972 Pläkkikaupunginkatu"]} lines={4}></BusTimes></div>
    <div class="small-tile bus3"><BusTimes stopIds={[760]} titles={["760 Härkämäki"]} lines={4}></BusTimes></div>
</div>
