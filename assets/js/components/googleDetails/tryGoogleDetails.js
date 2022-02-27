/*
Check whether local variables for the required google details have been populated, otherwise show a message.
*/

function tryGoogleDetails() {
    let clientID = localStorage.getItem('client-id');
    let apiKey = localStorage.getItem('api-key');
    let spreadsheetID = localStorage.getItem('spreadsheet-id');
    let sheetName = localStorage.getItem('sheet-name');
    let calendarID = localStorage.getItem('calendar-id');
    if (clientID === null) {
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">Client ID exists not populated</p>
                <p class="mb-0">Configure in <a href="./settings.html">settings</a></p>
            </div>`
        );
    }
    if (apiKey === null) {
        document.getElementById('notifications').innerHTML = (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">API Key not populated</p>
                <p class="mb-0">Configure in <a href="./settings.html">settings</a></p>
            </div>`
        );
    }
    if (spreadsheetID === null) {
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">Spreadsheet ID not populated</p>
                <p class="mb-0">Configure in <a href="./settings.html">settings</a></p>
            </div>`
        );
    }
    if (sheetName === null) {
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">Sheet name not populated</p>
                <p class="mb-0">Configure in <a href="./settings.html">settings</a></p>
            </div>`
        );
    }
    if (calendarID === null) {
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">Calendar ID not populated</p>
                <p class="mb-0">Configure in <a href="./settings.html">settings</a></p>
            </div>`
        );
    }
    // After adding the close buttons we add an onclick event
    var close = document.getElementsByClassName("closebtn");
    // Loop through all close buttons
    for (let i = 0; i < close.length; i++) {
        // When someone clicks on a close button
        close[i].onclick = function(){
            // Get the parent of <span class="closebtn"> (<div class="alert">)
            var div = this.parentElement;
            // Set the opacity of div to 0 (transparent)
            div.style.opacity = "0";
            // Hide the div after 600ms (the same amount of milliseconds it takes to fade out)
            setTimeout(function(){ div.style.display = "none"; }, 600);
        }
    }
}

export { tryGoogleDetails }