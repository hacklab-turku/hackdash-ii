import { writable } from 'svelte/store';

let localStorage = window.localStorage;

function createSettings() {
    let currentSettings;
    if (!localStorage.getItem('clientSettings')) {
        currentSettings = {};
        localStorage.setItem('clientSettings', JSON.stringify(currentSettings));
    } else {
        try {
            currentSettings = JSON.parse(localStorage.getItem('clientSettings'));
        } catch (e) {
            currentSettings = {};
            localStorage.setItem('clientSettings', JSON.stringify(currentSettings));
        }
    }

	const { subscribe, set, update } = writable(currentSettings);

	return {
		subscribe,
		setSetting: (name, value) => update(n => {
            n[name] = value;
            localStorage.setItem('clientSettings', JSON.stringify(n));
            return n;
        })
	};
}

export const settings = createSettings();