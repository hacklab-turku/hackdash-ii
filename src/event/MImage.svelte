<script>
	import { createEventDispatcher, getContext, beforeUpdate } from 'svelte';
    import { key } from '../matrix.js';
    import { getImageHeight } from '../event-utils.js';
    
    const dispatch = createEventDispatcher();

	const { getClient } = getContext(key);
    const client = getClient();

    export let event;
    export let width;
    
    let height;
    $: height = getImageHeight(event, width);
</script>

<style>
    img {
        object-fit: cover;
        border-radius: 7px;
    }
</style>

<img on:load={() => dispatch('reflow')} alt={event.getContent().body} src={client.mxcUrlToHttp(event.getContent().url)} width={width} height={height} />