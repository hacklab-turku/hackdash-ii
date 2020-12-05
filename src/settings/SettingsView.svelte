<script>
    import { createEventDispatcher } from 'svelte';
    
    import Checkbox from './Checkbox.svelte';

    const dispatch = createEventDispatcher();
</script>

<style>
.container {
    padding: 1em;
}
.header {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.header h2 {
    flex-grow: 1;
    margin: 0 0.5em;
}
.closebutton {
    padding: 0.5em 0.75em;
    font-size: 1.5rem;
}
</style>

<div class="container">
    <div class="header">
        <h2>Settings</h2>
        <a class="closebutton" href="/" on:click={()=>{dispatch("done")}}><i class="fa fa-times" aria-hidden="true"></i></a>
    </div>
    <div class="maincontent">
    <Checkbox name={"darkColorScheme"} label={"Dark color scheme"} defaultValue={false}></Checkbox>
    </div>
</div>