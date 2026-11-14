// Harold Portal Chat Script - Full Stack Edition

class HaroldChat {
  constructor() {
    this.messages = document.getElementById('messages');
    this.chatForm = document.getElementById('chat-form');
    this.messageInput = document.getElementById('message-input');
    this.sendBtn = document.querySelector('.send-btn');

    // API URLs - update for production
    this.chatApiUrl = '/api/chat';
    this.ftpApiUrl = '/api/ftp';

    this.socket = null;
    this.sessionId = this.generateSessionId();
    this.messageHistory = [];

    this.init();
  }

  init() {
    this.chatForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
    this.messageInput.addEventListener('input', () => this.updateSendButton());

    // Connect WebSocket for real-time events
    this.connectWebSocket();

    // Focus on input
    this.messageInput.focus();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  connectWebSocket() {
    if (typeof io !== 'undefined') {
      this.socket = io();

      this.socket.on('harold-event', (event) => {
        this.handleRealtimeEvent(event);
      });

      this.socket.on('connect', () => {
        this.socket.emit('join', this.sessionId);
      });
    }
  }

  handleRealtimeEvent(event) {
    const { event: eventType, data, timestamp } = event;

    // Add system message about the event
    this.addSystemMessage(
      `[System] ${eventType}: ${JSON.stringify(data)}`
    );
  }

  addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = 'S';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.style.background = '#fef3c7';
    bubbleDiv.style.borderColor = '#f59e0b';
    bubbleDiv.textContent = text;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = this.getCurrentTime();

    contentDiv.appendChild(bubbleDiv);
    contentDiv.appendChild(timeDiv);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    this.messages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  updateSendButton() {
    this.sendBtn.disabled = !this.messageInput.value.trim();
  }

  async handleChatSubmit(e) {
    e.preventDefault();

    const message = this.messageInput.value.trim();
    if (!message) return;

    // Add user message
    this.addMessage(message, 'user');
    this.messageHistory.push({ role: 'user', content: message });

    // Clear input
    this.messageInput.value = '';
    this.updateSendButton();

    // Show typing indicator
    this.showTyping();

    try {
      // Send to backend
      const response = await this.sendMessageToBackend(message, this.messageHistory);

      // Hide typing indicator
      this.hideTyping();

      // Add bot response
      this.addMessage(response, 'bot');
      this.messageHistory.push({ role: 'assistant', content: response });
    } catch (error) {
      console.error('Error sending message:', error);
      this.hideTyping();
      this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
  }

  async sendMessageToBackend(message, history) {
    const response = await fetch(this.chatApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, history, sessionId: this.sessionId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  async loadFiles() {
    try {
      const response = await fetch(this.ftpApiUrl + '/files');
      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error loading files:', error);
      return [];
    }
  }

  async searchFiles(pattern) {
    try {
      const response = await fetch(this.ftpApiUrl + '/search?pattern=' + encodeURIComponent(pattern));
      const data = await response.json();
      return data.files || [];
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = sender === 'bot' ? 'H' : 'U';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = text;

    const timeDiv = document.createElement('div');
    timeDiv.className = 'message-time';
    timeDiv.textContent = this.getCurrentTime();

    contentDiv.appendChild(bubbleDiv);
    contentDiv.appendChild(timeDiv);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    this.messages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  showTyping() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';

    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.textContent = 'H';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

    contentDiv.appendChild(bubbleDiv);
    typingDiv.appendChild(avatar);
    typingDiv.appendChild(contentDiv);

    this.messages.appendChild(typingDiv);
    this.scrollToBottom();
  }

  hideTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  scrollToBottom() {
    this.messages.scrollTop = this.messages.scrollHeight;
  }

  getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
  new HaroldChat();
});