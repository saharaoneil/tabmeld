// Get API key from config
async function getClaudeApiKey() {
  if (typeof CONFIG !== 'undefined' && CONFIG.claudeApiKey) {
    return CONFIG.claudeApiKey;
  }
  throw new Error('API key not configured in config.js');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabs') {
    extractAllTabs().then(tabs => {
      sendResponse({tabs: tabs});
    });
    return true;
  }
  
  if (request.action === 'synthesize') {
    synthesizeWithClaude(request.selectedTabs, request.mode).then(result => {
      sendResponse({result: result});
    });
    return true;
  }
});

async function extractAllTabs() {
  const tabs = await chrome.tabs.query({currentWindow: true});
  const results = [];
  
  for (const tab of tabs) {
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
      continue;
    }
    
    try {
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
    } catch (err) {
      console.log('Could not extract from ' + tab.url);
    }
  }
  
  return results;
}

function extractTextFromPage() {
  return document.body.innerText.substring(0, 5000);
}

async function synthesizeWithClaude(selectedTabs, mode) {
  const modeInstruction = 'Synthesize into a comprehensive research memo.';
  
  const tabContent = selectedTabs.map(t => '[' + t.title + ']\n' + t.text).join('\n\n---\n\n');
  
  const prompt = 'Synthesize this research into themes, quotes, and a memo:\n\n' + tabContent;

  try {
    const claudeApiKey = await getClaudeApiKey();
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'content-type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-opus-5',
        max_tokens: 4000,
        messages: [{role: 'user', content: prompt}]
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    
    const data = await response.json();
    
    // Find the text block (skip thinking blocks)
    const textBlock = data.content.find(block => block.type === 'text');
    
    if (!textBlock || !textBlock.text) {
      throw new Error('No text response from Claude');
    }
    
    const fullText = textBlock.text;
    console.log('Claude memo:', fullText);
    
    return {
      themes: 'Detected from research',
      quotes: 'Key points extracted',
      memo: fullText,
      success: true
    };
  } catch (err) {
    console.error('API Error:', err);
    return {
      success: false,
      error: err.message
    };
  }
}