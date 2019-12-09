<script>
	import { onMount, getContext, beforeUpdate } from 'svelte';
    import { key } from '../matrix.js';

	const { getClient } = getContext(key);
    const client = getClient();

    export let event;
</script>

<style>
    img {
        height: 100%;
        width: 100%;
        object-fit: cover;
        border-radius: 7px;
    }
</style>

<img alt={event.getContent().body} src={client.mxcUrlToHttp(event.getContent().url)} />