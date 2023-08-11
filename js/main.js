
// Plausible Analytics
window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }

// Detect iOS
// Credit: https://stackoverflow.com/a/9039885
function ifiOS() {
    if (['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'].includes(navigator.userAgent)) {
        return true
    } else if (navigator.userAgent.includes('Mac') && 'ontouchend' in document) {
        // iPadOS detection
        return true
    } else {
        return false
    }
}

// Function for cleaning link
function processLink(link) {
    plausible('Clean Link')
    var youtubeShortenEnabled = document.getElementById('youtube-shorten-check').checked
    var fixTwitterEnabled = document.getElementById('vxTwitter-check').checked
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
        try {
            navigator.share({
                url: document.getElementById('link-output').value
            })
        }
        catch (e) {
            alert('There was an error:\n\n' + e.message)
        }
    })
} else {
    document.getElementById('link-share-btn').disabled = true
}

// QR Code button
// This loads the QR code image only when the button is pressed
var qrModal = document.getElementById('qr-modal')
qrModal.addEventListener('show.bs.modal', function (event) {
    var currentLink = document.getElementById('link-output').value
    var qrElement = document.getElementById('qr-img')
    var qrSrc = 'https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=' + encodeURIComponent(currentLink)
    if (qrElement.src != qrSrc) {
        qrElement.setAttribute('src', qrSrc)
        qrElement.setAttribute('title', currentLink)
    }
})

// Test link button
document.getElementById('link-test-btn').addEventListener('click', function () {
    var currentLink = document.getElementById('link-output').value
    window.open(currentLink, '_blank')
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
document.getElementById('mastodon-share-btn').addEventListener('click', function () {
    var currentLink = document.getElementById('link-output').value
    var defaultServer = localStorage['mastodon-server'] || 'mastodon.social'
    var server = window.prompt('Which Mastodon server do you want to use?', defaultServer)
    if (server) {
        localStorage['mastodon-server'] = server
        var link = 'https://' + server + '/share?text=' + encodeURIComponent('Type something here\n\n' + currentLink)
        window.open(link, '_blank')
    }
})

// Facebook button
document.getElementById('facebook-share-btn').addEventListener('click', function () {
    var link = 'https://www.facebook.com/sharer.php?u=' + encodeURIComponent(document.getElementById('link-output').value)
    window.open(link, '_blank')
})

// LinkedIn button
document.getElementById('linkedin-share-btn').addEventListener('click', function () {
    var link = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(document.getElementById('link-output').value)
    window.open(link, '_blank')
})

// Twitter / X button
document.getElementById('x-share-btn').addEventListener('click', function () {
    var link = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(document.getElementById('link-output').value)
    window.open(link, '_blank')
})

// Telegram button
document.getElementById('telegram-share-btn').addEventListener('click', function () {
    var link = 'https://t.me/share/url?url=' + encodeURIComponent(document.getElementById('link-output').value)
    window.open(link, '_blank')
})

// Substack Notes button
document.getElementById('substack-share-btn').addEventListener('click', function () {
    var link = 'https://substack.com/notes?action=compose&message=' + encodeURIComponent(document.getElementById('link-output').value)
    window.open(link, '_blank')
})

// Show Shortcut prompt on iOS
if (ifiOS()) {
    document.getElementById('apple-shortcut-btn').style.display = 'block'
}

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