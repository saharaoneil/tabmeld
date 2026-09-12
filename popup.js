let allTabs = [];

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({action: 'getTabs'}, (response) => {
    if (response && response.tabs) {
      allTabs = response.tabs;
      displayTabs(allTabs);
    }
  });
});

function displayTabs(tabs) {
  const tabList = document.getElementById('tab-list');
  const status = document.getElementById('status');
  
  if (tabs.length === 0) {
    status.textContent = 'No valid tabs found';
    return;
  }
  
  status.textContent = tabs.length + ' tabs extracted';
  tabList.innerHTML = '';
  
  tabs.forEach((tab, index) => {
    const tabDiv = document.createElement('div');
    tabDiv.className = 'tab-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = index;
    checkbox.checked = true;
    
    const title = document.createElement('div');
    title.className = 'tab-title';
    title.textContent = tab.title.substring(0, 60) + '...';
    
    const preview = document.createElement('div');
    preview.className = 'tab-text';
    preview.textContent = tab.text.substring(0, 100) + '...';
    
    tabDiv.appendChild(checkbox);
    tabDiv.appendChild(title);
    tabDiv.appendChild(preview);
    
    tabList.appendChild(tabDiv);
  });
}

document.getElementById('synthesize-btn').addEventListener('click', () => {
  const checkboxes = document.querySelectorAll('#tab-list input[type="checkbox"]:checked');
  const selectedIndices = Array.from(checkboxes).map(cb => parseInt(cb.value));
  const selectedTabs = selectedIndices.map(i => allTabs[i]);
  
  if (selectedTabs.length === 0) {
    alert('Please select at least one tab');
    return;
  }
  
  const mode = document.getElementById('mode-select').value;
  
  document.getElementById('synthesize-btn').disabled = true;
  document.getElementById('synthesize-btn').textContent = 'Synthesizing...';
  
  chrome.runtime.sendMessage({
    action: 'synthesize',
    selectedTabs: selectedTabs,
    mode: mode
  }, (response) => {
    document.getElementById('synthesize-btn').disabled = false;
    document.getElementById('synthesize-btn').textContent = 'Synthesize Selected Tabs';
    
    if (response.result.success) {
      displayResult(response.result);
    } else {
      alert('Error: ' + response.result.error);
    }
  });
});

function displayResult(result) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';
  
  if (result.themes) {
    const themesDiv = document.createElement('div');
    themesDiv.className = 'result-section';
    themesDiv.innerHTML = '<div class="result-title">Detected Themes</div><div class="result-content">' + result.themes + '</div>';
    resultDiv.appendChild(themesDiv);
  }
  
  if (result.quotes) {
    const quotesDiv = document.createElement('div');
    quotesDiv.className = 'result-section';
    quotesDiv.innerHTML = '<div class="result-title">Key Quotes</div><div class="result-content">' + result.quotes + '</div>';
    resultDiv.appendChild(quotesDiv);
  }
  
  if (result.memo) {
    const memoDiv = document.createElement('div');
    memoDiv.className = 'result-section';
    memoDiv.innerHTML = '<div class="result-title">Full Memo</div><div class="result-content">' + result.memo + '</div>';
    resultDiv.appendChild(memoDiv);
  }
  
  resultDiv.style.display = 'block';
}