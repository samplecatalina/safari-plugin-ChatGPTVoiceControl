// ==UserScript==
// @name         Voice Control for ChatGPT
// @name:zh-CN   Voice Control for ChatGPT
// @namespace    http://tampermonkey.net/
// @version      0.1.5
// @description  Expands ChatGPT with voice control and read aloud. fork from https://chrome.google.com/webstore/detail/eollffkcakegifhacjnlnegohfdlidhn
// @description:zh-cn 扩展 ChatGPT，支持语音输入和回答朗读。
// @author       You
// @match        https://chatgpt.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        none
// @run-at       document-idle
// ==/UserScript==
 
(function () {
    'use strict';
   
    // Your code here...
    const style = document.createElement("style");
    style.innerHTML = `
   
  #sai-root {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }
   
  #sai-input-wrapper {
    position: relative;
    cursor: pointer;
    background-color: #e02d2d;
    animation-name: red-pulsating-color;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    max-width: 75%;
  }
   
  #sai-input-wrapper:hover {
    opacity: 0.7;
  }
   
  #sai-input-wrapper div.w-full {
    padding-right: 35px;
  }
   
  #sai-input-wrapper div {
    display: block;
    min-height: 24px;
    color: #fff;
  }
   
  #sai-input-wrapper.is-idle {
    background-color: #9a8e81;
    animation: none;
  }
   
  /*.light #sai-input-wrapper.is-idle {
    background-color: #7f7a89;
  }*/
   
  #sai-input-wrapper.is-idle #sai-speech-button {
    right: 50%;
    margin-right: -13px;
    width: 24px;
    height: 24px;
    top: 4px;
  }
   
  #sai-input-wrapper.is-idle #sai-speech-button svg {
    width: 24px;
    height: 24px;
  }
   
  #sai-speech-button {
    position: absolute;
    top: 10px;
    right: 12px;
    width: 18px;
    transition: 0.5s;
    right: 10px;
    user-select: none;
  }
   
  #sai-speech-button svg {
    width: 18px;
    height: 18px;
  }
   
  #sai-input-wrapper.is-idle #sai-cancel-msg {
    visibility: hidden;
    opacity: 0;
  }
   
  #sai-button-wrapper {
    display: flex;
    justify-content: space-between;
    flex: 1;
    padding: 10px 15px;
    background: #eeeeee;
    margin-left: 15px;
    border-radius: 5px;
    z-index: 10;
  }
   
  .dark #sai-button-wrapper {
    background: #eeeeee4a;
  }
   
  #sai-cancel-msg {
    font-size: 8px;
    color: #fff;
    position: absolute;
    bottom: -7px;
    right: 12px;
    transition: 0.2s;
    user-select: none;
    visibility: visible;
    opacity: 1;
  }
   
  #sai-speech-button path {
    fill: #fff;
  }
   
  #sai-lang-selector-wrapper {
    display: flex;
    align-items: center;
  }
   
  #sai-no-voices {
    font-size: 12px;
    cursor: pointer;
    min-width: 75px;
    text-decoration: underline;
    color: #1abc9c;
  }
   
  #sai-no-voices:hover {
    opacity: 0.5;
  }
   
  #sai-lang-selector {
    font-size: 12px;
    height: 25px;
    padding: 0 10px;
    user-select: none;
    height: 30px;
  }
   
  #sai-lang-selector.sai-hide {
    display: none;
  }
   
  .dark #sai-lang-selector {
    color: #000 !important;
  }
   
  #sai-settings-button {
    background-color: #1a82bc;
    padding: 3px 4px;
    border-radius: 5px;
  }
   
  #sai-settings-button svg {
    width: 24px;
    height: 22px;
    margin-top: 1px;
  }
   
  #sai-skip-read-aloud.sai-active:hover,
  #sai-disable-read-aloud:hover,
  #sai-settings-button:hover {
    opacity: 0.8;
    cursor: pointer;
  }
   
   
  #sai-disable-read-aloud {
    background-color: #1abc9c;
    padding: 3px 4px;
    border-radius: 5px;
    margin-left: 10px;
    margin-right: 10px;
    position: relative;
  }
   
  #sai-disable-read-aloud.disabled {
    background-color: #cb4b4b;
  }
   
  #sai-disable-read-aloud.disabled:before {
    content: "";
    width: 2px;
    height: 25px;
    background-color: #fff;
    position: absolute;
    transform: rotate(45deg);
    left: 13px;
  }
   
  #sai-disable-read-aloud svg {
    fill: rgba(0,0,0,0.0);
    width: 24px;
  }
   
  #sai-skip-read-aloud {
    background-color: #969696;
    padding: 3px 4px;
    border-radius: 5px;
    margin-left: 10px;
    position: relative;
  }
   
  #sai-skip-read-aloud.sai-active {
    animation-name: yellow-pulsating-color;
    animation-duration: 2s;
    animation-iteration-count: infinite;
    background-color: #daa266;
  }
   
  #sai-skip-read-aloud svg {
    fill: #fff;
    height: 16px;
    width: 24px;
    margin-top: 6px;
  }
   
  @media only screen and (max-width:450px) {
    #sai-skip-read-aloud {
      display: none;
    }
   
    .sai-compact #sai-skip-read-aloud {
      display: block;
    }
  }
   
  @keyframes red-pulsating-color {
    0% {
      background-color: #e02d2d;
    }
    50% {
      background-color: #ef8585;
    }
    100 {
      background-color: #e02d2d;
    }
  }
   
  @keyframes yellow-pulsating-color {
    0% {
      background-color: #daa266;
    }
    50% {
      background-color: #c78d4f;
    }
    100 {
      background-color: #daa266;
    }
  }
   
  div.px-3.pt-2.pb-3.text-center.text-xs {
    padding: 6px;
    font-size: 0.6rem;
  }
   
  #sai-error-message {
    position: fixed;
    top: 0;
    right: 0;
    width: 200px;
    min-height: 100px;
    background-color: #cb4b4b;
    padding: 15px;
    box-shadow: rgb(0 0 0 / 21%) 0px 0px 10px 2px;
    color: #fff;
    font-weight: bold;
    font-size: 12px;
  }
   
   
  /* ==== SETTINGS ====== */
   
  #sai-settings-view {
    position: fixed;
    right: 0;
    top: 0;
    width: 100%;
    background-color: rgb(30 30 30 / 90%);
    height: 100vh;
    padding: 25px;
    z-index: 100000;
  }
   
  #sai-settings-view.sai-hide {
    display: none;
  }
   
  #sai-settings-view-inner {
    max-width: 700px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
  }
   
  .sai-settings-col {
    width: 45%;
  }
   
  #sai-settings-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    max-width: 700px;
    margin: 0 auto;
    border-bottom: 1px solid #777;
    margin-bottom: 25px;
    padding-bottom: 10px;
  }
   
  #sai-settings-view a {
    color: #1abc9c;
    text-decoration: none;
    font-weight: bold;
  }
   
  .sai-button {
    all: unset;
    background-color: #1abc9c;
    color: #fff;
    padding: 10px 15px;
    font-weight: bold;
    border-radius: 5px;
    font-size: 14px;
    color: #fff !important;
    cursor: pointer;
    line-height: 1.6;
  }
   
  .sai-button:hover {
    opacity: 0.8;
  }
   
   
  #sai-settings-view h3,
  #sai-settings-view h4,
  #sai-settings-view p  {
    color: #fff;
    margin-bottom: 25px;
  }
   
  #sai-settings-view li {
    color: #fff;
  }
   
  #sai-settings-view h3 {
    font-size: 20px;
  }
   
  #sai-settings-view h4 {
    font-size: 17px;
    font-weight:bold;
    margin-bottom: 15px;
  }
   
   
  .sai-settings-section {
    margin-top: 35px;
    padding-top: 25px;
    border-top: 1px solid #777;
  }
   
  #sai-settings-view li strong {
    color: #ffca92;
  }
   
  #sai-settings-view ul {
    padding-left: 0;
    margin: 0;
    list-style: none;
  }
   
  #sai-settings-view li {
    margin-top: 10px;
  }
   
  #sai-settings-read-aloud-header {
   
  }
   
  #sai-settings-voice-link {
    display: inline-block;
    margin-top: 7px;
    font-size: 12px;
  }
   
  .sai-slidecontainer {
    width: 100%;
  }
   
  .sai-slider {
    -webkit-appearance: none;
    width: 100%;
    height: 15px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: 0.2s;
    transition: opacity 0.2s;
  }
   
  .sai-slider:hover {
    opacity: 1;
  }
   
  .sai-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    background: #1abc9c;
    cursor: pointer;
  }
   
  .sai-link-talkio {
    color: #ac99ff !important;
  }
   
  @media only screen and (max-height: 720px) {
    #sai-settings-header {
      margin-bottom: 15px;
      padding-bottom: 0;
    }
   
    #sai-settings-view {
      font-size: 12px;
      overflow-y: auto;
    }
   
    #sai-settings-view h4 {
      font-size: 16px;
    }
   
    .sai-settings-section {
      margin-top: 20px;
      padding-top: 10px;
    }
  }
   
  /* ======== REPEAT BUTTON ======= */
  .sai-repeat-button {
    border-radius: 5px;
    width: 30px;
    height: 30px;
    cursor: pointer;
    position: relative;
  }
   
  .sai-repeat-button.sai-disabled {
    display: none;
  }
   
  .sai-repeat-button svg {
    width: 18px;
    height: 18px;
    margin-top: 5px;
    margin-left: 5px;
  }
   
  .sai-repeat-button path {
    fill: #5d5d5d;
  }
   
  .sai-repeat-button:hover {
    background: #40414f;
  }
   
  .sai-repeat-button:hover path {
    fill: #b4b4b4;
  }
   
  .dark .sai-repeat-button path {
    fill: #b4b4b4;
  }
   
  .dark .sai-repeat-button:hover {
    background: #40414f;
  }
   
  .dark .sai-repeat-button:hover path {
    fill: #fff;
  }
   
   
  /* ======== HIDE SAI ======= */
  .sai-hidden #sai-input-wrapper,
  .sai-hidden #sai-lang-selector-wrapper,
  .sai-hidden #sai-skip-read-aloud,
  .sai-hidden #sai-disable-read-aloud {
    display: none;
  }
   
  .sai-hidden #sai-button-wrapper {
    background: transparent;
    padding: 0;
  }
   
  .sai-hidden #sai-settings-button {
    border-radius: 5px;
    position: fixed;
    top: 7px;
    right: 45px;
    z-index: 10000;
  }
   
  @media only screen and (min-width: 768px) {
    .sai-hidden #sai-settings-button {
      top: 20px;
      right: 20px
    }
  }
   
  @media only screen and (max-width: 768px) {
    form > div.relative.flex.h-full {
      flex-direction: column;
    }
   
    #sai-input-wrapper {
      height: 50px;
    }
  }
   
  /* ======== SAI COMPACT ======= */
  .sai-compact #sai-root {
    height: 0;
    margin: 0;
    position: relative;
  }
   
  .sai-compact #sai-input-wrapper{
    position: absolute;
    width: 30px;
    height: 30px;
    right: 10px;
    top: 8px;
    border: none;
    z-index: 10;
  }
   
  .sai-compact #sai-input-wrapper.is-idle {
    background: none;
    border: none;
    box-shadow: none;
    opacity: 0.5;
  }
   
  .sai-compact .sai-input {
    display: none !important;
  }
   
  .sai-compact #sai-speech-button {
    width: 20px !important;
    height: 20px !important;
    top: 4px !important;
    right: 0 !important;
    margin-right: 4px !important;
  }
   
  .sai-compact #sai-speech-button svg {
    width: 20px !important;
    height: 20px !important;
  }
   
  .sai-compact #sai-input-wrapper.is-idle #sai-speech-button svg path {
    fill: #999;
  }
   
  .sai-compact #sai-cancel-msg {
    display: none;
  }
   
  .sai-compact #sai-button-wrapper {
    position: absolute;
    bottom: 15px;
    right: 0;
    padding: 5px 7px;
  }
   
  .sai-compact #sai-lang-selector {
    font-size: 10px !important;
    height: 25px;
  }
   
  .sai-compact #sai-settings-button svg,
  .sai-compact #sai-disable-read-aloud svg{
    width: 20px !important;
    height: 20px !important;
    margin-top: 0px !important;
  }
   
  .sai-compact #sai-skip-read-aloud svg {
    width: 20px !important;
    height: 13px !important;
    margin-top: 5px !important;
  }
   
  .sai-compact #sai-disable-read-aloud.disabled:before {
    left: 11px;
    bottom: 1px;
  }
   
  .sai-compact textarea {
    padding-right: 4rem !important;
  }
   
  .sai-compact textarea + button {
    margin-right: 35px;
  }
   
  @media only screen and (max-width: 900px) {
    .sai-compact .flex.ml-1.gap-0.justify-center{
      position: static;
      justify-content: flex-start !important;
    }
  }
   
  @media only screen and (max-width: 768px) {
    .sai-compact .w-full.h-32.flex-shrink-0 {
      margin-top: 25px;
    }
   
    .sai-compact .flex.ml-1.gap-0.justify-center{
      position: absolute;
      bottom: 62px;
      height: 30px;
    }
  }
   
  @media only screen and (min-width: 768px) {
    .sai-compact #sai-input-wrapper {
      top: 12px;
    }
   
    .sai-compact #sai-button-wrapper {
      bottom: 10px;
    }
   
    .sai-compact .flex.ml-1.gap-0.justify-center{
      position: absolute;
      top: -46px;
      max-height: 36px;
    }
  }
  `
    document.body.appendChild(style);
    var logLevel;
    (function(e) {
        e.info = "info",
        e.warning = "warning",
        e.error = "error",
        e.verbose = "verbose",
        e.success = "success"
    }(logLevel || (logLevel = {})));
    class SAILogger {
        constructor(logToConsole=!0) {
            this.logToConsole = logToConsole,
            window.addEventListener("sai-print-logs", (()=>{
                console.log("All logs:"),
                console.log(SAILogger.allLogs)
            }
            ))
        }
        static info(msg, data) {
            this.instance.write(msg, logLevel.info, data)
        }
        static success(msg, data) {
            this.instance.write(msg, logLevel.success, data)
        }
        static warn(msg, data) {
            this.instance.write(msg, logLevel.warning, data)
        }
        static error(msg, err) {
            this.instance.write(msg, logLevel.error, err)
        }
        static verbose(msg, data) {
            this.instance.logToConsole && SAILogger.allLogs.push([Date.now(), logLevel.verbose, msg, data])
        }
        static setup() {
            if (!SAILogger.instance) {
                const logToConsole = "true" === window.localStorage.getItem("sai-log");
                this.instance = new SAILogger(logToConsole)
            }
            return SAILogger.instance
        }
        write(msg, level, data) {
            if (this.logToConsole) {
                const style = `color: ${this.getConsoleColor(level)}`;
                data ? console.log(`%c[${level}] ${msg}`, style, data) : console.log(`%c[${level}] ${msg}`, style),
                SAILogger.allLogs.push([Date.now(), level, msg, data])
            }
        }
        getConsoleColor(level) {
            return level === logLevel.info ? "#2e99d9" : level === logLevel.warning ? "#ffbb00" : level === logLevel.success ? "#1abc9c" : "#b91e1e"
        }
    }
    SAILogger.allLogs = [];
    class ErrorMessage {
        constructor(element) {
            this.element = element,
            this.isVisible = !1
        }
        write(html, delay=3e3) {
            this.isVisible && clearTimeout(this.timer),
            this.element.innerHTML = html,
            this.setVisible(!0),
            this.timer = setTimeout((()=>{
                this.setVisible(!1),
                this.element.innerHTML = ""
            }
            ), delay)
        }
        setVisible(v) {
            this.element.style.display = v ? "block" : "none",
            this.isVisible = v
        }
    }
    function matchLanguageCode(code, name) {
        return code === name || ("zh-CN" === code && "cmn-Hans-CN" === name || ("zh-TW" === code && "cmn-Hant-TW" === name || "zh-HK" === code && "yue-Hant-HK" === name))
    }
    const staticLangSupportList = [
      ["English (US)", "en-US"],
      ["English (UK)", "en-GB"],
      ["English (AU)", "en-AU"],
      ["English (CA)", "en-CA"],
      ["English (IN)", "en-IN"],
      ["English (NZ)", "en-NZ"],
      ["普通话 (中国大陆)", "cmn-Hans-CN"],
      ["中文 (台灣)", "cmn-Hant-TW"],
      ["粵語 (香港)", "yue-Hant-HK"],
      ["Afrikaans", "af-ZA"],
      ["Bahasa Indonesia", "id-ID"],
      ["Bahasa Melayu", "ms-MY"],
      ["Català", "ca-ES"],
      ["Čeština", "cs-CZ"],
      ["Dansk", "da-DK"],
      ["Deutsch", "de-DE"],
      ["Español (ES)", "es-ES"],
      ["Español (MX)", "es-MX"],
      ["Español (AR)", "es-AR"],
      ["Español (CO)", "es-CO"],
      ["Español (PE)", "es-PE"],
      ["Español (VE)", "es-VE"],
      ["Euskara", "eu-ES"],
      ["Français", "fr-FR"],
      ["Galego", "gl-ES"],
      ["Hrvatski", "hr_HR"],
      ["IsiZulu", "zu-ZA"],
      ["Íslenska", "is-IS"],
      ["Italiano", "it-IT"],
      ["Magyar", "hu-HU"],
      ["Nederlands", "nl-NL"],
      ["Norsk bokmål", "nb-NO"],
      ["Polski", "pl-PL"],
      ["Português (PT)", "pt-PT"],
      ["Português (BR)", "pt-BR"],
      ["Română", "ro-RO"],
      ["Slovenčina", "sk-SK"],
      ["Suomi", "fi-FI"],
      ["Svenska", "sv-SE"],
      ["Türkçe", "tr-TR"],
      ["български", "bg-BG"],
      ["日本語", "ja-JP"],
      ["한국어", "ko-KR"],
      ["Pусский", "ru-RU"],
      ["Српски", "sr-RS"]
    ];
    let allVoices = [];
    async function getVoiceSupportList() {
        if (allVoices.length > 0)
            return allVoices;
        const voices = await new Promise((resolve=>{
            window.speechSynthesis.onvoiceschanged = ()=>{
                const voices = window.speechSynthesis.getVoices();
                resolve(voices)
            }
        }
        ));
        return staticLangSupportList.forEach((langSupport=>{
            voices.some((v=>matchLanguageCode(v.lang, langSupport[1]))) ? allVoices.push(langSupport) : SAILogger.warn(`${langSupport[0]} not supported. Removed from selector.`)
        }
        )),
        allVoices
    }
    class LanguageSelector {
        constructor(selectionCb, code) {
            this.selectionCb = selectionCb,
            this.selected = code,
            this.storageKey = "sai-language",
            this.setDefaultFromStorage(),
            this.element = document.createElement("div"),
            this.selector = document.createElement("select"),
            this.element.id = "sai-lang-selector-wrapper",
            this.selector.id = "sai-lang-selector",
            getVoiceSupportList().then((list=>{
                if (0 === list.length) {
                    this.selector.classList.add("sai-hide");
                    const d = document.createElement("div");
                    return d.id = "sai-no-voices",
                    d.innerHTML = "<a href='https://voicecontrol.chat/install-voices' target='_blank'>Install voices</a>",
                    void this.element.appendChild(d)
                }
                list.forEach((([name,code])=>{
                    const e = document.createElement("option");
                    e.innerText = name,
                    e.value = code,
                    code === this.selected && (e.selected = !0),
                    this.selector.appendChild(e)
                }
                )),
                this.element.appendChild(this.selector),
                this.selector.onchange = event=>{
                    const t = event.target;
                    this.selectLanguage(t.value)
                }
            }
            ))
        }
        selectLanguage(code) {
            window.localStorage.setItem(this.storageKey, code),
            this.selectionCb(code)
        }
        setDefaultFromStorage() {
            let code = window.localStorage.getItem(this.storageKey);
            code && (this.selected = code,
            this.selectLanguage(code))
        }
    }
    class ReadAloudImpl {
        constructor(lang, reset, waitForContent) {
            this.lang = lang,
            this.waitForContent = waitForContent,
            this.lastText = "",
            this.lastRead = Date.now(),
            this.lastUtter = Date.now(),
            this.lastUtterCharCount = 0,
            this.lastTimeout = 0,
            this.lastTimeSinceLastUtter = 0,
            this.synth = window.speechSynthesis,
            this.queue = [],
            this.enabled = !0,
            this.storageKey = "sai-read-aloud",
            this.queueIdle = !0,
            this.disableButton = document.createElement("div"),
            this.disableButton.innerHTML = '<?xml version="1.0" encoding="iso-8859-1"?>\n\x3c!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  --\x3e\n<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\n\t viewBox="0 0 496.159 496.159" style="enable-background:new 0 0 496.159 496.159;" xml:space="preserve">\n<path class="sai-svg-color-path" d="M496.159,248.085c0-137.023-111.07-248.082-248.076-248.082C111.071,0.003,0,111.063,0,248.085\n\tc0,137.001,111.07,248.07,248.083,248.07C385.089,496.155,496.159,385.086,496.159,248.085z"/>\n<g>\n\t<path style="fill:#FFFFFF;" d="M247.711,125.252c-3.41-1.851-7.559-1.688-10.813,0.426l-95.137,61.789h-35.164\n\t\tc-5.845,0-10.583,4.738-10.583,10.584v92.727c0,5.845,4.738,10.583,10.583,10.583h35.164l95.137,61.79\n\t\tc1.748,1.135,3.753,1.707,5.765,1.707c1.733,0,3.471-0.425,5.049-1.281c3.41-1.852,5.534-5.421,5.534-9.301V134.553\n\t\tC253.244,130.672,251.121,127.103,247.711,125.252z"/>\n\t<path style="fill:#FFFFFF;" d="M282.701,319.271c0.894,0,1.801-0.162,2.685-0.504c24.239-9.412,40.524-38.49,40.524-72.359\n\t\tc0-29.957-13.2-57.049-33.63-69.018c-3.534-2.072-8.08-0.885-10.153,2.65c-2.073,3.536-0.885,8.082,2.651,10.153\n\t\tc15.971,9.358,26.291,31.424,26.291,56.214c0,27.359-12.77,51.424-31.055,58.525c-3.82,1.481-5.714,5.781-4.231,9.602\n\t\tC276.924,317.474,279.729,319.271,282.701,319.271z"/>\n\t<path style="fill:#FFFFFF;" d="M302.073,350.217c0.895,0,1.802-0.162,2.684-0.504c34.046-13.219,57.822-55.979,57.822-103.988\n\t\tc0-43.187-18.884-82.156-48.11-99.279c-3.534-2.072-8.082-0.885-10.152,2.652c-2.073,3.535-0.885,8.081,2.651,10.152\n\t\tc24.768,14.512,40.771,48.455,40.771,86.475c0,42.027-19.883,79.1-48.353,90.154c-3.82,1.481-5.715,5.781-4.231,9.602\n\t\tC296.295,348.418,299.1,350.217,302.073,350.217z"/>\n\t<path style="fill:#FFFFFF;" d="M322.025,379.715c-3.005,0-5.841-1.818-6.994-4.788c-1.499-3.861,0.416-8.206,4.277-9.706\n\t\tc38.764-15.051,65.837-64.404,65.837-120.019c0-50.136-21.609-95.192-55.052-114.786c-3.574-2.094-4.773-6.688-2.68-10.262\n\t\tc2.094-3.574,6.688-4.774,10.263-2.68c37.948,22.232,62.469,72.369,62.469,127.728c0,61.66-31.009,116.764-75.409,134.002\n\t\tC323.846,379.551,322.928,379.715,322.025,379.715z"/>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n<g>\n</g>\n</svg>\n',
            this.disableButton.id = "sai-disable-read-aloud",
            this.disableButton.title = "Toggle read aloud",
            this.skipButton = document.createElement("div"),
            this.skipButton.innerHTML = '<?xml version="1.0" encoding="UTF-8"?>\n<svg width="700pt" height="700pt" version="1.1" viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n <defs>\n  <symbol id="s" overflow="visible">\n   <path d="m18.766-1.125c-0.96875 0.5-1.9805 0.875-3.0312 1.125-1.043 0.25781-2.1367 0.39062-3.2812 0.39062-3.3984 0-6.0898-0.94531-8.0781-2.8438-1.9922-1.9062-2.9844-4.4844-2.9844-7.7344 0-3.2578 0.99219-5.8359 2.9844-7.7344 1.9883-1.9062 4.6797-2.8594 8.0781-2.8594 1.1445 0 2.2383 0.13281 3.2812 0.39062 1.0508 0.25 2.0625 0.625 3.0312 1.125v4.2188c-0.98047-0.65625-1.9453-1.1406-2.8906-1.4531-0.94922-0.3125-1.9492-0.46875-3-0.46875-1.875 0-3.3516 0.60547-4.4219 1.8125-1.0742 1.1992-1.6094 2.8555-1.6094 4.9688 0 2.1055 0.53516 3.7617 1.6094 4.9688 1.0703 1.1992 2.5469 1.7969 4.4219 1.7969 1.0508 0 2.0508-0.14844 3-0.45312 0.94531-0.3125 1.9102-0.80078 2.8906-1.4688z"/>\n  </symbol>\n  <symbol id="b" overflow="visible">\n   <path d="m13.734-11.141c-0.4375-0.19531-0.87109-0.34375-1.2969-0.4375-0.41797-0.10156-0.83984-0.15625-1.2656-0.15625-1.2617 0-2.2305 0.40625-2.9062 1.2188-0.67969 0.80469-1.0156 1.9531-1.0156 3.4531v7.0625h-4.8906v-15.312h4.8906v2.5156c0.625-1 1.3438-1.7266 2.1562-2.1875 0.82031-0.46875 1.8008-0.70312 2.9375-0.70312 0.16406 0 0.34375 0.011719 0.53125 0.03125 0.19531 0.011719 0.47656 0.039062 0.84375 0.078125z"/>\n  </symbol>\n  <symbol id="a" overflow="visible">\n   <path d="m17.641-7.7031v1.4062h-11.453c0.125 1.1484 0.53906 2.0078 1.25 2.5781 0.70703 0.57422 1.7031 0.85938 2.9844 0.85938 1.0312 0 2.082-0.14844 3.1562-0.45312 1.082-0.3125 2.1914-0.77344 3.3281-1.3906v3.7656c-1.1562 0.4375-2.3125 0.76562-3.4688 0.98438-1.1562 0.22656-2.3125 0.34375-3.4688 0.34375-2.7734 0-4.9297-0.70312-6.4688-2.1094-1.5312-1.4062-2.2969-3.3789-2.2969-5.9219 0-2.5 0.75391-4.4609 2.2656-5.8906 1.5078-1.4375 3.582-2.1562 6.2188-2.1562 2.4062 0 4.332 0.73047 5.7812 2.1875 1.4453 1.4492 2.1719 3.3828 2.1719 5.7969zm-5.0312-1.625c0-0.92578-0.27344-1.6719-0.8125-2.2344-0.54297-0.57031-1.25-0.85938-2.125-0.85938-0.94922 0-1.7188 0.26562-2.3125 0.79688s-0.96484 1.2969-1.1094 2.2969z"/>\n  </symbol>\n  <symbol id="d" overflow="visible">\n   <path d="m9.2188-6.8906c-1.0234 0-1.793 0.17188-2.3125 0.51562-0.51172 0.34375-0.76562 0.85547-0.76562 1.5312 0 0.625 0.20703 1.1172 0.625 1.4688 0.41406 0.34375 0.98828 0.51562 1.7188 0.51562 0.92578 0 1.7031-0.32812 2.3281-0.98438 0.63281-0.66406 0.95312-1.4922 0.95312-2.4844v-0.5625zm7.4688-1.8438v8.7344h-4.9219v-2.2656c-0.65625 0.92969-1.3984 1.6055-2.2188 2.0312-0.82422 0.41406-1.8242 0.625-3 0.625-1.5859 0-2.8711-0.45703-3.8594-1.375-0.99219-0.92578-1.4844-2.1289-1.4844-3.6094 0-1.7891 0.61328-3.1016 1.8438-3.9375 1.2383-0.84375 3.1797-1.2656 5.8281-1.2656h2.8906v-0.39062c0-0.76953-0.30859-1.332-0.92188-1.6875-0.61719-0.36328-1.5703-0.54688-2.8594-0.54688-1.0547 0-2.0312 0.10547-2.9375 0.3125-0.89844 0.21094-1.7305 0.52344-2.5 0.9375v-3.7344c1.0391-0.25 2.0859-0.44141 3.1406-0.57812 1.0625-0.13281 2.125-0.20312 3.1875-0.20312 2.7578 0 4.75 0.54688 5.9688 1.6406 1.2266 1.0859 1.8438 2.8555 1.8438 5.3125z"/>\n  </symbol>\n  <symbol id="c" overflow="visible">\n   <path d="m7.7031-19.656v4.3438h5.0469v3.5h-5.0469v6.5c0 0.71094 0.14062 1.1875 0.42188 1.4375s0.83594 0.375 1.6719 0.375h2.5156v3.5h-4.1875c-1.9375 0-3.3125-0.39844-4.125-1.2031-0.80469-0.8125-1.2031-2.1797-1.2031-4.1094v-6.5h-2.4219v-3.5h2.4219v-4.3438z"/>\n  </symbol>\n  <symbol id="j" overflow="visible">\n   <path d="m12.766-13.078v-8.2031h4.9219v21.281h-4.9219v-2.2188c-0.66797 0.90625-1.4062 1.5703-2.2188 1.9844s-1.7578 0.625-2.8281 0.625c-1.8867 0-3.4336-0.75-4.6406-2.25-1.2109-1.5-1.8125-3.4258-1.8125-5.7812 0-2.3633 0.60156-4.2969 1.8125-5.7969 1.207-1.5 2.7539-2.25 4.6406-2.25 1.0625 0 2 0.21484 2.8125 0.64062 0.82031 0.42969 1.5664 1.0859 2.2344 1.9688zm-3.2188 9.9219c1.0391 0 1.8359-0.37891 2.3906-1.1406 0.55078-0.76953 0.82812-1.8828 0.82812-3.3438 0-1.457-0.27734-2.5664-0.82812-3.3281-0.55469-0.76953-1.3516-1.1562-2.3906-1.1562-1.043 0-1.8398 0.38672-2.3906 1.1562-0.55469 0.76172-0.82812 1.8711-0.82812 3.3281 0 1.4609 0.27344 2.5742 0.82812 3.3438 0.55078 0.76172 1.3477 1.1406 2.3906 1.1406z"/>\n  </symbol>\n  <symbol id="i" overflow="visible">\n   <path d="m10.5-3.1562c1.0508 0 1.8516-0.37891 2.4062-1.1406 0.55078-0.76953 0.82812-1.8828 0.82812-3.3438 0-1.457-0.27734-2.5664-0.82812-3.3281-0.55469-0.76953-1.3555-1.1562-2.4062-1.1562-1.0547 0-1.8594 0.38672-2.4219 1.1562-0.55469 0.77344-0.82812 1.8828-0.82812 3.3281 0 1.4492 0.27344 2.5586 0.82812 3.3281 0.5625 0.77344 1.3672 1.1562 2.4219 1.1562zm-3.25-9.9219c0.67578-0.88281 1.4219-1.5391 2.2344-1.9688 0.82031-0.42578 1.7656-0.64062 2.8281-0.64062 1.8945 0 3.4453 0.75 4.6562 2.25 1.207 1.5 1.8125 3.4336 1.8125 5.7969 0 2.3555-0.60547 4.2812-1.8125 5.7812-1.2109 1.5-2.7617 2.25-4.6562 2.25-1.0625 0-2.0078-0.21094-2.8281-0.625-0.8125-0.42578-1.5586-1.0859-2.2344-1.9844v2.2188h-4.8906v-21.281h4.8906z"/>\n  </symbol>\n  <symbol id="h" overflow="visible">\n   <path d="m0.34375-15.312h4.8906l4.125 10.391 3.5-10.391h4.8906l-6.4375 16.766c-0.64844 1.6953-1.4023 2.8828-2.2656 3.5625-0.86719 0.6875-2 1.0312-3.4062 1.0312h-2.8438v-3.2188h1.5312c0.83203 0 1.4375-0.13672 1.8125-0.40625 0.38281-0.26172 0.67969-0.73047 0.89062-1.4062l0.14062-0.42188z"/>\n  </symbol>\n  <symbol id="g" overflow="visible">\n   <path d="m2.3594-21.281h4.8906v21.281h-4.8906z"/>\n  </symbol>\n  <symbol id="f" overflow="visible">\n   <path d="m16.547-12.766c0.61328-0.94531 1.3477-1.6719 2.2031-2.1719 0.85156-0.5 1.7891-0.75 2.8125-0.75 1.7578 0 3.0977 0.54688 4.0156 1.6406 0.92578 1.0859 1.3906 2.6562 1.3906 4.7188v9.3281h-4.9219v-7.9844-0.35938c0.007813-0.13281 0.015625-0.32031 0.015625-0.5625 0-1.082-0.16406-1.8633-0.48438-2.3438-0.3125-0.48828-0.82422-0.73438-1.5312-0.73438-0.92969 0-1.6484 0.38672-2.1562 1.1562-0.51172 0.76172-0.77344 1.8672-0.78125 3.3125v7.5156h-4.9219v-7.9844c0-1.6953-0.14844-2.7852-0.4375-3.2656-0.29297-0.48828-0.8125-0.73438-1.5625-0.73438-0.9375 0-1.6641 0.38672-2.1719 1.1562-0.51172 0.76172-0.76562 1.8594-0.76562 3.2969v7.5312h-4.9219v-15.312h4.9219v2.2344c0.60156-0.86328 1.2891-1.5156 2.0625-1.9531 0.78125-0.4375 1.6406-0.65625 2.5781-0.65625 1.0625 0 2 0.25781 2.8125 0.76562 0.8125 0.51172 1.4258 1.2305 1.8438 2.1562z"/>\n  </symbol>\n  <symbol id="r" overflow="visible">\n   <path d="m12.422-21.281v3.2188h-2.7031c-0.6875 0-1.1719 0.125-1.4531 0.375-0.27344 0.25-0.40625 0.6875-0.40625 1.3125v1.0625h4.1875v3.5h-4.1875v11.812h-4.8906v-11.812h-2.4375v-3.5h2.4375v-1.0625c0-1.6641 0.46094-2.8984 1.3906-3.7031 0.92578-0.80078 2.3672-1.2031 4.3281-1.2031z"/>\n  </symbol>\n  <symbol id="e" overflow="visible">\n   <path d="m9.6406-12.188c-1.0859 0-1.9141 0.39062-2.4844 1.1719-0.57422 0.78125-0.85938 1.9062-0.85938 3.375s0.28516 2.5938 0.85938 3.375c0.57031 0.77344 1.3984 1.1562 2.4844 1.1562 1.0625 0 1.875-0.38281 2.4375-1.1562 0.57031-0.78125 0.85938-1.9062 0.85938-3.375s-0.28906-2.5938-0.85938-3.375c-0.5625-0.78125-1.375-1.1719-2.4375-1.1719zm0-3.5c2.6328 0 4.6914 0.71484 6.1719 2.1406 1.4766 1.418 2.2188 3.3867 2.2188 5.9062 0 2.5117-0.74219 4.4805-2.2188 5.9062-1.4805 1.418-3.5391 2.125-6.1719 2.125-2.6484 0-4.7148-0.70703-6.2031-2.125-1.4922-1.4258-2.2344-3.3945-2.2344-5.9062 0-2.5195 0.74219-4.4883 2.2344-5.9062 1.4883-1.4258 3.5547-2.1406 6.2031-2.1406z"/>\n  </symbol>\n  <symbol id="q" overflow="visible">\n   <path d="m17.75-9.3281v9.3281h-4.9219v-7.1094c0-1.3438-0.03125-2.2656-0.09375-2.7656s-0.16797-0.86719-0.3125-1.1094c-0.1875-0.3125-0.44922-0.55469-0.78125-0.73438-0.32422-0.17578-0.69531-0.26562-1.1094-0.26562-1.0234 0-1.8242 0.39844-2.4062 1.1875-0.58594 0.78125-0.875 1.8711-0.875 3.2656v7.5312h-4.8906v-21.281h4.8906v8.2031c0.73828-0.88281 1.5195-1.5391 2.3438-1.9688 0.83203-0.42578 1.75-0.64062 2.75-0.64062 1.7695 0 3.1133 0.54688 4.0312 1.6406 0.91406 1.0859 1.375 2.6562 1.375 4.7188z"/>\n  </symbol>\n  <symbol id="p" overflow="visible">\n   <path d="m2.5781-20.406h5.875l7.4219 14v-14h4.9844v20.406h-5.875l-7.4219-14v14h-4.9844z"/>\n  </symbol>\n  <symbol id="o" overflow="visible">\n   <path d="m2.1875-5.9688v-9.3438h4.9219v1.5312c0 0.83594-0.007813 1.875-0.015625 3.125-0.011719 1.25-0.015625 2.0859-0.015625 2.5 0 1.2422 0.03125 2.1328 0.09375 2.6719 0.070313 0.54297 0.17969 0.93359 0.32812 1.1719 0.20703 0.32422 0.47266 0.57422 0.79688 0.75 0.32031 0.16797 0.69141 0.25 1.1094 0.25 1.0195 0 1.8203-0.39062 2.4062-1.1719 0.58203-0.78125 0.875-1.8672 0.875-3.2656v-7.5625h4.8906v15.312h-4.8906v-2.2188c-0.74219 0.89844-1.5234 1.5586-2.3438 1.9844-0.82422 0.41406-1.7344 0.625-2.7344 0.625-1.7617 0-3.1055-0.53906-4.0312-1.625-0.92969-1.082-1.3906-2.6602-1.3906-4.7344z"/>\n  </symbol>\n  <symbol id="n" overflow="visible">\n   <path d="m17.75-9.3281v9.3281h-4.9219v-7.1406c0-1.3203-0.03125-2.2344-0.09375-2.7344s-0.16797-0.86719-0.3125-1.1094c-0.1875-0.3125-0.44922-0.55469-0.78125-0.73438-0.32422-0.17578-0.69531-0.26562-1.1094-0.26562-1.0234 0-1.8242 0.39844-2.4062 1.1875-0.58594 0.78125-0.875 1.8711-0.875 3.2656v7.5312h-4.8906v-15.312h4.8906v2.2344c0.73828-0.88281 1.5195-1.5391 2.3438-1.9688 0.83203-0.42578 1.75-0.64062 2.75-0.64062 1.7695 0 3.1133 0.54688 4.0312 1.6406 0.91406 1.0859 1.375 2.6562 1.375 4.7188z"/>\n  </symbol>\n  <symbol id="m" overflow="visible">\n   <path d="m2.5781-20.406h8.7344c2.5938 0 4.582 0.57812 5.9688 1.7344 1.3945 1.1484 2.0938 2.7891 2.0938 4.9219 0 2.1367-0.69922 3.7812-2.0938 4.9375-1.3867 1.1562-3.375 1.7344-5.9688 1.7344h-3.4844v7.0781h-5.25zm5.25 3.8125v5.7031h2.9219c1.0195 0 1.8047-0.25 2.3594-0.75 0.5625-0.5 0.84375-1.2031 0.84375-2.1094 0-0.91406-0.28125-1.6172-0.84375-2.1094-0.55469-0.48828-1.3398-0.73438-2.3594-0.73438z"/>\n  </symbol>\n  <symbol id="l" overflow="visible">\n   <path d="m2.3594-15.312h4.8906v15.031c0 2.0508-0.49609 3.6172-1.4844 4.7031-0.98047 1.082-2.4062 1.625-4.2812 1.625h-2.4219v-3.2188h0.85938c0.92578 0 1.5625-0.21094 1.9062-0.625 0.35156-0.41797 0.53125-1.2461 0.53125-2.4844zm0-5.9688h4.8906v4h-4.8906z"/>\n  </symbol>\n  <symbol id="k" overflow="visible">\n   <path d="m14.719-14.828v3.9844c-0.65625-0.45703-1.3242-0.79688-2-1.0156-0.66797-0.21875-1.3594-0.32812-2.0781-0.32812-1.3672 0-2.4336 0.40234-3.2031 1.2031-0.76172 0.79297-1.1406 1.9062-1.1406 3.3438 0 1.4297 0.37891 2.543 1.1406 3.3438 0.76953 0.79297 1.8359 1.1875 3.2031 1.1875 0.75781 0 1.4844-0.10938 2.1719-0.32812 0.6875-0.22656 1.3203-0.56641 1.9062-1.0156v4c-0.76172 0.28125-1.5391 0.48828-2.3281 0.625-0.78125 0.14453-1.5742 0.21875-2.375 0.21875-2.7617 0-4.9219-0.70703-6.4844-2.125-1.5547-1.4141-2.3281-3.3828-2.3281-5.9062 0-2.5312 0.77344-4.5039 2.3281-5.9219 1.5625-1.4141 3.7227-2.125 6.4844-2.125 0.80078 0 1.5938 0.074219 2.375 0.21875 0.78125 0.13672 1.5547 0.35156 2.3281 0.64062z"/>\n  </symbol>\n </defs>\n <g>\n  <path d="m134.69 38.246 293.43 235.17c4.2656 3.2578 3.6094 9.9531 0 13.102l-293.43 235.11c-6.4414 4.7617-13.645 0.21875-13.645-6.5508v-74.953c0-5.0703 2.1523-6.9141 5.6211-9.8086l187.64-150.36-189.11-151.59c-3.1445-2.5273-4.1523-4.9883-4.1523-8.6016v-74.98c0-7.6094 7.7539-10.453 13.645-6.5508z" fill-rule="evenodd"/>\n  <path d="m570.56 36.402c4.6367 0 8.3945 3.7578 8.3945 8.3945v470.29c0 4.6367-3.7578 8.3945-8.3945 8.3945h-65.09 0.003906c-4.6367 0-8.3945-3.7578-8.3984-8.3945v-470.29c0.003906-4.6367 3.7617-8.3945 8.3984-8.3945h65.09z" fill-rule="evenodd"/>\n </g>\n</svg>\n',
            this.skipButton.id = "sai-skip-read-aloud",
            this.skipButton.title = "Skip read aloud",
            window.speechSynthesis.cancel(),
            this.disableButton.addEventListener("click", (()=>{
                this.enabled ? this.disableReadAloud() : this.enableReadAloud()
            }
            )),
            this.skipButton.onclick = ()=>{
                this.skipReading()
            }
            ,
            this.setReadAloudFromStorage(),
            SAILogger.info(`reInit ${reset}, lastTextLength: ${this.lastText.length}`),
            reset && this.reset()
        }
        async runQueue() {
            if (SAILogger.info(`Queue is idle: ${this.queueIdle}`),
            this.queue.length > 0 && this.queueIdle) {
                this.skipButton.classList.add("sai-active"),
                this.queueIdle = !1;
                const text = this.queue.shift();
                await this.readAloud(text),
                this.queueIdle = !0,
                this.skipButton.classList.remove("sai-active"),
                this.queue.length > 0 && this.runQueue()
            }
        }
        observerCallback(callback) {
            const text = this.getText();
            if (0 === text.length)
                SAILogger.info("No text, reset"),
                this.reset();
            else if (this.waitForContent)
                return SAILogger.info("Wait for content"),
                this.lastText = text,
                void (this.waitForContent = !1);
            const leftText = text.replace(this.lastText.trim(), "").trim()
              , lastChar = leftText[leftText.length - 1]
              , longTimeSince = this.lastRead + 1e4 < Date.now();
            if (leftText.length > 0 && ("." === lastChar || "?" === lastChar || "!" === lastChar || ":" === lastChar || "。" === lastChar || longTimeSince)) {
                longTimeSince && (SAILogger.warn(`Long time since last read. Queue length: ${this.queue.length}`),
                this.queueIdle = !0),
                SAILogger.info(`Push to queue: ${leftText}`);
                leftText.split(".").filter((t=>t.length > 0)).forEach((t=>{
                    this.queue.push(t)
                }
                )),
                this.runQueue(),
                this.lastRead = Date.now(),
                this.lastText = text
            }
        }
        setLang(langCode) {
            this.lang = langCode
        }
        skipReading() {
            this.synth.cancel(),
            this.queue = [],
            this.queueIdle = !0;
            const bases = document.querySelectorAll(".text-base");
            for (var i = 0; i < bases.length; i++)
                bases[i]?.classList.add("sai-skip")
        }
        repeat(markdown) {
            this.synth.cancel(),
            this.queue = [],
            this.queueIdle = !0;
            const text = this.getText(markdown);
            SAILogger.info(`Repeat: ${text}`),
            this.queue.push(text),
            this.runQueue()
        }
        readAloud(text) {
            return new Promise(((resolve,reject)=>{
                if (!this.enabled)
                    return SAILogger.info("Read aloud disabled"),
                    void resolve(void 0);
                if (!text)
                    return SAILogger.info("No text to read"),
                    void resolve(void 0);
                if (!document.getElementById("sai-root"))
                    return void resolve(void 0);
                let formatText = text.replace(/([0-9]+)\.(?=[0-9]+(?!\.))/g, "$1,");
                this.synth = window.speechSynthesis;
                const utterThis = new SpeechSynthesisUtterance(formatText)
                  , langVoices = this.synth.getVoices().reverse().filter((v=>matchLanguageCode(v.lang, this.lang)))
                  , preferenceVoice = window.localStorage.getItem("sai-voice-preference" + this.lang)
                  , voice = langVoices.find((v=>v.voiceURI === preferenceVoice)) ?? langVoices[0];
                if (!voice)
                    throw new Error(`unknown voice: ${voice} lang: ${this.lang}`);
                const volume = window.localStorage.getItem("sai-voice-volume-v2");
                volume || SAILogger.error("No volume stored in storage");
                utterThis.volume = volume / 20,
                utterThis.voice = voice;
                const speed = window.localStorage.getItem("sai-voice-speed-v2");
                speed || SAILogger.error("No speed stored in storage");
                // speedStringToRate
                const rate = function(speed) {
                    switch (speed) {
                    case "1":
                        return .1;
                    case "2":
                        return .2;
                    case "3":
                        return .3;
                    case "4":
                        return .4;
                    case "5":
                        return .5;
                    case "6":
                        return .6;
                    case "7":
                        return .7;
                    case "8":
                        return .8;
                    case "9":
                        return .9;
                    case "10":
                    default:
                        return 1;
                    case "11":
                        return 1.1;
                    case "12":
                        return 1.13;
                    case "13":
                        return 1.15;
                    case "14":
                        return 1.17;
                    case "15":
                        return 1.2;
                    case "16":
                        return 1.25;
                    case "17":
                        return 1.3;
                    case "18":
                        return 1.35;
                    case "19":
                        return 1.4;
                    case "20":
                        return 1.45
                    }
                }(speed);
                let timer;
                utterThis.rate = rate,
                SAILogger.success(`Voice name: ${voice.name}, lang: ${voice.lang}, rate: ${rate}: ${formatText}`);
                const read = ()=>{
                    const [timeout,timeSinceLastUtter] = function(lang, rate, lastUtter, lastTimeout, lastUtterCharCount, lastTimeSinceLastUtter) {
                        const timeSinceLastUtter = Date.now() - lastUtter
                          , timeout = function(lang, lastUtterCharCount, rate) {
                            let i = 100;
                            return "zh-CN" !== lang && "zh-TW" !== lang && "zh-HK" !== lang || (i = 240),
                            "zh-TW" === lang && (i = 300),
                            "ja-JP" === lang && (i = 260),
                            "ko-KR" === lang && (i = 240),
                            7e3 + lastUtterCharCount * i * (1 / rate)
                        }(lang, lastUtterCharCount, rate);
                        if (SAILogger.warn(`[resumeInfinity] Time since last utter: ${timeSinceLastUtter.toFixed(1)}. Timeout: ${timeout.toFixed(1)}. Last char count: ${lastUtterCharCount}`),
                        window.navigator.userAgent.search("Mac") > -1 && 0 === timeSinceLastUtter && lastTimeSinceLastUtter > 0) {
                            const diff = lastTimeout - lastTimeSinceLastUtter
                              , n = diff / lastTimeout * 100;
                            SAILogger.warn(`Last timeout safety gap: ${diff.toFixed(1)}ms. ${n.toFixed(1)}%`),
                            n < 25 && SAILogger.error(`________Safety gap ${n.toFixed(1)}% too low!________`)
                        }
                        return timeSinceLastUtter > timeout ? (SAILogger.error(`No utter timeout ${timeout.toFixed(1)} - cancel.`),
                        window.speechSynthesis.cancel(),
                        setTimeout((()=>{
                            window.speechSynthesis.resume()
                        }
                        ), 50),
                        [0, 0]) : [timeout, timeSinceLastUtter]
                    }(voice.lang, rate, this.lastUtter, this.lastTimeout, this.lastUtterCharCount, this.lastTimeSinceLastUtter);
                    this.lastTimeout = timeout,
                    this.lastTimeSinceLastUtter = timeSinceLastUtter,
                    window.speechSynthesis.pause(),
                    window.speechSynthesis.resume(),
                    timer = setTimeout(read, 7e3)
                }
                ;
                utterThis.addEventListener("error", (e=>{
                    SAILogger.error(`Read aloud error ${e.error}`, e),
                    resolve(void 0),
                    clearTimeout(timer)
                }
                )),
                utterThis.addEventListener("start", (()=>{
                    SAILogger.info(`Speech has started. Volume: ${utterThis.volume}`),
                    this.lastUtter = Date.now(),
                    read()
                }
                )),
                utterThis.addEventListener("end", (function(e) {
                    SAILogger.info("Speech has ended"),
                    resolve(void 0),
                    clearTimeout(timer)
                }
                )),
                utterThis.addEventListener("pause", (function(e) {
                    SAILogger.verbose("Speech has paused", e)
                }
                )),
                utterThis.addEventListener("resume", (function(e) {
                    SAILogger.verbose("Speech has resumed", e)
                }
                )),
                utterThis.addEventListener("boundary", (function(e) {
                    SAILogger.verbose(`Speech reached boundary. CharIndex: ${e.charIndex}`, e)
                }
                )),
                utterThis.addEventListener("mark", (function(e) {
                    SAILogger.info("Speech reached mark", e)
                }
                )),
                this.synth.speak(utterThis),
                this.lastUtterCharCount = formatText.length
            }
            ))
        }
        enableReadAloud() {
            this.enabled = !0,
            this.disableButton.classList.remove("disabled"),
            this.updateStorage(),
            document.querySelectorAll(".sai-repeat-button").forEach((e=>{
                e.classList.remove("sai-disabled")
            }
            ))
        }
        disableReadAloud() {
            this.queue = [],
            this.queueIdle = !0,
            this.synth.cancel(),
            this.disableButton.classList.add("disabled"),
            this.enabled = !1,
            this.updateStorage(),
            document.querySelectorAll(".sai-repeat-button").forEach((e=>{
                e.classList.add("sai-disabled")
            }
            ))
        }
        updateStorage() {
            window.localStorage.setItem(this.storageKey, this.enabled.toString())
        }
        setReadAloudFromStorage() {
            const enabled = window.localStorage.getItem(this.storageKey);
            enabled && (this.enabled = "true" === enabled,
            this.enabled ? this.enableReadAloud() : this.disableReadAloud())
        }
        getText(markdown) {
            const markdownElements = document.querySelectorAll(".text-base:not(.sai-skip) .markdown")
              , children = (markdown || markdownElements[markdownElements.length - 1])?.children ?? [];
            let text = "";
            for (const child of children)
                "PRE" !== child.nodeName && (text += child.textContent);
            return text = text.replace(/`/g, "").replace(/\*/g, "").replace(/\"/g, "").replace(/\\n/g, "").replace(/\\t/g, "").replace(/\\b/g, "").replace(/（/g, " (").replace(/）/g, ") ").replace(/？/g, "? ").replace(/：/g, ": ").replace(/！/g, "! ").replace(/。/g, ". "),
            text
        }
        reset() {
            SAILogger.warn("RESET read aloud queue"),
            this.queue = [],
            this.lastRead = Date.now()
        }
    }
    class SpeechImpl {
        constructor(lang, errorMessage, speechCallback) {
            this.lang = lang,
            this.errorMessage = errorMessage,
            this.transcript = "",
            this.recognition = new webkitSpeechRecognition,
            this.isRecording = !1,
            this.recognition.continuous = !0,
            this.recognition.interimResults = !0,
            this.recognition.onstart = ()=>{}
            ,
            this.recognition.onresult = event=>{
                let n = "";
                for (let i = event.resultIndex; i < event.results.length; ++i)
                    event.results[i].isFinal ? this.isRecording && (this.transcript += event.results[i][0].transcript,
                    speechCallback(this.transcript)) : n += event.results[i][0].transcript;
                this.isRecording && speechCallback(this.transcript + n)
            }
            ,
            this.recognition.onerror = event=>{
                let error = event.error;
                "not-allowed" === event.error && (error = "The webpage is not allowed to access your microphone"),
                "no-speech" === event.error && (error = "No sound from the microphone");
                let html = `\n        <span>\n          Error from Voice Control:\n          <br />\n          ${error}\n          <br /><br />\n          <em style="font-size: 10px; font-weight: normal;">\n            See voicecontrol.chat/support for help\n          </em>\n        </span>\n      `;
                this.errorMessage.write(html, 8e3),
                SAILogger.error(`recognition.onerror ${event.error}`)
            }
            ,
            this.recognition.onend = ()=>{
                SAILogger.info("Ended"),
                this.endCallback?.()
            }
        }
        start(endCallback) {
            SAILogger.info("Start"),
            this.endCallback = endCallback,
            this.recognition.lang = this.lang,
            this.recognition.start(),
            this.isRecording = !0
        }
        stop() {
            SAILogger.info(`Stop: ${this.transcript}`),
            this.isRecording = !1,
            this.recognition.stop(),
            this.endCallback = void 0
        }
        reset() {
            this.isRecording = !1,
            this.transcript = ""
        }
        setLang(langCode) {
            this.lang = langCode
        }
    }
    class SettingsImpl {
        constructor(readAloud) {
            this.readAloud = readAloud,
            this.showCompactUi = "true" === window.localStorage.getItem("sai-compact-ui"),
            this.appIsHidden = "true" === window.localStorage.getItem('"sai-hidden"'),
            this.settingsView = document.createElement("div"),
            this.settingsView.innerHTML = `<div id="sai-settings-header"> <h3>Voice Control for ChatGPT</h3> <button class="sai-button" id="sai-close-settings">Close</button> </div> <div id="sai-settings-view-inner"> <div class="sai-settings-col"> <section> <h4 id="sai-settings-read-aloud-header">Read aloud speed: <span id="sai-read-aloud-speed"></span></h4> <div class="sai-slidecontainer"> <input type="range" min="1" max="20" value="10" step="1" class="sai-slider" id="sai-popup-range-slider-speed" /> </div> </section> <section class="sai-settings-section"> <h4 id="sai-settings-read-aloud-header">Read aloud volume: <span id="sai-read-aloud-volume"></span></h4> <div class="sai-slidecontainer"> <input type="range" min="1" max="20" value="10" step="1" class="sai-slider" id="sai-popup-range-slider-volume" /> </div> </section>   <section class="sai-settings-section"> <h4>Voice preference</h4>          <div id="sai-voice-settings"></div>          <a href="https://voicecontrol.chat/install-voices" id="sai-settings-voice-link" target="_blank">            Install more voices          </a>        </section>        <section class="sai-settings-section">          <h4>Display settings</h4>          <p></p>          <button id="sai-ui-toggle" class="sai-button">            ${this.showCompactUi ? "Use classic interface" : "Use compact interface"}          </button>          <p></p>          <button id="sai-display-toggle" class="sai-button">            ${this.appIsHidden ? "Show " : "Hide "}            Voice Control          </button>        </section>        <section class="sai-settings-section">          <h4>Need help or have a suggestion?</h4>          <p>            If you have trouble loading voices or need help troubleshooting please            <a href="https://voicecontrol.chat/support" target="_blank">              see the FAQ.            </a>          </p>          <p>            If you have suggestions on how to improve the extension please share your ideas            <a href="https://forms.gle/BA3AU9LdApsZDBW28" target="_blank">              here.            </a>          </p>        </section>      </div>      <div class="sai-settings-col">        <h4>Keyboard shortcuts</h4>        <ul>        <li>          Press-and-hold <strong>SPACE</strong> (outside text input) to          record, and release to submit        </li>        <li>          Press <strong>ESC</strong> or <strong>Q</strong> to cancel a          transcription        </li>        <li>          Press <strong>E</strong> to stop and copy the transcription to the          ChatGPT input field without submitting        </li>      </ul>      <section class="sai-settings-section">        <p><em>Upgrade your language learning experience with <a class="sai-link-talkio" href="https://talkio.ai" target="_blank">Talkio AI</a>,        the premium version of this extension designed specifically for language learners.</em></p>      </section>      <section class="sai-settings-section">        <p>          The extension is created by <a href="https://twitter.com/theisof" target="_blank">Theis Frøhlich</a>          <br />          Please <a href="https://chrome.google.com/webstore/detail/voice-control-for-chatgpt/eollffkcakegifhacjnlnegohfdlidhn" target="_blank">leave a review</a>          if you like this extension.        </p>      </section>      </div>    </div>`,
            this.settingsView.id = "sai-settings-view",
            this.settingsView.classList.add("sai-hide")
        }
        setupListeners() {
            const sliderSpeedElement = document.getElementById("sai-popup-range-slider-speed")
              , sliderVolumeElement = document.getElementById("sai-popup-range-slider-volume")
              , speedElement = document.getElementById("sai-read-aloud-speed")
              , volumeElement = document.getElementById("sai-read-aloud-volume")
              , closeSettingsElement = document.getElementById("sai-close-settings")
              , displayToggleElement = document.getElementById("sai-display-toggle")
              , uiToggleElement = document.getElementById("sai-ui-toggle");
            if (!(sliderSpeedElement && sliderVolumeElement && speedElement && volumeElement && closeSettingsElement && displayToggleElement && uiToggleElement))
                return void SAILogger.warn("settings element missing");
            closeSettingsElement.onclick = ()=>{
                this.settingsView.classList.add("sai-hide")
            },
            displayToggleElement.onclick = ()=>{
                document.body.classList.toggle("sai-hidden");
                const hidden = window.localStorage.getItem('"sai-hidden"');
                hidden && "true" === hidden ? (window.localStorage.setItem('"sai-hidden"', "false"),
                this.appIsHidden = !1,
                displayToggleElement.innerText = "Hide Voice Control") : (window.localStorage.setItem('"sai-hidden"', "true"),
                this.appIsHidden = !0,
                this.readAloud.disableReadAloud(),
                displayToggleElement.innerText = "Show Voice Control")
            },
            uiToggleElement.onclick = ()=>{
                document.body.classList.toggle("sai-compact");
                const showCompactUi = window.localStorage.getItem("sai-compact-ui");
                showCompactUi && "true" === showCompactUi ? (window.localStorage.setItem("sai-compact-ui", "false"),
                this.showCompactUi = !1,
                uiToggleElement.innerText = "Compact interface") : (window.localStorage.setItem("sai-compact-ui", "true"),
                this.showCompactUi = !0,
                uiToggleElement.innerText = "Classic interface");
                document.getElementById("sai-root")?.remove()
            };
            const updateSpeed = speed=>{
                speedElement.innerHTML = speed;
                sliderSpeedElement.value = speed,
                window.localStorage.setItem("sai-voice-speed-v2", speed)
            };
            const updateVolume = volume=>{
              volumeElement.innerHTML = volume;
              sliderVolumeElement.value = volume,
              window.localStorage.setItem("sai-voice-volume-v2", volume)
          };
            sliderSpeedElement.oninput = event=>{
                const t = event.target;
                updateSpeed(t.value)
            };
            sliderVolumeElement.oninput = event=>{
              const t = event.target;
              updateVolume(t.value)
          };
            const voiceSpeed = window.localStorage.getItem("sai-voice-speed-v2");
            voiceSpeed && updateSpeed(voiceSpeed)
            const voiceVolume = window.localStorage.getItem("sai-voice-volume-v2");
            voiceVolume && updateVolume(voiceVolume)
        }
        createVoiceSelector() {
            const langCode = window.localStorage.getItem("sai-language") ?? "en-US"
              , filteredVoices = window.speechSynthesis.getVoices().filter((v=>matchLanguageCode(v.lang, langCode))).reverse()
              , preferenceVoice = window.localStorage.getItem("sai-voice-preference" + langCode)
              , selectElement = document.createElement("select");
            selectElement.id = "sai-voice-selector",
            selectElement.style.color = "black",
            selectElement.style.width = "100%",
            filteredVoices.forEach((v=>{
                const element = document.createElement("option");
                element.innerText = v.name,
                element.value = v.voiceURI,
                preferenceVoice === element.value && (element.selected = !0),
                selectElement.appendChild(element)
            }
            )),
            selectElement.onchange = event=>{
                const t = event.target;
                window.localStorage.setItem("sai-voice-preference" + langCode, t.value)
            }
            ;
            const voiceSettingsElement = document.getElementById("sai-voice-settings");
            voiceSettingsElement && (voiceSettingsElement.innerHTML = "",
            voiceSettingsElement.appendChild(selectElement))
        }
        labelFromSpeedValue(speed) {
            return speed
        }
    }
    class RepeatButton {
        constructor(readAloud) {
            const saiEnabled = "true" === window.localStorage.getItem("sai-read-aloud");
            this.element = document.createElement("div"),
            this.element.innerHTML = '<?xml version="1.0" encoding="utf-8"?>\n<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n<path fill-rule="evenodd" clip-rule="evenodd" d="M12.1657 2.14424C12.8728 2.50021 13 3.27314 13 3.7446V20.2561C13 20.7286 12.8717 21.4998 12.1656 21.8554C11.416 22.2331 10.7175 21.8081 10.3623 21.4891L4.95001 16.6248H3.00001C1.89544 16.6248 1.00001 15.7293 1.00001 14.6248L1 9.43717C1 8.3326 1.89543 7.43717 3 7.43717H4.94661L10.3623 2.51158C10.7163 2.19354 11.4151 1.76635 12.1657 2.14424ZM11 4.63507L6.00618 9.17696C5.82209 9.34439 5.58219 9.43717 5.33334 9.43717H3L3.00001 14.6248H5.33334C5.58015 14.6248 5.81823 14.716 6.00179 14.881L11 19.3731V4.63507Z" fill="#000000"/>\n<path d="M16.0368 4.73124C16.1852 4.19927 16.7368 3.88837 17.2688 4.03681C20.6116 4.9696 23 8.22106 23 12C23 15.779 20.6116 19.0304 17.2688 19.9632C16.7368 20.1117 16.1852 19.8007 16.0368 19.2688C15.8884 18.7368 16.1993 18.1852 16.7312 18.0368C19.1391 17.3649 21 14.9567 21 12C21 9.04332 19.1391 6.63512 16.7312 5.96321C16.1993 5.81477 15.8884 5.2632 16.0368 4.73124Z" fill="#000000"/>\n<path d="M16.2865 8.04192C15.7573 7.88372 15.2001 8.18443 15.0419 8.71357C14.8837 9.24271 15.1844 9.79992 15.7136 9.95812C16.3702 10.1544 17 10.9209 17 12C17 13.0791 16.3702 13.8456 15.7136 14.0419C15.1844 14.2001 14.8837 14.7573 15.0419 15.2865C15.2001 15.8156 15.7573 16.1163 16.2865 15.9581C17.9301 15.4667 19 13.8076 19 12C19 10.1924 17.9301 8.53333 16.2865 8.04192Z" fill="#000000"/>\n</svg>',
            this.element.classList.add("sai-repeat-button"),
            saiEnabled || this.element.classList.add("sai-disabled"),
            this.element.onclick = ()=>{
                const markdown = this.element.closest(".text-base")?.querySelector(".markdown");
                markdown ? readAloud.repeat(markdown) : SAILogger.warn("Could not find text element to repeat")
            }
        }
    }
    class RepeatHandler {
        constructor(readAloud) {
            this.readAloud = readAloud;
        }
        injectRepeatButtons() {
            document.querySelectorAll("article .text-base .flex-col .items-center .flex.items-center>div.flex").forEach((element=>{
                if (element.querySelectorAll(".sai-repeat-button").length > 0)
                    return;
                const repeatButton = new RepeatButton(this.readAloud);
                element.appendChild(repeatButton.element)
            }))
        }
    }
    const defaultLanguageCode = staticLangSupportList[0][1];
    class VoiceControl {
        constructor(reset=!1, waitForContent=!1) {
            this.isRecording = !1,
            this.language = defaultLanguageCode,
            this.spaceIsDown = !1,
            this.isCompact = "true" === window.localStorage.getItem("sai-compact-ui"),
            SAILogger.info("Init app");
            const chatGptInput = document.querySelector("textarea")
              , chatGptInputParent = document.querySelector('#composer-background');
            if (!chatGptInput || !chatGptInputParent)
                throw new Error("Missing elements");
            this.chatGptInput = chatGptInput,
            this.chatGptInputParent = chatGptInputParent,
            this.saiRoot = document.createElement("div"),
            this.saiRoot.id = "sai-root",
            this.saiInput = document.createElement("div"),
            this.saiInput.className = chatGptInput.classList.value + " sai-input",
            this.saiInputWrapper = document.createElement("div"),
            this.saiInputWrapper.id = "sai-input-wrapper",
            this.saiInputWrapper.className = this.chatGptInputParent.classList.value + " is-idle",
            this.saiInputWrapper.appendChild(this.saiInput),
            this.saiRoot.appendChild(this.saiInputWrapper),
            this.isCompact ? this.chatGptInputParent.before(this.saiRoot) : this.chatGptInputParent.after(this.saiRoot),
            this.saiCancelMsg = document.createElement("div"),
            this.saiCancelMsg.id = "sai-cancel-msg",
            this.saiCancelMsg.innerHTML = "press esc to cancel",
            this.saiInputWrapper.appendChild(this.saiCancelMsg),
            this.saiRecordButton = document.createElement("div"),
            this.saiRecordButton.id = "sai-speech-button",
            this.saiRecordButton.innerHTML = '<?xml version="1.0" ?><svg baseProfile="tiny" height="24px" id="Layer_1" version="1.2" viewBox="0 0 24 24" width="24px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M12,16c2.206,0,4-1.795,4-4V6c0-2.206-1.794-4-4-4S8,3.794,8,6v6C8,14.205,9.794,16,12,16z"/><path d="M19,12v-2c0-0.552-0.447-1-1-1s-1,0.448-1,1v2c0,2.757-2.243,5-5,5s-5-2.243-5-5v-2c0-0.552-0.447-1-1-1s-1,0.448-1,1v2   c0,3.52,2.613,6.432,6,6.92V20H8c-0.553,0-1,0.447-1,1s0.447,1,1,1h8c0.553,0,1-0.447,1-1s-0.447-1-1-1h-3v-1.08   C16.387,18.432,19,15.52,19,12z"/></g></svg>',
            this.saiInputWrapper.appendChild(this.saiRecordButton),
            this.saiButtonWrapper = document.createElement("div"),
            this.saiButtonWrapper.id = "sai-button-wrapper",
            this.saiSettingsButton = document.createElement("div"),
            this.saiSettingsButton.id = "sai-settings-button",
            this.saiSettingsButton.innerHTML = '<?xml version="1.0" encoding="UTF-8"?>\n\x3c!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools --\x3e\n<svg width="800px" height="800px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\n\n    <title>/svg/ic-settings</title>\n    <desc>Created with Sketch.</desc>\n    <defs>\n\n</defs>\n    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\n        <g id="ic-settings" fill="#ffffff">\n            <path d="M1,5 C1,4.44771525 1.44266033,4 1.99895656,4 L3.00104344,4 C3.55275191,4 4,4.44386482 4,5 C4,5.55228475 3.55733967,6 3.00104344,6 L1.99895656,6 C1.44724809,6 1,5.55613518 1,5 Z M12,5 C12,4.44771525 12.444837,4 12.9955775,4 L22.0044225,4 C22.5542648,4 23,4.44386482 23,5 C23,5.55228475 22.555163,6 22.0044225,6 L12.9955775,6 C12.4457352,6 12,5.55613518 12,5 Z M8,6 C7.44771525,6 7,5.55228475 7,5 C7,4.44771525 7.44771525,4 8,4 C8.55228475,4 9,4.44771525 9,5 C9,5.55228475 8.55228475,6 8,6 Z M8,8 C6.34314575,8 5,6.65685425 5,5 C5,3.34314575 6.34314575,2 8,2 C9.65685425,2 11,3.34314575 11,5 C11,6.65685425 9.65685425,8 8,8 Z M1,19 C1,18.4477153 1.44266033,18 1.99895656,18 L3.00104344,18 C3.55275191,18 4,18.4438648 4,19 C4,19.5522847 3.55733967,20 3.00104344,20 L1.99895656,20 C1.44724809,20 1,19.5561352 1,19 Z M12,19 C12,18.4477153 12.444837,18 12.9955775,18 L22.0044225,18 C22.5542648,18 23,18.4438648 23,19 C23,19.5522847 22.555163,20 22.0044225,20 L12.9955775,20 C12.4457352,20 12,19.5561352 12,19 Z M8,20 C7.44771525,20 7,19.5522847 7,19 C7,18.4477153 7.44771525,18 8,18 C8.55228475,18 9,18.4477153 9,19 C9,19.5522847 8.55228475,20 8,20 Z M8,22 C6.34314575,22 5,20.6568542 5,19 C5,17.3431458 6.34314575,16 8,16 C9.65685425,16 11,17.3431458 11,19 C11,20.6568542 9.65685425,22 8,22 Z M1,12 C1,11.4477153 1.4556644,11 1.99539757,11 L10.0046024,11 C10.5543453,11 11,11.4438648 11,12 C11,12.5522847 10.5443356,13 10.0046024,13 L1.99539757,13 C1.44565467,13 1,12.5561352 1,12 Z M19,12 C19,11.4477153 19.4433532,11 20.0093689,11 L21.9906311,11 C22.5480902,11 23,11.4438648 23,12 C23,12.5522847 22.5566468,13 21.9906311,13 L20.0093689,13 C19.4519098,13 19,12.5561352 19,12 Z M15,13 C14.4477153,13 14,12.5522847 14,12 C14,11.4477153 14.4477153,11 15,11 C15.5522847,11 16,11.4477153 16,12 C16,12.5522847 15.5522847,13 15,13 Z M15,15 C13.3431458,15 12,13.6568542 12,12 C12,10.3431458 13.3431458,9 15,9 C16.6568542,9 18,10.3431458 18,12 C18,13.6568542 16.6568542,15 15,15 Z" id="Combined-Shape">\n\n</path>\n        </g>\n    </g>\n</svg>',
            this.saiSettingsButton.onclick = ()=>{
                document.getElementById("sai-settings-view")?.classList.remove("sai-hide"),
                this.settings.createVoiceSelector()
            }
            ,
            this.saiErrorMessage = document.createElement("div"),
            this.saiErrorMessage.id = "sai-error-message",
            this.saiErrorMessage.innerHTML = "error",
            this.saiErrorMessage.style.display = "none",
            this.saiRoot.append(this.saiErrorMessage),
            this.errorMessage = new ErrorMessage(this.saiErrorMessage),
            this.speech = new SpeechImpl(this.language,this.errorMessage,this.speechCallback.bind(this)),
            this.readAloud = new ReadAloudImpl(this.language,reset, waitForContent),
            this.settings = new SettingsImpl(this.readAloud),
            this.speechHandlers();
            const langSelector = new LanguageSelector(this.setLanguage.bind(this), defaultLanguageCode);
            this.saiButtonWrapper.appendChild(langSelector.element),
            this.saiRoot.appendChild(this.saiButtonWrapper),
            this.saiButtonWrapper.appendChild(this.readAloud.skipButton),
            this.saiButtonWrapper.appendChild(this.readAloud.disableButton),
            this.saiButtonWrapper.appendChild(this.saiSettingsButton),
            this.saiRoot.appendChild(this.settings.settingsView),
            this.settings.setupListeners(),
            this.repeatHandler = new RepeatHandler(this.readAloud);
            document.querySelectorAll("#sai-root").length > 1 && this.errorMessage.write("<span>\n        Looks like Voice Control for ChatGPT is installed twice.\n        Please go to chrome://extensions and disable one of the installations\n        </span>\n        ", 7e3)
        }
        keyDownHandler(event) {
            const t = event.target;
            if ("textarea" === t?.localName || "Space" !== event.code || this.spaceIsDown || (this.holdSpaceTimer = setTimeout((()=>{
                SAILogger.info("Space start"),
                this.startRecording(),
                this.speech.start((()=>{
                    this.stopRecording()
                }
                ))
            }
            ), 250),
            this.spaceIsDown = !0),
            "textarea" !== t?.localName && "Space" === event.code && this.isRecording && this.isCompact && this.appToIdle(),
            "textarea" === t?.localName || "Escape" !== event.code && "KeyQ" !== event.code || !this.isRecording || (SAILogger.info(`Pressed ${event.code}`),
            this.appToIdle()),
            ("Escape" === event.code || "KeyQ" === event.code) && !this.isRecording) {
                SAILogger.info(`Pressed ${event.code}. Close settings`);
                document.getElementById("sai-settings-view")?.classList.add("sai-hide")
            }
            "KeyE" === event.code && this.isRecording && (SAILogger.info("Pressed KeyE"),
            this.chatGptInput.value = this.saiInput.innerText,
            this.appToIdle()),
            "textarea" !== t?.localName && "Enter" === event.code && this.isRecording && (SAILogger.info("Enter stop"),
            this.submitToChatGPT(this.chatGptInput.value),
            this.appToIdle())
        }
        keyUpHandler(event) {
            this.spaceIsDown && "Space" === event.code && (this.isCompact || (SAILogger.info("Space stop"),
            this.stopRecording()))
        }
        onSubmit() {
            SAILogger.info("on Submit"),
            this.appToIdle()
        }
        adjustCompactIconPos() {
            if (!this.isCompact)
                return;
            const offsetHeight = this.chatGptInput.offsetHeight
              , icon = document.querySelector("textarea + button.absolute.p-1.rounded-md");
            icon && (icon.style.marginRight = offsetHeight > 30 ? "0" : "35px")
        }
        speechHandlers() {
            this.spaceIsDown = !1,
            this.saiInputWrapper.onclick = ()=>{
                this.isRecording ? (this.speech.stop(),
                this.stopRecording()) : (this.startRecording(),
                this.speech.start((()=>{
                    this.stopRecording()
                }
                )))
            }
        }
        startRecording() {
            this.isRecording = !0,
            this.saiInputWrapper.classList.remove("is-idle")
        }
        stopRecording() {
            if (this.isCompact)
                this.chatGptInput.dispatchEvent(new Event("input",{
                    bubbles: !0
                }));
            else {
                const text = this.saiInput.innerText;
                this.submitToChatGPT(text)
            }
            this.appToIdle()
        }
        submitToChatGPT(text) {
            text.length > 0 && (this.chatGptInput.value += text,
            this.chatGptInput.dispatchEvent(new Event("input",{
                bubbles: !0
            })),
            setTimeout(() => this.chatGptInputParent.querySelectorAll('button')[6].click(), 100)
            )
        }
        appToIdle() {
            this.speech.stop(),
            this.speech.reset(),
            this.isRecording = !1,
            this.saiInput.innerText = "",
            this.saiInputWrapper.classList.add("is-idle"),
            this.spaceIsDown = !1,
            clearTimeout(this.holdSpaceTimer)
        }
        speechCallback(transcript) {
            this.isCompact ? transcript.length > 0 && (this.chatGptInput.value = transcript,
            this.chatGptInput.dispatchEvent(new Event("input",{
                bubbles: !0
            }))) : this.saiInput.innerText = transcript
        }
        setLanguage(langCode) {
            this.language = langCode,
            this.readAloud.setLang(langCode),
            this.speech.setLang(langCode)
        }
    }
    SAILogger.setup();
    window.localStorage.getItem("sai-voice-speed-v2") || window.localStorage.setItem("sai-voice-speed-v2", "10");
    window.localStorage.getItem("sai-voice-volume-v2") || window.localStorage.setItem("sai-voice-volume-v2", "10");
    "true" === window.localStorage.getItem('"sai-hidden"') && document.body.classList.add("sai-hidden");
    function initApp() {
        const fnCheckPath = () => /^\/c\/(.*)$/.test(window.location.pathname);
        let vc = new VoiceControl(!1, fnCheckPath())
          , flag = !1;
        const keydownListener = event=>{
            vc.keyDownHandler(event)
        }
          , keyupListener = event=>{
            vc.keyUpHandler(event)
        }
          , submitListener = event=>{
            "Enter" === event.code && vc.onSubmit()
        }
          , clickListener = ()=>{
            vc.onSubmit()
        }
        ;
        document.addEventListener("keydown", keydownListener),
        document.addEventListener("keyup", keyupListener);
        const buttonSelector = "form button.absolute.p-1.rounded-md.text-gray-500";
        function callback(observerCallback) {
            const root = document.getElementById("sai-root")
              , textarea = document.querySelector("textarea");
            vc?.adjustCompactIconPos(),
            vc?.repeatHandler?.injectRepeatButtons(),
            flag && textarea && (SAILogger.info("Re-init app"),
            root && root.remove(),
            vc = new VoiceControl(!0,fnCheckPath()),
            flag = !1,
            document.addEventListener("keydown", keydownListener),
            document.addEventListener("keyup", keyupListener),
            document.querySelector("textarea")?.addEventListener("keyup", submitListener),
            document.querySelector(buttonSelector)?.addEventListener("click", clickListener)),
            root && textarea || (SAILogger.warn("App removed"),
            root && root.remove(),
            vc.readAloud.reset(),
            document.removeEventListener("keydown", keydownListener),
            document.removeEventListener("keyup", keyupListener),
            document.querySelector("textarea")?.removeEventListener("keyup", submitListener),
            document.querySelector(buttonSelector)?.removeEventListener("click", clickListener),
            flag = !0),
            root && vc.readAloud.observerCallback(observerCallback)
        }
        document.querySelector("textarea")?.addEventListener("keyup", submitListener),
        document.querySelector(buttonSelector)?.addEventListener("click", clickListener);
        new MutationObserver(callback).observe(document.body, {
            childList: !0,
            subtree: !0,
            characterData: !0
        }),
        setInterval((()=>{
            callback([])
        }
        ), 3500)
    }
    "true" === window.localStorage.getItem("sai-compact-ui") && document.body.classList.add("sai-compact"),
    // chrome.runtime.onMessage.addListener(((message, sender, sendResponse)=>("sai-on-chatgpt-message" === message.key && sendResponse({
    //     value: "yes-we-are-here"
    // }),
    // !0)));
    document.querySelector("textarea") ? initApp() : setTimeout((()=>{
        initApp()
    }
    ), 2e3);
  })();