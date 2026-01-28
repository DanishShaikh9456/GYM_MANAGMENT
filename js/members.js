/* ====================================
   ENHANCED MEMBERS PAGE - NO BACKEND
==================================== */

let editMemberId = null;

function addMember() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const plan = document.getElementById("plan").value;

    if (!name || !email || !phone || !plan) {
        Utils.showNotification("Please fill in all fields", "error");
        return;
    }

    if (!Utils.validateEmail(email)) {
        Utils.showNotification("Please enter a valid email address", "error");
        return;
    }

    if (!Utils.validatePhone(phone)) {
        Utils.showNotification("Please enter a valid phone number", "error");
        return;
    }

    const newMember = Storage.addMember({ name, email, phone, plan });

    if (newMember) {
        Utils.showNotification(`${name} added successfully! ID: ${newMember.membershipId}`, "success");
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("phone").value = "";
        document.getElementById("plan").value = "";
        loadMembers();
    } else {
        Utils.showNotification("Error adding member. Please try again.", "error");
    }
}

function loadMembers() {
    const tableBody = document.getElementById("memberTable");
    const members = Storage.getMembers();

    if (!tableBody) return;

    if (members.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No members found. Add your first member above!</p>
                </td>
            </tr>
        `;
        return;
    }

    members.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

    tableBody.innerHTML = members.map(member => {
        const isExpiringSoon = checkExpiringSoon(member.expiryDate);
        return `
            <tr>
                <td>
                    <div class="member-info">
                        <div class="member-avatar">${Utils.getInitials(member.name)}</div>
                        <div class="member-details">
                            <h4>${member.name}</h4>
                            <p>${member.email}</p>
                            ${member.membershipId ? `<small style="color: var(--text-muted);">ID: ${member.membershipId}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <p><i class="fas fa-phone"></i> ${member.phone}</p>
                    </div>
                </td>
                <td>
                    <strong>${member.plan}</strong>
                    <br>
                    <small class="text-muted">${getPlanPrice(member.plan)}</small>
                    ${member.expiryDate ? `<br><small style="color: ${isExpiringSoon ? 'var(--danger)' : 'var(--warning)'};">Expires: ${Utils.formatDate(member.expiryDate)}</small>` : ''}
                </td>
                <td>
                    <span class="badge ${member.paid ? 'paid' : 'due'}">
                        <i class="fas fa-${member.paid ? 'check-circle' : 'clock'}"></i>
                        ${member.paid ? 'Paid' : 'Due'}
                    </span>
                    ${member.lastPayment ? `<br><small class="text-muted">Last: ${Utils.formatDate(member.lastPayment)}</small>` : ''}
                </td>
                <td>${Utils.formatDate(member.joinDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="openEdit(${member.id})" title="Edit Member">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn pay" onclick="togglePayment(${member.id})" title="Toggle Payment">
                            <i class="fas fa-dollar-sign"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteMember(${member.id})" title="Delete Member">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function checkExpiringSoon(expiryDate) {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

function getPlanPrice(plan) {
    const prices = {
        'Monthly': '$50/month',
        'Quarterly': '$135/3 months',
        'Yearly': '$500/year'
    };
    return prices[plan] || '';
}

function togglePayment(id) {
    const members = Storage.getMembers();
    const member = members.find(m => m.id === id);

    if (!member) return;

    const newStatus = !member.paid;
    
    if (Storage.togglePayment(id)) {
        Utils.showNotification(
            `Payment marked as ${newStatus ? 'paid' : 'due'} for ${member.name}`,
            "success"
        );
        loadMembers();
    } else {
        Utils.showNotification("Error updating payment status", "error");
    }
}

function deleteMember(id) {
    const members = Storage.getMembers();
    const member = members.find(m => m.id === id);

    if (!member) return;

    if (confirm(`Are you sure you want to delete ${member.name}?`)) {
        if (Storage.deleteMember(id)) {
            Utils.showNotification(`${member.name} deleted successfully`, "success");
            loadMembers();
        } else {
            Utils.showNotification("Error deleting member", "error");
        }
    }
}

function searchMembers() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const members = Storage.getMembers();
    
    const filtered = members.filter(member => 
        member.name.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm) ||
        member.phone.includes(searchTerm) ||
        member.plan.toLowerCase().includes(searchTerm) ||
        (member.membershipId && member.membershipId.toLowerCase().includes(searchTerm))
    );

    const tableBody = document.getElementById("memberTable");

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No members found matching "${searchTerm}"</p>
                </td>
            </tr>
        `;
        return;
    }

    filtered.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));

    tableBody.innerHTML = filtered.map(member => {
        const isExpiringSoon = checkExpiringSoon(member.expiryDate);
        return `
            <tr>
                <td>
                    <div class="member-info">
                        <div class="member-avatar">${Utils.getInitials(member.name)}</div>
                        <div class="member-details">
                            <h4>${member.name}</h4>
                            <p>${member.email}</p>
                            ${member.membershipId ? `<small style="color: var(--text-muted);">ID: ${member.membershipId}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <p><i class="fas fa-phone"></i> ${member.phone}</p>
                    </div>
                </td>
                <td>
                    <strong>${member.plan}</strong>
                    <br>
                    <small class="text-muted">${getPlanPrice(member.plan)}</small>
                    ${member.expiryDate ? `<br><small style="color: ${isExpiringSoon ? 'var(--danger)' : 'var(--warning)'};">Expires: ${Utils.formatDate(member.expiryDate)}</small>` : ''}
                </td>
                <td>
                    <span class="badge ${member.paid ? 'paid' : 'due'}">
                        <i class="fas fa-${member.paid ? 'check-circle' : 'clock'}"></i>
                        ${member.paid ? 'Paid' : 'Due'}
                    </span>
                    ${member.lastPayment ? `<br><small class="text-muted">Last: ${Utils.formatDate(member.lastPayment)}</small>` : ''}
                </td>
                <td>${Utils.formatDate(member.joinDate)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="openEdit(${member.id})" title="Edit Member">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn pay" onclick="togglePayment(${member.id})" title="Toggle Payment">
                            <i class="fas fa-dollar-sign"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteMember(${member.id})" title="Delete Member">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openEdit(id) {
    const members = Storage.getMembers();
    const member = members.find(m => m.id === id);

    if (!member) return;

    editMemberId = id;

    document.getElementById("editName").value = member.name;
    document.getElementById("editEmail").value = member.email;
    document.getElementById("editPhone").value = member.phone;
    document.getElementById("editPlan").value = member.plan;

    const modal = document.getElementById("editModal");
    modal.style.display = "flex";
    modal.classList.add("active");
}

function saveEdit() {
    const name = document.getElementById("editName").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const phone = document.getElementById("editPhone").value.trim();
    const plan = document.getElementById("editPlan").value;

    if (!name || !email || !phone || !plan) {
        Utils.showNotification("Please fill in all fields", "error");
        return;
    }

    if (!Utils.validateEmail(email)) {
        Utils.showNotification("Please enter a valid email address", "error");
        return;
    }

    if (!Utils.validatePhone(phone)) {
        Utils.showNotification("Please enter a valid phone number", "error");
        return;
    }

    if (Storage.updateMember(editMemberId, { name, email, phone, plan })) {
        Utils.showNotification("Member updated successfully!", "success");
        closeModal();
        loadMembers();
    } else {
        Utils.showNotification("Error updating member", "error");
    }
}

function closeModal() {
    const modal = document.getElementById("editModal");
    modal.classList.remove("active");
    setTimeout(() => {
        modal.style.display = "none";
        editMemberId = null;
    }, 300);
}

document.addEventListener("DOMContentLoaded", function() {
    loadMembers();

    const addMemberForm = document.getElementById("addMemberForm");
    if (addMemberForm) {
        addMemberForm.addEventListener("submit", function(e) {
            e.preventDefault();
            addMember();
        });
    }

    const editMemberForm = document.getElementById("editMemberForm");
    if (editMemberForm) {
        editMemberForm.addEventListener("submit", function(e) {
            e.preventDefault();
            saveEdit();
        });
    }

    const modal = document.getElementById("editModal");
    if (modal) {
        modal.addEventListener("click", function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape" && editMemberId !== null) {
            closeModal();
        }
    });
});