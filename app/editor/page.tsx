'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface FileType {
  name: string;
  language: string;
  content: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function EditorPage() {
  const { isLoaded, isSignedIn } = useAuth();
  
  // Load data from localStorage on mount
  const [files, setFiles] = useState<FileType[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debugify_files');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [
      { 
        name: 'untitled.js', 
        language: 'javascript', 
        content: `// Welcome to Debugify\n// Start writing your code here...\n\nfunction hello() {\n  console.log("Hello, World!");\n}\n\nhello();\n`
      }
    ];
  });

  const [selectedFileIndex, setSelectedFileIndex] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debugify_selectedFile');
      return saved ? parseInt(saved) : 0;
    }
    return 0;
  });

  const [code, setCode] = useState(files[selectedFileIndex]?.content || '');
  const [language, setLanguage] = useState(files[selectedFileIndex]?.language || 'javascript');
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debugify_chatHistory');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return [
      { role: 'assistant', content: 'Hi! I\'m your AI coding assistant powered by Google Gemini. How can I help you debug or improve your code today?' }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState('');
  const [showDiff, setShowDiff] = useState(false);

  // Resizable panel widths
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [chatWidth, setChatWidth] = useState(350);
  const [outputHeight, setOutputHeight] = useState(250);
  const [isDragging, setIsDragging] = useState<'sidebar' | 'chat' | 'output' | null>(null);

  // Editor enhancements
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debugify_fontSize');
      return saved ? parseInt(saved) : 14;
    }
    return 14;
  });
  const [minimapEnabled, setMinimapEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debugify_minimapEnabled');
      return saved ? saved === 'true' : true;
    }
    return true;
  });
  const [editorTheme, setEditorTheme] = useState<'vs-dark' | 'light' | 'hc-black'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debugify_editorTheme');
      return (saved as 'vs-dark' | 'light' | 'hc-black') || 'vs-dark';
    }
    return 'vs-dark';
  });

  // Save files to localStorage whenever they change
  useEffect(() => {
    if (isSignedIn && files.length > 0) {
      localStorage.setItem('debugify_files', JSON.stringify(files));
    }
  }, [files, isSignedIn]);

  // Save selected file index
  useEffect(() => {
    if (isSignedIn) {
      localStorage.setItem('debugify_selectedFile', selectedFileIndex.toString());
    }
  }, [selectedFileIndex, isSignedIn]);

  // Save chat history
  useEffect(() => {
    if (isSignedIn && chatMessages.length > 0) {
      localStorage.setItem('debugify_chatHistory', JSON.stringify(chatMessages));
    }
  }, [chatMessages, isSignedIn]);

  // Save editor preferences
  useEffect(() => {
    if (isSignedIn) {
      localStorage.setItem('debugify_fontSize', fontSize.toString());
    }
  }, [fontSize, isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      localStorage.setItem('debugify_minimapEnabled', minimapEnabled.toString());
    }
  }, [minimapEnabled, isSignedIn]);

  useEffect(() => {
    if (isSignedIn) {
      localStorage.setItem('debugify_editorTheme', editorTheme);
    }
  }, [editorTheme, isSignedIn]);

  // Update code state when files or selected index changes
  useEffect(() => {
    if (files[selectedFileIndex]) {
      setCode(files[selectedFileIndex].content);
      setLanguage(files[selectedFileIndex].language);
    }
  }, [selectedFileIndex, files]);

  // Handle resize dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging === 'sidebar') {
        const newWidth = Math.max(200, Math.min(500, e.clientX));
        setSidebarWidth(newWidth);
      } else if (isDragging === 'chat') {
        const newWidth = Math.max(300, Math.min(600, window.innerWidth - e.clientX));
        setChatWidth(newWidth);
      } else if (isDragging === 'output') {
        const newHeight = Math.max(150, Math.min(600, window.innerHeight - e.clientY - 60));
        setOutputHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isDragging === 'output' ? 'ns-resize' : 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          code: code,
          language: language,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response 
        }]);

        // Extract the "AFTER" code block if it exists
        const afterMatch = data.response.match(/\*\*AFTER.*?\*\*:?\s*```[\w]*\n([\s\S]*?)```/i);
        if (afterMatch && afterMatch[1]) {
          setSuggestedCode(afterMatch[1].trim());
          setShowDiff(true);
        } else {
          // Try to extract any code block from the response
          const codeMatch = data.response.match(/```[\w]*\n([\s\S]*?)```/);
          if (codeMatch && codeMatch[1] && codeMatch[1].trim() !== code.trim()) {
            setSuggestedCode(codeMatch[1].trim());
            setShowDiff(true);
          }
        }
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error. Please try again.' 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I couldn\'t connect to the AI service. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  const handleFileSelect = (index: number) => {
    // Save current file content before switching
    const updatedFiles = [...files];
    updatedFiles[selectedFileIndex].content = code;
    setFiles(updatedFiles);

    // Switch to new file
    setSelectedFileIndex(index);
    setCode(files[index].content);
    setLanguage(files[index].language);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    
    const language = getLanguageFromExtension(newFileName);
    const newFile: FileType = {
      name: newFileName,
      language: language,
      content: `// ${newFileName}\n\n`
    };
    
    setFiles([...files, newFile]);
    setNewFileName('');
    setShowNewFileDialog(false);
    
    // Select the new file
    const newIndex = files.length;
    setSelectedFileIndex(newIndex);
    setCode(newFile.content);
    setLanguage(newFile.language);
  };

  const handleDeleteFile = (index: number) => {
    if (files.length === 1) {
      alert('Cannot delete the last file!');
      return;
    }
    
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    
    // Select previous file or first file
    const newIndex = index > 0 ? index - 1 : 0;
    setSelectedFileIndex(newIndex);
    setCode(updatedFiles[newIndex].content);
    setLanguage(updatedFiles[newIndex].language);
  };

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    // Auto-save to current file
    const updatedFiles = [...files];
    updatedFiles[selectedFileIndex].content = newCode;
    setFiles(updatedFiles);
  };

  const handleRunCode = async () => {
    console.log('🚀 Run code clicked');
    
    const currentLang = files[selectedFileIndex]?.language;
    const currentCode = code; // Capture current code state
    
    console.log('📝 Language:', currentLang);
    console.log('📄 Code length:', currentCode?.length);
    
    // Prevent concurrent runs
    if (isRunning) {
      console.log('⏸️ Already running, skipping');
      return;
    }
    
    // Force state update before any async operation
    setIsRunning(true);
    setOutput('Running...');
    
    // Use a small delay to ensure state updates
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // ALWAYS show output panel first
    console.log('📺 Opening output panel');
    setShowOutput(true);

    // Safety timeout - ensure button re-enables after 30 seconds
    const timeout = setTimeout(() => {
      console.log('⏰ Timeout reached, resetting');
      setIsRunning(false);
    }, 30000);

    try {
      if (currentLang === 'javascript') {
        console.log('🟨 Executing JavaScript');
        // Run JavaScript in browser
        const logs: string[] = [];
        const originalLog = console.log;
        const originalError = console.error;

        console.log = (...args: unknown[]) => {
          logs.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
          ).join(' '));
        };

        console.error = (...args: unknown[]) => {
          logs.push('Error: ' + args.map(arg => String(arg)).join(' '));
        };

        try {
          console.log('⚡ About to eval code');
          eval(currentCode);
          console.log('✅ Code executed successfully');
          const outputText = logs.length > 0 ? logs.join('\n') : '✅ Code executed successfully (no output)';
          setOutput(outputText);
        } catch (error: unknown) {
          const err = error as Error;
          console.log('❌ JavaScript execution error:', err.message);
          console.log('🔍 Formatting error for display');
          // Format error like VS Code
          const errorLines = [];
          errorLines.push('╔══════════════════════════════════════════════════╗');
          errorLines.push('║  ❌ EXECUTION ERROR                              ║');
          errorLines.push('╚══════════════════════════════════════════════════╝\n');
          
          // Extract line number from stack trace
          const stackLines = err.stack?.split('\n') || [];
          let lineNumber = 'unknown';
          let columnNumber = 'unknown';
          
          // Try to find line number from eval stack
          const evalMatch = stackLines[0]?.match(/<anonymous>:(\d+):(\d+)/);
          if (evalMatch) {
            lineNumber = evalMatch[1];
            columnNumber = evalMatch[2];
          }
          
          errorLines.push(`📄 File: ${files[selectedFileIndex]?.name}`);
          errorLines.push(`📍 Line: ${lineNumber}, Column: ${columnNumber}\n`);
          errorLines.push(`❌ ${err.name}: ${err.message}\n`);
          
          // Show the problematic line if we have line number
          if (lineNumber !== 'unknown') {
            const codeLines = code.split('\n');
            const lineNum = parseInt(lineNumber) - 1;
            
            if (lineNum >= 0 && lineNum < codeLines.length) {
              errorLines.push('─'.repeat(60));
              // Show context (line before, error line, line after)
              if (lineNum > 0) {
                errorLines.push(`  ${lineNum}  | ${codeLines[lineNum - 1]}`);
              }
              errorLines.push(`▶ ${lineNum + 1}  | ${codeLines[lineNum]} ◀ ERROR HERE`);
              if (lineNum < codeLines.length - 1) {
                errorLines.push(`  ${lineNum + 2}  | ${codeLines[lineNum + 1]}`);
              }
              errorLines.push('─'.repeat(60) + '\n');
            }
          }
          
          // Add full stack trace
          errorLines.push('📋 Stack Trace:');
          errorLines.push(err.stack || 'No stack trace available');
          
          const finalOutput = errorLines.join('\n');
          console.log('📤 Setting error output, length:', finalOutput.length);
          setOutput(finalOutput);
          console.log('✔️ Error output set successfully');
        } finally {
          console.log = originalLog;
          console.error = originalError;
        }
      } else if (currentLang === 'python' || currentLang === 'java' || currentLang === 'cpp' || currentLang === 'c') {
        // For other languages, use Piston API (online compiler)
        const languageMap: { [key: string]: string } = {
          python: 'python',
          java: 'java',
          cpp: 'cpp',
          c: 'c',
          typescript: 'typescript',
          go: 'go',
          rust: 'rust',
          php: 'php',
          ruby: 'ruby',
        };

        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language: languageMap[currentLang] || currentLang,
            version: '*',
            files: [
              {
                name: files[selectedFileIndex]?.name,
                content: code,
              },
            ],
          }),
        });

        const data = await response.json();

        if (data.run) {
          const stdout = data.run.output || data.run.stdout || '';
          const stderr = data.run.stderr || '';
          
          if (stderr) {
            // Format compilation/runtime errors like VS Code
            const errorLines = [];
            errorLines.push('╔══════════════════════════════════════════════════╗');
            errorLines.push(`║  ❌ ${currentLang.toUpperCase()} ERROR${' '.repeat(42 - currentLang.length)}║`);
            errorLines.push('╚══════════════════════════════════════════════════╝\n');
            
            errorLines.push(`📄 File: ${files[selectedFileIndex]?.name}\n`);
            
            // Show stdout if any
            if (stdout) {
              errorLines.push('📤 Output:');
              errorLines.push(stdout);
              errorLines.push('\n');
            }
            
            errorLines.push('❌ Error Details:');
            errorLines.push('─'.repeat(60));
            errorLines.push(stderr);
            errorLines.push('─'.repeat(60));
            
            setOutput(errorLines.join('\n'));
          } else {
            // Successful execution
            const outputLines = [];
            outputLines.push('╔══════════════════════════════════════════════════╗');
            outputLines.push('║  ✅ EXECUTION SUCCESSFUL                         ║');
            outputLines.push('╚══════════════════════════════════════════════════╝\n');
            outputLines.push(`📄 File: ${files[selectedFileIndex]?.name}\n`);
            outputLines.push('📤 Output:');
            outputLines.push('─'.repeat(60));
            outputLines.push(stdout || '(no output)');
            outputLines.push('─'.repeat(60));
            
            setOutput(outputLines.join('\n'));
          }
        } else {
          setOutput('❌ Error: Could not execute code');
        }
      } else if (currentLang === 'html') {
        setOutput('ℹ️ HTML files cannot be executed directly. Use the preview feature instead.');
      } else if (currentLang === 'css') {
        setOutput('ℹ️ CSS files cannot be executed directly. They need to be used with HTML.');
      } else {
        setOutput(`ℹ️ Execution not supported for ${currentLang} files yet.`);
      }
    } catch (error: unknown) {
      // Catch any unexpected errors
      const err = error as Error;
      const errorLines = [];
      errorLines.push('╔══════════════════════════════════════════════════╗');
      errorLines.push('║  ❌ UNEXPECTED ERROR                             ║');
      errorLines.push('╚══════════════════════════════════════════════════╝\n');
      errorLines.push(`📄 File: ${files[selectedFileIndex]?.name}\n`);
      errorLines.push(`❌ ${err.name || 'Error'}: ${err.message || 'Unknown error'}\n`);
      errorLines.push('📋 Details:');
      errorLines.push(err.stack || 'No additional details available');
      setOutput(errorLines.join('\n'));
    } finally {
      // Clear timeout and always reset running state
      clearTimeout(timeout);
      setIsRunning(false);
    }
  };

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show sign in prompt if not authenticated
  if (!isSignedIn) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="mb-6">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold mb-3">
              <span className="text-[#ff6b35]">Authentication Required</span>
            </h2>
            <p className="text-gray-400 mb-6">
              Please sign in or create an account to access the code editor and start debugging with AI.
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <button className="bg-[#ff6b35] hover:bg-[#ff8c42] px-6 py-3 rounded-lg font-semibold transition-all">
                Go to Home & Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Modern Gradient Header with Glassmorphism */}
      <header className="relative bg-gradient-to-r from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] border-b border-[#ff6b35]/30 px-6 py-3 flex items-center justify-between backdrop-blur-md bg-opacity-80 shadow-lg shadow-[#ff6b35]/10">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ff6b35]/5 to-transparent animate-pulse opacity-50"></div>
        
        {/* Left Section */}
        <div className="flex items-center gap-6 relative z-10">
          <Link href="/" className="group flex items-center gap-2 transition-all">
            {/* Animated Logo with Glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-[#ff6b35] blur-lg opacity-30 group-hover:opacity-50 transition-opacity rounded-full"></div>
              <span className="relative text-2xl font-black tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] drop-shadow-lg">Debug</span>
                <span className="text-white drop-shadow-lg">ify</span>
              </span>
            </div>
            
            {/* Enhanced Beta Badge with Animation */}
            <div className="relative group/beta">
              {/* Pulsing glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-full blur opacity-30 group-hover/beta:opacity-50 animate-pulse transition-opacity"></div>
              
              {/* Badge */}
              <span className="relative px-3 py-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-full text-[10px] font-extrabold text-white uppercase tracking-widest shadow-lg shadow-[#ff6b35]/50 flex items-center gap-1.5 animate-shimmer cursor-help">
                <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                Beta
              </span>
              
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 opacity-0 invisible group-hover/beta:opacity-100 group-hover/beta:visible transition-all duration-200 z-50 pointer-events-none">
                <div className="bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-[#ff6b35]/40 rounded-lg p-3 shadow-2xl shadow-[#ff6b35]/20 backdrop-blur-sm">
                  <div className="text-xs text-gray-300 space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[#ff6b35] text-sm">🚀</span>
                      <span className="font-bold text-[#ff6b35]">Beta Version</span>
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      This is an early access version. New features are being added regularly. Your feedback helps us improve!
                    </p>
                  </div>
                  {/* Arrow */}
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e1e1e] border-l border-t border-[#ff6b35]/40 rotate-45"></div>
                </div>
              </div>
            </div>
          </Link>
          
          {/* Professional Vertical Divider */}
          <div className="relative h-10 w-px mx-2">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff6b35]/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff8c42] to-transparent animate-pulse opacity-50"></div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-gray-400 text-sm font-medium">Code Editor</span>
              <span className="text-[10px] text-gray-600 font-mono">v1.0.0-beta</span>
            </div>
            
            {/* Enhanced Status Indicators */}
            <div className="flex items-center gap-2">
              {/* AI Connection Status */}
              <div className="group/status relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/40 rounded-lg shadow-sm shadow-green-500/20 hover:shadow-md hover:shadow-green-500/30 transition-all cursor-help">
                <div className="relative">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-xs text-green-400 font-semibold">AI Ready</span>
                
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-48 opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-200 z-50 pointer-events-none">
                  <div className="bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-green-500/40 rounded-lg p-2.5 shadow-xl shadow-green-500/20 backdrop-blur-sm">
                    <div className="text-[10px] text-gray-300">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-green-400">✓</span>
                        <span className="font-semibold text-green-400">Connected to Gemini AI</span>
                      </div>
                      <p className="leading-relaxed text-gray-400">Ready to assist with debugging and code analysis</p>
                    </div>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e1e1e] border-l border-t border-green-500/40 rotate-45"></div>
                  </div>
                </div>
              </div>
              
              {/* Code Execution Status */}
              {isRunning && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-[#ff6b35]/10 to-[#ff8c42]/10 border border-[#ff6b35]/40 rounded-lg shadow-sm shadow-[#ff6b35]/20 animate-pulse">
                  <div className="relative">
                    <div className="w-2 h-2 bg-[#ff6b35] rounded-full animate-ping"></div>
                    <div className="absolute inset-0 w-2 h-2 bg-[#ff8c42] rounded-full"></div>
                  </div>
                  <span className="text-xs text-[#ff6b35] font-semibold">Executing</span>
                </div>
              )}
              
              {/* File Count Indicator */}
              <div className="group/files relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg shadow-sm hover:shadow-md hover:shadow-blue-500/20 transition-all cursor-help">
                <span className="text-xs text-blue-400 font-semibold">📁 {files.length} {files.length === 1 ? 'File' : 'Files'}</span>
                
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-40 opacity-0 invisible group-hover/files:opacity-100 group-hover/files:visible transition-all duration-200 z-50 pointer-events-none">
                  <div className="bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-blue-500/40 rounded-lg p-2.5 shadow-xl shadow-blue-500/20 backdrop-blur-sm">
                    <div className="text-[10px] text-gray-300">
                      <div className="font-semibold text-blue-400 mb-1">Open Files</div>
                      <p className="leading-relaxed text-gray-400">{files.length} file{files.length !== 1 ? 's' : ''} in workspace</p>
                    </div>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1e1e1e] border-l border-t border-blue-500/40 rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 relative z-10">
          {/* Enhanced Current File Badge */}
          <div className="group/file relative px-4 py-2.5 bg-gradient-to-br from-[#1a1a1a] via-[#1e1e1e] to-[#1a1a1a] border border-[#ff6b35]/50 rounded-xl shadow-lg shadow-[#ff6b35]/10 hover:shadow-xl hover:shadow-[#ff6b35]/20 hover:scale-[1.02] transition-all duration-300">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35]/0 via-[#ff6b35]/10 to-[#ff6b35]/0 rounded-xl opacity-0 group-hover/file:opacity-100 transition-opacity"></div>
            
            <div className="relative flex items-center gap-3">
              {/* Animated dot indicator */}
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] shadow-lg shadow-[#ff6b35]/50"></div>
                <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-[#ff6b35] animate-ping opacity-75"></div>
              </div>
              
              {/* File info */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">{files[selectedFileIndex]?.name}</span>
                <div className="h-4 w-px bg-gradient-to-b from-transparent via-gray-600 to-transparent"></div>
                <span className="text-[11px] uppercase font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] tracking-wider">
                  {files[selectedFileIndex]?.language}
                </span>
              </div>
              
              {/* File type icon */}
              <div className="flex items-center justify-center w-6 h-6 bg-[#ff6b35]/20 rounded-md border border-[#ff6b35]/30">
                <span className="text-xs">📝</span>
              </div>
            </div>
          </div>

          {/* Enhanced Storage Info Button */}
          <div className="group/storage relative">
            <button className="relative p-2.5 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#ff6b35]/40 rounded-xl hover:border-[#ff6b35]/70 transition-all hover:scale-110 hover:shadow-xl hover:shadow-[#ff6b35]/30 active:scale-95 overflow-hidden group" title="Storage Info">
              {/* Hover glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35]/0 via-[#ff6b35]/20 to-[#ff6b35]/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative text-lg filter group-hover:drop-shadow-[0_0_8px_rgba(255,107,53,0.8)] transition-all">💾</span>
            </button>
            <div className="hidden group-hover/storage:block fixed right-6 top-20 w-72 bg-gradient-to-br from-[#1e1e1e] via-[#1a1a1a] to-[#161616] border-2 border-[#ff6b35]/50 rounded-xl p-3 text-xs shadow-2xl shadow-[#ff6b35]/30 z-[9999] backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#ff6b35]/30">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-lg shadow-lg shadow-[#ff6b35]/50">
                  <span className="text-base">�</span>
                </div>
                <div>
                  <div className="font-bold text-white text-sm">Data Storage</div>
                  <div className="text-[10px] text-gray-500">Local Browser Storage</div>
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-2 text-gray-300 text-[10px]">
                <div>
                  <strong className="text-white">Stored:</strong>
                  <span className="text-gray-400"> Files, code, chat, settings</span>
                </div>
                
                <div>
                  <strong className="text-white">Keys (6):</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <code className="text-[9px] bg-[#0a0a0a]/50 px-1.5 py-0.5 rounded border border-[#ff6b35]/20 text-blue-400">files</code>
                    <code className="text-[9px] bg-[#0a0a0a]/50 px-1.5 py-0.5 rounded border border-[#ff6b35]/20 text-blue-400">selectedFile</code>
                    <code className="text-[9px] bg-[#0a0a0a]/50 px-1.5 py-0.5 rounded border border-[#ff6b35]/20 text-blue-400">chatHistory</code>
                    <code className="text-[9px] bg-[#0a0a0a]/50 px-1.5 py-0.5 rounded border border-[#ff6b35]/20 text-blue-400">fontSize</code>
                    <code className="text-[9px] bg-[#0a0a0a]/50 px-1.5 py-0.5 rounded border border-[#ff6b35]/20 text-blue-400">minimap</code>
                    <code className="text-[9px] bg-[#0a0a0a]/50 px-1.5 py-0.5 rounded border border-[#ff6b35]/20 text-blue-400">theme</code>
                  </div>
                </div>
                
                {/* Warning */}
                <div className="flex items-start gap-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded p-2 mt-2">
                  <span className="text-yellow-400 text-xs">⚠️</span>
                  <p className="text-[9px] text-yellow-300/80 leading-relaxed">
                    Data is stored locally. Clearing browser data will remove it.
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Professional Run Code Button */}
          <button 
            onClick={handleRunCode}
            disabled={isRunning}
            className="relative group/run px-7 py-3 bg-gradient-to-r from-[#ff6b35] via-[#ff7a45] to-[#ff8c42] rounded-xl font-extrabold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2.5 hover:scale-[1.08] hover:shadow-2xl hover:shadow-[#ff6b35]/60 active:scale-95 overflow-hidden border border-[#ff8c42]/50"
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/run:translate-x-full transition-transform duration-1000"></div>
            
            {/* Pulsing glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] blur-xl opacity-0 group-hover/run:opacity-50 transition-opacity"></div>
            
            <span className="relative z-10 flex items-center gap-2.5">
              {isRunning ? (
                <>
                  <span className="animate-spin text-base">⚡</span>
                  <span className="tracking-wide">Executing...</span>
                </>
              ) : (
                <>
                  <span className="text-base">▶</span>
                  <span className="tracking-wide">Run Code</span>
                </>
              )}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Explorer */}
        <aside 
          style={{ width: `${sidebarWidth}px` }}
          className="bg-[#111111] border-r border-[#ff6b35]/20 p-4 overflow-y-auto flex-shrink-0"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm uppercase text-gray-400">Files</h3>
            <button 
              onClick={() => setShowNewFileDialog(true)}
              className="text-[#ff6b35] hover:text-[#ff8c42] text-xl font-bold"
              title="New File"
            >
              +
            </button>
          </div>

          {/* Professional New File Dialog */}
          {showNewFileDialog && (
            <div className="mb-3 p-4 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-[#ff6b35]/40 rounded-xl shadow-xl shadow-[#ff6b35]/20 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="mb-2 text-xs font-semibold text-[#ff6b35] flex items-center gap-2">
                <span>📄</span>
                <span>Create New File</span>
              </div>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFile()}
                placeholder="filename.ext (e.g., app.js)"
                className="w-full bg-[#0a0a0a] border-2 border-[#ff6b35]/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#ff6b35] focus:shadow-lg focus:shadow-[#ff6b35]/20 mb-3 transition-all placeholder:text-gray-600"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFile}
                  className="flex-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#ff7a45] hover:to-[#ff9a52] px-3 py-2 rounded-lg text-xs font-bold transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-[#ff6b35]/50 active:scale-95"
                >
                  ✓ Create
                </button>
                <button
                  onClick={() => {
                    setShowNewFileDialog(false);
                    setNewFileName('');
                  }}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#252525] border border-gray-700 hover:border-gray-600 px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02]"
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className={`group flex items-center justify-between px-3 py-2 rounded text-sm transition-colors ${
                  selectedFileIndex === index
                    ? 'bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/30'
                    : 'hover:bg-[#0a0a0a] text-gray-300'
                }`}
              >
                <button
                  onClick={() => handleFileSelect(index)}
                  className="flex-1 text-left"
                >
                  <span className="mr-2">📄</span>
                  {file.name}
                </button>
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs ml-2"
                    title="Delete file"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            {/* Professional Quick Actions Header */}
            <div className="mb-4 pb-2 border-b border-[#ff6b35]/20">
              <h4 className="font-bold text-xs uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] tracking-widest flex items-center gap-2">
                <span className="text-[#ff6b35]">⚡</span>
                Quick Actions
              </h4>
            </div>
            
            {/* Professional Quick Action Buttons */}
            <div className="space-y-2">
              <button 
                onClick={() => {
                  const message = 'Find and explain any bugs or errors in this code. Provide specific line numbers and suggest fixes.';
                  setInputMessage(message);
                  handleSendMessage();
                }}
                disabled={isLoading}
                className="group/action w-full text-left px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border border-[#ff6b35]/20 hover:border-[#ff6b35]/60 hover:from-[#ff6b35]/10 hover:to-[#ff8c42]/10 text-gray-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#ff6b35]/20 hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 bg-red-500/20 rounded-lg group-hover/action:bg-red-500/30 transition-colors">
                    <span className="text-sm">🐛</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Debug Code</div>
                    <div className="text-[10px] text-gray-500 group-hover/action:text-gray-400">Find and fix bugs</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  const message = 'Analyze this code and suggest optimizations for better performance, readability, and best practices.';
                  setInputMessage(message);
                  handleSendMessage();
                }}
                disabled={isLoading}
                className="group/action w-full text-left px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border border-[#ff6b35]/20 hover:border-[#ff6b35]/60 hover:from-[#ff6b35]/10 hover:to-[#ff8c42]/10 text-gray-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#ff6b35]/20 hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 bg-yellow-500/20 rounded-lg group-hover/action:bg-yellow-500/30 transition-colors">
                    <span className="text-sm">✨</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Optimize Code</div>
                    <div className="text-[10px] text-gray-500 group-hover/action:text-gray-400">Improve performance</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  const message = 'Review this code and suggest refactoring improvements. Focus on code structure, naming conventions, and maintainability.';
                  setInputMessage(message);
                  handleSendMessage();
                }}
                disabled={isLoading}
                className="group/action w-full text-left px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border border-[#ff6b35]/20 hover:border-[#ff6b35]/60 hover:from-[#ff6b35]/10 hover:to-[#ff8c42]/10 text-gray-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#ff6b35]/20 hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 bg-blue-500/20 rounded-lg group-hover/action:bg-blue-500/30 transition-colors">
                    <span className="text-sm">📝</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Refactor Code</div>
                    <div className="text-[10px] text-gray-500 group-hover/action:text-gray-400">Improve structure</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  const message = 'Explain what this code does line by line in simple terms. Help me understand the logic and flow.';
                  setInputMessage(message);
                  handleSendMessage();
                }}
                disabled={isLoading}
                className="group/action w-full text-left px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border border-[#ff6b35]/20 hover:border-[#ff6b35]/60 hover:from-[#ff6b35]/10 hover:to-[#ff8c42]/10 text-gray-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#ff6b35]/20 hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 bg-green-500/20 rounded-lg group-hover/action:bg-green-500/30 transition-colors">
                    <span className="text-sm">📖</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Explain Code</div>
                    <div className="text-[10px] text-gray-500 group-hover/action:text-gray-400">Understand logic</div>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  const message = 'Review this code for security vulnerabilities and potential issues. Suggest secure coding practices.';
                  setInputMessage(message);
                  handleSendMessage();
                }}
                disabled={isLoading}
                className="group/action w-full text-left px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#1a1a1a] to-[#0a0a0a] border border-[#ff6b35]/20 hover:border-[#ff6b35]/60 hover:from-[#ff6b35]/10 hover:to-[#ff8c42]/10 text-gray-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#ff6b35]/20 hover:scale-[1.02] active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 bg-purple-500/20 rounded-lg group-hover/action:bg-purple-500/30 transition-colors">
                    <span className="text-sm">🔒</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Security Review</div>
                    <div className="text-[10px] text-gray-500 group-hover/action:text-gray-400">Find vulnerabilities</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Professional Sidebar Resize Handle */}
        <div
          className="group/divider relative w-2 cursor-ew-resize flex-shrink-0 transition-all"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging('sidebar');
          }}
          title="Drag to resize sidebar"
        >
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35]/10 via-[#ff6b35]/30 to-[#ff6b35]/10"></div>
          
          {/* Hover effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35] via-[#ff8c42] to-[#ff6b35] opacity-0 group-hover/divider:opacity-100 transition-opacity duration-300"></div>
          
          {/* Active glow */}
          <div className="absolute inset-0 bg-[#ff8c42] opacity-0 group-active/divider:opacity-100 shadow-[0_0_20px_rgba(255,107,53,0.8)]"></div>
          
          {/* Center line indicator */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-white/40 to-transparent opacity-0 group-hover/divider:opacity-100 transition-opacity"></div>
        </div>

        {/* Code Editor */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Breadcrumb Navigation */}
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#1e1e1e] px-4 py-2 border-b border-[#ff6b35]/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="hover:text-[#ff6b35] cursor-pointer transition-colors">📁 Debugify</span>
              <span className="text-gray-600">/</span>
              <span className="hover:text-[#ff6b35] cursor-pointer transition-colors">Files</span>
              <span className="text-gray-600">/</span>
              <span className="text-[#ff6b35] font-semibold">{files[selectedFileIndex]?.name}</span>
              <div className="ml-2 px-2 py-0.5 bg-[#ff6b35]/20 border border-[#ff6b35]/30 rounded text-[10px] font-bold text-[#ff6b35] uppercase">
                {files[selectedFileIndex]?.language}
              </div>
            </div>

            {/* Editor Controls */}
            <div className="flex items-center gap-2">
              {/* Font Size Controls */}
              <div className="flex items-center gap-1 bg-[#0a0a0a]/50 border border-[#ff6b35]/20 rounded-lg px-2 py-1">
                <button
                  onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                  className="text-gray-400 hover:text-[#ff6b35] transition-colors px-1.5 py-0.5 rounded hover:bg-[#ff6b35]/10"
                  title="Decrease font size"
                >
                  A-
                </button>
                <span className="text-xs text-gray-500 px-1">{fontSize}px</span>
                <button
                  onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                  className="text-gray-400 hover:text-[#ff6b35] transition-colors px-1.5 py-0.5 rounded hover:bg-[#ff6b35]/10"
                  title="Increase font size"
                >
                  A+
                </button>
              </div>

              {/* Minimap Toggle */}
              <button
                onClick={() => setMinimapEnabled(!minimapEnabled)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  minimapEnabled
                    ? 'bg-[#ff6b35] text-white shadow-lg shadow-[#ff6b35]/30'
                    : 'bg-[#0a0a0a]/50 border border-[#ff6b35]/20 text-gray-400 hover:text-[#ff6b35]'
                }`}
                title="Toggle minimap"
              >
                🗺️ Map
              </button>

              {/* Theme Selector */}
              <select
                value={editorTheme}
                onChange={(e) => setEditorTheme(e.target.value as 'vs-dark' | 'light' | 'hc-black')}
                className="bg-[#0a0a0a]/50 border border-[#ff6b35]/20 text-gray-400 text-xs rounded-lg px-2 py-1 hover:border-[#ff6b35]/40 focus:outline-none focus:border-[#ff6b35] transition-all cursor-pointer"
                title="Editor theme"
              >
                <option value="vs-dark">🌙 Dark</option>
                <option value="light">☀️ Light</option>
                <option value="hc-black">🎯 High Contrast</option>
              </select>
            </div>
          </div>

          {/* Tab Bar for Open Files */}
          <div className="bg-[#0a0a0a] border-b border-[#ff6b35]/20 flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-[#ff6b35]/30">
            {files.map((file, index) => (
              <div
                key={index}
                onClick={() => handleFileSelect(index)}
                className={`group relative flex items-center gap-2 px-4 py-2 border-r border-[#ff6b35]/10 cursor-pointer transition-all min-w-[120px] ${
                  selectedFileIndex === index
                    ? 'bg-[#1a1a1a] text-white border-t-2 border-t-[#ff6b35]'
                    : 'text-gray-400 hover:bg-[#1a1a1a]/50 hover:text-gray-200'
                }`}
              >
                <span className="text-xs truncate">{file.name}</span>
                {selectedFileIndex === index && (
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42]"></div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(index);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-xs"
                  title="Close file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Diff View Banner */}
          {showDiff && (
            <div className="bg-gradient-to-r from-[#ff6b35]/10 to-[#ff8c42]/10 border-b border-[#ff6b35]/30 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-[#ff6b35]">Diff View Active</span>
                </div>
                <span className="text-xs text-gray-400">Compare your code with AI suggestions</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCode(suggestedCode);
                    setShowDiff(false);
                    const updatedFiles = [...files];
                    updatedFiles[selectedFileIndex].content = suggestedCode;
                    setFiles(updatedFiles);
                  }}
                  className="px-3 py-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white text-xs font-semibold rounded-lg hover:scale-105 transition-all shadow-lg shadow-[#ff6b35]/30"
                >
                  ✓ Apply Fix
                </button>
                <button
                  onClick={() => {
                    setShowDiff(false);
                    setSuggestedCode('');
                  }}
                  className="px-3 py-1 bg-gray-700 text-white text-xs font-semibold rounded-lg hover:bg-gray-600 transition-all"
                >
                  ✕ Dismiss
                </button>
              </div>
            </div>
          )}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div 
              className="flex-1 overflow-hidden"
              style={{ height: showOutput ? `calc(100% - ${outputHeight}px)` : '100%' }}
            >
              {showDiff ? (
                <div className="h-full flex">
                  {/* Original Code - Left Side */}
                  <div className="w-1/2 border-r border-[#ff6b35]/30 flex flex-col">
                    <div className="bg-[#1e1e1e] px-3 py-1 border-b border-[#ff6b35]/20">
                      <span className="text-xs text-red-400">❌ BEFORE (Your Code)</span>
                    </div>
                    <MonacoEditor
                      height="100%"
                      language={files[selectedFileIndex]?.language || 'plaintext'}
                      value={code}
                      onChange={handleCodeChange}
                      theme={editorTheme}
                      options={{
                        fontSize: fontSize,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        readOnly: false,
                      }}
                    />
                  </div>
                  {/* Fixed Code - Right Side */}
                  <div className="w-1/2 flex flex-col">
                    <div className="bg-[#1e1e1e] px-3 py-1 border-b border-[#ff6b35]/20">
                      <span className="text-xs text-green-400">✅ AFTER (AI Suggested Fix)</span>
                    </div>
                    <MonacoEditor
                      height="100%"
                      language={files[selectedFileIndex]?.language || 'plaintext'}
                      value={suggestedCode}
                      onChange={(value) => setSuggestedCode(value || '')}
                      theme={editorTheme}
                      options={{
                        fontSize: fontSize,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        wordWrap: 'on',
                        readOnly: false,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <MonacoEditor
                  height="100%"
                  language={files[selectedFileIndex]?.language || 'plaintext'}
                  value={code}
                  onChange={handleCodeChange}
                  theme={editorTheme}
                  options={{
                    fontSize: fontSize,
                    minimap: { enabled: minimapEnabled },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                  }}
                />
              )}
            </div>
            
            {/* Output Panel - VS Code Style Terminal */}
            {showOutput && (
              <>
                {/* Professional Output Resize Handle */}
                <div
                  className="group/output-divider relative h-2 cursor-ns-resize flex-shrink-0 transition-all"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setIsDragging('output');
                  }}
                  title="Drag to resize output panel"
                >
                  {/* Base gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#ff6b35]/10 via-[#ff6b35]/30 to-[#ff6b35]/10"></div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#ff6b35] via-[#ff8c42] to-[#ff6b35] opacity-0 group-hover/output-divider:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Active glow */}
                  <div className="absolute inset-0 bg-[#ff8c42] opacity-0 group-active/output-divider:opacity-100 shadow-[0_0_20px_rgba(255,107,53,0.8)]"></div>
                  
                  {/* Center line indicator */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover/output-divider:opacity-100 transition-opacity"></div>
                </div>
                <div 
                  style={{ height: `${outputHeight}px` }}
                  className="bg-[#1e1e1e] border-t-2 border-[#ff6b35] flex flex-col flex-shrink-0"
                >
                <div className="bg-[#252526] px-4 py-2 border-b border-[#3e3e42] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-300 font-semibold">▼ TERMINAL</span>
                    <span className="text-xs text-gray-500">|</span>
                    <span className="text-xs text-gray-400">{files[selectedFileIndex]?.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="text-xs text-gray-400 hover:text-[#ff6b35] transition-colors disabled:opacity-50"
                      title="Re-run"
                    >
                      ↻ Re-run
                    </button>
                    <button
                      onClick={() => {
                        setShowOutput(false);
                        setOutput('');
                      }}
                      className="text-xs text-gray-400 hover:text-[#ff6b35] transition-colors"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-[#1e1e1e]">
                  <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap leading-relaxed">{output || 'Running...'}</pre>
                </div>
                </div>
              </>
            )}
          </div>
        </main>

        {/* Professional Chat Resize Handle */}
        <div
          className="group/chat-divider relative w-2 cursor-ew-resize flex-shrink-0 transition-all"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsDragging('chat');
          }}
          title="Drag to resize chat panel"
        >
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35]/10 via-[#ff6b35]/30 to-[#ff6b35]/10"></div>
          
          {/* Hover effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff6b35] via-[#ff8c42] to-[#ff6b35] opacity-0 group-hover/chat-divider:opacity-100 transition-opacity duration-300"></div>
          
          {/* Active glow */}
          <div className="absolute inset-0 bg-[#ff8c42] opacity-0 group-active/chat-divider:opacity-100 shadow-[0_0_20px_rgba(255,107,53,0.8)]"></div>
          
          {/* Center line indicator */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-white/40 to-transparent opacity-0 group-hover/chat-divider:opacity-100 transition-opacity"></div>
        </div>

        {/* AI Chat Panel */}
        <aside 
          style={{ width: `${chatWidth}px` }}
          className="bg-[#111111] border-l border-[#ff6b35]/20 flex flex-col flex-shrink-0"
        >
          <div className="px-4 py-3 border-b border-[#ff6b35]/20">
            <h3 className="font-semibold flex items-center gap-2">
              <span className="text-[#ff6b35]">🤖</span>
              AI Assistant
            </h3>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`${
                  msg.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block max-w-[85%] p-3 rounded-lg text-sm whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-[#ff6b35] text-white'
                      : 'bg-[#0a0a0a] border border-[#ff6b35]/30 text-gray-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="text-left">
                <div className="inline-block p-3 rounded-lg text-sm bg-[#0a0a0a] border border-[#ff6b35]/30 text-gray-200">
                  <span className="animate-pulse">🤔🤔🤔...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#ff6b35]/20">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
                placeholder="Ask about your code..."
                disabled={isLoading}
                className="flex-1 bg-[#0a0a0a] border border-[#ff6b35]/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#ff6b35] disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-[#ff6b35] hover:bg-[#ff8c42] px-4 py-2 rounded text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
            <div className="mt-2 flex gap-2">
              <button 
                onClick={() => setInputMessage('Find any bugs in this code')}
                disabled={isLoading}
                className="text-xs bg-[#0a0a0a] hover:bg-[#ff6b35]/10 border border-[#ff6b35]/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                Find bugs
              </button>
              <button 
                onClick={() => setInputMessage('Explain what this code does')}
                disabled={isLoading}
                className="text-xs bg-[#0a0a0a] hover:bg-[#ff6b35]/10 border border-[#ff6b35]/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                Explain code
              </button>
              <button 
                onClick={() => setInputMessage('How can I optimize this code?')}
                disabled={isLoading}
                className="text-xs bg-[#0a0a0a] hover:bg-[#ff6b35]/10 border border-[#ff6b35]/30 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                Optimize
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
