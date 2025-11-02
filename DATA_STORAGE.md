# 💾 Debugify Data Storage Guide

## Where Your Data is Stored

Your code, files, and chat history in Debugify are stored **locally in your browser** using **localStorage**. This means:

✅ **Your data stays on your computer**
✅ **No data is sent to external servers** (except AI chat requests)
✅ **Fast access and instant loading**
✅ **Works offline for editing** (AI requires internet)

---

## Storage Keys Used

Debugify uses six localStorage keys to save your work and preferences:

### 1. `debugify_files`
**Stores:** All your code files with their content
```javascript
// Example structure:
[
  {
    name: "app.js",
    language: "javascript",
    content: "console.log('Hello World');"
  },
  {
    name: "style.css",
    language: "css",
    content: "body { margin: 0; }"
  }
]
```

### 2. `debugify_selectedFile`
**Stores:** The index of the currently selected file
```javascript
// Example: "0" means first file is selected
```

### 3. `debugify_chatHistory`
**Stores:** Your entire conversation with the AI assistant
```javascript
// Example structure:
[
  {
    role: "assistant",
    content: "Hi! How can I help you?"
  },
  {
    role: "user",
    content: "Debug this code..."
  }
]
```

### 4. `debugify_fontSize`
**Stores:** User's preferred editor font size (10-24px)
```javascript
// Example: "14" (default), "16", "18", etc.
```

### 5. `debugify_minimapEnabled`
**Stores:** Whether the code minimap is shown
```javascript
// Example: "true" or "false"
```

### 6. `debugify_editorTheme`
**Stores:** User's preferred editor color theme
```javascript
// Example: "vs-dark", "light", or "hc-black"
```

---

## How to View Your Stored Data

### Chrome / Edge
1. Press `F12` to open DevTools
2. Go to **Application** tab
3. In left sidebar: **Storage** → **Local Storage**
4. Click on your site URL
5. Look for keys: `debugify_files`, `debugify_selectedFile`, `debugify_chatHistory`, `debugify_fontSize`, `debugify_minimapEnabled`, `debugify_editorTheme`

### Firefox
1. Press `F12` to open DevTools
2. Go to **Storage** tab
3. Expand **Local Storage**
4. Click on your site URL
5. Find the debugify keys (all 6 keys)

### Safari
1. Press `Cmd + Option + C` to open Web Inspector
2. Go to **Storage** tab
3. Select **Local Storage**
4. View the stored data (all 6 keys)

---

## Auto-Save Features

### ✅ Files Auto-Save When:
- You type in the code editor (every keystroke)
- You create a new file
- You delete a file
- You switch between files

### ✅ Chat History Auto-Saves When:
- You send a message
- AI responds
- New conversation starts

### ✅ File Selection Auto-Saves When:
- You click on a different file
- You create/delete files

---

## Data Persistence Rules

### ✅ Data PERSISTS When:
- You close the browser tab
- You close the entire browser
- You turn off your computer
- You refresh the page
- You navigate away and come back

### ⚠️ Data is LOST When:
- You clear browser data/cache
- You clear localStorage specifically
- You use browser's "Clear browsing data" feature
- You uninstall the browser (in most cases)
- You use incognito/private browsing (data deleted after session)

---

## Storage Limits

### Browser localStorage Limits:
- **Chrome/Edge:** ~10 MB per domain
- **Firefox:** ~10 MB per domain
- **Safari:** ~5 MB per domain

### Debugify Usage:
- **Small projects:** ~50-100 KB
- **Medium projects:** ~500 KB - 1 MB
- **Large projects:** ~2-5 MB
- **With chat history:** +500 KB - 2 MB

You can store **hundreds of files** before reaching any limits!

---

## Backup Your Work

Since data is stored locally, here's how to backup:

### Method 1: Export Files Manually
Copy your code from the editor and save to your computer as regular files.

### Method 2: Browser Export (Advanced)
1. Open DevTools → Application/Storage
2. Copy localStorage data
3. Save to a JSON file
4. Import later by pasting back

### Method 3: Use Version Control
Copy your code to a GitHub repository for permanent backup.

---

## Privacy & Security

### ✅ What's Private:
- All your code files (never uploaded)
- Your chat history with AI (only requests sent, not stored on server)
- File names and structure (local only)

### 🌐 What's Sent to Servers:
- **AI Chat Requests:** Your code + question → Google Gemini API
- **Code Execution:** Code → Piston API (for non-JavaScript languages)
- **Authentication:** Login info → Clerk service

### 🔒 Security Notes:
- localStorage is accessible only by Debugify website
- Other websites cannot read your data
- Data is not encrypted in localStorage (don't store passwords!)
- AI requests are sent over HTTPS (encrypted in transit)

---

## Multi-Device Sync

### ❌ Currently NOT Supported:
Debugify uses localStorage, which is **device-specific**. Your data on one computer won't sync to another.

### 🔮 Future Features:
We may add cloud sync in the future, allowing you to:
- Access your projects from any device
- Share projects with team members
- Automatic cloud backups

---

## Troubleshooting

### Problem: My files disappeared!
**Possible causes:**
- Browser data was cleared
- Using incognito/private mode
- Different browser/device
- Browser extension interfering with localStorage

**Solution:**
Check DevTools → Application → Local Storage to verify data exists.

### Problem: Changes not saving
**Possible causes:**
- localStorage is full (very rare)
- Browser privacy settings blocking localStorage
- Browser extension interference

**Solution:**
1. Check browser console for errors (F12)
2. Try clearing old localStorage data
3. Disable browser extensions temporarily

### Problem: Code not loading
**Possible causes:**
- Corrupted localStorage data
- JavaScript error preventing load

**Solution:**
1. Open DevTools console
2. Clear debugify keys: `localStorage.removeItem('debugify_files')`
3. Refresh page

---

## Developer Information

### For Developers Who Want to Access Data:

```javascript
// Get all files
const files = JSON.parse(localStorage.getItem('debugify_files') || '[]');

// Get selected file index
const selectedIndex = parseInt(localStorage.getItem('debugify_selectedFile') || '0');

// Get chat history
const chatHistory = JSON.parse(localStorage.getItem('debugify_chatHistory') || '[]');

// Clear all Debugify data
localStorage.removeItem('debugify_files');
localStorage.removeItem('debugify_selectedFile');
localStorage.removeItem('debugify_chatHistory');
```

---

## Summary

📍 **Location:** Browser localStorage (local to your computer)  
💾 **What's Saved:** Code files, selected file, chat history  
🔄 **Auto-Save:** Yes, on every change  
🔒 **Privacy:** Data stays local, only AI requests sent to server  
⚠️ **Backup:** Manual (copy code) or use version control  
🌐 **Sync:** Not available (single-device only)  

**Tip:** Hover over the 💾 icon in the editor header to see storage info!
