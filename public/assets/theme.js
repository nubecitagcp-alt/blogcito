try {
  const preference = localStorage.getItem('diogo-theme');
  if (preference === 'dark' || preference === 'light') {
    document.documentElement.dataset.theme = preference;
  }
} catch {
  // The default theme follows the system when saved preferences are unavailable.
}
