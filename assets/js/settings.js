import { attach } from './components/addEventListeners.js';
import { loadStoredGoogleDetails } from './components/googleDetails/loadGoogleDetails.js';

window.addEventListener('DOMContentLoaded', main);

async function main() {
    // entry point
    console.log('Init...');

    // attach event listeners to buttons
    attach();

    // Load stored settings if they exist
    loadStoredGoogleDetails();
}
