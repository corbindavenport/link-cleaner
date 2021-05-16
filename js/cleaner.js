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

document.getElementById('link-input').addEventListener('paste', function () {
    // This is wrapped in a timeout or it executes before the value has changed
    setTimeout(function () {
        cleanLink(document.getElementById('link-input').value)
    }, 50)
})

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

document.getElementById('link-startover').addEventListener('click', function () {
    document.getElementById('completed').style.display = 'none'
    document.getElementById('initial').style.display = 'block'
    document.getElementById('link-input').value = ''
    document.getElementById('link-input').select()
})

if (navigator.canShare) {
    document.getElementById('link-share-btn').addEventListener('click', function () {
        try {
            navigator.share({
                url: document.getElementById('link-input').value
            })
        }
        catch(e) {
            console.error(e)
            alert('There was an error, sorry about that.')
        }
    })
} else {
    document.getElementById('link-share-btn').disabled = true
    document.getElementById('link-share-btn').innerText = 'Share not available'
}