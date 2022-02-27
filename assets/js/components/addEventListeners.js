import { captureGoogleDetails } from './googleDetails/captureGoogleDetails.js';
import { testGoogleDetails } from './googleDetails/testGoogleDetails.js';
import { getCalendarEntries } from './googleCalendar/getCalendarEntries.js';

function attach() {
    // Settings page
    if (document.getElementById('store-details') !== null) {
        document.getElementById('store-details').addEventListener('click', captureGoogleDetails);
    }
    // Settings page
    if (document.getElementById('test-details') !== null) {
        document.getElementById('test-details').addEventListener('click', testGoogleDetails);
    }
    // calendarMigrator page
    if (document.getElementById('fetch-calendar-details') !== null) {
        document.getElementById('fetch-calendar-details').addEventListener('click', getCalendarEntries);
    }
}


export { attach };