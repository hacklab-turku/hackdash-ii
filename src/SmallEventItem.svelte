<script>
    import MatrixAvatar from './MatrixAvatar.svelte';
	import { getContext } from 'svelte';
    import { key } from './matrix.js';
    
	const { getClient } = getContext(key);
    const client = getClient();

    export let event;

    function memberText(e) {
        // there was no previous membership
        if (!('membership' in e.getPrevContent())) {
            // user joined
            if (e.getContent().membership === 'join') {
                return `${e.target.name} joined`;
            }
            // user was invited
            else if (e.getContent().membership === 'invite') {
                return `${e.target.name} was invited`;
            }
            // user was banned
            else if (e.getContent().membership === 'ban') {
                return `${e.target.name} was banned`;
            }
        }
        else {
            // the membership changed
            if (e.getPrevContent().membership !== e.getContent().membership) {
                let prev = e.getPrevContent().membership;
                let curr = e.getContent().membership;
                // user accepted the invitation or user rejoined the room
                if ((prev === 'invite' || prev === 'leave') && curr === 'join') {
                    return `${e.target.name} joined`;
                }
                // user rejected the invitation
                else if (prev === 'invite' && curr === 'leave') {
                    return `${e.target.name} rejected the invitation`;
                }
                // user left (state event sent by themselves)
                else if (prev === 'join' && curr === 'leave' && e.getSender()===e.target.userId) {
                    return `${e.target.name} left`;
                }
                // user was kicked (leave event sent by someone else)
                else if (prev === 'join' && curr === 'leave') {
                    let reason = '';
                    if ('reason' in e.getContent()) { reason = ` (${e.getContent().reason})`; }
                    return `${e.target.name} was kicked by ${e.sender.name}${reason}`;
                }
                // user was banned (ban event sent by someone else)
                else if (prev === 'join' && curr === 'ban') {
                    let reason = '';
                    if ('reason' in e.getContent()) { reason = ` (${e.getContent().reason})`; }
                    return `${e.target.name} was kicked by ${e.sender.name}${reason}`;
                }
            } else {
                let displaynameChange = null;
                let avatarChange = null;
                if (e.getPrevContent().displayname === null && e.getContent().displayname !== null) {
                    displaynameChange = 'set their display name';
                } else if (e.getPrevContent().displayname !== e.getContent().displayname) {
                    displaynameChange = 'changed their display name';
                }
                if (e.getPrevContent().avatar_url === null && e.getContent().avatar_url !== null) {
                    avatarChange = 'set their avatar';
                } else if (e.getPrevContent().avatar_url !== e.getContent().avatar_url) {
                    displaynameChange = 'changed their avatar';
                }
                if (displaynameChange !== null && avatarChange !== null) {
                    return `${e.target.name} ${displaynameChange} and ${avatarChange}`;
                } else if (displaynameChange !== null) {
                    return `${e.target.name} ${displaynameChange}`;
                } else if (avatarChange !== null) {
                    return `${e.target.name} ${avatarChange}`;
                }
            }
        }
        console.log(e);
        return "Unsupported event";
    }

    function getMessageText() {
        switch (event.getType()) {
            case "m.room.member":
                return memberText(event);
            default:
                return "Unsupported event "+event.getType();
        }
    }

    function getTimestamp(event) {
        return new Date(event.getTs()).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute: '2-digit'});
    }
    let timestamp = getTimestamp(event);
</script>
<style>
.container {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    margin-top: 0.2em;
}
.avatar {
    width: 1em;
    height: 1em;
    margin-right: 0.5em;
    flex-shrink: 0;
}
.message {
    margin-bottom: 0.5em;
    margin-right: 1em;
    font-size: 0.9em;
}
.timestamp {
    font-size: 0.6rem;
    flex-shrink: 0;
    text-align: center;
}
@media (min-width: 870px) {
    .timestamp {
        width: 4rem;
    }
}
@media (max-width: 869px) {
    .timestamp {
        width: 3rem;
    }
}
</style>

<div class="container">
    <div class="timestamp">{timestamp}</div>
    {#if event.sender}
        <div class="avatar">
            <MatrixAvatar size="0.5" mxcUrl={event.sender.getAvatarUrl(client.baseUrl)} name={event.sender.name}></MatrixAvatar>
        </div>
    {:else}
        <div class="avatar">
            <MatrixAvatar size="0.5" name={event.getSender().charAt(1)}></MatrixAvatar>
        </div>
    {/if}
    <div class="message">
        {getMessageText()}
    </div>
</div>