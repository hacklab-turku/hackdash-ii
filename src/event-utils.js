import { stripPlainReply } from './html-utils.js';

// Event types to be displayed in a normal large size
const displayEventTypes = [
    "m.room.message",
    "m.sticker"
];
// Event types to be displayed smaller (without using the combined sender info)
const smallDisplayEventTypes = [
    "m.room.member"
];

export function eventDisplayType(event) {
    if (displayEventTypes.includes(event.getType()) && !event.isRelation('m.replace')) {
        return "DISPLAY";
    } else if (smallDisplayEventTypes.includes(event.getType())) {
        return "SMALL";
    } else {
        return "NONE";
    }
}

export function getViewType(event) {
    let content;
    if (event.replacingEvent()) { content = event.replacingEvent().getContent()['m.new_content'] }
    else { content = event.getContent(); }

    if ('msgtype' in content && content.msgtype === 'm.image') {
        return "image";
    } else if (event.getType() === 'm.sticker') {
        return "sticker";
    }
    return "text";
}

export function getPreviewEvent(room) {
    let e = room.getLiveTimeline().getEvents()
    for (var i=e.length-1; i >= 0; i--) {
        if (eventDisplayType(e[i]) == "DISPLAY") {
            return e[i];
        }
    }
    return undefined;
}

export function getSimpleText(event) {
    if (event === undefined) { return ''; }
    else if ('body' in event.getContent()) { return stripPlainReply(event.getContent().body); }
    else { return 'Unimplemented event'; /*TODO*/ }
}

/*
Copyright 2017 New Vector Ltd
Copyright 2019 Michael Telatynski <7t3chguy@gmail.com>
Copyright 2019 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*
Function originally from matrix-react-sdk (see above copyright notice)
Modified for use in my little Svelte project
Copyright 2019 Max Sandholm
*/

export function getParentEventId(ev) {
    if (!ev || ev.isRedacted()) return;

    // XXX: For newer relations (annotations, replacements, etc.), we now
    // have a `getRelation` helper on the event, and you might assume it
    // could be used here for replies as well... However, the helper
    // currently assumes the relation has a `rel_type`, which older replies
    // do not, so this block is left as-is for now.
    const mRelatesTo = ev.getWireContent()['m.relates_to'];
    if (mRelatesTo && mRelatesTo['m.in_reply_to']) {
        const mInReplyTo = mRelatesTo['m.in_reply_to'];
        if (mInReplyTo && mInReplyTo['event_id']) return mInReplyTo['event_id'];
    }
}