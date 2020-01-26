<script>
	import { onMount, getContext } from 'svelte';
    import { matrixcs, key } from './matrix.js';

	const { getClient } = getContext(key);
    const client = getClient();

    export let imageUrl = undefined;
    export let name = undefined;
    export let size;

    let hasImage = false;

    let img;

    function calculateLetter() {
        // TODO
        return name.charAt(0);
    }

    onMount(() => {
        img.src = imageUrl;
    });
</script>

<style>
.container {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-position: center;
    background-size: cover;
    background-color: white;
}
.noimage {
    background-color: lightblue;
    justify-content: center;
    align-items: center;
    text-align: center;
    display: flex;
}
.avatarimage {
        height: 100%;
        width: 100%;
        object-fit: cover;
        border-radius: 50%;
}
.hidden {
    display: none;
}
</style>

<div class="container" class:noimage={!hasImage} style="font-size: {size}em;">
<img class="avatarimage" bind:this={img} class:hidden={!hasImage} on:load={() => {hasImage=true;}} />
{#if !hasImage}
{calculateLetter()}
{/if}
</div>