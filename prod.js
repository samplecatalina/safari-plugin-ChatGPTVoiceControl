// ==UserScript==
// @name         Voice Control for ChatGPT (Ultimate)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Ultimate voice control for ChatGPT - All issues fixed
// @author       You
// @match        https://chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';
    
    // Prevent multiple instances
    if (window.VoiceControlLoaded) {
        console.log('🎤 Voice Control already loaded, skipping...');
        return;
    }
    window.VoiceControlLoaded = true;
    
    // Debug logging
    function log(msg, data = '') {
        console.log(`🎤 [Voice Control ULTIMATE] ${msg}`, data);
    }
    
    function error(msg, err = '') {
        console.error(`❌ [Voice Control ULTIMATE] ${msg}`, err);
    }
    
    log("🚀 ULTIMATE Voice Control starting...");
    
    // Ultimate text insertion function - SAFE MODE
    function ultimateTextInsertion(element, text) {
        log(`💥 SAFE text insertion: "${text}"`);
        
        if (!element) {
            error("No element provided");
            return false;
        }
        
        // Always use direct insertion to avoid triggering send actions
        return ultimateDirectInsertion(element, text, 'append');
    }
    
    // Direct value manipulation with React compatibility
    function ultimateDirectInsertion(element, text, mode = 'append') {
        log(`🔧 Using robust direct value manipulation (mode: ${mode})...`);

        try {
            const isContentEditable = element.isContentEditable || element.getAttribute('contenteditable') === 'true';

            let newText;
            if (mode === 'append') {
                const existingText = isContentEditable ? (element.innerText || '') : (element.value || '');
                const textToAppend = existingText.trim() ? ' ' + text : text;
                newText = existingText + textToAppend;
            } else { // mode === 'replace'
                newText = text;
            }

            // Set the value based on the element's actual type
            if (isContentEditable) {
                element.innerText = newText;
            } else if ('value' in element) {
                const prototype = Object.getPrototypeOf(element);
                const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
                if (nativeInputValueSetter) {
                    nativeInputValueSetter.call(element, newText);
                } else {
                    element.value = newText; // Fallback
                }
            } else {
                 element.textContent = newText;
            }

            // Dispatch the final input event
            element.dispatchEvent(new Event("input", { bubbles: true }));

            log("✅ Direct insertion completed");
            return true;
            
        } catch (e) {
            error(`Direct insertion failed (mode: ${mode}):`, e);
            return false;
        }
    }
    
    // Enhanced element detection with retry
    function isVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        if (style.visibility === 'hidden' || style.display === 'none') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && el.offsetParent !== null;
    }

    function findChatGPTElements(retryCount = 0) {
        // Prefer the official prompt textarea first
        const preferredSelectors = [
            'textarea[data-testid="prompt-textarea"]',
            'form textarea[data-testid="prompt-textarea"]'
        ];
        
        for (const selector of preferredSelectors) {
            const el = document.querySelector(selector);
            if (el && isVisible(el)) {
                log(`✅ Found preferred textarea with: ${selector}`);
                return { textarea: el };
            }
        }

        // Fallback selectors (keep original list but ensure visibility)
        const fallbackSelectors = [
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="message"]',
            'form textarea',
            'textarea',
            '[contenteditable="true"]'
        ];
        
        for (const selector of fallbackSelectors) {
            try {
                const candidates = Array.from(document.querySelectorAll(selector));
                const visible = candidates.find(isVisible);
                if (visible) {
                    log(`✅ Found visible element with: ${selector}`);
                    return { textarea: visible };
                }
            } catch (e) {
                error(`Selector failed: ${selector}`, e);
            }
        }
        
        if (retryCount < 5) {
            log(`No visible textarea found, retry ${retryCount + 1}/5 in 1 second...`);
            setTimeout(() => findChatGPTElements(retryCount + 1), 1000);
            return null;
        }
        
        error("❌ No visible textarea found after 5 retries");
        return null;
    }
    
    // Ultimate Voice Recognition with extensive error handling
    class UltimateVoiceControl {
        constructor(textarea) {
            this.textarea = textarea;
            this.isRecording = false;
            this.recognition = null;
            this.initialText = '';
            this.sessionTranscript = '';
            this.autoRestart = false;
            this.recordingTimeout = null;
            this.maxRecordingTime = 240000; // 4 minutes
            
            log("🎙️ Initializing ULTIMATE voice recognition...");
            
            if (!window.webkitSpeechRecognition) {
                error("❌ webkitSpeechRecognition not available");
                alert('❌ Speech recognition not supported. Please use a supported browser.');
                return;
            }
            
            this.recognition = new webkitSpeechRecognition();
            
            // Optimal settings for reliability
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;
            this.recognition.lang = 'en-US';
            
            log("Voice recognition configured:", {
                continuous: this.recognition.continuous,
                interimResults: this.recognition.interimResults,
                lang: this.recognition.lang
            });
            
            this.setupEventHandlers();
        }
        
        setupEventHandlers() {
            this.recognition.onstart = () => {
                log("🎙️ Voice recognition STARTED");
                this.isRecording = true;
                this.updateUI();
                
                // Reset and set maximum recording time
                this.clearTimeout();
                this.recordingTimeout = setTimeout(() => {
                    log("⏰ Recording timeout reached, stopping...");
                    this.stopRecording();
                }, this.maxRecordingTime);
            };
            
            this.recognition.onspeechstart = () => {
                log("🗣️ Speech detected!");
            };
            
            this.recognition.onsoundstart = () => {
                log("🔊 Sound detected!");
            };
            
            this.recognition.onaudiostart = () => {
                log("🎵 Audio input started!");
            };
            
            this.recognition.onresult = (event) => {
                log("📝 Voice result received");

                let interimTranscript = '';
                let finalTranscriptSinceLastResult = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    const transcript = result[0].transcript;

                    if (result.isFinal) {
                        finalTranscriptSinceLastResult += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscriptSinceLastResult) {
                    this.sessionTranscript += (this.sessionTranscript.trim() ? ' ' : '') + finalTranscriptSinceLastResult.trim();
                }

                const fullText = (this.initialText.trim() ? this.initialText.trim() + ' ' : '') +
                                 this.sessionTranscript.trim() +
                                 (interimTranscript.trim() ? ' ' + interimTranscript.trim() : '');

                this.updateTextarea(fullText);
            };
            
            this.recognition.onerror = (event) => {
                error("Voice recognition error:", {
                    error: event.error,
                    message: event.message || 'No message'
                });
                
                let alertMessage = `❌ Voice error: ${event.error}`;
                
                switch (event.error) {
                    case 'not-allowed':
                        alertMessage = '❌ Microphone permission denied.\n\nPlease:\n1. Allow microphone in Safari settings\n2. Refresh the page\n3. Try again';
                        break;
                    case 'no-speech':
                        alertMessage = '❌ No speech detected.\n\nPlease:\n1. Speak louder\n2. Check microphone\n3. Reduce background noise';
                        break;
                    case 'audio-capture':
                        alertMessage = '❌ No microphone found.\n\nPlease:\n1. Connect a microphone\n2. Check device settings\n3. Refresh the page';
                        break;
                    case 'network':
                        alertMessage = '❌ Network error.\n\nPlease:\n1. Check internet connection\n2. Try again';
                        break;
                    case 'aborted':
                        log("Recognition aborted (normal for stop button)");
                        return; // Don't show alert for intentional stops
                }
                
                if (event.error !== 'aborted') {
                    alert(alertMessage);
                }
                
                this.isRecording = false;
                this.updateUI();
                this.clearTimeout();
            };
            
            this.recognition.onend = () => {
                log("🛑 Voice recognition ENDED");

                if (this.autoRestart) {
                    // This was an unexpected stop, so restart it
                    log("🎤 Recognition stopped unexpectedly, auto-restarting...");
                    try {
                        // A brief delay can help in some browsers
                        setTimeout(() => this.recognition.start(), 100);
                    } catch (e) {
                        error("Failed to auto-restart recognition:", e);
                        this.autoRestart = false; // Stop trying if it fails
                        this.isRecording = false;
                        this.updateUI();
                    }
                } else {
                    // This was a user-initiated stop
                    this.isRecording = false;
                    this.updateUI();
                    this.clearTimeout();
                    if (this.sessionTranscript) {
                        log("Session completed. Final transcript:", this.sessionTranscript);
                    } else {
                        log("⚠️ Session ended with no transcript captured");
                    }
                }
            };
            
            this.recognition.onnomatch = () => {
                log("⚠️ No speech match found");
            };
            
            this.recognition.onspeechend = () => {
                log("🔇 Speech ended");
            };
        }
        
        clearTimeout() {
            if (this.recordingTimeout) {
                clearTimeout(this.recordingTimeout);
                this.recordingTimeout = null;
            }
        }
        
        updateTextarea(text) {
            if (!this.textarea) {
                error("No textarea available for updating.");
                return;
            }
            // Always replace the content during a voice session
            ultimateDirectInsertion(this.textarea, text, 'replace');
        }

        insertText(text) {
            log(`🔤 Inserting text: "${text}"`);
            
            if (!this.textarea) {
                error("No textarea available");
                alert(`Transcript captured: "${text}"\n\nPlease manually copy this to ChatGPT.`);
                return;
            }
            
            const success = ultimateDirectInsertion(this.textarea, text, 'append');
            
            if (success) {
                log("✅ Text insertion successful");
                
                // Visual feedback
                this.textarea.style.border = '4px solid #00ff00';
                this.textarea.style.boxShadow = '0 0 20px #00ff00';
                
                setTimeout(() => {
                    this.textarea.style.border = '';
                    this.textarea.style.boxShadow = '';
                }, 2000);
                
                // Verify insertion after delay
                setTimeout(() => {
                    const isContentEditable = this.textarea.isContentEditable || this.textarea.getAttribute('contenteditable') === 'true';
                    const currentText = isContentEditable ? this.textarea.innerText : this.textarea.value;
                    if (currentText && currentText.includes(text)) {
                        log("✅ Text confirmed in textarea");
                    } else {
                        error("❌ Text not found after insertion");
                        alert(`Text insertion may have failed.\n\nTranscript: "${text}"\n\nPlease manually copy if needed.`);
                    }
                }, 500);
                
            } else {
                error("❌ All insertion methods failed");
                alert(`Voice transcript: "${text}"\n\nAutomatic insertion failed. Please manually copy this text to ChatGPT.`);
            }
        }
        
        startRecording() {
            log("🔴 Start recording requested");
            
            if (!this.recognition) {
                alert("❌ Speech recognition not available");
                return;
            }
            
            if (this.isRecording) {
                log("🛑 Stopping current recording");
                this.stopRecording();
                return;
            }
            
            try {
                log("🎙️ Starting voice recognition...");
                const isContentEditable = this.textarea.isContentEditable || this.textarea.getAttribute('contenteditable') === 'true';
                this.initialText = isContentEditable ? this.textarea.innerText : this.textarea.value;
                this.sessionTranscript = '';
                this.autoRestart = true;
                this.recognition.start();
            } catch (e) {
                error("Failed to start recording:", e);
                this.autoRestart = false;
                alert(`❌ Failed to start recording: ${e.message}\n\nPlease refresh the page and try again.`);
            }
        }
        
        stopRecording() {
            if (this.recognition && this.isRecording) {
                this.autoRestart = false;
                this.recognition.stop();
                this.clearTimeout();
            }
        }
        
        updateUI() {
            const button = document.getElementById('ultimate-voice-btn');
            if (button) {
                if (this.isRecording) {
                    button.textContent = '🔴 Recording... (Click to Stop)';
                    button.style.backgroundColor = '#ff0000';
                    button.style.animation = 'pulse 1s infinite';
                } else {
                    button.textContent = '🎤 Start Recording';
                    button.style.backgroundColor = '#007bff';
                    button.style.animation = 'none';
                }
            }
        }
    }
    
    // Create Ultimate UI
    function createUltimateUI(textarea, voiceControl) {
        // Remove any existing UI
        document.querySelectorAll('[id*="voice-control"], [id*="ultimate-voice"]').forEach(el => el.remove());
        
        // Add animations
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes pulse {
                0% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.05); }
                100% { opacity: 1; transform: scale(1); }
            }
            .ultimate-voice-ui {
                position: relative !important;
                z-index: 999999 !important;
            }
        `;
        document.head.appendChild(style);
        
        const container = document.createElement('div');
        container.id = 'ultimate-voice-ui';
        container.className = 'ultimate-voice-ui';
        container.style.cssText = `
            display: flex !important;
            gap: 10px !important;
            margin-bottom: 10px !important;
            padding: 15px !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            border-radius: 12px !important;
            border: 2px solid #007bff !important;
            box-shadow: 0 6px 20px rgba(0,123,255,0.25) !important;
            z-index: 999999 !important;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
        `;
        
        // Ultimate voice button
        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'ultimate-voice-btn';
        voiceBtn.textContent = '🎤 Start Recording';
        voiceBtn.style.cssText = `
            background: #007bff !important;
            color: white !important;
            border: none !important;
            padding: 15px 20px !important;
            border-radius: 10px !important;
            cursor: pointer !important;
            font-weight: bold !important;
            font-size: 16px !important;
            flex: 1 !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 15px rgba(0,123,255,0.3) !important;
        `;
        
        voiceBtn.onclick = () => {
            log("🎤 Ultimate voice button clicked");
            voiceControl.startRecording();
        };
        
        // Ultimate test button
        const testBtn = document.createElement('button');
        testBtn.textContent = '⚡ Ultimate Test';
        testBtn.style.cssText = `
            background: #28a745 !important;
            color: white !important;
            border: none !important;
            padding: 15px 20px !important;
            border-radius: 10px !important;
            cursor: pointer !important;
            font-weight: bold !important;
            font-size: 16px !important;
            box-shadow: 0 4px 15px rgba(40,167,69,0.3) !important;
        `;
        
        testBtn.onclick = () => {
            log("⚡ Ultimate test button clicked");
            
            // Wait for DOM to be ready
            setTimeout(() => {
                const success = ultimateTextInsertion(textarea, "🚀 APPEND TEST!");
                if (success) {
                    testBtn.textContent = '✅ Appended!';
                    setTimeout(() => {
                        testBtn.textContent = '⚡ Ultimate Test';
                    }, 2000);
                } else {
                    testBtn.textContent = '❌ Failed';
                    setTimeout(() => {
                        testBtn.textContent = '⚡ Ultimate Test';
                    }, 2000);
                }
            }, 100);
        };
        
        container.appendChild(voiceBtn);
        container.appendChild(testBtn);
        
        // Insert the UI container above the main chat form or textarea
        try {
            const form = textarea.closest('form');
            if (form) {
                form.before(container);
                log("✅ UI inserted before form");
            } else {
                // Fallback: insert before the textarea's direct parent
                textarea.parentElement.before(container);
                log("✅ UI inserted before textarea parent");
            }
        } catch (e) {
            error("Failed to insert UI intelligently, falling back to body", e);
            document.body.appendChild(container);
            log("✅ UI inserted in body as fallback");
        }
        
        return true;
    }
    
    // Ultimate initialization
    let initializationInProgress = false;
    
    function ultimateInit() {
        if (initializationInProgress) {
            log("⏳ Initialization already in progress, skipping...");
            return;
        }
        
        initializationInProgress = true;
        log("🚀 ULTIMATE initialization starting...");
        
        try {
            const elements = findChatGPTElements();
            if (!elements) {
                log("⏳ Elements not ready, will retry...");
                return;
            }
            
            const { textarea } = elements;
            log("✅ Textarea found, creating voice control...");
            
            const voiceControl = new UltimateVoiceControl(textarea);
            
            log("✅ Creating ultimate UI...");
            const uiSuccess = createUltimateUI(textarea, voiceControl);
            
            if (uiSuccess) {
                log("🎉 ULTIMATE Voice Control initialized successfully!");
                
                // Store reference globally for debugging
                window.UltimateVoiceControl = {
                    voiceControl,
                    textarea,
                    insertText: (text) => ultimateTextInsertion(textarea, text)
                };
                
                log("🔧 Debug: window.UltimateVoiceControl available");
            }
            
        } catch (e) {
            error("❌ Ultimate initialization failed:", e);
            initializationInProgress = false;
            setTimeout(ultimateInit, 2000);
        }
        
        initializationInProgress = false;
    }
    
    // Start ultimate initialization with safety checks
    log("🔧 Setting up ultimate initialization...");
    
    // Multiple initialization strategies
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ultimateInit);
        log("📅 Scheduled for DOMContentLoaded");
    } else {
        // Document already loaded
        setTimeout(ultimateInit, 1000);
        log("⚡ Immediate initialization in 1 second");
    }
    
    // Fallback initialization
    setTimeout(ultimateInit, 3000);
    log("🔄 Fallback initialization in 3 seconds");
    
    // Monitor for page changes (ChatGPT SPA)
    let reinitTimeout;
    const observer = new MutationObserver(() => {
        if (!document.getElementById('ultimate-voice-ui')) {
            clearTimeout(reinitTimeout);
            reinitTimeout = setTimeout(() => {
                log("🔄 UI disappeared, reinitializing...");
                ultimateInit();
            }, 1000);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    log("🎉 ULTIMATE Voice Control script loaded!");
    
})(); 