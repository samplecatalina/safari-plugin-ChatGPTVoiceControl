// ==UserScript==
// @name         Voice Control for ChatGPT (Final)
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Simple, working voice control for ChatGPT on iPad Safari
// @author       You
// @match        https://chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';
    
    // AGGRESSIVE duplicate prevention
    const UNIQUE_ID = 'VOICE_CONTROL_FINAL_LOADED_' + Date.now();
    if (window[UNIQUE_ID] || document.querySelector('#final-voice-control')) {
        console.log('🎤 Voice Control already exists, aborting...');
        return;
    }
    window[UNIQUE_ID] = true;
    
    function log(msg) {
        console.log(`🎤 [Final] ${msg}`);
    }
    
    log("Starting FINAL Voice Control...");
    
    // iOS-optimized text insertion
    function insertTextIOS(textarea, text) {
        log(`Inserting: "${text}"`);
        
        if (!textarea) {
            alert(`Voice captured: "${text}"\n\nPlease paste manually.`);
            return;
        }
        
        try {
            // Method 1: Simple value assignment (works best on iOS)
            const originalValue = textarea.value;
            textarea.value = text;
            
            // Minimal event triggering - just input event
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            
            log("✅ Text inserted successfully");
            
            // Visual feedback
            textarea.style.backgroundColor = '#d4edda';
            setTimeout(() => {
                textarea.style.backgroundColor = '';
            }, 1000);
            
            return true;
            
        } catch (e) {
            log(`Insertion failed: ${e.message}`);
            alert(`Voice captured: "${text}"\n\nAutomatic insertion failed. Please paste manually.`);
            return false;
        }
    }
    
    // Find textarea with retries
    function findTextarea() {
        const selectors = ['textarea', 'textarea[placeholder*="Message"]'];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                log(`Found textarea: ${selector}`);
                return element;
            }
        }
        return null;
    }
    
    // Simple voice recognition
    class SimpleVoiceControl {
        constructor(textarea) {
            this.textarea = textarea;
            this.isRecording = false;
            this.recognition = null;
            
            if (!window.webkitSpeechRecognition) {
                alert('Speech recognition not supported on this device.');
                return;
            }
            
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false; // Simple one-shot recording
            this.recognition.interimResults = false; // Only final results
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                log("Recording started");
                this.isRecording = true;
                this.updateButton();
            };
            
            this.recognition.onresult = (event) => {
                if (event.results.length > 0) {
                    const transcript = event.results[0][0].transcript.trim();
                    log(`Transcript: "${transcript}"`);
                    
                    if (transcript) {
                        insertTextIOS(this.textarea, transcript);
                    }
                }
            };
            
            this.recognition.onerror = (event) => {
                log(`Error: ${event.error}`);
                
                let message = 'Voice recognition error.';
                if (event.error === 'not-allowed') {
                    message = 'Microphone permission denied. Please allow microphone access in Safari settings.';
                } else if (event.error === 'no-speech') {
                    message = 'No speech detected. Please try speaking louder.';
                }
                
                alert(message);
                this.isRecording = false;
                this.updateButton();
            };
            
            this.recognition.onend = () => {
                log("Recording ended");
                this.isRecording = false;
                this.updateButton();
            };
        }
        
        toggleRecording() {
            if (!this.recognition) return;
            
            if (this.isRecording) {
                this.recognition.stop();
            } else {
                try {
                    this.recognition.start();
                } catch (e) {
                    alert('Failed to start recording. Please try again.');
                    log(`Start error: ${e.message}`);
                }
            }
        }
        
        updateButton() {
            const button = document.getElementById('final-voice-btn');
            if (button) {
                if (this.isRecording) {
                    button.textContent = '🔴 Stop';
                    button.style.backgroundColor = '#dc3545';
                } else {
                    button.textContent = '🎤 Record';
                    button.style.backgroundColor = '#007bff';
                }
            }
        }
    }
    
    // Create simple UI
    function createSimpleUI(textarea, voiceControl) {
        // Remove any existing voice control UI
        document.querySelectorAll('[id*="voice"], [id*="sai-"], [id*="ultimate"]').forEach(el => {
            if (el.id !== 'final-voice-control') {
                el.remove();
            }
        });
        
        const container = document.createElement('div');
        container.id = 'final-voice-control';
        container.style.cssText = `
            display: flex !important;
            gap: 10px !important;
            margin: 10px 0 !important;
            padding: 15px !important;
            background: #f8f9fa !important;
            border: 2px solid #007bff !important;
            border-radius: 8px !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            z-index: 9999 !important;
        `;
        
        // Simple voice button
        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'final-voice-btn';
        voiceBtn.textContent = '🎤 Record';
        voiceBtn.style.cssText = `
            background: #007bff !important;
            color: white !important;
            border: none !important;
            padding: 12px 20px !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            font-size: 16px !important;
            font-weight: 600 !important;
        `;
        
        // iOS-specific click handling
        voiceBtn.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent iOS keyboard on first touch
        });
        
        voiceBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Ensure textarea is focused first (iOS requirement)
            textarea.focus();
            
            // Small delay for iOS focus to register
            setTimeout(() => {
                voiceControl.toggleRecording();
            }, 100);
        });
        
        // Simple test button
        const testBtn = document.createElement('button');
        testBtn.textContent = '🧪 Test';
        testBtn.style.cssText = `
            background: #28a745 !important;
            color: white !important;
            border: none !important;
            padding: 12px 20px !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            font-size: 16px !important;
            font-weight: 600 !important;
        `;
        
        testBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
        
        testBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            textarea.focus();
            setTimeout(() => {
                const success = insertTextIOS(textarea, "Test successful!");
                testBtn.textContent = success ? '✅ OK' : '❌ Failed';
                setTimeout(() => {
                    testBtn.textContent = '🧪 Test';
                }, 1500);
            }, 100);
        });
        
        container.appendChild(voiceBtn);
        container.appendChild(testBtn);
        
        // Insert UI
        try {
            textarea.parentElement.after(container);
            log("✅ UI created");
        } catch (e) {
            document.body.appendChild(container);
            log("✅ UI created (fallback)");
        }
    }
    
    // Initialize once
    function initialize() {
        log("Initializing...");
        
        const textarea = findTextarea();
        if (!textarea) {
            log("No textarea found, retrying...");
            setTimeout(initialize, 1000);
            return;
        }
        
        // Check if already initialized
        if (document.getElementById('final-voice-control')) {
            log("Already initialized");
            return;
        }
        
        const voiceControl = new SimpleVoiceControl(textarea);
        createSimpleUI(textarea, voiceControl);
        
        log("🎉 Initialization complete!");
        
        // Store for debugging
        window.FinalVoiceControl = { voiceControl, textarea };
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 500);
    }
    
    log("Final Voice Control script loaded");
    
})(); 