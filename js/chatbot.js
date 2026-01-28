/* ====================================
   GYM CHATBOT - AI ASSISTANT
   Simple, Smart, Helpful
==================================== */

const GymChatbot = {
    responses: {
        // Greetings
        greetings: [
            "Hello! I'm your FitPro gym assistant. How can I help you today?",
            "Hi there! Welcome to FitPro Gym. What can I do for you?",
            "Hey! I'm here to help you with gym information. Ask me anything!"
        ],
        
        // Member questions
        members: {
            keywords: ['member', 'members', 'how many', 'count', 'total members'],
            response: () => {
                const members = Storage.getMembers();
                const active = members.filter(m => m.paid).length;
                return `We currently have ${members.length} total members, with ${active} active memberships. ${members.length - active} payments are pending.`;
            }
        },
        
        // Membership plans
        plans: {
            keywords: ['plan', 'plans', 'membership', 'price', 'cost', 'how much'],
            response: () => {
                return `We offer 3 membership plans:\n\n` +
                       `💪 Monthly - $50/month\n` +
                       `💪 Quarterly - $135 (3 months)\n` +
                       `💪 Yearly - $500 (12 months)\n\n` +
                       `The yearly plan gives you the best value!`;
            }
        },
        
        // Attendance
        attendance: {
            keywords: ['attendance', 'present', 'today', 'checked in', 'who came'],
            response: () => {
                const attendance = Storage.getAttendance();
                const today = new Date().toISOString().split('T')[0];
                const todayCount = attendance.filter(a => a.date === today).length;
                return `${todayCount} members have checked in today. You can view full attendance details on the Attendance page.`;
            }
        },
        
        // Revenue
        revenue: {
            keywords: ['revenue', 'income', 'money', 'earning', 'profit'],
            response: () => {
                const members = Storage.getMembers();
                const prices = { Monthly: 50, Quarterly: 45, Yearly: 41.67 };
                const revenue = members
                    .filter(m => m.paid)
                    .reduce((sum, m) => sum + (prices[m.plan] || 0), 0);
                return `Current monthly revenue is $${revenue.toFixed(2)} from active memberships.`;
            }
        },
        
        // Expenses
        expenses: {
            keywords: ['expense', 'expenses', 'spending', 'costs'],
            response: () => {
                const expenses = Storage.getExpenses();
                const total = expenses.reduce((sum, e) => sum + e.amount, 0);
                const currentMonth = new Date().getMonth();
                const monthly = expenses
                    .filter(e => new Date(e.date).getMonth() === currentMonth)
                    .reduce((sum, e) => sum + e.amount, 0);
                return `Total expenses: $${total.toFixed(2)}\nThis month: $${monthly.toFixed(2)}`;
            }
        },
        
        // Add member
        addMember: {
            keywords: ['add member', 'new member', 'register', 'sign up', 'enroll'],
            response: () => {
                return `To add a new member:\n\n` +
                       `1. Go to the Members page\n` +
                       `2. Fill in the member's details (name, email, phone)\n` +
                       `3. Select a membership plan\n` +
                       `4. Click "Add Member"\n\n` +
                       `A unique membership ID will be generated automatically!`;
            }
        },
        
        // Mark attendance
        markAttendance: {
            keywords: ['mark attendance', 'check in', 'attendance entry', 'mark present'],
            response: () => {
                return `To mark attendance:\n\n` +
                       `1. Go to the Attendance page\n` +
                       `2. Select the member from the dropdown\n` +
                       `3. Click "Mark Present"\n\n` +
                       `The system will automatically record the time and date!`;
            }
        },
        
        // Payment
        payment: {
            keywords: ['payment', 'pay', 'paid', 'pending payment', 'due'],
            response: () => {
                const members = Storage.getMembers();
                const pending = members.filter(m => !m.paid).length;
                return `${pending} members have pending payments. You can update payment status from the Members page by clicking the dollar sign ($) icon.`;
            }
        },
        
        // Features
        features: {
            keywords: ['features', 'what can', 'capabilities', 'functions', 'what do'],
            response: () => {
                return `FitPro Gym Management System features:\n\n` +
                       `📊 Dashboard - View statistics\n` +
                       `👥 Members - Manage members\n` +
                       `📋 Attendance - Track check-ins\n` +
                       `💰 Expenses - Monitor costs\n` +
                       `📈 Reports - View analytics\n` +
                       `🌙 Dark/Light theme toggle`;
            }
        },
        
        // Help
        help: {
            keywords: ['help', 'support', 'how to', 'guide', 'tutorial'],
            response: () => {
                return `I can help you with:\n\n` +
                       `• Member information and statistics\n` +
                       `• Membership plans and pricing\n` +
                       `• Attendance tracking\n` +
                       `• Revenue and expenses\n` +
                       `• How to use different features\n\n` +
                       `Just ask me anything!`;
            }
        },
        
        // Expiring memberships
        expiring: {
            keywords: ['expiring', 'expire', 'expiry', 'ending', 'renewal'],
            response: () => {
                const members = Storage.getMembers();
                const today = new Date();
                const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                const expiring = members.filter(m => {
                    if (!m.expiryDate) return false;
                    const expiry = new Date(m.expiryDate);
                    return m.paid && expiry > today && expiry <= sevenDaysFromNow;
                });
                if (expiring.length > 0) {
                    return `⚠️ ${expiring.length} membership(s) expiring in the next 7 days:\n\n` +
                           expiring.map(m => `• ${m.name} - Expires ${Utils.formatDate(m.expiryDate)}`).join('\n');
                }
                return `No memberships expiring in the next 7 days. All good! ✅`;
            }
        },
        
        // Thanks
        thanks: {
            keywords: ['thank', 'thanks', 'appreciate'],
            response: () => {
                return `You're welcome! Happy to help! 😊 Feel free to ask if you need anything else.`;
            }
        },
        
        // Goodbye
        goodbye: {
            keywords: ['bye', 'goodbye', 'see you', 'later'],
            response: () => {
                return `Goodbye! Have a great workout! 💪 I'll be here if you need me.`;
            }
        }
    },

    // Initialize chatbot
    init: function() {
        this.createChatUI();
        this.attachEventListeners();
    },

    // Create chat UI
    createChatUI: function() {
        const chatHTML = `
            <div id="chatbot" class="chatbot-container">
                <div class="chatbot-header">
                    <div class="chatbot-header-content">
                        <i class="fas fa-robot"></i>
                        <div>
                            <h4>FitPro Assistant</h4>
                            <span class="chatbot-status">Online</span>
                        </div>
                    </div>
                    <button class="chatbot-toggle" onclick="GymChatbot.toggleChat()">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
                <div class="chatbot-messages" id="chatMessages">
                    <div class="bot-message">
                        <div class="message-avatar">🤖</div>
                        <div class="message-content">
                            ${this.responses.greetings[0]}
                        </div>
                    </div>
                </div>
                <div class="chatbot-input">
                    <input 
                        type="text" 
                        id="chatInput" 
                        placeholder="Ask me anything..."
                        onkeypress="if(event.key === 'Enter') GymChatbot.sendMessage()"
                    >
                    <button onclick="GymChatbot.sendMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
            
            <button class="chatbot-fab" onclick="GymChatbot.openChat()">
                <i class="fas fa-comments"></i>
                <span class="chatbot-badge">💬</span>
            </button>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
    },

    // Attach event listeners
    attachEventListeners: function() {
        const input = document.getElementById('chatInput');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
    },

    // Open chat
    openChat: function() {
        document.getElementById('chatbot').classList.add('active');
        document.querySelector('.chatbot-fab').style.display = 'none';
        document.getElementById('chatInput').focus();
    },

    // Toggle chat
    toggleChat: function() {
        const chatbot = document.getElementById('chatbot');
        const fab = document.querySelector('.chatbot-fab');
        
        if (chatbot.classList.contains('active')) {
            chatbot.classList.remove('active');
            fab.style.display = 'flex';
        } else {
            chatbot.classList.add('active');
            fab.style.display = 'none';
            document.getElementById('chatInput').focus();
        }
    },

    // Send message
    sendMessage: function() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Show typing indicator
        this.showTyping();

        // Get bot response
        setTimeout(() => {
            this.hideTyping();
            const response = this.getResponse(message);
            this.addMessage(response, 'bot');
        }, 800);
    },

    // Add message to chat
    addMessage: function(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageHTML = sender === 'user' ? `
            <div class="user-message">
                <div class="message-content">${text}</div>
                <div class="message-avatar">👤</div>
            </div>
        ` : `
            <div class="bot-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">${text}</div>
            </div>
        `;

        messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // Show typing indicator
    showTyping: function() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingHTML = `
            <div class="bot-message typing-indicator" id="typingIndicator">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // Hide typing indicator
    hideTyping: function() {
        const typing = document.getElementById('typingIndicator');
        if (typing) typing.remove();
    },

    // Get bot response
    getResponse: function(message) {
        const lowerMessage = message.toLowerCase();

        // Check for greetings
        if (/^(hi|hello|hey|yo|sup)$/i.test(lowerMessage)) {
            return this.responses.greetings[Math.floor(Math.random() * this.responses.greetings.length)];
        }

        // Check each response category
        for (const [key, value] of Object.entries(this.responses)) {
            if (key === 'greetings') continue;
            
            if (value.keywords) {
                const matched = value.keywords.some(keyword => 
                    lowerMessage.includes(keyword.toLowerCase())
                );
                
                if (matched) {
                    return typeof value.response === 'function' 
                        ? value.response() 
                        : value.response;
                }
            }
        }

        // Default response
        return `I'm not sure about that. Try asking me about:\n\n` +
               `• Member information\n` +
               `• Membership plans\n` +
               `• Attendance records\n` +
               `• Revenue and expenses\n` +
               `• How to use features\n\n` +
               `Type "help" for more options!`;
    }
};

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on authenticated pages
    if (Auth.isAuthenticated() && window.location.pathname.split("/").pop() !== "index.html") {
        GymChatbot.init();
    }
});