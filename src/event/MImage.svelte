<script>
	import { getContext, beforeUpdate } from 'svelte';
    import { key } from '../matrix.js';
    
	const { getClient } = getContext(key);
    const client = getClient();

    export let event;

    function getHeight(event, clientWidth) {
        let i = event.getContent().info;
        let aspectRatio = i.h/i.w;
        return width*aspectRatio;
    }

    export let width;
    let height;
    $: height = getHeight(event, width);
</script>

<style>
    img {
        object-fit: cover;
        border-radius: 7px;
    }
</style>

<img alt={event.getContent().body} src={client.mxcUrlToHttp(event.getContent().url)} width={width} height={height} />