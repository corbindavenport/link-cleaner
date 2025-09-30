// Plausible Analytics
window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }

// Delete link history storage if it exists, link history feature has been removed
localStorage.removeItem('history');

// Detect various platforms
const isApplePlatform = ['MacIntel', 'Macintosh', 'iPhone', 'iPod', 'iPad'].includes(navigator.platform);

// Initialize elements, modals, and toasts
const mastodonModal = new bootstrap.Modal(document.getElementById('mastodon-modal'));
const linkEl = document.getElementById('link-input');

// Save PWA install prompt
var installPrompt = null;
window.addEventListener('beforeinstallprompt', function (e) {
    // Prevents the default mini-infobar or install dialog from appearing on mobile
    e.preventDefault();
    // Save install for later
    installPrompt = e;
});

// Function for opening pop-up window in center of screen
function openWindow(url) {
    // Set window dimensions
    let windowWidth = 600;
    let windowHeight = 500;
    // Calculate center position for X and Y axis
    let leftStart = Math.floor(window.screen.availWidth / 2) - Math.floor(windowWidth / 2);
    let topStart = Math.floor(window.screen.availHeight / 2) - Math.floor(windowHeight / 2);
    // Open popup window
    let windowOptions = `width=${windowWidth},height=${windowHeight},popup,noopener,noreferrer,left=${leftStart},top=${topStart}`;
    window.open(url, '_blank', windowOptions);
}

// Function for cleaning link
function processLink(link, startMode = 'user') {
    plausible('Clean Link');
    // Read settings
    if (localStorage.getItem('youtube-shorten-check')) {
        var youtubeShortenEnabled = JSON.parse(localStorage.getItem('youtube-shorten-check').toLowerCase());
    } else {
        var youtubeShortenEnabled = false;
    }
    if (localStorage.getItem('vxTwitter-check')) {
        var fixTwitterEnabled = JSON.parse(localStorage.getItem('vxTwitter-check').toLowerCase());
    } else {
        var fixTwitterEnabled = false;
    }
    if (localStorage.getItem('walmart-shorten-check')) {
        var shortenWalmartEnabled = JSON.parse(localStorage.getItem('walmart-shorten-check').toLowerCase());
    } else {
        var shortenWalmartEnabled = false;
    }
    var newLink = cleanLink(link, youtubeShortenEnabled, fixTwitterEnabled, shortenWalmartEnabled);
    // Insert cleaned link and update page layout
    linkEl.innerText = newLink;
    document.getElementById('linkcleaner-buttons-container').classList.remove('d-none');
    // If medium size device or smaller, scroll past the top message
    const container = document.getElementById('linkcleaner-url-container');
    const containerTop = container.getBoundingClientRect().top + window.scrollY;
    const desiredScrollTop = containerTop - 50;
    if (window.matchMedia('(max-width: 767.98px)').matches && (startMode === 'user')) {
        // Smooth scroll if the user entered the URL
        window.scrollTo({ top: desiredScrollTop, behavior: 'smooth' })
    } else if (window.matchMedia('(max-width: 767.98px)').matches) {
        // Instant scroll if Link Cleaner was opened through a shortcut
        window.scrollTo({ top: desiredScrollTop, behavior: 'instant' })
    }
    // If the user is on a touchscreen, unfocus the input element, so nothing is covering the Copy and share buttons
    // If the user is not on a touchscreen, select the text so the user can immediately do Ctrl+C
    if (window.matchMedia('screen and (hover: none)').matches) {
        linkEl.blur();
    } else {
        window.getSelection().selectAllChildren(linkEl);
    }
    // Hide placeholder in link history list before adding new item
    document.getElementById('link-history-list-placeholder').style.display = 'none';
    // Create new item in link history list
    var listEl = document.createElement('a');
    listEl.classList.add('list-group-item', 'list-group-item-action', 'text-break');
    listEl.setAttribute('href', newLink);
    listEl.setAttribute('rel', 'noreferrer');
    listEl.setAttribute('target', '_blank');
    listEl.innerText = newLink;
    // Create domain badge for link history item
    var badgeEl = document.createElement('span');
    badgeEl.classList.add('badge', 'text-bg-primary', 'rounded-pill', 'me-2');
    badgeEl.innerText = new URL(newLink).hostname.replaceAll('www.', '');
    listEl.prepend(badgeEl);
    // Add link history item to list
    document.getElementById('link-history-list').appendChild(listEl);
}

// Process URL after a paste action is detected
linkEl.addEventListener('paste', function () {
    // This is wrapped in a timeout or it executes before the value has changed
    setTimeout(function () {
        processLink(linkEl.innerText)
    }, 50)
})

// Process URL after an Enter key press
linkEl.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        processLink(linkEl.innerText);
    }
});

// Paste button
try {
    if (typeof navigator.clipboard.readText !== "undefined") {
        document.getElementById('link-paste-btn').addEventListener('click', function () {
            navigator.clipboard.readText().then(function (data) {
                processLink(data)
            })
        })
    } else {
        document.getElementById('link-paste-btn').disabled = true
    }
} catch {
    document.getElementById('link-paste-btn').disabled = true
}

// Clear button
document.getElementById('link-clear-btn').addEventListener('click', function () {
    linkEl.innerText = '';
    linkEl.focus();
})

// Copy link button
document.getElementById('link-copy-btn').addEventListener('click', function () {
    var btn = document.getElementById('link-copy-btn')
    if (navigator.clipboard) {
        // Use Clipboard API if available
        var copyText = linkEl.value
        navigator.clipboard.writeText(copyText)
    } else {
        // Fallback to older API
        var copyText = linkEl
        copyText.select()
        document.execCommand('copy')
        linkEl.blur()
    }
    // Change button design
    btn.classList.remove('btn-primary')
    btn.classList.add('btn-success')
    btn.innerHTML = '<i class="bi bi-check"></i> Copied'
    // Revert after three seconds
    setTimeout(function () {
        btn.classList.remove('btn-success')
        btn.classList.add('btn-primary')
        btn.innerHTML = '<i class="bi bi-clipboard me-2"></i> Copy'
    }, 2000)
})

// Share button
if (navigator.canShare) {
    document.getElementById('link-share-btn').addEventListener('click', function () {
        navigator.share({
            url: linkEl.value
        })
    })
} else {
    document.getElementById('link-share-btn').disabled = true
}

// QR Code button
// This generates the QR code only when the button is pressed
var qrModal = document.getElementById('qr-modal');
qrModal.addEventListener('show.bs.modal', function () {
    var currentLink = linkEl.value;
    var qrContainer = document.getElementById('qrcode');
    const qrSettings = {
        text: currentLink,
        width: 425,
        height: 425,
        quietZone: 25,
        tooltip: true
    }
    new QRCode(document.getElementById('qrcode'), qrSettings);
})

// Save QR as PNG button
document.getElementById('qr-download-btn').addEventListener('click', function () {
    const qrContainer = document.getElementById('qrcode');
    const canvas = qrContainer.querySelector('canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'qrcode.png';
        link.click();
    }
})

// Remove QR code when popup is hidden (so new codes don't show up below new ones)
qrModal.addEventListener('hidden.bs.modal', function (event) {
    document.getElementById('qrcode').innerHTML = '';
})

// Test link button
document.getElementById('link-test-btn').addEventListener('click', function () {
    var currentLink = linkEl.value
    openWindow(currentLink);
})

// Email button
document.getElementById('email-btn').addEventListener('click', function () {
    var currentLink = linkEl.value
    var emailSubject = 'Link for you'
    var emailBody = '\n\n\n' + currentLink
    window.open('mailto:?subject=' + encodeURIComponent(emailSubject) + '&body=' + encodeURIComponent(emailBody), '_blank')
})

// SMS button
document.getElementById('sms-btn').addEventListener('click', function () {
    var currentLink = linkEl.value
    window.open('sms:?&body=' + encodeURIComponent(currentLink), '_blank')
})

// Mastodon button
document.getElementById('mastodon-server-hostname').value = localStorage['mastodon-server'] || ''
document.getElementById('mastodon-share-btn').addEventListener('click', function () {
    var currentLink = linkEl.value
    var currentServer = document.getElementById('mastodon-server-hostname').value
    if (currentServer) {
        localStorage['mastodon-server'] = currentServer
        var link = 'https://' + currentServer + '/share?text=' + encodeURIComponent(currentLink)
        openWindow(link);
        mastodonModal.hide()
    }
})

// Facebook button
document.getElementById('facebook-share-btn').addEventListener('click', function () {
    var link = 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent(linkEl.value);
    openWindow(link);
})

// LinkedIn button
document.getElementById('linkedin-share-btn').addEventListener('click', function () {
    var link = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(linkEl.value);
    openWindow(link);
})

// Reddit button
document.getElementById('reddit-share-btn').addEventListener('click', function () {
    var link = 'https://reddit.com/submit?url=' + encodeURIComponent(linkEl.value);
    openWindow(link);
})

// Telegram button
document.getElementById('telegram-share-btn').addEventListener('click', function () {
    var link = 'https://t.me/share/url?url=' + encodeURIComponent(linkEl.value)
    openWindow(link);
})

// Bluesky button
document.getElementById('bluesky-share-btn').addEventListener('click', function () {
    var link = 'https://bsky.app/intent/compose?text=' + encodeURIComponent(linkEl.value)
    openWindow(link);
})

// PWA install button and accordion
if ('onbeforeinstallprompt' in window) {
    document.getElementById('accordion-pwa-container').style.display = 'block';
} else if (isApplePlatform) {
    document.getElementById('accordion-apple-app-container').style.display = 'block';
}
document.getElementById('install-btn').addEventListener('click', function () {
    if (installPrompt) {
        // Web browser supports PWA and there is a captured install prompt, activate the prompt
        installPrompt.prompt();
    } else if ('onbeforeinstallprompt' in window) {
        alert('You need to use the browser install button, such as the button in the address bar on desktop browsers, or the "Add to Home Screen" button on Android devices.');
    }
})

// Check for 'url' parameter on Link Cleaner launch
// This is used for the Web Share Target API, Apple Shortcut, Bookmarklet, OpenSearch, and custom automations
const parsedUrl = new URL(window.location)
if (parsedUrl.searchParams.get('url')) {
    // This is where the URL SHOULD BE
    processLink(parsedUrl.searchParams.get('url'), 'shortcut');
} else if (parsedUrl.searchParams.get('text')) {
    // Android usually puts URLs here
    processLink(parsedUrl.searchParams.get('text'), 'shortcut');
} else if (parsedUrl.searchParams.get('title')) {
    // Android sometimes puts URLs here
    processLink(parsedUrl.searchParams.get('title'), 'shortcut');
}