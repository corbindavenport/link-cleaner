// Process URL after clicking 'Clean Links' button
document.getElementById('link-clean-btn').addEventListener('click', function () {
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
    // Split comma-separated or newline-seperated input into array and trim whitespace
    var oldLinks = document.getElementById('link-bulk-input').value.split(/\n|\,/)
    // Filter out blank lines
    oldLinks = oldLinks.filter(link => link.length > 0)
    // Clean links
    var newLinks = []
    oldLinks.forEach((link) => {
        var processedLink = cleanLink(link, youtubeShortenEnabled, fixTwitterEnabled, shortenWalmartEnabled)
        newLinks.push(processedLink)
    })
    // Output result
    var result = newLinks.toString().replaceAll(',','\n')
    document.getElementById('link-copy-btn').removeAttribute('disabled')
    document.getElementById('link-bulk-output').value = result
})

// Copy link button
document.getElementById('link-copy-btn').addEventListener('click', function () {
    var btn = document.getElementById('link-copy-btn')
    if (navigator.clipboard) {
        // Use Clipboard API if available
        var copyText = document.getElementById('link-bulk-output').value
        navigator.clipboard.writeText(copyText)
    } else {
        // Fallback to older API
        var copyText = document.getElementById('link-bulk-output')
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