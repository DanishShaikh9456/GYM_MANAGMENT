/* ====================================
   ENHANCED DASHBOARD - NO BACKEND
==================================== */

function calculateStats() {
    const members = Storage.getMembers();
    const expenses = Storage.getExpenses();
    const attendance = Storage.getAttendance();

    const planPrices = {
        'Monthly': 50,
        'Quarterly': 45,
        'Yearly': 41.67
    };

    const totalRevenue = members.reduce((sum, member) => {
        if (member.paid) {
            return sum + (planPrices[member.plan] || 0);
        }
        return sum;
    }, 0);

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today).length;

    const currentMonth = new Date().getMonth();
    const monthlyExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === currentMonth)
        .reduce((sum, e) => sum + e.amount, 0);

    return {
        totalMembers: members.length,
        activeMemberships: members.filter(m => m.paid).length,
        pendingPayments: members.filter(m => !m.paid).length,
        totalRevenue: totalRevenue.toFixed(2),
        todayAttendance,
        monthlyExpenses: monthlyExpenses.toFixed(2),
        planStats: {
            Monthly: members.filter(m => m.plan === 'Monthly').length,
            Quarterly: members.filter(m => m.plan === 'Quarterly').length,
            Yearly: members.filter(m => m.plan === 'Yearly').length
        }
    };
}

function updateDashboard() {
    const stats = calculateStats();

    Utils.animateValue('totalMembers', 0, stats.totalMembers, 1000);
    Utils.animateValue('activeMemberships', 0, stats.activeMemberships, 1000);
    Utils.animateValue('pendingPayments', 0, stats.pendingPayments, 1000);
    
    const revenueEl = document.getElementById("totalRevenue");
    if (revenueEl) {
        revenueEl.textContent = `$${stats.totalRevenue}`;
    }

    const todayAttEl = document.getElementById("todayAttendance");
    if (todayAttEl) {
        Utils.animateValue('todayAttendance', 0, stats.todayAttendance, 800);
    }
}

function loadRecentMembers() {
    const tableBody = document.getElementById("recentMembersTable");
    if (!tableBody) return;

    const members = Storage.getMembers();

    if (members.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No members yet. Add your first member!</p>
                </td>
            </tr>
        `;
        return;
    }

    const recentMembers = members
        .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
        .slice(0, 5);

    tableBody.innerHTML = recentMembers.map(member => `
        <tr>
            <td>
                <div class="member-info">
                    <div class="member-avatar">${Utils.getInitials(member.name)}</div>
                    <div class="member-details">
                        <h4>${member.name}</h4>
                        <p>${member.email}</p>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge warning">
                    <i class="fas fa-id-card"></i> ${member.plan}
                </span>
            </td>
            <td>
                <span class="badge ${member.paid ? 'paid' : 'due'}">
                    <i class="fas fa-${member.paid ? 'check-circle' : 'clock'}"></i>
                    ${member.paid ? 'Paid' : 'Due'}
                </span>
            </td>
            <td>${Utils.formatDate(member.joinDate)}</td>
        </tr>
    `).join('');
}

function loadPlanStats() {
    const stats = calculateStats();
    Utils.animateValue('monthlyCount', 0, stats.planStats.Monthly, 800);
    Utils.animateValue('quarterlyCount', 0, stats.planStats.Quarterly, 800);
    Utils.animateValue('yearlyCount', 0, stats.planStats.Yearly, 800);
}

function loadExpiringMemberships() {
    const members = Storage.getMembers();
    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiring = members.filter(member => {
        if (!member.expiryDate) return false;
        const expiryDate = new Date(member.expiryDate);
        return member.paid && expiryDate > today && expiryDate <= sevenDaysFromNow;
    });

    if (expiring.length > 0) {
        setTimeout(() => {
            Utils.showNotification(`${expiring.length} membership(s) expiring soon!`, 'error');
        }, 1000);
    }
}

function initDashboard() {
    updateDashboard();
    loadRecentMembers();
    loadPlanStats();
    loadExpiringMemberships();
}

document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("totalMembers")) {
        initDashboard();
        setInterval(initDashboard, 30000);
    }
});