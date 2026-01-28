/* ====================================
   ATTENDANCE PAGE - NO BACKEND
==================================== */

let members = [];
let todayAttendance = [];

function loadMembersDropdown() {
    members = Storage.getMembers();
    const select = document.getElementById('memberId');
    
    select.innerHTML = '<option value="">Choose a member...</option>';
    
    members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} - ${member.membershipId || 'N/A'}`;
        option.dataset.name = member.name;
        select.appendChild(option);
    });
}

function markAttendance(e) {
    e.preventDefault();
    
    const select = document.getElementById('memberId');
    const memberId = parseInt(select.value);
    
    if (!memberId) {
        Utils.showNotification('Please select a member', 'error');
        return;
    }
    
    const memberName = select.options[select.selectedIndex].dataset.name;
    const record = Storage.markAttendance(memberId, memberName);
    
    if (record) {
        Utils.showNotification(`Attendance marked for ${memberName}`, 'success');
        select.value = '';
        loadTodayAttendance();
        updateStats();
    } else {
        Utils.showNotification('Error marking attendance', 'error');
    }
}

function loadTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    const allAttendance = Storage.getAttendance();
    todayAttendance = allAttendance.filter(a => a.date === today);
    
    const tableBody = document.getElementById('attendanceTable');
    
    if (todayAttendance.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No attendance records for today</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = todayAttendance
        .sort((a, b) => new Date(b.checkIn) - new Date(a.checkIn))
        .map(record => {
            const checkInTime = new Date(record.checkIn);
            const duration = calculateDuration(record.checkIn);
            const member = members.find(m => m.id === record.memberId);
            
            return `
                <tr>
                    <td>
                        <div class="member-info">
                            <div class="member-avatar">${Utils.getInitials(record.memberName)}</div>
                            <div class="member-details">
                                <h4>${record.memberName}</h4>
                            </div>
                        </div>
                    </td>
                    <td><strong>${member?.membershipId || 'N/A'}</strong></td>
                    <td>
                        <i class="fas fa-clock"></i> 
                        ${checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td>${duration}</td>
                    <td>
                        <span class="badge paid">
                            <i class="fas fa-check-circle"></i> Present
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
}

function calculateDuration(checkIn) {
    const start = new Date(checkIn);
    const now = new Date();
    const diff = Math.floor((now - start) / 1000 / 60);
    
    if (diff < 60) {
        return `${diff} min`;
    }
    
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
}

function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    const allAttendance = Storage.getAttendance();
    const todayCount = allAttendance.filter(a => a.date === today).length;
    
    document.getElementById('todayAttendance').textContent = todayCount;
    
    const allMembers = Storage.getMembers();
    if (allMembers.length > 0) {
        const avgPercent = ((todayCount / allMembers.length) * 100).toFixed(0);
        document.getElementById('avgAttendance').textContent = `${avgPercent}%`;
    }
}

function updateClock() {
    const now = new Date();
    
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeStr;
    
    const dateStr = now.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
    document.getElementById('currentDate').textContent = dateStr;
}

function filterByDate() {
    const dateInput = document.getElementById('dateFilter');
    const selectedDate = dateInput.value;
    
    if (!selectedDate) return;
    
    const allAttendance = Storage.getAttendance();
    const records = allAttendance.filter(a => a.date === selectedDate);
    
    const container = document.getElementById('historyContainer');
    
    if (records.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px;">
                <i class="fas fa-calendar-times"></i>
                <p>No attendance records for ${selectedDate}</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Member</th>
                        <th>Check-In Time</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.map(record => `
                        <tr>
                            <td>${record.memberName}</td>
                            <td>${new Date(record.checkIn).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}</td>
                            <td>
                                <span class="badge paid">
                                    <i class="fas fa-check-circle"></i> Present
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function searchAttendance() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = todayAttendance.filter(record => 
        record.memberName.toLowerCase().includes(searchTerm)
    );
    
    const tableBody = document.getElementById('attendanceTable');
    
    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No records found matching "${searchTerm}"</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filtered.map(record => {
        const checkInTime = new Date(record.checkIn);
        const duration = calculateDuration(record.checkIn);
        const member = members.find(m => m.id === record.memberId);
        
        return `
            <tr>
                <td>
                    <div class="member-info">
                        <div class="member-avatar">${Utils.getInitials(record.memberName)}</div>
                        <div class="member-details">
                            <h4>${record.memberName}</h4>
                        </div>
                    </div>
                </td>
                <td><strong>${member?.membershipId || 'N/A'}</strong></td>
                <td>
                    <i class="fas fa-clock"></i> 
                    ${checkInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>${duration}</td>
                <td>
                    <span class="badge paid">
                        <i class="fas fa-check-circle"></i> Present
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    loadMembersDropdown();
    loadTodayAttendance();
    updateStats();
    updateClock();
    
    setInterval(updateClock, 60000);
    setInterval(loadTodayAttendance, 60000);
    
    document.getElementById('dateFilter').valueAsDate = new Date();
    
    const form = document.getElementById('attendanceForm');
    if (form) {
        form.addEventListener('submit', markAttendance);
    }
});