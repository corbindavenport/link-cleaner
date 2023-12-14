
// Plausible Analytics
window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }

// Options used for pop-up windows from social share buttons
const popupOptions = 'popup,width=600,height=500,noopener,noreferrer';

// Initialize modals
const mastodonModal = new bootstrap.Modal(document.getElementById('mastodon-modal'))

// Function for cleaning link
function processLink(link) {
    plausible('Clean Link')
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
    var newLink = cleanLink(link, youtubeShortenEnabled, fixTwitterEnabled)
    // Switch to output
    document.getElementById('link-output').value = newLink
    document.getElementById('initial').style.display = 'none'
    document.getElementById('completed').style.display = 'block'
    // Highlight the output for easy copy
    document.getElementById('link-output').select()
}

// Process URL after a paste action is detected
document.getElementById('link-input').addEventListener('paste', function () {
    // This is wrapped in a timeout or it executes before the value has changed
    setTimeout(function () {
        processLink(document.getElementById('link-input').value)
    }, 50)
})

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

// Process URL after clicking arrow button
document.getElementById('link-submit').addEventListener('click', function () {
    processLink(document.getElementById('link-input').value)
})

// Copy link button
document.getElementById('link-copy-btn').addEventListener('click', function () {
    var btn = document.getElementById('link-copy-btn')
    if (navigator.clipboard) {
        // Use Clipboard API if available
        var copyText = document.getElementById('link-output').value
        navigator.clipboard.writeText(copyText)
    } else {
        // Fallback to older API
        var copyText = document.getElementById('link-output')
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
        btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy to Clipboard'
    }, 2000)
})

// Start over button
document.getElementById('link-startover').addEventListener('click', function () {
    document.getElementById('completed').style.display = 'none'
    document.getElementById('initial').style.display = 'block'
    document.getElementById('link-input').value = ''
    document.getElementById('link-input').select()
})

// Share button
if (navigator.canShare) {
    document.getElementById('link-share-btn').addEventListener('click', function () {
        navigator.share({
            url: document.getElementById('link-output').value
        })
    })
} else {
    document.getElementById('link-share-btn').disabled = true
}

// QR Code button
// This generates the QR code only when the button is pressed
var qrModal = document.getElementById('qr-modal')
qrModal.addEventListener('show.bs.modal', function (event) {
    var currentLink = document.getElementById('link-output').value
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
    var currentLink = document.getElementById('link-output').value
    window.open(currentLink, '_blank', popupOptions)
})

// Email button
document.getElementById('email-btn').addEventListener('click', function () {
    var currentLink = document.getElementById('link-output').value
    var emailSubject = 'Link for you'
    var emailBody = '\n\n\n' + currentLink
    window.open('mailto:?subject=' + encodeURIComponent(emailSubject) + '&body=' + encodeURIComponent(emailBody), '_blank')
})

// SMS button
document.getElementById('sms-btn').addEventListener('click', function () {
    var currentLink = document.getElementById('link-output').value
    window.open('sms:?&body=' + encodeURIComponent(currentLink), '_blank')
})

// Mastodon button
document.getElementById('mastodon-server-hostname').value = localStorage['mastodon-server'] || ''
document.getElementById('mastodon-share-btn').addEventListener('click', function () {
    var currentLink = document.getElementById('link-output').value
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
    var link = 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent(document.getElementById('link-output').value)
    window.open(link, '_blank', popupOptions)
})

// LinkedIn button
document.getElementById('linkedin-share-btn').addEventListener('click', function () {
    var link = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(document.getElementById('link-output').value)
    window.open(link, '_blank', popupOptions)
})

// Reddit button
document.getElementById('reddit-share-btn').addEventListener('click', function () {
    var currentLink = document.getElementById('link-output').value
    window.open('https://reddit.com/submit?url=' + encodeURIComponent(currentLink), '_blank', popupOptions)
})

// Telegram button
document.getElementById('telegram-share-btn').addEventListener('click', function () {
    var link = 'https://t.me/share/url?url=' + encodeURIComponent(document.getElementById('link-output').value)
    window.open(link, '_blank', popupOptions)
})

// Substack Notes button
document.getElementById('substack-share-btn').addEventListener('click', function () {
    var link = 'https://substack.com/notes?action=compose&message=' + encodeURIComponent(document.getElementById('link-output').value)
    window.open(link, '_blank', popupOptions)
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