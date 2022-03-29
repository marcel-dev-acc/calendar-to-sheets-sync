import { captureGoogleDetails } from './googleDetails/captureGoogleDetails.js';
import { testGoogleDetails } from './googleDetails/testGoogleDetails.js';
import { getCalendarEntries } from './googleCalendar/getCalendarEntries.js';
import { clearAuthDetails } from './googleDetails/clearAuth.js';

function attach() {
    // Settings page
    if (document.getElementById('store-details') !== null) {
        document.getElementById('store-details').addEventListener('click', captureGoogleDetails);
    }
    // Settings page
    if (document.getElementById('test-details') !== null) {
        document.getElementById('test-details').addEventListener('click', testGoogleDetails);
    }
    // Settings page
    if (document.getElementById('clear-auth') !== null) {
        document.getElementById('clear-auth').addEventListener('click', clearAuthDetails);
    }
    // calendarMigrator page
    if (document.getElementById('fetch-calendar-details') !== null) {
        document.getElementById('fetch-calendar-details').addEventListener('click', getCalendarEntries);
    }
}


export { attach };