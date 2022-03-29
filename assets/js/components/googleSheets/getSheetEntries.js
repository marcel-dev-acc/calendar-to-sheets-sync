import 'https://apis.google.com/js/api.js';
import { sleep } from '../utils.js';

function getSheetEntries() {
    /* Validate that the settings are populated */
    // Start date populated?
    if (document.getElementById('start-date').value == "") {
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
    // Start time populated?
    if (document.getElementById('start-time').value == "") {
        // Add messaging asking to populate date
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">Please choose a start time under settings.</p>
            </div>`
        );
        addCloseButtons();
        return null;
    }
    // Max results populated?
    if (document.getElementById('max-results').value == "") {
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
    document.getElementById('calendar-output-loading').style.display = 'block';
    handleClientLoad();
}

function addCloseButtons() {
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
    let SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar.readonly';

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
        // Get a list of populated calendar ID's and next insertion slot
        let processedCalendarIDs = [];
        let nextAvailableInsertionSlot = 0;
        if (range.values != undefined) {
            for (let i = 0; i < range.values.length; i++) {
                let row = range.values[i];
                let calendarID = row[0];
                if (!processedCalendarIDs.includes(calendarID)) {
                    processedCalendarIDs.push(calendarID);
                }
                // Determine next insertion slot
                let date = row[2];
                if (date != "") {
                    nextAvailableInsertionSlot++;
                }
            }
        }
        document.getElementById('next-available-insertion-slot').value = nextAvailableInsertionSlot;
        listUpcomingEvents(processedCalendarIDs);
    }, function(response) {
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">ERROR (Sheets): ${response.result.error.message}</p>
            </div>`
        );
        addCloseButtons();
        document.getElementById('calendar-output-loading').style.display = 'none';
    });
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents(processedCalendarIDs) {
    let calendarID = localStorage.getItem('calendar-id');
    let time = `${document.getElementById('start-date').value}T${document.getElementById('start-time').value}:00.000Z`;
    gapi.client.calendar.events.list({
        'calendarId': calendarID,
        'timeMin': time,
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': document.getElementById('max-results').value,
        'orderBy': 'startTime'
    }).then(function(response) {
        let html = `
        <div class="card shadow">
            <div class="card-body">
                <div class="row">
                    <div class="col font-weight-bolder">Start</div>
                    <div class="col font-weight-bolder duration">Duration</div>
                    <div class="col font-weight-bolder">Summary</div>
                </div>
            </div>
        </div>
        `;
        let events = response.result.items;
        // console.log(events);
        for (let i = 0; i < events.length; i++) {
            // Check if it is an all day event
            let startDateStr = '';
            let startTimeStr = '';
            let endDateStr = '';
            let endTimeStr = '';
            let duration = 0;
            let durationStr = '';
            if (events[i].start.dateTime == undefined) {
                startDateStr = events[i].start.date;
                startTimeStr = '00:00';
                endDateStr = events[i].end.date;
                endTimeStr = '23:59';
                duration = 24 * 60;
                durationStr = '24 hours';
            } else {
                let startDateTime = new Date(events[i].start.dateTime);
                startDateStr = events[i].start.dateTime.substring(0, 10);
                startTimeStr = events[i].start.dateTime.substring(11, 16);
                let endDateTime = new Date(events[i].end.dateTime);
                endDateStr = events[i].end.dateTime.substring(0, 10);
                endTimeStr = events[i].end.dateTime.substring(11, 16);
                // Calculate the duration of the event
                duration = (endDateTime.getTime() - startDateTime.getTime()) / 1000 / 60;  // Duration in minutes
                durationStr = `${duration} minutes`;
                if (duration >= 60) {
                    if ((duration / 60) == 1) {
                        durationStr = `${(duration / 60)} hour`;
                    } else {
                        durationStr = `${(duration / 60)} hours`;
                    }
                }
            }
            let isBacs = events[i].summary.toUpperCase().indexOf('BACS') > -1;
            let isPaypal = events[i].summary.toUpperCase().indexOf('PAYPAL') > -1;
            // Default is BACS
            let paymentTypeOptionsStr = `
            <option selected>BACS</option>
            <option>PayPal</option>
            `;
            if (isPaypal) {
                paymentTypeOptionsStr = `
                <option>BACS</option>
                <option selected>PayPal</option>
                `;
            }
            // Attempt to get the individuals name out
            let clientName = '';
            if (events[i].summary.split(':').length > 1) {
                clientName = events[i].summary.split(':')[1].trim();
                if (clientName.indexOf('(') > -1) {
                    clientName = clientName.substring(0, clientName.indexOf('(')).trim();
                }
            }
            // Attempt to get the subject out
            let subjectName = '';
            if (events[i].summary.split(':').length > 1) {
                subjectName = events[i].summary.split(':')[1].trim();
                if (subjectName.indexOf('(') > -1 && subjectName.indexOf(')') > -1) {
                    subjectName = subjectName.substring(
                        (subjectName.indexOf('(') + 1),
                        subjectName.indexOf(')')
                    ).trim();
                }
            }
            // Attempt to get the lesson price out per hour
            let lessonPrice = 0;
            if (events[i].summary.split(':').length > 1) {
                lessonPrice = events[i].summary.split(':')[1].trim();
                if (lessonPrice.indexOf('£') > -1 && lessonPrice.indexOf('/hr') > -1) {
                    try {
                        lessonPrice = parseInt(lessonPrice.substring(
                            (lessonPrice.indexOf('£') + 1),
                            lessonPrice.indexOf('/hr')
                        ).trim());
                    } catch(error) {
                        console.error(`Could not convert lesson price\n${error}`);
                    }
                }
            }
            // Check if it has been migrated
            let warning = '<span style="color: orange;" class="material-icons">warning</span>';
            let migrated = '<span style="color: green;" class="material-icons">verified</span>';
            let processedStatus = warning;
            if (processedCalendarIDs.includes(events[i].id)) {
                processedStatus = migrated;
            }
            // Create the html
            html = html + `
                <div id="card-${i}" class="card shadow mt-2 animate__animated">
                    <div class="card-body">
                        <div class="migrate-item-${i}">
                            <div class="row mb-2">
                                <div class="col text-left" style="font-size: 60%;">
                                    <span>${(i + 1)}</span>
                                </div>
                                <div id="migrated-status-${i}" class="col text-right">
                                    ${processedStatus}
                                </div>
                            </div>
                            <div class="row" style="font-size: 80%;">
                                <div class="col">Date: ${startDateStr}<br>Time: ${startTimeStr}</div>
                                <div class="col duration">${durationStr}</div>
                                <div class="col">${events[i].summary}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div id="collapsible-migrate-item-${i}" class="col migrateItem">

                                    <hr>
                                    <!-- Migration form ${i} -->
                                    <div>
                                        <div class="form-group" style="display: none;">
                                            <label>Form ID</label>
                                            <input type="number" class="form-control" id="form-id-${i}" value="${i}">
                                        </div>
                                        <div class="form-group" style="display: none;">
                                            <label>Calendar Event ID</label>
                                            <input type="text" class="form-control" id="calendar-id-${i}" value="${events[i].id}">
                                        </div>

                                        <div class="row">
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>Start Date</label>
                                                    <input type="date" class="form-control" id="start-date-${i}" value="${startDateStr}">
                                                </div>
                                            </div>
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>Start Time</label>
                                                    <input type="time" class="form-control" id="start-time-${i}" value="${startTimeStr}">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>End Date</label>
                                                    <input type="date" class="form-control" id="end-date-${i}" value="${endDateStr}">
                                                </div>
                                            </div>
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>End Time</label>
                                                    <input type="time" class="form-control" id="end-time-${i}" value="${endTimeStr}">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>Duration</label>
                                                    <input type="number" class="form-control" id="duration-${i}" value="${(duration / 60)}">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>Summary</label>
                                                    <input type="text" class="form-control" id="summary-${i}" value="${events[i].summary}">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>Payment Type</label>
                                                    <select id="payment-type-${i}" class="form-control">
                                                        ${paymentTypeOptionsStr}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>Client Name</label>
                                                    <input type="text" class="form-control" id="client-name-${i}" value="${clientName}">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>Subject</label>
                                                    <input type="text" class="form-control" id="subject-${i}" value="${subjectName}">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>Lesson Price</label>
                                                    <input type="number" class="form-control" id="lesson-price-${i}" value="${lessonPrice}">
                                                </div>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col">
                                                <div class="form-group">
                                                    <label>Payment Type</label>
                                                    <select id="session-status-${i}" class="form-control">
                                                        <option selected>Pending</option>
                                                        <option>Confirmed</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="text-center mt-3">
                                            <button id="migrate-details-${i}" class="btn btn-primary">Migrate</button>
                                        </div>
                                        <div id="migration-loading-${i}" style="display: none;" class="text-center mb-3">
                                            <div class="spinner-border text-dark" role="status">
                                                <span class="sr-only">Loading...</span>
                                            </div>
                                        </div>
                                    </div>
                                    <!-- End of migration form ${i} -->
                                    
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        // Reset page stats
        document.getElementById('calendar-entries').innerHTML = html;
        document.getElementById('calendar-output-loading').style.display = 'none';
        document.getElementById('calendar-entries').style.display = 'block';
        document.getElementById('calendar-entries').style.display = 'block';
        document.getElementById('fetch-calendar-details').innerHTML = 'Refresh';

        // Add a collapsable to the "migrate-item-${i}" class
        collapsibleMigrateItem(events.length);
        // Add migration button  listeners
        migrationButtons(events.length);

    }, function(response) {
        document.getElementById('notifications').innerHTML += (
            `<div class="alert">
                <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                <p class="mb-0">ERROR (Calendar): ${response.result.error.message}</p>
            </div>`
        );
        addCloseButtons();
        document.getElementById('calendar-output-loading').style.display = 'none';
    });
}

function collapsibleMigrateItem(items) {
    for (let j = 0; j < items; j++) {
        let migratedItems = document.getElementsByClassName(`migrate-item-${j}`);
        for (let k = 0; k < migratedItems.length; k++) {
            migratedItems[k].addEventListener("click", function() {
                let collapsibleMigrateItem = document.getElementById(`collapsible-migrate-item-${j}`);
                if (collapsibleMigrateItem.style.maxHeight){
                    collapsibleMigrateItem.style.maxHeight = null;
                } else {
                    collapsibleMigrateItem.style.maxHeight = collapsibleMigrateItem.scrollHeight + "px";
                }
            });
        }
    }
}


// TODO Move to googleSheets folder and use an import to bring into here
/**
 * 
 */
function migrationButtons(items) {
    for (let j = 0; j < items; j++) {
        let migrateButton = document.getElementById(`migrate-details-${j}`);
        migrateButton.addEventListener("click", function() {
            // Enable spinner
            let collapsibleMigrateItem = document.getElementById(`collapsible-migrate-item-${j}`);
            collapsibleMigrateItem.style.maxHeight = (parseInt(collapsibleMigrateItem.scrollHeight) + 50).toString() + 'px';
            document.getElementById(`migrate-details-${j}`).style.display = 'none';
            document.getElementById(`migration-loading-${j}`).style.display = 'block';
            // Get form id
            let buttonID = this.id;
            let id = buttonID.replace('migrate-details-', '');
            // Get form specific details
            let formID = document.getElementById(`form-id-${id}`).value;
            let calendarID = document.getElementById(`calendar-id-${id}`).value;
            let startDate = document.getElementById(`start-date-${id}`).value;
            let startTime = document.getElementById(`start-time-${id}`).value;
            let endDate = document.getElementById(`end-time-${id}`).value;
            let endTime = document.getElementById(`end-time-${id}`).value;
            let duration = document.getElementById(`duration-${id}`).value;
            let summary = document.getElementById(`summary-${id}`).value;
            let paymentType = document.getElementById(`payment-type-${id}`).value;
            let clientName = document.getElementById(`client-name-${id}`).value;
            let subject = document.getElementById(`subject-${id}`).value;
            let lessonPrice = document.getElementById(`lesson-price-${id}`).value;
            let sessionStatus = document.getElementById(`session-status-${id}`).value;
            // Calculate cut (amount taken from earnings)
            let cut = 0;
            // Generate row entries
            // Calendar ID, Student, Date, Status, Hours, Paid On, Amount, Earnings, Subject, Cut, Payment Type, Claim Fuel
            let row = [
                calendarID,
                clientName,
                startDate,
                sessionStatus,
                duration, // Hours
                '', // Paid on
                (duration * lessonPrice), // Amount
                ( (duration * lessonPrice) - cut ), // Earnings
                subject,
                cut,
                paymentType, // Payment
                'No'
            ];

            // Write details to spreadsheet -- assumes that the client is authenticated
            let valueRangeBody = {
                values: [row]
            };
            gapi.client.sheets.spreadsheets.values.update(
                {
                    spreadsheetId: localStorage.getItem('spreadsheet-id'),
                    range: localStorage.getItem('sheet-name') + '!A' + (parseInt(document.getElementById('next-available-insertion-slot').value) + 1),
                    valueInputOption: 'USER_ENTERED',
                },
                valueRangeBody
            ).then(async function(response) {
                // Increment the next insertion slot
                document.getElementById('next-available-insertion-slot').value = (
                    parseInt(document.getElementById('next-available-insertion-slot').value)
                    + 1
                );
                // Disable spinner
                document.getElementById(`migration-loading-${j}`).style.display = 'none';
                // Mark entry as verified
                document.getElementById(`migrated-status-${j}`).innerHTML = '<span style="color: green;" class="material-icons">verified</span>';
                // Minimise card
                let collapsibleMigrateItem = document.getElementById(`collapsible-migrate-item-${j}`);
                window.scrollBy(0, -collapsibleMigrateItem.scrollHeight);
                collapsibleMigrateItem.style.maxHeight = null;
                // Sleep while card is minimised
                await sleep(1000);
                // Animate the item to zoom out of scope
                document.getElementById(`card-${j}`).classList.add('animate__zoomOutRight');
                // Sleep while card disappears
                await sleep(1000);
                // Make the display = none
                document.getElementById(`card-${j}`).style.display = 'none';
            }, function(response) {
                document.getElementById('notifications').innerHTML += (
                    `<div class="alert">
                        <span class="closebtn" onclick="this.parentElement.style.display='none';">&times;</span>
                        <p class="mb-0">ERROR (Calendar): ${response.result.error.message}</p>
                    </div>`
                );
                addCloseButtons();
                document.getElementById(`migration-loading-${j}`).style.display = 'none';
            });
        });
    }
}


export { getSheetEntries };