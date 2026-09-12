// Listen for extraction request from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractText') {
    // Simple text extraction: grab all text from page
    const text = document.body.innerText;
    
    // Limit to first 5000 chars to avoid huge payloads
    const truncated = text.substring(0, 5000);
    
    sendResponse({text: truncated});
  }
});