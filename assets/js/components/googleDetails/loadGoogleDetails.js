/*
Loads captured settings from local storage if they exist
*/
function loadStoredGoogleDetails() {
    document.getElementById('client-id').value = localStorage.getItem('client-id');
    document.getElementById('api-key').value = localStorage.getItem('api-key');
    document.getElementById('spreadsheet-id').value = localStorage.getItem('spreadsheet-id');
    document.getElementById('sheet-name').value = localStorage.getItem('sheet-name');
    document.getElementById('calendar-id').value = localStorage.getItem('calendar-id');
}

export { loadStoredGoogleDetails };