<script>
    export let userId;

    function getNetworkIcon(id) {
        if (/@_telegram_.+:hacklab\.fi/.test(id)) {
            return "telegram.png";
        } else if (/@freenode_.+:matrix\.org/.test(id)) {
            return "irc.png";
        } else {
            return "matrix.png";
        }
    }
</script>

<style>
.container {
    height: 0.9em;
    width: 0.9em;
    display: inline-block;
    margin-left: 0.4em;
}

img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    opacity: 0.75;
}
</style>

<div class="container">
    <img src={getNetworkIcon(userId)} alt="SenderNet">
</div>