// Function for cleaning link
function cleanLink(link) {
    var oldLink = new URL(link)
    // Retain 'q' parameter (for Google, DuckDuckGo, etc.) because it's usually not malicious or overly long
    if (oldLink.searchParams.get('q')) {
        var newLink = new URL(oldLink.origin + oldLink.pathname + '?q=' + oldLink.searchParams.get('q'))
    } else {
        var newLink = new URL(oldLink.origin + oldLink.pathname)
    }
    // Switch to output
    document.getElementById('link-output').value = newLink.toString()
    document.getElementById('initial').style.display = 'none'
    document.getElementById('completed').style.display = 'block'
    // Highlight the output for easy copy
    document.getElementById('link-output').select()
}

// Function for sharing a link
function shareLink(link) {
    try {
        navigator.share({
            url: link
        })
    }
    catch (e) {
        console.error(e)
    }
}

// Process URL after a paste action is detected
document.getElementById('link-input').addEventListener('paste', function () {
    // This is wrapped in a timeout or it executes before the value has changed
    setTimeout(function () {
        cleanLink(document.getElementById('link-input').value)
    }, 50)
})

// Copy link button
document.getElementById('link-copy-btn').addEventListener('click', function () {
    var btn = document.getElementById('link-copy-btn')
    // Copy text
    var copyText = document.getElementById('link-output')
    copyText.select()
    document.execCommand('copy')
    // Change button design
    btn.classList.remove('btn-primary')
    btn.classList.add('btn-success')
    btn.innerText = 'Done!'
    // Revert after three seconds
    setTimeout(function () {
        btn.classList.remove('btn-success')
        btn.classList.add('btn-primary')
        btn.innerText = 'Copy to clipboard'
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
        shareLink(document.getElementById('link-output'))
    })
} else {
    document.getElementById('link-share-btn').disabled = true
    document.getElementById('link-share-btn').innerText = 'Share not available'
}

// Web Share Target API support
const parsedUrl = new URL(window.location)
if (parsedUrl.searchParams.get('url')) {
    // This is where the URL SHOULD BE
    cleanLink(parsedUrl.searchParams.get('url'))
    shareLink(document.getElementById('link-output'))
} else if (parsedUrl.searchParams.get('text')) {
    // Android usually puts URLs here
    cleanLink(parsedUrl.searchParams.get('text'))
    shareLink(document.getElementById('link-output'))
} else if (parsedUrl.searchParams.get('title')) {
    // Android sometimes puts URLs here
    cleanLink(parsedUrl.searchParams.get('title'))
    shareLink(document.getElementById('link-output'))
}