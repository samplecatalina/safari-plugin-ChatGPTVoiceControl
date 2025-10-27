// ==UserScript==
// @name         Voice Control for ChatGPT & Gemini (Ultimate Bilingual)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Ultimate voice control for ChatGPT and Google Gemini - Bilingual support
// @author       samplecatalina
// @match        https://chatgpt.com/*
// @match        https://gemini.google.com/*
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
    
    // Platform detection
    function detectPlatform() {
        const hostname = window.location.hostname;
        if (hostname.includes('chatgpt.com')) {
            return 'chatgpt';
        } else if (hostname.includes('gemini.google.com')) {
            return 'gemini';
        }
        return 'unknown';
    }
    
    const currentPlatform = detectPlatform();
    log(`🌐 Detected platform: ${currentPlatform}`);
    
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
        let preferredSelectors = [];
        let fallbackSelectors = [];
        
        // Platform-specific selectors
        if (currentPlatform === 'chatgpt') {
            // ChatGPT-specific selectors
            preferredSelectors = [
                'textarea[data-testid="prompt-textarea"]',
                'form textarea[data-testid="prompt-textarea"]'
            ];
            
            fallbackSelectors = [
                'textarea[placeholder*="Message"]',
                'textarea[placeholder*="message"]',
                'form textarea',
                'textarea',
                '[contenteditable="true"]'
            ];
        } else if (currentPlatform === 'gemini') {
            // Gemini-specific selectors
            preferredSelectors = [
                'rich-textarea[data-test-id="text-input"]',
                'rich-textarea .ql-editor',
                'div.ql-editor[contenteditable="true"]',
                '[data-test-id="text-input"] .ql-editor'
            ];
            
            fallbackSelectors = [
                '.ql-editor[contenteditable="true"]',
                '[contenteditable="true"][role="textbox"]',
                'rich-textarea [contenteditable="true"]',
                '[contenteditable="true"]',
                'textarea'
            ];
        } else {
            // Generic selectors for unknown platforms
            preferredSelectors = [
                'textarea',
                '[contenteditable="true"]'
            ];
        }
        
        // Try preferred selectors first
        for (const selector of preferredSelectors) {
            try {
                const el = document.querySelector(selector);
                if (el && isVisible(el)) {
                    log(`✅ Found preferred textarea with: ${selector}`);
                    return { textarea: el };
                }
            } catch (e) {
                error(`Preferred selector failed: ${selector}`, e);
            }
        }

        // Fallback selectors
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
            this.currentLanguage = this.getStoredLanguage(); // Load saved language preference
            
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
            this.recognition.lang = this.currentLanguage;
            
            log("Voice recognition configured:", {
                continuous: this.recognition.continuous,
                interimResults: this.recognition.interimResults,
                lang: this.recognition.lang,
                currentLanguage: this.currentLanguage
            });
            
            this.setupEventHandlers();
        }
        
        // Language management methods
        getStoredLanguage() {
            try {
                return localStorage.getItem('voiceControlLanguage') || 'en-US';
            } catch (e) {
                log("Could not access localStorage, defaulting to en-US");
                return 'en-US';
            }
        }
        
        setLanguage(language) {
            log(`🌍 Switching language to: ${language}`);
            this.currentLanguage = language;
            this.recognition.lang = language;
            
            try {
                localStorage.setItem('voiceControlLanguage', language);
            } catch (e) {
                log("Could not save language to localStorage");
            }
            
            // Update all UI elements to reflect new language
            this.updateLanguageUI();
            this.updateUI(); // Update recording button text
            this.updateTestButtonText(); // Update test button text
        }
        
        updateTestButtonText() {
            const testBtn = document.getElementById('ultimate-test-btn');
            if (testBtn) {
                const labels = this.getLocalizedLabels();
                testBtn.textContent = labels.testButton;
            }
        }
        
        clearTextarea() {
            log("🧹 Clearing textarea for new recording session");
            
            if (!this.textarea) {
                error("No textarea available for clearing");
                return false;
            }
            
            try {
                const isContentEditable = this.textarea.isContentEditable || this.textarea.getAttribute('contenteditable') === 'true';
                
                // Clear the content based on the element's actual type
                if (isContentEditable) {
                    this.textarea.innerText = '';
                } else if ('value' in this.textarea) {
                    const prototype = Object.getPrototypeOf(this.textarea);
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;
                    if (nativeInputValueSetter) {
                        nativeInputValueSetter.call(this.textarea, '');
                    } else {
                        this.textarea.value = ''; // Fallback
                    }
                } else {
                    this.textarea.textContent = '';
                }
                
                // Dispatch input event to notify React/frameworks of the change
                this.textarea.dispatchEvent(new Event("input", { bubbles: true }));
                
                log("✅ Textarea cleared successfully");
                return true;
                
            } catch (e) {
                error("Failed to clear textarea:", e);
                return false;
            }
        }
        
        updateLanguageUI() {
            const languageBtn = document.getElementById('ultimate-language-btn');
            if (languageBtn) {
                const languageNames = {
                    'en-US': '🇺🇸 English',
                    'zh-CN': '🇨🇳 中文'
                };
                languageBtn.textContent = languageNames[this.currentLanguage] || '🌍 Language';
            }
        }
        
        getLocalizedErrorMessages() {
            if (this.currentLanguage === 'zh-CN') {
                return {
                    notAllowed: '❌ 麦克风权限被拒绝。\n\n请：\n1. 在浏览器设置中允许麦克风权限\n2. 刷新页面\n3. 重试',
                    noSpeech: '❌ 未检测到语音。\n\n请：\n1. 说话声音大一些\n2. 检查麦克风\n3. 减少背景噪音',
                    audioCapture: '❌ 未找到麦克风。\n\n请：\n1. 连接麦克风\n2. 检查设备设置\n3. 刷新页面',
                    network: '❌ 网络错误。\n\n请：\n1. 检查网络连接\n2. 重试'
                };
            } else {
                return {
                    notAllowed: '❌ Microphone permission denied.\n\nPlease:\n1. Allow microphone in browser settings\n2. Refresh the page\n3. Try again',
                    noSpeech: '❌ No speech detected.\n\nPlease:\n1. Speak louder\n2. Check microphone\n3. Reduce background noise',
                    audioCapture: '❌ No microphone found.\n\nPlease:\n1. Connect a microphone\n2. Check device settings\n3. Refresh the page',
                    network: '❌ Network error.\n\nPlease:\n1. Check internet connection\n2. Try again'
                };
            }
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
                
                // Get localized error messages
                const errorMessages = this.getLocalizedErrorMessages();
                
                switch (event.error) {
                    case 'not-allowed':
                        alertMessage = errorMessages.notAllowed;
                        break;
                    case 'no-speech':
                        alertMessage = errorMessages.noSpeech;
                        break;
                    case 'audio-capture':
                        alertMessage = errorMessages.audioCapture;
                        break;
                    case 'network':
                        alertMessage = errorMessages.network;
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
                
                // Clear the textarea for a fresh start
                const clearSuccess = this.clearTextarea();
                
                // Provide visual feedback for clearing
                if (clearSuccess) {
                    this.textarea.style.border = '3px solid #ff9500';
                    this.textarea.style.boxShadow = '0 0 15px #ff9500';
                    setTimeout(() => {
                        this.textarea.style.border = '';
                        this.textarea.style.boxShadow = '';
                    }, 1000);
                    
                    // Show notification that input was cleared
                    const labels = this.getLocalizedLabels();
                    this.showNotification(labels.inputCleared, '#ff9500');
                }
                
                // Reset initial text since we just cleared it
                this.initialText = '';
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
                const labels = this.getLocalizedLabels();
                if (this.isRecording) {
                    button.textContent = labels.recording;
                    button.style.backgroundColor = '#ff0000';
                    button.style.animation = 'pulse 1s infinite';
                } else {
                    button.textContent = labels.startRecording;
                    button.style.backgroundColor = '#007bff';
                    button.style.animation = 'none';
                }
            }
        }
        
        getLocalizedLabels() {
            if (this.currentLanguage === 'zh-CN') {
                return {
                    startRecording: '🎤 开始录音',
                    recording: '🔴 录音中... (点击停止)',
                    testButton: '⚡ 测试',
                    inputCleared: '🧹 输入框已清空，准备录音'
                };
            } else {
                return {
                    startRecording: '🎤 Start Recording',
                    recording: '🔴 Recording... (Click to Stop)',
                    testButton: '⚡ Ultimate Test',
                    inputCleared: '🧹 Input cleared, ready to record'
                };
            }
        }
        
        showNotification(message, color = '#6f42c1') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed !important;
                top: 20px !important;
                right: 20px !important;
                background: ${color} !important;
                color: white !important;
                padding: 15px 20px !important;
                border-radius: 10px !important;
                z-index: 1000000 !important;
                font-weight: bold !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
                animation: slideIn 0.3s ease-out !important;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 2000);
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
            @keyframes slideIn {
                0% { opacity: 0; transform: translateX(100%); }
                100% { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOut {
                0% { opacity: 1; transform: translateX(0); }
                100% { opacity: 0; transform: translateX(100%); }
            }
            .ultimate-voice-ui {
                position: relative !important;
                z-index: 999999 !important;
            }
        `;
        document.head.appendChild(style);
        
        // Get platform display name and color
        const platformInfo = {
            'chatgpt': { name: 'ChatGPT', color: '#10a37f' },
            'gemini': { name: 'Gemini', color: '#8e8ea0' },
            'unknown': { name: 'Unknown', color: '#667eea' }
        };
        
        const platform = platformInfo[currentPlatform] || platformInfo['unknown'];
        
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
            border: 2px solid ${platform.color} !important;
            box-shadow: 0 6px 20px rgba(0,123,255,0.25) !important;
            z-index: 999999 !important;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
            position: relative !important;
        `;
        
        // Add platform indicator badge
        const platformBadge = document.createElement('div');
        platformBadge.style.cssText = `
            position: absolute !important;
            top: -10px !important;
            left: 10px !important;
            background: ${platform.color} !important;
            color: white !important;
            padding: 4px 12px !important;
            border-radius: 12px !important;
            font-size: 11px !important;
            font-weight: bold !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
            z-index: 1 !important;
        `;
        platformBadge.textContent = `🎯 ${platform.name}`;
        container.appendChild(platformBadge);
        
        // Ultimate voice button
        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'ultimate-voice-btn';
        const labels = voiceControl.getLocalizedLabels();
        voiceBtn.textContent = labels.startRecording;
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
        testBtn.id = 'ultimate-test-btn';
        testBtn.textContent = labels.testButton;
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
                const testText = voiceControl.currentLanguage === 'zh-CN' ? "🚀 测试文本!" : "🚀 APPEND TEST!";
                const success = ultimateTextInsertion(textarea, testText);
                const successText = voiceControl.currentLanguage === 'zh-CN' ? '✅ 成功!' : '✅ Appended!';
                const failText = voiceControl.currentLanguage === 'zh-CN' ? '❌ 失败' : '❌ Failed';
                
                if (success) {
                    testBtn.textContent = successText;
                    setTimeout(() => {
                        testBtn.textContent = labels.testButton;
                    }, 2000);
                } else {
                    testBtn.textContent = failText;
                    setTimeout(() => {
                        testBtn.textContent = labels.testButton;
                    }, 2000);
                }
            }, 100);
        };
        
        // Language selector button
        const languageBtn = document.createElement('button');
        languageBtn.id = 'ultimate-language-btn';
        const languageNames = {
            'en-US': '🇺🇸 English',
            'zh-CN': '🇨🇳 中文'
        };
        languageBtn.textContent = languageNames[voiceControl.currentLanguage] || '🌍 Language';
        languageBtn.style.cssText = `
            background: #6f42c1 !important;
            color: white !important;
            border: none !important;
            padding: 15px 20px !important;
            border-radius: 10px !important;
            cursor: pointer !important;
            font-weight: bold !important;
            font-size: 16px !important;
            box-shadow: 0 4px 15px rgba(111,66,193,0.3) !important;
            transition: all 0.3s ease !important;
        `;
        
        languageBtn.onclick = () => {
            log("🌍 Language button clicked");
            
            // Toggle between English and Chinese
            const newLanguage = voiceControl.currentLanguage === 'en-US' ? 'zh-CN' : 'en-US';
            voiceControl.setLanguage(newLanguage);
            
            // Visual feedback
            languageBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                languageBtn.style.transform = 'scale(1)';
            }, 150);
            
            // Show language switch notification
            const switchMessage = newLanguage === 'zh-CN' ? 
                `🌍 语言已切换至 ${languageNames[newLanguage]}` : 
                `🌍 Language switched to ${languageNames[newLanguage]}`;
            voiceControl.showNotification(switchMessage, '#6f42c1');
        };

        container.appendChild(testBtn);
        container.appendChild(languageBtn);
        container.appendChild(voiceBtn);
        
        // Insert the UI container above the main chat form or textarea
        try {
            if (currentPlatform === 'gemini') {
                // For Gemini, try to find the input container
                const richTextarea = textarea.closest('rich-textarea');
                const inputContainer = richTextarea || textarea.closest('.input-area-container') || textarea.parentElement;
                
                if (inputContainer) {
                    inputContainer.before(container);
                    log("✅ UI inserted before Gemini input container");
                } else {
                    textarea.parentElement.before(container);
                    log("✅ UI inserted before Gemini textarea parent");
                }
            } else {
                // ChatGPT and other platforms
                const form = textarea.closest('form');
                if (form) {
                    form.before(container);
                    log("✅ UI inserted before form");
                } else {
                    // Fallback: insert before the textarea's direct parent
                    textarea.parentElement.before(container);
                    log("✅ UI inserted before textarea parent");
                }
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