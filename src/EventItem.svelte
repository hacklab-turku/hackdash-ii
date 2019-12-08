<script>
    import MatrixAvatar from './MatrixAvatar.svelte';
    import MImage from './event/MImage.svelte';
    import Reply from './event/Reply.svelte';

    import * as HtmlUtils from './html-utils.js';
	import { getContext, beforeUpdate } from 'svelte';
    import { key } from './matrix.js';
    import { getParentEventId, getViewType } from './event-utils.js';
    
	const { getClient } = getContext(key);
    const client = getClient();

    export let event;
    export let room;
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

    let edited;
    let messageText;
    let messageViewType;

    let replyEventId;
    let replyTo;

    beforeUpdate(() => {
            edited = !!event.replacingEvent();
            messageText = getMessageText();
            messageViewType = getViewType(event);
            replyEventId = getParentEventId(event);
            replyTo = room.findEventById(replyEventId);
    });
</script>
<style>
.edited {
    opacity: 0.5;
    font-size: 0.8em;
}

.avatarwrapper {
    height: 0;
    overflow: visible;
}
.message {
    overflow-wrap: break-word;
    word-wrap: break-word;
}
 
.message :global(pre) {
    overflow-x: scroll;
}
.reply {
    border-left: 2px solid grey;
    padding-left: 0.5em;
    margin-top: 0.25em;
    margin-bottom: 0.25em;
    max-width: 400px;
    margin-right: 2em;
}
.image {
    max-width: 50%;
}

@media (min-width: 870px) {
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
    .reply {
        margin-left: 4em;
    }
    .message {
        margin-left: 4em;
        margin-bottom: 0.5em;
        margin-right: 1em;
    }
}

@media (max-width: 869px) {
    .avatar {
        width: 2em;
        height: 2em;
        margin-left: 0.5em;
    }
    .sendername {
        margin-left: 3em;
        margin-top: 0.3em;
        margin-bottom: 0.3em;
        font-weight: bold;
    }
    .reply {
        margin-left: 3em;
    }
    .message {
        margin-left: 3em;
        margin-bottom: 0.5em;
        margin-right: 0.5em;
    }
}
</style>
{#if showSender}
    {#if event.sender}
        <div class="avatarwrapper">
            <div class="avatar">
                <MatrixAvatar size="1" imageUrl={event.sender.getAvatarUrl(client.baseUrl)} name={event.sender.name}></MatrixAvatar>
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
{#if replyEventId !== undefined}
    <div class="reply">
        {#if replyTo !== undefined}
            <Reply event={replyTo}></Reply>
        {:else}
            loading...
        {/if}
    </div>
{/if}
<div class="message">
    {#if messageViewType === "text"}
        {#if messageText.isDisplayedWithHtml}{@html messageText.text}{:else}{messageText.text}{/if}
        {#if edited}<span class="edited">(edited)</span>{/if}
    {:else if messageViewType === "image"}
        <div class="image"><MImage {event}></MImage></div>
    {/if}
</div>
