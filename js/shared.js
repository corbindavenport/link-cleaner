// Code that is shared across normal Link Cleaner and bulk mode

// Pride Month mode
document.body.dataset.prideMode = (new Date()).getMonth() === 5;

// Function for cleaning links
function cleanLink(link, youtubeShortenEnabled = false, fixTwitterEnabled = false, amazonTrackingId = localStorage['amazon-tracking-id']) {
    try {
        var oldLink = new URL(link)
    } catch (e) {
        // TypeError rasied if not identified as URL, try stripping "Page Title" or any other non-link text
        if (e instanceof TypeError) {
            var extractedURL = link.match(/https?:\/\/\S+/);
            if (extractedURL) {
                var oldLink = new URL(extractedURL[0]);
            } else {
                console.log('No valid URL found in the string.');
            }
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
        oldLink = new URL(hrefLink)
    } else if ((oldLink.host === 'www.google.com') && (oldLink.pathname === '/url') && (oldLink.searchParams.has('url'))) {
        // Fix for redirect links from Google Search (#29)
        oldLink = new URL(oldLink.searchParams.get('url'))
    }
    // Generate new link
    var newLink = new URL(oldLink.origin + oldLink.pathname)
    // Don't remove 'q' parameter
    if (oldLink.searchParams.has('q')) {
        newLink.searchParams.append('q', oldLink.searchParams.get('q'))
    }
    // Don't remove ID parameter for Google Play links (#34)
    if (oldLink.host.includes('play.google.com') && oldLink.searchParams.has('id')) {
        newLink.searchParams.append('id', oldLink.searchParams.get('id'))
    }
    // Don't remove ID parameter for Macy's links (#21)
    if (oldLink.host.includes('macys.com') && oldLink.searchParams.has('ID')) {
        newLink.searchParams.append('ID', oldLink.searchParams.get('ID'))
    }
    // YouTube links
    if (oldLink.host.includes('youtube.com') && oldLink.searchParams.has('v')) {
        // Shorten link if setting is enabled
        if (oldLink.searchParams.has('v') && youtubeShortenEnabled) {
            // Use to find the video ID: https://regex101.com/r/0Plpyd/1
            var regex = /^.*(youtu\.be\/|embed\/|shorts\/|\?v=|\&v=)(?<videoID>[^#\&\?]*).*/;
            var videoId = regex.exec(oldLink.href)['groups']['videoID'];
            newLink = new URL('https://youtu.be/' + videoId);
        } else if (oldLink.searchParams.has('v')) {
            // If the video link won't be in the main path, the 'v' (video ID) parameter needs to be added
            newLink.searchParams.append('v', oldLink.searchParams.get('v'))
        }
        // Never remove the 't' (time position) for YouTube video links
        if (oldLink.searchParams.has('t')) {
            newLink.searchParams.append('t', oldLink.searchParams.get('t'))
        }
    } else if (oldLink.host.includes('youtube.com') && oldLink.pathname.includes('playlist') && oldLink.searchParams.has('list')) {
        // Don't remove list ID for YouTube playlist links (#37)
        newLink.searchParams.append('list', oldLink.searchParams.get('list'))
    }
    // Don't remove required variables for Facebook links
    if (oldLink.host.includes('facebook.com') && oldLink.pathname.includes('story.php')) {
        newLink.searchParams.append('story_fbid', oldLink.searchParams.get('story_fbid'))
        newLink.searchParams.append('id', oldLink.searchParams.get('id'))
    }
    // Remove extra information for Amazon shopping links
    if (oldLink.host.includes('amazon') && (oldLink.pathname.includes('/dp/') || oldLink.pathname.includes('/d/') || oldLink.pathname.includes('/product/'))) {
        newLink.hostname = newLink.hostname.replace('www.', '') // Amazon doesn't need www.
        var regex = /(?:\/dp\/|\/product\/|\/d\/)(\w*|\d*)/g;
        var match = regex.exec(oldLink.pathname);
        if (match && match[1]) {
            newLink.pathname = '/dp/' + match[1];
        }
    }
    // Use FixTwitter if enabled
    if ((oldLink.host.includes('twitter.com') || oldLink.host.includes('x.com')) && fixTwitterEnabled) {
        newLink.host = 'fxtwitter.com'
    }
    // Add Amazon affiliate code if enabled
    if (oldLink.host.includes('amazon') && amazonTrackingId) {
        newLink.searchParams.append('tag', amazonTrackingId)
    }
    // Fix Lenovo store links (#36)
    if (oldLink.host.includes('lenovo.com') && oldLink.searchParams.has('bundleId')) {
        newLink.searchParams.append('bundleId', oldLink.searchParams.get('bundleId'))
    }
    // Shorten Best Buy product links (#42)
    if (oldLink.host.includes('bestbuy.com') && oldLink.pathname.includes('.p')) {
        var regex = /\/(\d+)\.p/;
        var productID = oldLink.pathname.match(regex);
        if (productID) {
            newLink.pathname = '/site/' + productID[1] + '.p';
        }
    }
    // Shorten Walmart links (#41)
    if (oldLink.host.includes('walmart.com') && oldLink.pathname.includes('/ip/')) {
        var regex = /\/ip\/.*\/(\d+)/;
        var productID = oldLink.pathname.match(regex);
        if (productID) {
            newLink.pathname = '/ip/' + productID[1];
        }
    }
    // Allow Xiaohongshu links to be viewed without an account (#47)
    if ((oldLink.host === ('www.xiaohongshu.com')) && oldLink.searchParams.has('xsec_token')) {
        newLink.searchParams.append('xsec_token', oldLink.searchParams.get('xsec_token'))
    }
    // Fix Apple Weather alert links (#46)
    if (oldLink.host === 'weatherkit.apple.com') {
        newLink.searchParams.append('lang', oldLink.searchParams.get('lang'));
        newLink.searchParams.append('party', oldLink.searchParams.get('party'));
        newLink.searchParams.append('ids', oldLink.searchParams.get('ids'));
    }
    // Fix BusinessWire tracking links (#39)
    if ((oldLink.host === 'cts.businesswire.com') && oldLink.searchParams.has('url')) {
        newLink = new URL(oldLink.searchParams.get('url'));
    }
    // Switch to output
    console.log('New link:', newLink)
    return newLink.toString()
}