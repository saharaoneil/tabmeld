# TabMeld

A Chrome extension that synthesizes multiple research tabs into structured insights using Claude AI. Extract key themes, quotes, and actionable memos from your open browser tabs in seconds.

## Features

- **One-Click Tab Synthesis** — Automatically extract text from all open tabs and synthesize them into themes, quotes, and a comprehensive memo
- **Multiple Synthesis Modes:**
  - 📋 **Research Memo** — Comprehensive research synthesis with key findings
  - 🎯 **Competitive Analysis** — Market landscape and strategic positioning
  - 💼 **Meeting Prep** — Talking points, decisions, and action items
- **Fast & Efficient** — Uses Claude Opus for high-quality synthesis
- **Privacy-First** — No data stored; text is extracted locally and sent directly to Claude API
- **Selective Synthesis** — Choose which tabs to include, deselect irrelevant ones before synthesizing

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked** and select the `tabmeld` folder
5. The extension icon will appear in your Chrome toolbar

## Setup

### Get Your API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and generate an API key
3. Copy your API key

### Add Your API Key to the Extension

1. Open `config.js` in the extension folder
2. Replace `'your-api-key-here'` with your actual API key:
   ```javascript
   const CONFIG = {
     claudeApiKey: 'sk-ant-your-key-here'
   };
   ```
3. Save the file
4. Reload the extension in Chrome (go to `chrome://extensions/` and click the refresh icon)

## Usage

1. Open multiple research tabs in Chrome
2. Click the **TabMeld** extension icon in your toolbar
3. The extension will automatically load and extract text from all open tabs
4. **Select synthesis mode** from the dropdown (Research Memo, Competitive Analysis, or Meeting Prep)
5. **Choose which tabs to include** by checking/unchecking them
6. Click **Synthesize Selected Tabs**
7. Claude will generate:
   - **Detected Themes** — Key themes and concepts identified across your tabs
   - **Key Quotes** — Direct verbatim quotes from source materials
   - **Full Memo** — Complete synthesis with structure and analysis

## How It Works

1. **Tab Extraction** — Content script extracts up to 5000 characters from each tab's text
2. **Claude Synthesis** — Sends combined text to Claude Opus API
3. **Structured Output** — Claude generates themes, quotes, and a comprehensive memo in your chosen format
4. **Display** — Results shown in the popup for immediate review

## Privacy & Security

- **No data is stored** — Text is extracted, sent to Claude, and then discarded
- **API key stored locally** — Your Anthropic API key stays in `config.js` (which is in `.gitignore`)
- **No tracking** — This extension does not track users or collect analytics
- **HTTPS only** — All API calls use encrypted HTTPS connections

## Requirements

- Chrome browser (Manifest V3 compatible)
- Anthropic API account with active API key
- Sufficient API credits for Claude calls

## Troubleshooting

**"No valid tabs found"**
- Make sure you have open tabs with actual content (not blank pages or system tabs)
- System tabs (chrome://, about:, edge://) are automatically excluded

**API errors**
- Verify your API key is correct in `config.js`
- Check that you have remaining API credits
- Ensure you have internet connectivity

**Synthesis is slow**
- This is normal for Opus — can take 10-30 seconds depending on tab content
- Larger amounts of text take longer to process

## Configuration

Edit `config.js` to customize:

```javascript
const CONFIG = {
  claudeApiKey: 'your-key-here'  // Your Anthropic API key
};
```

## Development

The extension uses:
- **Chrome APIs** — tabs, scripting, storage, runtime messaging
- **Anthropic Claude API** — for synthesis and analysis
- **Manifest V3** — modern Chrome extension standard

### File Structure

```
tabmeld/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content-script.js      # Content script for text extraction
├── popup.html            # UI for the popup
├── popup.js              # Popup logic and event handlers
├── popup.css             # Popup styling
├── config.js             # API key configuration (local only)
├── icons/                # Extension icons
└── README.md             # This file
```

## Future Features

- [ ] Model selection (Haiku for speed, Sonnet for balance, Opus for quality)
- [ ] Save/export synthesis results
- [ ] Custom prompt templates
- [ ] Tab grouping and tagging
- [ ] Local result history
- [ ] Keyboard shortcuts

## License

MIT

## Support

For issues or feature requests, please open an issue on the repository.
