/*
    Bookmarklet for passing URLs to Link Cleaner
    This can be converted into a bookmarklet with tools like this: https://chriszarate.github.io/bookmarkleter/
*/

function openLinkCleaner() {
    window.open('https://linkcleaner.app/?url=' + encodeURIComponent(window.location.href) + '&utm_source=Bookmarklet', 'linkWindow', 'popup, width=400, height=500, left=100, top=100, noopener, noreferrer');
}
openLinkCleaner(); 