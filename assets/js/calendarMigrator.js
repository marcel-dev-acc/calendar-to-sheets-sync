import { attach } from './components/addEventListeners.js';
import { tryGoogleDetails } from './components/googleDetails/tryGoogleDetails.js';

window.addEventListener('DOMContentLoaded', main);

async function main() {
    // entry point
    console.log('Init...');

    // attach event listeners to buttons
    attachListenerToCollapsible();
    attach();

    // Check if local details have been populated
    tryGoogleDetails();
}

function attachListenerToCollapsible() {
    let coll = document.getElementsByClassName("w3collapsible");        
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("w3active");
            if (this.style.borderRadius == '10px') {
                this.style.borderRadius = '10px 10px 0px 0px';
            } else {             
                this.style.borderRadius = '10px';
            }
            
            let content = this.nextElementSibling;
            if (content.style.maxHeight){
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }
}