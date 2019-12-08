<script>
	import { onMount, getContext } from 'svelte';
    import { matrixcs, key } from './matrix.js';

	const { getClient } = getContext(key);
    const client = getClient();

    export let imageUrl = undefined;
    export let name = undefined;
    export let size;

    let hasImage = false;

    function calculateLetter() {
        // TODO
        return name.charAt(0);
    }

    onMount(async () => {
        await fetch(imageUrl)
            .then(r => {
                if (r.status === 200) { hasImage = true; }
                else { hasImage = false; }
            })
            .catch(r => {
                hasImage = false;
            });
    });
</script>

<style>
.container {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-position: center;
    background-size: cover;
}
.image {
    background-color: white;
}
.noimage {
    background-color: lightblue;
    justify-content: center;
    align-items: center;
    text-align: center;
    display: flex;
}
</style>

{#if hasImage}
<div class="container image" style="background-image: url({imageUrl});">
</div>
{:else}
<div class="container noimage" style="font-size: {size}em;">
{calculateLetter()}
</div>
{/if}