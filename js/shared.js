// Code that is shared across all Link Cleaner pages

// Pride Month mode
document.body.dataset.prideMode = (new Date()).getMonth() === 5;

// Holiday mode
document.body.dataset.snowMode = (new Date()).getMonth() === 11;

// Delete any data for removed features
localStorage.removeItem('history');
localStorage.removeItem('clean-db');