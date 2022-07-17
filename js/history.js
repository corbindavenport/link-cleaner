// Load values from storage
function loadHistory() {
    var linkArray = []
    // Get current value if available
    if (localStorage.getItem('history')) {
        try {
            linkArray = JSON.parse(localStorage.getItem('history').split(','))
        } catch {
            // Saved storage only has one value so it's not valid JSON
            linkArray.push(localStorage.getItem('history'))
        }
    }
    // Show error if there are no saved links
    if (linkArray.length === 0) {
        document.getElementById('clean-history-empty-alert').classList.remove('d-none')
        return true
    }
    // Generate list
    listEl = document.getElementById('clean-history-list')
    linkArray.forEach(function(link) {
        var linkEl = document.createElement('a')
        linkEl.classList.add('list-group-item', 'list-group-item-action', 'text-break')
        linkEl.innerText = link
        linkEl.setAttribute('href', link)
        linkEl.setAttribute('target', '_blank')
        listEl.appendChild(linkEl)
    })
    // Show list and delete buttons when completed
    listEl.classList.remove('d-none')
}

// Clear History button
document.getElementById('history-delete-btn').addEventListener('click', function () {
    // Delete stored links
    localStorage.removeItem('history')
    // Update page UI
    document.getElementById('clean-history-list').classList.add('d-none')
    document.getElementById('clean-history-empty-alert').classList.remove('d-none')
})

loadHistory()