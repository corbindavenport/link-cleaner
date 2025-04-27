
// Plausible Analytics
window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }

// Delete link history storage if it exists, link history feature has been removed
localStorage.removeItem('history');

// Options used for pop-up windows from social share buttons
const popupOptions = 'popup,width=600,height=500,noopener,noreferrer';

// Initialize modals and toasts
const mastodonModal = new bootstrap.Modal(document.getElementById('mastodon-modal'))
const clipboardToast = bootstrap.Toast.getOrCreateInstance(document.querySelector('#clipboard-toast'))

// Function for cleaning link
function processLink(link) {
    plausible('Clean Link')
    // Read settings
    if (localStorage.getItem('clipboard-check')) {
        var autoClipboardEnabled = JSON.parse(localStorage.getItem('clipboard-check').toLowerCase());
    } else {
        var autoClipboardEnabled = false;
    }
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
    var newLink = cleanLink(link, youtubeShortenEnabled, fixTwitterEnabled)
    // Switch to output
    window.scrollTo(0,0)
    document.getElementById('link-input').value = newLink
    document.getElementById('linkcleaner-buttons-container').style.display = 'flex'
    document.body.dataset.view = 'cleaned';
    // Write text to clipboard
    if (navigator.clipboard && autoClipboardEnabled) {
        try {
            const type = 'text/plain';
            const blob = new Blob([newLink], { type });
            const data = [new ClipboardItem({ [type]: blob })];
            navigator.clipboard.write(data);
            clipboardToast.show();
        } catch (e) {
            console.error('Error copying to clipboard:', e);
        }
    }
    // Highlight the output for easy copy
    document.getElementById('link-input').select()
}

// Process URL after a paste action is detected
document.getElementById('link-input').addEventListener('paste', function () {
    // This is wrapped in a timeout or it executes before the value has changed
    setTimeout(function () {
        processLink(document.getElementById('link-input').value)
    }, 50)
})

// Process URL after an Enter key press
document.getElementById('link-input').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        processLink(document.getElementById('link-input').value);
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
    document.getElementById('link-input').value = '';
    document.getElementById('link-input').focus();
})

// Copy link button
document.getElementById('link-copy-btn').addEventListener('click', function () {
    var btn = document.getElementById('link-copy-btn')
    if (navigator.clipboard) {
        // Use Clipboard API if available
        var copyText = document.getElementById('link-input').value
        navigator.clipboard.writeText(copyText)
    } else {
        // Fallback to older API
        var copyText = document.getElementById('link-input')
        copyText.select()
        document.execCommand('copy')
    }
    // Change button design
    btn.classList.remove('btn-primary')
    btn.classList.add('btn-success')
    btn.innerHTML = '<i class="bi bi-check"></i> Copied'
    // Revert after three seconds
    setTimeout(function () {
        btn.classList.remove('btn-success')
        btn.classList.add('btn-primary')
        btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy'
    }, 2000)
})

// Share button
if (navigator.canShare) {
    document.getElementById('link-share-btn').addEventListener('click', function () {
        navigator.share({
            url: document.getElementById('link-input').value
        })
    })
} else {
    document.getElementById('link-share-btn').disabled = true
}

// QR Code button
// This generates the QR code only when the button is pressed
var qrModal = document.getElementById('qr-modal')
qrModal.addEventListener('show.bs.modal', function (event) {
    var currentLink = document.getElementById('link-input').value
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
    var currentLink = document.getElementById('link-input').value
    window.open(currentLink, '_blank', popupOptions)
})

// Email button
document.getElementById('email-btn').addEventListener('click', function () {
    var currentLink = document.getElementById('link-input').value
    var emailSubject = 'Link for you'
    var emailBody = '\n\n\n' + currentLink
    window.open('mailto:?subject=' + encodeURIComponent(emailSubject) + '&body=' + encodeURIComponent(emailBody), '_blank')
})

// SMS button
document.getElementById('sms-btn').addEventListener('click', function () {
    var currentLink = document.getElementById('link-input').value
    window.open('sms:?&body=' + encodeURIComponent(currentLink), '_blank')
})

// Mastodon button
document.getElementById('mastodon-server-hostname').value = localStorage['mastodon-server'] || ''
document.getElementById('mastodon-share-btn').addEventListener('click', function () {
    var currentLink = document.getElementById('link-input').value
    var currentServer = document.getElementById('mastodon-server-hostname').value
    if (currentServer) {
        localStorage['mastodon-server'] = currentServer
        var link = 'https://' + currentServer + '/share?text=' + encodeURIComponent(currentLink)
        window.open(link, '_blank', popupOptions)
        mastodonModal.hide()
    }
})

// Facebook button
document.getElementById('facebook-share-btn').addEventListener('click', function () {
    var link = 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent(document.getElementById('link-input').value)
    window.open(link, '_blank', popupOptions)
})

// LinkedIn button
document.getElementById('linkedin-share-btn').addEventListener('click', function () {
    var link = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(document.getElementById('link-input').value)
    window.open(link, '_blank', popupOptions)
})

// Reddit button
document.getElementById('reddit-share-btn').addEventListener('click', function () {
    var currentLink = document.getElementById('link-input').value
    window.open('https://reddit.com/submit?url=' + encodeURIComponent(currentLink), '_blank', popupOptions)
})

// Telegram button
document.getElementById('telegram-share-btn').addEventListener('click', function () {
    var link = 'https://t.me/share/url?url=' + encodeURIComponent(document.getElementById('link-input').value)
    window.open(link, '_blank', popupOptions)
})

// Substack Notes button
document.getElementById('bluesky-share-btn').addEventListener('click', function () {
    var link = 'https://bsky.app/intent/compose?text=' + encodeURIComponent(document.getElementById('link-input').value)
    window.open(link, '_blank', popupOptions)
})

// Scroll to top of page when the link field is selected
// This works with the margin CSS rules to fix the layout when a touch keyboard is selected
document.getElementById('link-input').addEventListener('focus', function() {
        window.scrollTo(0,0);
})

// Support for Web Share Target API, Siri Shortcut, and OpenSearch
const parsedUrl = new URL(window.location)
if (parsedUrl.searchParams.get('url')) {
    // This is where the URL SHOULD BE
    processLink(parsedUrl.searchParams.get('url'))
} else if (parsedUrl.searchParams.get('text')) {
    // Android usually puts URLs here
    processLink(parsedUrl.searchParams.get('text'))
} else if (parsedUrl.searchParams.get('title')) {
    // Android sometimes puts URLs here
    processLink(parsedUrl.searchParams.get('title'))
}