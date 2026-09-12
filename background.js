// Get API key from config
async function getClaudeApiKey() {
  try {
    const response = await fetch(chrome.runtime.getURL('config.js'));
    const text = await response.text();
    
    // Extract the API key using regex
    const match = text.match(/claudeApiKey:\s*['"]([^'"]+)['"]/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (err) {
    console.error('Failed to load config:', err);
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
  
  console.log('Found ' + tabs.length + ' total tabs');
  
  for (const tab of tabs) {
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:') || tab.url.startsWith('edge://')) {
      console.log('Skipping system tab: ' + tab.url);
      continue;
    }
    
    try {
      console.log('Extracting from tab ' + tab.id + ': ' + tab.title);
      
      // Inject content script and extract text
      const injectionResults = await chrome.scripting.executeScript({
        target: {tabId: tab.id, allFrames: true},
        files: ['content-script.js']
      });
      
      // Now send message to the injected script
      const response = await chrome.tabs.sendMessage(tab.id, {action: 'extractText'});
      
      if (!response || !response.text) {
        console.warn('No text in response from tab ' + tab.id);
        continue;
      }
      
      const text = response.text;
      console.log('Successfully extracted ' + text.length + ' chars from ' + tab.title);
      
      results.push({
        id: tab.id,
        url: tab.url,
        title: tab.title,
        text: text
      });
    } catch (err) {
      console.error('Error extracting from tab ' + tab.id + ' (' + tab.url + '): ' + err.message);
    }
  }
  
  console.log('Total tabs extracted: ' + results.length);
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
        max_tokens: 8000,
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
    
    // Parse themes section - capture all lines that start with ### Theme
    let themes = '';
    const themeLines = fullText.match(/^###\s+Theme\s+\d+.*$/gm);
    if (themeLines && themeLines.length > 0) {
      themes = themeLines.slice(0, 5).join('\n\n'); // Show first 5 themes
    }
    
    // Extract all block quotes as key quotes
    let quotes = '';
    const quoteMatches = fullText.match(/^>\s+(.+?)(?=\n(?:[^>]|$))/gm);
    if (quoteMatches && quoteMatches.length > 0) {
      quotes = quoteMatches.map(q => q.replace(/^>\s+/, '')).join('\n\n');
    }
    
    return {
      themes: themes || 'Themes detected in synthesis',
      quotes: quotes || 'Key quotes extracted from synthesis',
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