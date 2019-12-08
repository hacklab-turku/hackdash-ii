<script>
    import { getParentEventId, getViewType } from '../event-utils.js';
    import MImage from './MImage.svelte';
    import { beforeUpdate, getContext } from 'svelte';
    import { key } from '../matrix.js';
    
	const { getClient } = getContext(key);
    const client = getClient();

    import * as HtmlUtils from '../html-utils.js';
    
    export let event;

    let messageText;
    let messageViewType;
    let senderName;

    let imageSize = [0,0];

    function getMessageText() {
        let content;
        if (event.replacingEvent()) { content = event.replacingEvent().getContent()['m.new_content'] }
        else { content = event.getContent(); }
        
        const stripReply = getParentEventId(event);
        if ('body' in content) {
            let text = HtmlUtils.bodyToHtml(content, [], {
                disableBigEmoji: content.msgtype === "m.emote",
                stripReplyFallback: stripReply,
            });
            if (text.isDisplayedWithHtml) {
                let el = document.createElement('div');
                el.innerHTML = text.text;
                return el.innerText;
            } else {
                return text.text;
            }
        }
        else { return "Unsupported message"; }
    }

    beforeUpdate(() => {
            messageText = getMessageText();
            messageViewType = getViewType(event);
            if (event.sender) {
                senderName = event.sender.name;
            } else {
                senderName = event.getSender();
            }
    });
</script>

<style>
.sendername {
    font-weight: bold;
}
.message {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.image {
    width: 2em;
    height: 2em;
    float: left;
    margin-top: 0.25em;
    margin-right: 0.5em;
    object-fit: cover;
    border-radius: 7px;
}
</style>

{#if messageViewType === "text"}
    <span class="sendername">{senderName}</span>
    <div class="message">
        {messageText}
    </div>
{:else if messageViewType === "image"}
    <img class="image" alt={event.getContent().body} src={client.mxcUrlToHttp(event.getContent().url)} />
    <span class="sendername">{senderName}</span>
    <div class="message">Image</div>
{/if}