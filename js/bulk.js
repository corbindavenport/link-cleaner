// Plausible Analytics
window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments) }

// Button links
document.querySelectorAll('.link-btn').forEach(function (el) {
    el.addEventListener('click', function () {
        window.open(el.getAttribute('data-url'), '_blank')
    })
})

// Process URL after clicking 'Clean Links' button
document.getElementById('link-clean-btn').addEventListener('click', function () {
    plausible('Bulk Clean Link')
    // Read settings
    var youtubeShortenEnabled = document.getElementById('youtube-shorten-check').checked
    var vxTwitterEnabled = document.getElementById('vxTwitter-check').checked
    // Split comma-separated or newline-seperated input into array and trim whitespace
    var oldLinks = document.getElementById('link-bulk-input').value.split(/\n|\,/)
    // Filter out blank lines
    oldLinks = oldLinks.filter(link => link.length > 0)
    // Clean links
    var newLinks = []
    oldLinks.forEach((link) => {
        var processedLink = cleanLink(link, youtubeShortenEnabled, vxTwitterEnabled)
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
    btn.classList.remove('btn-outline-primary')
    btn.classList.add('btn-outline-success')
    btn.innerHTML = '<i class="bi bi-check"></i> Copied'
    // Revert after three seconds
    setTimeout(function () {
        btn.classList.remove('btn-outline-success')
        btn.classList.add('btn-outline-primary')
        btn.innerHTML = '<i class="bi bi-clipboard"></i> Copy to Clipboard'
    }, 2000)
})

// Save settings automatically to localStorage
document.querySelectorAll('input[type="checkbox"]').forEach(function(el) {
    el.addEventListener('change', function() {
        localStorage.setItem(el.id, el.checked)
        console.log('Saved setting:', el.id, el.checked)
    })
})

// Load settings from localStorage
Object.entries(localStorage).forEach(function(key) {
    console.log('Loaded setting:', key)
    document.getElementById(key[0]).checked = JSON.parse(key[1])
})