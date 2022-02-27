function captureGoogleDetails() {
    localStorage.setItem('client-id', document.getElementById('client-id').value);
    localStorage.setItem('api-key', document.getElementById('api-key').value);
    localStorage.setItem('spreadsheet-id', document.getElementById('spreadsheet-id').value);
    localStorage.setItem('sheet-name', document.getElementById('sheet-name').value);
    localStorage.setItem('calendar-id', document.getElementById('calendar-id').value);
}

export { captureGoogleDetails };