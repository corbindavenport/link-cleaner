// Code that is shared across normal Link Cleaner and bulk mode

// Function for cleaning links
function cleanLink(link, youtubeShortenEnabled = false, fixTwitterEnabled = false, amazonTrackingId = localStorage['amazon-tracking-id']) {
    try {
        var oldLink = new URL(link)
    } catch (e) {
        // TypeError rasied if not identified as URL, try stripping "Page Title"
        if (e instanceof TypeError) {
            var oldLink = new URL(link.split(/"(?:[^\\"]|\\.)*"/)[1].trim())
        }
    }
    console.log('Old link:', oldLink)
    // Fixes for various link shorteners/filters
    if ((oldLink.host === 'l.facebook.com') && oldLink.searchParams.has('u')) {
        // Fix for Facebook shared links
        var facebookLink = decodeURI(oldLink.searchParams.get('u'))
        oldLink = new URL(facebookLink)
    } else if ((oldLink.host === 'href.li')) {
        // Fix for href.li links
        var hrefLink = oldLink.href.split('?')[1]
        var oldLink = new URL(hrefLink)
    }
    // Generate new link
    var newLink = new URL(oldLink.origin + oldLink.pathname)
    // Don't remove 'q' parameter
    if (oldLink.searchParams.has('q')) {
        newLink.searchParams.append('q', oldLink.searchParams.get('q'))
    }
    // Don't remove ID parameter for Macy's links (#21)
    if (oldLink.host.includes('macys.com') && oldLink.searchParams.has('ID')) {
        newLink.searchParams.append('ID', oldLink.searchParams.get('ID'))
    }
    // Don't remove 'v' (video id) and 't' (time position) for YouTube links
    if (oldLink.host.includes('youtube.com') && oldLink.searchParams.has('v')) {
        newLink.searchParams.append('v', oldLink.searchParams.get('v'))
        newLink.searchParams.append('t', oldLink.searchParams.get('t'))
    }
    // Don't remove required variables for Facebook links
    if (oldLink.host.includes('facebook.com') && oldLink.pathname.includes('story.php')) {
        newLink.searchParams.append('story_fbid', oldLink.searchParams.get('story_fbid'))
        newLink.searchParams.append('id', oldLink.searchParams.get('id'))
    }
    // Remove extra information for Amazon shopping links
    if (oldLink.host.includes('amazon') && oldLink.pathname.includes('/dp/')) {
        newLink.hostname = newLink.hostname.replace('www.', '') // Amazon doesn't need www.
        var regex = /(?:\/dp\/)(\w*|\d*)/g
        var amazonID = regex.exec(oldLink.pathname)[1]
        if (amazonID) {
            newLink.pathname = '/dp/' + amazonID
        }
    }
    // Shorten YouTube links if enabled
    if (oldLink.host.includes('youtube.com') && youtubeShortenEnabled) {
        newLink.host = 'youtu.be'
        newLink.pathname = '/' + oldLink.searchParams.get('v')
        newLink.searchParams.delete('v')
    }
    // Use FixTwitter if enabled
    if (oldLink.host.includes('twitter.com') && fixTwitterEnabled) {
        newLink.host = 'fxtwitter.com'
    }
    // Add Amazon affiliate code if enabled
    if (oldLink.host.includes('amazon') && amazonTrackingId) {
        newLink.searchParams.append('tag', amazonTrackingId)
    }
    // Save to history
    addToHistory(newLink)
    // Switch to output
    console.log('New link:', newLink)
    return newLink.toString()
}

// Function for adding result to link clean history
function addToHistory(link) {
    var linkArray = []
    // Get current value if available
    if (localStorage.getItem('history')) {
        try {
            linkArray = JSON.parse(localStorage.getItem('history'))
        } catch {
            // Saved storage only has one value so it's not valid JSON
            linkArray.push(localStorage.getItem('history'))
        }
    }
    linkArray.unshift(link)
    // Don't exceed 100 links
    if (linkArray.length > 100) {
        linkArray.splice(-1)
    }
    // Save back to localStorage
    try {
        localStorage.setItem('history', JSON.stringify(linkArray))
    } catch (e) {
        // localStorage might be full, try deleting some items and try again
        linkArray.splice(arr1.length - 10, 10)
        localStorage.setItem('history', JSON.stringify(linkArray))
    }
}

// Function for generating popup window
// Based on: https://stackoverflow.com/a/32261263
function popupWindow(url, windowName, win, w, h) {
    const y = win.top.outerHeight / 2 + win.top.screenY - (h / 2)
    const x = win.top.outerWidth / 2 + win.top.screenX - (w / 2)
    return win.open(url, windowName, `toolbar=no, location=no, directories=no, status=no, menubar=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`)
}

// Save settings automatically to localStorage
document.querySelectorAll('input[type="checkbox"]').forEach(function (el) {
    el.addEventListener('change', function () {
        localStorage.setItem(el.id, el.checked)
        console.log('Saved setting:', el.id, el.checked)
    })
})
document.querySelectorAll('.settings-container input[type="text"]').forEach(function (el) {
    el.addEventListener('change', function () {
        localStorage.setItem(el.id, el.value)
        console.log('Saved setting:', el.id, el.value)
    })
})

// Load settings from localStorage
// TODO: Migrate to localForage
Object.entries(localStorage).forEach(function (key) {
    // Ignore link history and android app
    if (key[0] === 'history' || key[0] === 'android-app' || key[0] === 'mastodon-server') {
        return true
    }
    // Amazon ID settings
    if (key[0] === 'amazon-tracking-id') {
        console.log('Loaded setting:', key)
        document.getElementById('amazon-tracking-id').value = key[1]
        return true
    }
    // Other settings
    if (document.getElementById(key[0])) {
        console.log('Loaded setting:', key)
        document.getElementById(key[0]).checked = JSON.parse(key[1])
    }
})

// Hide donation links on Android APK
if ((localStorage['android-app'] === 'true') || document.referrer.includes('android-app://')) {
    console.log('Android app detected')
    document.querySelector('.donate-card').classList.add('d-none')
    if (!(localStorage['android-app'] === 'true')) {
        localStorage['android-app'] = 'true'
    }
}