<script>
    import { settings } from './settingsstore.js';
    import { onMount } from 'svelte';

    export let name;
    export let label;
    export let defaultValue;

    let currentValue;
    
    try {
        currentValue = $settings[name];
    } catch (e) {
        console.log("setting default value");
        settings.setSetting(name, defaultValue);
        currentValue = defaultValue;
    }

    $: settings.setSetting(name, currentValue);
</script>


<label>
    <input type="checkbox" name={name} bind:checked={currentValue} />
    {label}
</label>