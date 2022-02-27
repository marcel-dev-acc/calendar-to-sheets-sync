/*
A lot of the code below is taken from the google dev walk through
*/

import 'https://apis.google.com/js/api.js';

function testGoogleDetails() {
    document.getElementById('test-output-loading').style.display = 'block';
    handleClientLoad();
}

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    // Array of API discovery doc URLs for APIs used by the quickstart
    let DISCOVERY_DOCS = [
        "https://sheets.googleapis.com/$discovery/rest?version=v4",
        "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
    ];
    /*
    Authorization scopes required by the API; multiple scopes can be
    included, separated by spaces.
    */
    let SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly https://www.googleapis.com/auth/calendar.readonly";

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
        showFirstCell();
        listUpcomingEvents();
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
 * Print the contents of cell A1 in the desired spreadsheet
 */
 function showFirstCell() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: localStorage.getItem('spreadsheet-id'),
        range: 'A1',
    }).then(function(response) {
        let range = response.result;
        document.getElementById('test-output-loading').style.display = 'none';
        document.getElementById('test-output').innerHTML = (
            document.getElementById('test-output').innerHTML
            + `<br><p>Range = ${range.range}, contents = "${range.values[0]}"</p><br>`
        );
    }, function(response) {
        document.getElementById('test-output-loading').style.display = 'none';
        document.getElementById('test-output').innerHTML = (
            document.getElementById('test-output').innerHTML
            + `<br><p>ERROR (Sheets): ${response.result.error.message}</p><br>`
        );
    });
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
    let calendarID = localStorage.getItem('calendar-id');
    gapi.client.calendar.events.list({
        'calendarId': calendarID,
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 5,
        'orderBy': 'startTime'
    }).then(function(response) {
        let html = '<br><table>\n<tr><td>Start Date</td><td>End Date</td><td>Summary</td></tr>\n';
        let events = response.result.items;
        // console.log(events);
        for (let i = 0; i < events.length; i++) {
            html = html + `<tr><td>${events[i].start.dateTime}</td><td>${events[i].end.dateTime}</td><td>${events[i].summary}</td></tr>\n`;
        }
        html = html + '</html><br>';
        document.getElementById('test-output').innerHTML = (
            document.getElementById('test-output').innerHTML
            + html
        );
    }, function(response) {
        document.getElementById('test-output-loading').style.display = 'none';
        document.getElementById('test-output').innerHTML = (
            document.getElementById('test-output').innerHTML
            + `<br><p>ERROR (Sheets): ${response.result.error.message}</p><br>`
        );
    });
}

export { testGoogleDetails };