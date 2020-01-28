<script>
	import { createEventDispatcher, tick, onMount, onDestroy, getContext } from 'svelte';
    import { key } from './matrix.js';

    import { getPreviewEvent } from './event-utils.js';

    import RoomListItem from './RoomListItem.svelte';
    import RoomView from './RoomView.svelte';
    import SettingsView from './settings/SettingsView.svelte';
    
    const dispatch = createEventDispatcher();

	const { getClient } = getContext(key);
    const client = getClient();
    
    export let matrixError;

    let favoriteRooms = [];
    let otherRooms = [];

    let chatViewActive = false;

    let sidebarMenuOpened = false;
    let settingsOpened = false;

    let currentRoom = undefined;

    function updateRoomList() {
        let rooms = client.getVisibleRooms();
        favoriteRooms = rooms
            .filter(r => "m.favourite" in r.tags)
            .sort((r1, r2) => (r1.tags["m.favourite"] || 0) - (r2.tags["m.favourite"] || 0));
        otherRooms = rooms
            .filter(r => !("m.favourite" in r.tags))
            .sort((r1, r2) => {
                let r1Ts, r2Ts;
                let r1Event = getPreviewEvent(r1);
                let r2Event = getPreviewEvent(r2);
                if (r1Event !== undefined) { r1Ts = r1Event.getTs();}
                else { r1Ts = 0; }
                if (r2Event !== undefined) { r2Ts = r2Event.getTs() }
                else { r2Ts = 0; }
                return (r2Ts) - (r1Ts);
            });
    }

    async function selectRoom(room) {
        if (currentRoom === undefined) {
            history.pushState({roomId: room.roomId}, "", `#${room.roomId}`);
        } else {
            history.replaceState({roomId: room.roomId}, "", `#${room.roomId}`);
        }
        currentRoom = undefined;
        await tick();
        currentRoom = room.roomId;
        chatViewActive = true;
        updateRoomList();
    }

    function unselectRoom() {
        currentRoom = undefined;
        chatViewActive = false;
    }

    function logout() {
        currentRoom = undefined;
        client.removeListener("sync", updateRoomList);
        client.logout();
        dispatch("logout");
    }

    window.onpopstate = (event) => {
        unselectRoom();
    }

    onMount(() => {
        client.on("sync", updateRoomList);

        updateRoomList();
    });

    onDestroy(() => {
        client.removeListener("sync", updateRoomList);
    })
</script>

<style>
h2 {
    margin-left: 0.8em;
}
ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
}
.container {
    display: flex;
    flex-direction: row;
    height: 100%;
}
.sidebarheader {
    display: flex;
    align-items: center;
}
.sidebarheader h2 {
    margin-left: 0.8em;
    flex-grow: 1;
}
.menubutton {
    padding: 1em;
    margin-right: 0.5em;
    position: relative;
}
.menu {
    position: absolute;
    right: 0.5em;
    top: 2.6em;
    background: var(--main-bg-color);
    box-shadow: 0px 2px 15px 0px var(--box-shadow-color);
    display: flex;
    flex-direction: column;
}
.settingscontainer {
    width: 100%;
    height: 100%;
    position: absolute;
    background-color: var(--dim-bg-color);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}
.settingswindow {
    max-width: 100%;
    max-height: 100%;
    width: 50em;
    height: 50em;
    background-color: var(--main-bg-color);
    box-shadow: 0px 2px 15px 0px var(--box-shadow-color);
    z-index: 101;
}
.menuitem {
    padding: 0.5em 0.8em;
    color: var(--main-text-color);
}
.hidden {
    display: none;
}
@media (min-width: 870px) {
    .sidebar {
        width: 30%;
        height: 100%;
        overflow-y: scroll;
        flex-shrink: 0;
        border-right: 1px solid var(--thin-border-color);
    }
    .mainarea {
        flex-shrink: 1;
        flex-grow: 1;
        min-width: 0;
    }
}
@media (max-width: 869px) {
    .sidebar {
        width: 100%;
        height: 100%;
        overflow-y: scroll;
    }
    .mainarea {
        width: 100%;
        height: 100%;
    }
    .sidebarHidden {
        display: none;
    }

}
</style>

{#if settingsOpened}
<div class="settingscontainer" on:click={()=>{settingsOpened=false;}}>
    <div class="settingswindow" on:click={(e)=>{e.stopPropagation()}}>
        <SettingsView on:done={()=>{settingsOpened=false;}}></SettingsView>
    </div>
</div>
{/if}
<div class="container">
    <div class="sidebar" class:sidebarHidden={chatViewActive}>
        <div class="sidebarheader">
            <h2>Chats</h2>
            <a class="menubutton" on:click={() => {sidebarMenuOpened = !sidebarMenuOpened;}}>
                <i class="fa fa-ellipsis-v" aria-hidden="true"></i>
                <div class="menu" class:hidden={!sidebarMenuOpened}>
                    <a on:click={()=>{settingsOpened=true;}} class="menuitem">Settings</a>
                    <a on:click={logout} class="menuitem">Sign out</a>
                </div>
            </a>
        </div>
        <ul>
        {#each favoriteRooms as room (room.roomId)}
        <li><a on:click={async () => await selectRoom(room)}><RoomListItem {room} selected={currentRoom===room.roomId}></RoomListItem></a></li>
        {/each}
        </ul>
        <div style="height:2em;"></div>
        <ul>
        {#each otherRooms as room (room.roomId)}
        <li><a on:click={async () => await selectRoom(room)}><RoomListItem {room} selected={currentRoom===room.roomId}></RoomListItem></a></li>
        {/each}
        </ul>
    </div>
    <div class="mainarea" class:sidebarHidden={!chatViewActive}>
    {#if matrixError}
        error
    {:else if currentRoom != undefined}
            <RoomView on:close={()=>{unselectRoom(); history.back()}} roomId={currentRoom}></RoomView>
    {/if}
    </div>
</div>
