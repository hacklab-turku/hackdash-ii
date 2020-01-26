<script>
    import EventItem from './EventItem.svelte';
    import SmallEventItem from './SmallEventItem.svelte';
    import MatrixAvatar from './MatrixAvatar.svelte';

    import { eventDisplayType } from './event-utils.js';

	import { createEventDispatcher, tick, onMount, onDestroy, getContext, beforeUpdate, afterUpdate } from 'svelte';
    import { key } from './matrix.js';
    
	const { getClient } = getContext(key);
    const client = getClient();

    export let roomId;
    let room;

    let scrolledToBottom = true;
    let oldDistanceFromBottom = 0;
    let initialLoad = true;
    let eventlist;

    let width = 100;

    const dispatch = createEventDispatcher();

    function getPreviousDisplayEventIndex(i) {
        if (i<=0) { return i; }
        else if (i >= room.getLiveTimeline().getEvents().length) { return i; }

        let previousDisplayEventIndex = i-1;
        while (previousDisplayEventIndex >= 0) {
            switch (eventDisplayType(room.getLiveTimeline().getEvents()[previousDisplayEventIndex])) {
                case "DISPLAY":
                case "SMALL":
                    return previousDisplayEventIndex;
                default:
                    previousDisplayEventIndex--;
                    break;
            }
        }
        return previousDisplayEventIndex;
    }

    function shouldShowSender(i) {
        if (i <= 0) { return true; }
        else if (i >= room.getLiveTimeline().getEvents().length) { return true; }

        let thisEvent = room.getLiveTimeline().getEvents()[i];
        if (thisEvent == undefined) { return false; }
        
        let prevEvent = room.getLiveTimeline().getEvents()[getPreviousDisplayEventIndex(i)];
        if (prevEvent == undefined) { return true; }

        switch (eventDisplayType(prevEvent)) {
            case "DISPLAY":
                return (thisEvent.getSender() != prevEvent.getSender()) ||
                        (thisEvent.getTs()-prevEvent.getTs() > 300000);
            case "SMALL":
                return true;
            default:
                break;
        }

        return true;
    }

    function shouldShowDateSeparator(i) {
        if (i <= 0) { return true; }
        else if (i >= room.getLiveTimeline().getEvents().length) { return false; }

        let thisEvent = room.getLiveTimeline().getEvents()[i];
        if (thisEvent == undefined || eventDisplayType(thisEvent) == "NONE") { return false; }

        let prevEvent = room.getLiveTimeline().getEvents()[getPreviousDisplayEventIndex(i)];
        if (prevEvent == undefined) {
            return true;
        }

        let eventDate = new Date(thisEvent.getTs());
        let previousEventDate = new Date(prevEvent.getTs());

        return !(
            eventDate.getFullYear() === previousEventDate.getFullYear() &&
            eventDate.getMonth() === previousEventDate.getMonth() &&
            eventDate.getDate() === previousEventDate.getDate()
        );

    }

    function onRoomTimeline(event, eventRoom, toStartOfTimeline, removed, data) {
        if (eventRoom.roomId == roomId) {
            room = room;
        }
    }

    onMount(async () => {
        await tick();
        room = client.getRoom(roomId);
        client.on("Room.timeline", onRoomTimeline);
        checkScrolledToTop();
    });

    onDestroy(() => {
        client.removeListener("Room.timeline", onRoomTimeline);
    })

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
        reflow();
    });
    
    function reflow() {
        if (eventlist) {
            if (scrolledToBottom) { eventlist.scrollTo(0, eventlist.scrollHeight); }
            else { eventlist.scrollTo(0, eventlist.scrollHeight-oldDistanceFromBottom); };
            checkScrolledToTop();
        }
    }

    let timelineTopPlaceholder;
    let scrollBackPromise;

    function checkScrolledToTop() {
        if (eventlist && timelineTopPlaceholder) {
            const windowBounds = eventlist.getBoundingClientRect();
            const placeholderBounds = timelineTopPlaceholder.getBoundingClientRect();

            if (placeholderBounds.bottom >= windowBounds.top && scrollBackPromise === undefined) {
                scrollBackPromise = scrollBack();
            }
        }
    }

    function scrollBack() {
        return client.paginateEventTimeline(
            room.getLiveTimeline(),
            { backwards: true })
            .then(()=>{
                room = room;
                scrollBackPromise = undefined;
            });
    }
</script>

<style>
.topbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 3em;
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
    width: 2em;
    height: 2em;
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
    line-height: 2.5em;
    padding: 0 1em;
    border-top: 1px solid rgb(200, 200, 200);
}
.event {
    position: relative;
}

.dateseparator {
  margin: 0.3em;
  text-align: center;
  border-bottom: 1px solid rgb(200, 200, 200);
  font-size: 0.9rem;
  margin-bottom: 0.4em;
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

<div class="container" bind:clientWidth={width}>
    {#if room}
        <div class="topbar">
            <a on:click={()=>dispatch('close')} class="backbutton"><i class="fa fa-angle-left" aria-hidden="true"></i></a>
            <div class="roomavatar"><MatrixAvatar size="1" imageUrl={room.getAvatarUrl(client.baseUrl)} name={room.name}></MatrixAvatar></div>
            <span class="roomname">{room.name}</span>
        </div>
        <div bind:this={eventlist} on:scroll={checkScrolledToTop} class="eventlist">
            <div class="spacer"></div>
            <div class="timelineTopPlaceholder" bind:this={timelineTopPlaceholder}>
            {#await scrollBackPromise}
            loading...
            {:then ok}
            load more messages
            {:catch error}
            {error.message}
            {/await}
            </div>
            {#each room.getLiveTimeline().getEvents() as event, i (event.getId())}
                {#if shouldShowDateSeparator(i)}
                    <div class="dateseparator">
                        {new Date(event.getTs()).toDateString()}
                    </div>
                {/if}
                {#if eventDisplayType(event) == "DISPLAY"}
                    <div class="event"><EventItem on:reflow={reflow} {width} {room} {event} showSender={shouldShowSender(i)}></EventItem></div>
                {:else if eventDisplayType(event) == "SMALL"}
                    <div class="event"><SmallEventItem on:reflow={reflow} {event}}></SmallEventItem></div>
                {/if}
            {/each}
        </div>
        <div class="messagebar">sorry, no sending messages yet</div>
    {:else}
        loading...
    {/if}
</div>
