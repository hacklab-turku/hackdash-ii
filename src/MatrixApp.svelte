<script>
	import { tick, onMount, getContext } from 'svelte';
    import { key } from './matrix.js';

    import { getPreviewEvent } from './event-utils.js';

    import RoomListItem from './RoomListItem.svelte';
    import RoomView from './RoomView.svelte';
    
	const { getClient } = getContext(key);
    const client = getClient();
    
    export let matrixError;
    export let narrowView;

    let favoriteRooms = [];
    let otherRooms = [];

    let chatViewActive = false;

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

    window.onpopstate = (event) => {
        unselectRoom();
    }

    onMount(() => {
        client.on("sync", function() {
            updateRoomList();
        });

        updateRoomList();
    });
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

@media (min-width: 870px) {
    .sidebar {
        width: 500px;
        height: 100%;
        overflow-y: scroll;
        flex-shrink: 0;
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

    .hidden {
        display: none;
    }
}
</style>

<div class="container">
    <div class="sidebar" class:hidden={chatViewActive}>
            <h2>Chats</h2>
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
    <div class="mainarea" class:hidden={!chatViewActive}>
    {#if matrixError}
        ERROR!!!
    {:else if currentRoom != undefined}
            <RoomView on:close={()=>{unselectRoom(); history.back()}} roomId={currentRoom}></RoomView>
    {/if}
    </div>
</div>
