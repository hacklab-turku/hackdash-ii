<script>
    import EventItem from './EventItem.svelte';
    import SmallEventItem from './SmallEventItem.svelte';
    import MatrixAvatar from './MatrixAvatar.svelte';

    import { eventDisplayType } from './event-utils.js';

	import { createEventDispatcher, tick, onMount, getContext, beforeUpdate, afterUpdate } from 'svelte';
    import { key } from './matrix.js';
    
	const { getClient } = getContext(key);
    const client = getClient();

    export let roomId;
    let room;

    let scrolledToBottom = true;
    let oldDistanceFromBottom = 0;
    let initialLoad = true;
    let eventlist;

    const dispatch = createEventDispatcher();

    function shouldShowSender(i) {
        if (i === 0) { return true; }
        else if (i >= room.getLiveTimeline().getEvents().length) { return true; }

        let previousDisplayEventIndex = i-1;
        while (previousDisplayEventIndex >= 0) {
            switch (eventDisplayType(room.getLiveTimeline().getEvents()[previousDisplayEventIndex])) {
                case "DISPLAY":
                    return room.getLiveTimeline().getEvents()[i].getSender() !=
                           room.getLiveTimeline().getEvents()[previousDisplayEventIndex].getSender();
                case "SMALL":
                    return true;
                default:
                    break;
            }
            previousDisplayEventIndex--;
        }

        return true;
    }

    onMount(async () => {
        await tick();
        room = client.getRoom(roomId);
        client.on("Room.timeline", function(event, eventRoom, toStartOfTimeline, removed, data) {
            if (eventRoom.roomId == roomId) {
                room = room;
            }
        });
    });

    beforeUpdate(() => {
        room = room;
        if (!initialLoad) {
            if (eventlist) {
                scrolledToBottom = eventlist.clientHeight + eventlist.scrollTop > eventlist.scrollHeight - 20;
                oldDistanceFromBottom = eventlist.scrollHeight-eventlist.scrollTop;
            }
        } else {
            initialLoad = false;
        }
	});

	afterUpdate(() => {
        if (eventlist) {
            if (scrolledToBottom) { eventlist.scrollTo(0, eventlist.scrollHeight); }
            else { eventlist.scrollTo(0, eventlist.scrollHeight-oldDistanceFromBottom); };
        }
	});
</script>

<style>
.topbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 4em;
    border-bottom: 1px solid rgb(200, 200, 200);
}
.backbutton {
    height: 100%;
    width: 2.5em;
    display: flex;
    align-items: center;
    justify-content: center;
}
.roomavatar {
    width: 3em;
    height: 3em;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    margin-left: 1em;
    margin-right: 1em;
}
.roomname {
    font-weight: bold;
}
.container {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
}
.eventlist {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    max-height: 100%;
    overflow-y: scroll;
    flex-grow: 1;
}
.spacer {
    flex-grow: 1;
}
.messagebar {
    min-height: 3em;
    border-top: 1px solid rgb(200, 200, 200);
}
.event {
    position: relative;
}

@media (min-width: 870px) {
    .backbutton {
        display: none;
    }
}
@media (max-width: 869px) {
    .roomavatar {
        margin-left: 0;
        margin-right: 0.75em;
    }
}
</style>

<div class="container">
    {#if room}
        <div class="topbar">
            <a on:click={()=>dispatch('close')} class="backbutton"><i class="fa fa-angle-left" aria-hidden="true"></i></a>
            <div class="roomavatar"><MatrixAvatar size="1" imageUrl={room.getAvatarUrl(client.baseUrl)} name={room.name}></MatrixAvatar></div>
            <span class="roomname">{room.name}</span>
        </div>
        <div bind:this={eventlist} class="eventlist">
            <div class="spacer"></div>
            {#each room.getLiveTimeline().getEvents() as event, i (event.getId())}
                {#if eventDisplayType(event) == "DISPLAY"}
                    <div class="event"><EventItem {room} {event} showSender={shouldShowSender(i)}></EventItem></div>
                {:else if eventDisplayType(event) == "SMALL"}
                    <div class="event"><SmallEventItem {event}}></SmallEventItem></div>
                {/if}
            {/each}
        </div>
        <div class="messagebar"></div>
    {:else}
        loading...
    {/if}
</div>
