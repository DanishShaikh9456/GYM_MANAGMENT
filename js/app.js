/* ====================================
   ENHANCED GYM MANAGEMENT SYSTEM
   Pure JavaScript - No Backend
   Version: 3.0
==================================== */

/* ====================================
   AUTHENTICATION MODULE
==================================== */
const Auth = {
    login: function(username, password) {
        if (username === "admin" && password === "admin") {
            const userData = {
                username: username,
                loginTime: new Date().toISOString(),
                isAuthenticated: true
            };
            localStorage.setItem("auth", JSON.stringify(userData));
            return true;
        }
        return false;
    },

    isAuthenticated: function() {
        const authData = localStorage.getItem("auth");
        if (!authData) return false;
        try {
            const userData = JSON.parse(authData);
            return userData.isAuthenticated === true;
        } catch (e) {
            return false;
        }
    },

    logout: function() {
        localStorage.removeItem("auth");
        window.location.href = "index.html";
    },

    guard: function() {
        const currentPage = window.location.pathname.split("/").pop();
        const publicPages = ["index.html", ""];
        if (!publicPages.includes(currentPage) && !this.isAuthenticated()) {
            window.location.href = "index.html";
        }
    },

    getCurrentUser: function() {
        const authData = localStorage.getItem("auth");
        if (!authData) return null;
        try {
            return JSON.parse(authData);
        } catch (e) {
            return null;
        }
    }
};

/* ====================================
   THEME MODULE
==================================== */
const Theme = {
    toggle: function() {
        document.body.classList.toggle("dark");
        const isDark = document.body.classList.contains("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        this.updateIcon();
    },

    init: function() {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.body.classList.add("dark");
        }
        this.updateIcon();
    },

    updateIcon: function() {
        const icons = document.querySelectorAll(".theme-toggle i");
        const isDark = document.body.classList.contains("dark");
        icons.forEach(icon => {
            icon.className = isDark ? "fas fa-sun" : "fas fa-moon";
        });
    }
};

/* ====================================
   STORAGE MODULE - ENHANCED
==================================== */
const Storage = {
    // Members
    getMembers: function() {
        try {
            const data = localStorage.getItem("members");
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Error reading members:", e);
            return [];
        }
    },

    saveMembers: function(members) {
        try {
            localStorage.setItem("members", JSON.stringify(members));
            return true;
        } catch (e) {
            console.error("Error saving members:", e);
            return false;
        }
    },

    addMember: function(memberData) {
        const members = this.getMembers();
        const newMember = {
            id: Date.now(),
            name: memberData.name,
            email: memberData.email,
            phone: memberData.phone,
            plan: memberData.plan,
            paid: false,
            joinDate: new Date().toISOString(),
            lastPayment: null,
            membershipId: this.generateMembershipId(),
            expiryDate: this.calculateExpiryDate(memberData.plan),
            address: memberData.address || '',
            emergencyContact: memberData.emergencyContact || ''
        };
        members.push(newMember);
        return this.saveMembers(members) ? newMember : null;
    },

    updateMember: function(id, memberData) {
        const members = this.getMembers();
        const index = members.findIndex(m => m.id === id);
        if (index !== -1) {
            members[index] = { ...members[index], ...memberData };
            return this.saveMembers(members);
        }
        return false;
    },

    deleteMember: function(id) {
        const members = this.getMembers();
        const filtered = members.filter(m => m.id !== id);
        return this.saveMembers(filtered);
    },

    togglePayment: function(id) {
        const members = this.getMembers();
        const member = members.find(m => m.id === id);
        if (member) {
            member.paid = !member.paid;
            if (member.paid) {
                member.lastPayment = new Date().toISOString();
                member.expiryDate = this.calculateExpiryDate(member.plan);
            }
            return this.saveMembers(members);
        }
        return false;
    },

    generateMembershipId: function() {
        return 'FP' + Date.now().toString().slice(-8);
    },

    calculateExpiryDate: function(plan) {
        const date = new Date();
        switch (plan) {
            case 'Monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'Quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'Yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
        }
        return date.toISOString();
    },

    // Attendance
    getAttendance: function() {
        try {
            const data = localStorage.getItem("attendance");
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveAttendance: function(attendance) {
        try {
            localStorage.setItem("attendance", JSON.stringify(attendance));
            return true;
        } catch (e) {
            return false;
        }
    },

    markAttendance: function(memberId, memberName) {
        const attendance = this.getAttendance();
        const record = {
            id: Date.now(),
            memberId,
            memberName,
            checkIn: new Date().toISOString(),
            date: new Date().toISOString().split('T')[0]
        };
        attendance.push(record);
        return this.saveAttendance(attendance) ? record : null;
    },

    // Expenses
    getExpenses: function() {
        try {
            const data = localStorage.getItem("expenses");
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveExpenses: function(expenses) {
        try {
            localStorage.setItem("expenses", JSON.stringify(expenses));
            return true;
        } catch (e) {
            return false;
        }
    },

    addExpense: function(expenseData) {
        const expenses = this.getExpenses();
        const user = Auth.getCurrentUser();
        const expense = {
            id: Date.now(),
            category: expenseData.category,
            amount: parseFloat(expenseData.amount),
            description: expenseData.description,
            date: new Date().toISOString(),
            createdBy: user ? user.username : 'Admin'
        };
        expenses.push(expense);
        return this.saveExpenses(expenses) ? expense : null;
    },

    deleteExpense: function(id) {
        const expenses = this.getExpenses();
        const filtered = expenses.filter(e => e.id !== id);
        return this.saveExpenses(filtered);
    },

    // Trainers
    getTrainers: function() {
        try {
            const data = localStorage.getItem("trainers");
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveTrainers: function(trainers) {
        try {
            localStorage.setItem("trainers", JSON.stringify(trainers));
            return true;
        } catch (e) {
            return false;
        }
    },

    addTrainer: function(trainerData) {
        const trainers = this.getTrainers();
        const trainer = {
            id: Date.now(),
            ...trainerData,
            joinDate: new Date().toISOString()
        };
        trainers.push(trainer);
        return this.saveTrainers(trainers) ? trainer : null;
    },

    deleteTrainer: function(id) {
        const trainers = this.getTrainers();
        const filtered = trainers.filter(t => t.id !== id);
        return this.saveTrainers(filtered);
    },

    // Classes
    getClasses: function() {
        try {
            const data = localStorage.getItem("classes");
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveClasses: function(classes) {
        try {
            localStorage.setItem("classes", JSON.stringify(classes));
            return true;
        } catch (e) {
            return false;
        }
    },

    addClass: function(classData) {
        const classes = this.getClasses();
        const newClass = {
            id: Date.now(),
            ...classData,
            enrolled: 0,
            active: true
        };
        classes.push(newClass);
        return this.saveClasses(classes) ? newClass : null;
    },

    deleteClass: function(id) {
        const classes = this.getClasses();
        const filtered = classes.filter(c => c.id !== id);
        return this.saveClasses(filtered);
    }
};

/* ====================================
   UTILITY FUNCTIONS
==================================== */
const Utils = {
    formatDate: function(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    getInitials: function(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    showNotification: function(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone: function(phone) {
        const re = /^[\d\s\-\+\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    animateValue: function(id, start, end, duration) {
        const obj = document.getElementById(id);
        if (!obj) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.textContent = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
};

/* ====================================
   LOGIN PAGE FUNCTIONS
==================================== */
function login() {
    const username = document.getElementById("user").value.trim();
    const password = document.getElementById("pass").value;

    if (!username || !password) {
        Utils.showNotification("Please fill in all fields", "error");
        return;
    }

    if (Auth.login(username, password)) {
        Utils.showNotification("Login successful!", "success");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 500);
    } else {
        Utils.showNotification("Invalid username or password", "error");
    }
}

function togglePasswordVisibility() {
    const passwordInput = document.getElementById("pass");
    const toggleIcon = document.querySelector(".toggle-password i");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.className = "fas fa-eye-slash";
    } else {
        passwordInput.type = "password";
        toggleIcon.className = "fas fa-eye";
    }
}

/* ====================================
   GLOBAL FUNCTIONS
==================================== */
function logout() {
    if (confirm("Are you sure you want to logout?")) {
        Auth.logout();
    }
}

function toggleTheme() {
    Theme.toggle();
}

/* ====================================
   INITIALIZATION
==================================== */
document.addEventListener("DOMContentLoaded", function() {
    Theme.init();
    Auth.guard();
    
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function(e) {
            e.preventDefault();
            login();
        });
    }
});

/* ====================================
   NOTIFICATION STYLES
==================================== */
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 16px 24px;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid #10b981;
    }
    
    .notification-error {
        border-left: 4px solid #ef4444;
    }
    
    .notification i {
        font-size: 20px;
    }
    
    .notification-success i {
        color: #10b981;
    }
    
    .notification-error i {
        color: #ef4444;
    }
    
    body.dark .notification {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }
`;
document.head.appendChild(notificationStyles);