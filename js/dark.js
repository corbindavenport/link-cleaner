// This code is required because Bootstrap doesn't support automatic light and dark themes

function applyTheme() {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'light');
    }
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    applyTheme();
})

applyTheme();