// Code that is shared across normal LinkCleaner and bulk mode

// Function for cleaning links
function cleanLink(link, youtubeShortenEnabled = false, vxTwitterEnabled = false) {
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
    // Retain 'q' parameter
    if (oldLink.searchParams.has('q')) {
        newLink.searchParams.append('q', oldLink.searchParams.get('q'))
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
    // Shorten YouTube links if enabled
    if (oldLink.host.includes('youtube.com') && youtubeShortenEnabled) {
        newLink.host = 'youtu.be'
        newLink.pathname = '/' + oldLink.searchParams.get('v')
        newLink.searchParams.delete('v')
    }
    // Use vxTwitter if enabled
    if (oldLink.host.includes('twitter.com') && vxTwitterEnabled) {
        newLink.host = 'vxtwitter.com'
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

// Save settings automatically to localStorage
document.querySelectorAll('input[type="checkbox"]').forEach(function(el) {
    el.addEventListener('change', function() {
        localStorage.setItem(el.id, el.checked)
        console.log('Saved setting:', el.id, el.checked)
    })
})

// Load settings from localStorage
Object.entries(localStorage).forEach(function(key) {
    // Ignore link history and android app
    if (key[0] === 'history' || key[0] === 'android-app') {
        return true
    }
    // Load setting
    console.log('Loaded setting:', key)
    document.getElementById(key[0]).checked = JSON.parse(key[1])
})

// Hide donation links on Android APK
if (document.referrer.includes('android-app://')) {
    console.log('Android app detected')
    document.querySelector('.donate-card').classList.add('d-none')
}