<script>
    import { createEventDispatcher, getContext } from 'svelte';
    import { key } from './matrix.js';

	const { getClient } = getContext(key);
    const client = getClient();

    const dispatch = createEventDispatcher();

    let separateServerUrl = false;
    function switchLoginType() {
        separateServerUrl = !separateServerUrl;
        hsURL = "";
        servername = ""
    }

    let hsURL = "";
    let strippedHsURL;
    function stripHsURL(input) {
        // strip trailing slash
        return input.replace(/\/$/, "");
    }
    $: strippedHsURL = stripHsURL(hsURL);

    let servername = "";
    let strippedServername;
    function stripServername(input) {
        // strip protocol and trailing slash if someone inputs those
        let servername = input.replace(/^https?:\/\//, "");
        return servername.replace(/\/$/, "");
    }
    $: strippedServername = stripServername(servername);

    let serverNamePromise;
    let hsNameValidated = false;

    async function getServerUrlAndValidate() {
        hsNameValidated = false;
        strippedHsURL = "";
        let response = await fetch(`https://${strippedServername}/_matrix/client/versions`)
            .catch(()=>{throw new Error("Matrix server not available!");});
        if (response.status === 200) {
            const data = await response.json();
            if ('versions' in data) {
                hsNameValidated = true;
                strippedHsURL = `https://${strippedServername}`;
                return true;
            }
        }

        response = await fetch(`https://${strippedServername}/.well-known/matrix/client`)
            .catch(()=>{throw new Error("Matrix server not available");});
        if (response.status !== 200) { throw new Error(""); }
        const data = await response.json();
        if ('m.homeserver' in data && 'base_url' in data['m.homeserver']) {
            hsNameValidated = true;
            strippedHsURL = stripHsURL(data['m.homeserver']['base_url']);
            return true;
        }
        throw new Error("Not a Matrix server!");
    }

    async function validateHomeserver(url) {
        hsNameValidated = false;
        if (!url.match(/^https?:\/\//)) { throw new Error("Server URL must start with http:// or https://"); }
        const response = await fetch(`${url}/_matrix/client/versions`)
            .catch(()=>{throw new Error("Matrix server not available");});
        if (response.status !== 200) { throw new Error("Matrix server not available"); }
        const data = await response.json();
        if ('versions' in data) {
            hsNameValidated = true;
            return true;
        } else { throw new Error("Not a Matrix server"); }
    }

    let localpart = "";
    let strippedLocalpart;
    function stripLocalpart(input) {
        // if you put a MXID in the localpart field, extract the localpart from it
        let localpart = input.replace(/^@/, "");
        return localpart.replace(/:.*/, "");
    }
    $: strippedLocalpart = stripLocalpart(localpart);

    let password = "";

    async function login() {
        if (separateServerUrl) {
            await validateHomeserver(strippedHsURL);
        } else {
            await getServerUrlAndValidate();
        }
        if (!hsNameValidated) { throw new Error("Please fill in a valid homeserver"); }
        if (localpart==="") { throw new Error("Please fill in a username"); }

        // check if password login is supported
        let response = await fetch(`${strippedHsURL}/_matrix/client/r0/login`)
            .catch(()=>{throw new Error("Matrix server not available");});
        if (response.status !== 200) { throw new Error("Matrix server not available"); }
        let data = await response.json();
        if (!data.flows.some(f => f.type === "m.login.password")) { throw new Error("Matrix server does not support password login"); }

        let requestData = {
            type: "m.login.password",
            identifier: {
                type: "m.id.user",
                user: localpart
            },
            password: password
        };

        let request = new Request(
            `${strippedHsURL}/_matrix/client/r0/login`,
            {
                method: 'POST',
                body: JSON.stringify(requestData)
            });
        response = await fetch(request)
            .catch(()=>{throw new Error("Matrix server not available");});
        data = await response.json();
        if (response.status === 400) {
            if (data.errcode == "M_FORBIDDEN") { throw new Error("Incorrect username or password"); }
            else if (data.errcode == "M_USER_DEACTIVATED") { throw new Error("User has been deactivated"); }
            else { throw new Error("Unknown login error"); }
        } else if (response.status === 429) {
            throw new Error("Ratelimited, try again soon");
        } else if (response.status !== 200) {
            throw new Error("Unknown login error");
        }

        const loginData = {
            baseUrl: strippedHsURL,
            userId: data.user_id,
            accessToken: data.access_token,
            deviceId: data.device_id
        };
        let localStorage = window.localStorage;
        localStorage.setItem('matrixLoginSession', JSON.stringify(loginData));

        dispatch('loggedIn');
    }
    let loginPromise;
</script>

<style>
    .container {
        display: flex;
        flex-direction: column;
        max-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }
    h3 {
        margin-bottom: 0.25em;
    }
    a {
        margin-bottom: 2em;
    }
    .username {
        display: flex;
        flex-direction: row;
        align-items: baseline;
    }
    .localpart,.servername {
        flex-shrink: 1;
        flex-grow: 1;
        min-width: 0;
    }
</style>

<div class="container">
    {#if separateServerUrl}
        <h3>Login using homeserver URL and username</h3>
        <a href="#" on:click={switchLoginType}>Use Matrix ID instead?</a>
        <input type="text" placeholder="Homeserver URL" bind:value={hsURL} on:focusout={()=>serverNamePromise=validateHomeserver(strippedHsURL)} />
        <input type="text" placeholder="Username" bind:value={localpart} />
    {:else}
        <h3>Login using Matrix ID</h3>
        <a href="#" on:click={switchLoginType}>Use server URL and username instead?</a>
        <div class="username">@<input class="localpart" type="text" placeholder="Username" bind:value={localpart} />:<input class="servername" type="text" placeholder="Server name" bind:value={servername} on:focusout={()=>serverNamePromise=getServerUrlAndValidate()} /></div>
    {/if}
    <input type="password" placeholder="Password" bind:value={password} />
    {#await serverNamePromise}
        Loading...
    {:then ok}
        <input type="button" value="Login" disabled={!hsNameValidated || localpart===""} on:click={()=>loginPromise=login()} />
        {#await loginPromise}
            Logging in...
        {:then ok}
        {:catch error}
            {error.message}
        {/await}
    {:catch error}
        <input type="button" value="Login" disabled={true} />
        {error.message}
    {/await}
</div>