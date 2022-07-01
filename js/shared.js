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
    // Switch to output
    console.log('New link:', newLink)
    return newLink.toString()
}