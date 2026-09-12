// On load, get all tabs and display them
document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({action: 'getTabs'}, (response) => {
    if (response && response.tabs) {
      displayTabs(response.tabs);
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
  
  status.textContent = `${tabs.length} tabs extracted`;
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

// Button click handler
document.getElementById('extract-btn').addEventListener('click', () => {
  alert('Next: synthesis coming soon!');
});
