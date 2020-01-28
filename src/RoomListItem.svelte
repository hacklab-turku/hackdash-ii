<script>
    import MatrixAvatar from './MatrixAvatar.svelte';
    import { getPreviewEvent, getSimpleText } from './event-utils.js';
	import { getContext, beforeUpdate } from 'svelte';
    import { key } from './matrix.js';

	const { getClient } = getContext(key);
    const client = getClient();

    export let room;
    export let selected;

    let previewEvent = getPreviewEvent(room);

    beforeUpdate(() => {
        previewEvent = getPreviewEvent(room);
    });
</script>

<style>
.container {
    width: 100%;
    height: 4em;
    padding: 0.5em;
    padding-left: 0.8em;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 3em auto;
    grid-template-rows: 1.5em 1.5em;
    grid-column-gap: 0.8em;
    cursor: pointer;
    user-select: none;
    color: var(--main-text-color);
}
.container:hover {
    background-color: var(--hover-bg-color);
}
.avatar {
    width: 3em;
    height: 3em;
    grid-area: 1 / 1 / 3 / 2;
}
.roomname {
    font-weight: bold;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    grid-area: 1 / 2 / 2 / 3;
}
.previewtext {
    padding-top: 0.1em;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    grid-area: 2 / 2 / 3 / 3;
}
.selected {
    background-color: var(--selected-item-color) !important;
}
</style>

<div class="container" class:selected>
    <div class="avatar"><MatrixAvatar size="1" imageUrl={room.getAvatarUrl(client.baseUrl)} name={room.name}></MatrixAvatar></div>
    <span class="roomname">{room.name}</span>
    <span class="previewtext">{#if previewEvent !== undefined}{previewEvent.sender.name}: {getSimpleText(previewEvent)}{/if}</span>
</div>
