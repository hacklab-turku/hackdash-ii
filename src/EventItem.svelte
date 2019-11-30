<script>
    import MatrixAvatar from './MatrixAvatar.svelte';
    import * as HtmlUtils from './html-utils.js';
	import { getContext, beforeUpdate } from 'svelte';
    import { key } from './matrix.js';
    import { getParentEventId } from './event-utils.js';
    
	const { getClient } = getContext(key);
    const client = getClient();

    export let event;
    export let showSender;

    function getMessageText() {
        let content;
        if (event.replacingEvent()) { content = event.replacingEvent().getContent()['m.new_content'] }
        else { content = event.getContent(); }

        const stripReply = getParentEventId(event);
        if ('body' in content) {
            return HtmlUtils.bodyToHtml(content, [], {
                disableBigEmoji: content.msgtype === "m.emote",
                stripReplyFallback: stripReply,
            });
        }
        else { return "Unsupported message"; }
    }

    let edited = !!event.replacingEvent();
    let messageContent = getMessageText();

    beforeUpdate(() => {
            edited = !!event.replacingEvent();
            messageContent = getMessageText();
    });
</script>
<style>
.avatarwrapper {
    height: 0;
    overflow: visible;
}
.avatar {
    width: 2em;
    height: 2em;
    margin-left: 1em;
    margin-right: 1em;
}
.sendername {
    margin-left: 4em;
    margin-top: 0.3em;
    margin-bottom: 0.3em;
    font-weight: bold;
}
.message {
    margin-left: 4em;
    margin-bottom: 0.5em;
    margin-right: 1em;
}
.edited {
    opacity: 0.5;
    font-size: 0.8em;
}
</style>
{#if showSender}
{#if event.sender}
<div class="avatarwrapper">
    <div class="avatar">
        <MatrixAvatar size="1" mxcUrl={event.sender.getAvatarUrl(client.baseUrl)} name={event.sender.name}></MatrixAvatar>
    </div>
</div>
<div class="sendername">{event.sender.name}</div>
{:else}
<div class="avatarwrapper">
    <div class="avatar">
        <MatrixAvatar size="1" name={event.getSender().charAt(1)}></MatrixAvatar>
    </div>
</div>
<span class="sendername">{event.getSender()}</span>
{/if}
{/if}
<div class="message">
{#if messageContent.isDisplayedWithHtml}{@html messageContent.text}{:else}{messageContent.text}{/if}
{#if edited}<span class="edited">(edited)</span>{/if}
</div>
