document.getElementById('test-btn').addEventListener('click', () => {
  alert('✓ TabMeld is working!');
});

// Show tab count on load
chrome.tabs.query({currentWindow: true}, (tabs) => {
  document.getElementById('status').textContent = `${tabs.length} tabs open`;
});