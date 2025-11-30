/**
 * Text-to-Speech and Speech Recognition service
 */

import { getSelectedVoice } from './configService';

let speechSynthesis = null;
let speechRecognition = null;

/**
 * Initialize speech synthesis
 */
export function initSpeechSynthesis() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSynthesis = window.speechSynthesis;
  }
}

/**
 * Get available Japanese voices
 * @returns {Array} Array of Japanese voice options
 */
export function getJapaneseVoices() {
  if (!speechSynthesis) {
    initSpeechSynthesis();
  }
  
  const voices = speechSynthesis?.getVoices() || [];
  return voices.filter(voice => voice.lang.startsWith('ja'));
}

/**
 * Speak Japanese text
 * @param {string} text - Text to speak
 * @param {string} voiceName - Optional: specific voice name (if not provided, uses setting)
 * @param {number} rate - Speech rate (0.1 to 10)
 * @param {number} pitch - Speech pitch (0 to 2)
 * @returns {Promise}
 */
export function speakJapanese(text, voiceName = null, rate = 1.0, pitch = 1.0) {
  return new Promise((resolve, reject) => {
    if (!speechSynthesis) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }
    
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    // Get voice name from parameter or settings
    const targetVoiceName = voiceName || getSelectedVoice();
    
    // Set voice if specified
    if (targetVoiceName) {
      const voices = getJapaneseVoices();
      const voice = voices.find(v => v.name === targetVoiceName);
      if (voice) {
        utterance.voice = voice;
      }
    } else {
      // Use first Japanese voice
      const voices = getJapaneseVoices();
      if (voices.length > 0) {
        utterance.voice = voices[0];
      }
    }
    
    utterance.onend = () => resolve();
    utterance.onerror = (error) => reject(error);
    
    speechSynthesis.speak(utterance);
  });
}

/**
 * Stop current speech
 */
export function stopSpeaking() {
  if (speechSynthesis) {
    speechSynthesis.cancel();
  }
}

/**
 * Initialize speech recognition
 */
export function initSpeechRecognition() {
  if (typeof window !== 'undefined') {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognition = new SpeechRecognition();
      speechRecognition.lang = 'ja-JP';
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
    }
  }
}

/**
 * Start recording speech
 * @returns {Promise<string>} Recognized text
 */
export function startRecording() {
  return new Promise((resolve, reject) => {
    if (!speechRecognition) {
      initSpeechRecognition();
    }
    
    if (!speechRecognition) {
      reject(new Error('Speech recognition not supported'));
      return;
    }
    
    speechRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };
    
    speechRecognition.onerror = (error) => {
      reject(error);
    };
    
    speechRecognition.start();
  });
}

/**
 * Stop recording
 */
export function stopRecording() {
  if (speechRecognition) {
    speechRecognition.stop();
  }
}

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Check if speech recognition is supported
 */
export function isSpeechRecognitionSupported() {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}
