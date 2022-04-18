import 'https://apis.google.com/js/api.js';
import { sleep } from '../utils.js';

function getSheetEntries() {
    /* Validate that the settings are populated */
    // Start date populated?
    if (document.getElementById('start-date').value == '') {
        // Add messaging asking to populate date
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">Please choose a start date under settings.</p>
            </div>`
        );
        addCloseButtons();
        return null;
    }
    // Max results populated?
    if (document.getElementById('max-results').value == '') {
        // Add messaging asking to populate date
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">Please choose the maximum number of results to retrieve.</p>
            </div>`
        );
        addCloseButtons();
        return null;
    }
    document.getElementById('sheet-output-loading').style.display = 'block';
    handleClientLoad();
}

function addCloseButtons() {
    // After adding the close buttons we add an onclick event
    var close = document.getElementsByClassName('closebtn');
    // Loop through all close buttons
    for (let i = 0; i < close.length; i++) {
        // When someone clicks on a close button
        close[i].onclick = function(){
            // Get the parent of <span class="closebtn"> (<div class="alert">)
            var div = this.parentElement;
            // Set the opacity of div to 0 (transparent)
            div.style.opacity = '0';
            // Hide the div after 600ms (the same amount of milliseconds it takes to fade out)
            setTimeout(function(){ div.style.display = 'none'; }, 600);
        }
    }
}

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    // Array of API discovery doc URLs for APIs used by the quickstart
    let DISCOVERY_DOCS = [
        'https://sheets.googleapis.com/$discovery/rest?version=v4',
    ];
    /*
    Authorization scopes required by the API; multiple scopes can be
    included, separated by spaces.
    */
    let SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

    gapi.client.init({
      apiKey: localStorage.getItem('api-key'),
      clientId: localStorage.getItem('client-id'),
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      let authorizeButton = document.getElementById('authorize_button');
      let signoutButton = document.getElementById('signout_button');
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    }, function(error) {
      alert(JSON.stringify(error, null, 2));
    });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
*/
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        let authorizeButton = document.getElementById('authorize_button');
        let signoutButton = document.getElementById('signout_button');
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'inline';
        // Start setting up page
        getSavedEntries();        
    } else {
        let authorizeButton = document.getElementById('authorize_button');
        let signoutButton = document.getElementById('signout_button');
        authorizeButton.style.display = 'inline';
        signoutButton.style.display = 'none';
    }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}

/**
 * Get Saved details within spreadsheet
 */
function getSavedEntries() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: localStorage.getItem('spreadsheet-id'),
        range: localStorage.getItem('sheet-name') + '!A:Z',
    }).then(function(response) {
        let range = response.result;
        displayEntries(range.values);
    }, function(response) {
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">ERROR (Sheets): ${response.result.error.message}</p>
            </div>`
        );
        addCloseButtons();
        document.getElementById('sheets-output-loading').style.display = 'none';
    });
}

function displayEntries(values) {
    // Map of relevant columns for reference
    let map = {
        1: 'Student',
        2: 'Date',
        3: 'Status',
        4: 'Hours',
        5: 'Paid On',
        6: 'Amount',
        7: 'Earnings',
        8: 'Subject',
        9: 'Cut',
        10: 'Payment Type',
        11: 'Claim Fuel'
    };
    // Clear any previous fetch
    document.getElementById('event-entries').innerHTML = '';
    // Determine the length of results to display
    let displayLength = values.length;
    if (values.length > document.getElementById('max-results').value) {
        displayLength = document.getElementById('max-results').value;
    }
    // Setup the results header
    document.getElementById('event-entries').innerHTML += `
        <div id="card-header" class="card shadow mt-2 bg-dark text-light">
            <div class="card-body">
                <div class="row">
                    <div class="col font-weight-bolder">${map[1]}</div>
                    <div class="col font-weight-bolder">${map[2]}</div>
                    <div class="col font-weight-bolder">${map[3]}</div>
                </div>
            </div>
        </div>
    `;
    // Get start date
    let startDate = document.getElementById('start-date').value;
    let day = parseInt(startDate.substring(8, 10));
    let month = parseInt(startDate.substring(5, 7));
    let year = parseInt(startDate.substring(0, 4));
    startDate = new Date(year, (month - 1), day);
    // Skip the first row and display results
    for (let i = 1; i < values.length; i++) {
        // Validate date of entry is after start date
        let day = parseInt(values[i][2].substring(0, 2));
        let month = parseInt(values[i][2].substring(3, 5));
        let year = parseInt(values[i][2].substring(6, 10));
        let eventDate = new Date(year, (month - 1), day);
        if (eventDate < startDate) {
            continue;
        }
        // No longer render entries when the number of slots is taken
        if(displayLength == 0) {
            continue;
        }
        // Determine if a submit button is necessary
        let submitEventSection = '';
        if (values[i][3].toLowerCase() != "completed") {
            submitEventSection = `
            <hr/>
            <div class="row mt-2">
                <div class="col">
                    <label class="mt-2">Paid On</label>
                </div>
                <div class="col">
                    <input id="paid-on-${i}" type="date" class="form-control" />
                </div>
            </div>
            <div class="row mt-3">
                <div class="col text-center">
                    <button id="submit-entry-${i}" class="btn btn-primary" style="display: inline;">Submit</button>
                </div>
            </div>
            `;
        }
        // Output event
        document.getElementById('event-entries').innerHTML += `
        <div id="card-${i}" class="card shadow mt-2">
            <div class="card-body">
                <div class="row" style="font-size: 80%;">
                    <div class="col">${values[i][1]}</div>
                    <div class="col">${values[i][2]}</div>
                    <div class="col" id="entry-status-${i}">${values[i][3]}</div>
                </div>
                ${submitEventSection}
            </div>
        </div>
        `;
        if (values[i][3].toLowerCase() != "completed") {
            let submitEntryButton = document.getElementById(`submit-entry-${i}`);
            submitEntryButton.addEventListener("click", function() {
                submitEntry(i, values[i]);
            });
        }
        displayLength--;
    }
    document.getElementById('sheet-output-loading').style.display = 'none';
}


function submitEntry(rowNumber, rowValues) {
    // Validate that paid on date is populated
    if (document.getElementById(`paid-on-${rowNumber}`).value == '') {
        // Add messaging asking to populate date
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">Please choose a paid on date.</p>
            </div>`
        );
        addCloseButtons();
        return null;
    }
    // Generate row entries
    // Status	Hours	Paid On
    let row = [
        'Completed', // Status
        rowValues[4],
        document.getElementById(`paid-on-${rowNumber}`).value
    ];
    // Write details to spreadsheet -- assumes that the client is authenticated
    let valueRangeBody = {
        values: [row]
    };
    gapi.client.sheets.spreadsheets.values.update(
        {
            spreadsheetId: localStorage.getItem('spreadsheet-id'),
            range: localStorage.getItem('sheet-name') + `!D${(rowNumber + 1)}`,
            valueInputOption: 'USER_ENTERED',
        },
        valueRangeBody
    ).then(function(response) {
        // Mark the entry as completed and hide the submit button
        document.getElementById(`entry-status-${rowNumber}`).innerHTML = 'Completed';
        document.getElementById(`submit-entry-${rowNumber}`).style.display = 'none';
    }, function(response) {
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">ERROR (Calendar): ${response.result.error.message}</p>
            </div>`
        );
        addCloseButtons();
    });
}


export { getSheetEntries };