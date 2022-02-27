import { attach } from './components/addEventListeners.js';
import { tryGoogleDetails } from './components/googleDetails/tryGoogleDetails.js';

window.addEventListener('DOMContentLoaded', main);

async function main() {
    // entry point
    console.log('Init...');

    // attach event listeners to buttons
    attach();

    // Check if local details have been populated
    tryGoogleDetails();
}
