// Plausible Analytics
window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }

// Delete link history storage if it exists, link history feature has been removed
localStorage.removeItem('history');

// Detect various platforms
const isApplePlatform = ['MacIntel','Macintosh','iPhone','iPod','iPad'].includes(navigator.platform);

// Initialize elements, modals, and toasts
const mastodonModal = new bootstrap.Modal(document.getElementById('mastodon-modal'));
const urlInput = document.getElementById('link-input');

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
    var newLink = cleanLink(link, youtubeShortenEnabled, fixTwitterEnabled);
    // Insert cleaned link and update page layout
    urlInput.value = newLink;
    document.body.dataset.view = 'cleaned';
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
        urlInput.blur();
    } else {
        urlInput.select();
    }
}

// Process URL after a paste action is detected
urlInput.addEventListener('paste', function () {
    // This is wrapped in a timeout or it executes before the value has changed
    setTimeout(function () {
        processLink(urlInput.value)
    }, 50)
})

// Process URL after an Enter key press
urlInput.addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        processLink(urlInput.value);
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
    urlInput.value = '';
    urlInput.focus();
})

// Copy link button
document.getElementById('link-copy-btn').addEventListener('click', function () {
    var btn = document.getElementById('link-copy-btn')
    if (navigator.clipboard) {
        // Use Clipboard API if available
        var copyText = urlInput.value
        navigator.clipboard.writeText(copyText)
    } else {
        // Fallback to older API
        var copyText = urlInput
        copyText.select()
        document.execCommand('copy')
        urlInput.blur()
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
            url: urlInput.value
        })
    })
} else {
    document.getElementById('link-share-btn').disabled = true
}

// QR Code button
// This generates the QR code only when the button is pressed
var qrModal = document.getElementById('qr-modal')
qrModal.addEventListener('show.bs.modal', function (event) {
    var currentLink = urlInput.value
    var qrContainer = document.getElementById('qrcode')
    const qrSettings = {
        text: currentLink,
        width: 425,
        height: 425,
        quietZone: 25,
        tooltip: true
    }
    new QRCode(document.getElementById('qrcode'), qrSettings)
})

// Remove QR code when popup is hidden (so new codes don't show up below new ones)
qrModal.addEventListener('hide.bs.modal', function (event) {
    document.getElementById('qrcode').innerHTML = ''
})

// Test link button
document.getElementById('link-test-btn').addEventListener('click', function () {
    var currentLink = urlInput.value
    openWindow(currentLink);
})

// Email button
document.getElementById('email-btn').addEventListener('click', function () {
    var currentLink = urlInput.value
    var emailSubject = 'Link for you'
    var emailBody = '\n\n\n' + currentLink
    window.open('mailto:?subject=' + encodeURIComponent(emailSubject) + '&body=' + encodeURIComponent(emailBody), '_blank')
})

// SMS button
document.getElementById('sms-btn').addEventListener('click', function () {
    var currentLink = urlInput.value
    window.open('sms:?&body=' + encodeURIComponent(currentLink), '_blank')
})

// Mastodon button
document.getElementById('mastodon-server-hostname').value = localStorage['mastodon-server'] || ''
document.getElementById('mastodon-share-btn').addEventListener('click', function () {
    var currentLink = urlInput.value
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
    var link = 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent(urlInput.value);
    openWindow(link);
})

// LinkedIn button
document.getElementById('linkedin-share-btn').addEventListener('click', function () {
    var link = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(urlInput.value);
    openWindow(link);
})

// Reddit button
document.getElementById('reddit-share-btn').addEventListener('click', function () {
    var link = 'https://reddit.com/submit?url=' + encodeURIComponent(urlInput.value);
    openWindow(link);
})

// Telegram button
document.getElementById('telegram-share-btn').addEventListener('click', function () {
    var link = 'https://t.me/share/url?url=' + encodeURIComponent(urlInput.value)
    openWindow(link);
})

// Bluesky button
document.getElementById('bluesky-share-btn').addEventListener('click', function () {
    var link = 'https://bsky.app/intent/compose?text=' + encodeURIComponent(urlInput.value)
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