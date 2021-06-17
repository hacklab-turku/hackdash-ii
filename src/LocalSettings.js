import { NoEmitOnErrorsPlugin } from "webpack";

function createLocalSettings() {
    return {
        "roomToView": "!DLojZSthiplZsDhCKu:hacklab.fi",
        "title": "Hackdash",
        // "logo": "https://url.to/image.jpg",    // Optional
        "matrixUser": "@user:matrix.server", // Not used yet
        "matrixAccessToken": "MDAxOGlotofcharacters_fqy4yRQo", // Not used yet
        "matrixServer": "https://matrix.server", // Not used yet
        "showTemperature": true,
        "showLights": true,
        "showPrinter": true,
        "showBuses": true
    }
}

export const localsettings = createLocalSettings();
