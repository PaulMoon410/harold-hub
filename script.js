// Harold Chat Script - Base44 Backend Edition with Extensions Support

class HaroldChat {
  constructor() {
    this.messages = document.getElementById('messages');
    this.chatForm = document.getElementById('chat-form');
    this.messageInput = document.getElementById('message-input');
    this.sendBtn = document.querySelector('.send-btn');

    // Base44 API URL - update with your deployed Base44 app URL
    this.base44ApiUrl = 'https://app.base44.com/api/functions/chat';

    this.sessionId = this.generateSessionId();
    this.messageHistory = [];

    // Extensions loaded from the pool registry
    this.extensions = [];
    this.loadExtensions();

    this.init();
  }

  init() {
    this.chatForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
    this.messageInput.addEventListener('input', () => this.updateSendButton());
    this.messageInput.focus();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  updateSendButton() {
    this.sendBtn.disabled = !this.messageInput.value.trim();
  }

  async handleChatSubmit(e) {
    e.preventDefault();

    const message = this.messageInput.value.trim();
    if (!message) return;

    this.addMessage(message, 'user');
    this.messageHistory.push({ role: 'user', content: message });
    this.messageInput.value = '';
    this.updateSendButton();

    this.showTyping();

    try {
      const response = await this.sendMessageToBase44(message, this.messageHistory);
      this.hideTyping();
      this.addMessage(response, 'bot');
      this.messageHistory.push({ role: 'assistant', content: response });
    } catch (error) {
      console.error('Error:', error);
      this.hideTyping();
      this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
    }
  }

  async sendMessageToBase44(message, history) {
    const response = await fetch(this.base44ApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        history,
        sessionId: this.sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  }

  // ---- Extensions ----

  async loadExtensions() {
    try {
      const res = await fetch('/extensions/registry.json');
      if (!res.ok) return;
      const data = await res.json();
      this.extensions = Array.isArray(data.extensions) ? data.extensions : [];
      this.renderExtensions();
    } catch (e) {
      // No registry yet, ignore
    }
  }

  renderExtensions() {
    const container = document.getElementById('extensions-list');
    if (!container) return;
    container.innerHTML = '';
    if (this.extensions.length === 0) {
      container.innerHTML = '<p class="ext-empty">No extensions registered yet.</p>';
      return;
    }
    this.extensions.forEach((ext) => {
      const item = document.createElement('div');
      item.className = 'ext-item';
      item.innerHTML = `
        <strong>${escapeHtml(ext.name)}</strong>
        <span>${escapeHtml(ext.description || '')}</span>
        <small>by ${escapeHtml(ext.publisher || 'unknown')}</small>
      `;
      container.appendChild(item);
    });
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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  new HaroldChat();
});