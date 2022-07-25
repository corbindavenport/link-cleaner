# Link Cleaner

Link Cleaner is a modern web app that removes uncessesary parts of web links in one click. The result can then be copied to the device clipboard, shared to another app or service, or displayed as a QR code for easy scanning.

Link Cleaner is primarily developed for mobile devices, as removing parts of links with a touchscreen keyboard is usually cumbersome, but it works perfectly well on desktob browsers as well.

### Features

- Fully functional when the device is offline
- Bulk Mode can clean multiple links at once
- Completely private (see [Privacy Policy](#privacy-policy))
- Records cleaned links on History page for easy access later
- Uses the [Web Share Target API](https://w3c.github.io/web-share-target/) to recieve links from other applications (e.g. through the Share menu on Android devices)
- Uses [OpenSearch](https://developer.mozilla.org/en-US/docs/Web/OpenSearch) to allow cleaning links from the search bar in some web browsers
- Uses the [Web Share API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) to send cleaned links directly to other installed applications

### Privacy Policy

Link Cleaner uses [Plausible Analytics](https://plausible.io) to report anonymous usage data, including how many times the app is open, how long it is used, the current country, and how many times links are cleaned. Links are **not** sent anywhere during or after cleaning.

The 'Show QR Code' button uses the [Google Charts API](https://developers.google.com/chart/infographics/docs/qr_codes) to generate a QR code, which requires sending the cleaned link to a Google server. However, the QR code is only loaded if you press the button.

### Credits

Link Cleaner uses code from [Bootstrap](https://getbootstrap.com/), and QR codes are provided by [Google Charts API](https://developers.google.com/chart/infographics/docs/qr_codes). The logo is ["Link 45deg" from Boostrap Icons](https://icons.getbootstrap.com/icons/link-45deg/).
