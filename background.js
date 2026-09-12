chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabs') {
    extractAllTabs().then(tabs => {
      sendResponse({tabs: tabs});
    });
    return true;
  }
});

async function extractAllTabs() {
  const tabs = await chrome.tabs.query({currentWindow: true});
  const results = [];
  
  for (const tab of tabs) {
    // Skip chrome:// and about: pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
      console.log('Skipping:', tab.url);
      continue;
    }
    
    try {
      // Use executeScript to extract text directly
      const injectionResults = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        function: extractTextFromPage
      });
      
      const text = injectionResults[0].result;
      
      results.push({
        id: tab.id,
        url: tab.url,
        title: tab.title,
        text: text
      });
      
      console.log('Extracted from:', tab.title);
    } catch (err) {
      console.log(`Could not extract from ${tab.url}:`, err.message);
    }
  }
  
  console.log('Total tabs extracted:', results.length);
  return results;
}

// Function to extract text (runs in tab context)
function extractTextFromPage() {
  return document.body.innerText.substring(0, 5000);
}