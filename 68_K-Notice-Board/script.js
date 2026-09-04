/**
 * 68_K Notice Board - Main Application Logic
 */

// HARDCODED ADMIN SECURITY PIN
const ADMIN_PIN = '1234';

// Global State
let notices = [];
let isAdmin = false;
let selectedDateStr = null;
let deleteTargetId = null;

// Sample Notices Generator
const defaultNotices = [
    {
        id: '1',
        title: 'Updated Class Routine for Spring Semester',
        category: 'Routine',
        date: '2026-03-01',
        time: '09:00',
        description: 'A revised weekly class schedule takes effect starting next Monday. Room allocations for Friday lectures have been modified.',
        postedBy: 'CR',
        attachment: '',
        pinned: false
    },
    {
        id: '2',
        title: 'Assignment 2 Submission Deadline Extended',
        category: 'Assignment',
        date: '2026-03-10',
        time: '23:59',
        description: 'Due to ongoing lab maintenance, the deadline for Data Structures Assignment 2 has been extended by two days. Submit via the student portal.',
        postedBy: 'Teacher',
        attachment: '',
        pinned: false
    },
    {
        id: '3',
        title: 'Midterm Examination Schedule Released',
        category: 'Exam',
        date: '2026-03-15',
        time: '10:00',
        description: '', // Optional Description
        postedBy: 'Admin',
        attachment: 'https://example.com/schedule.pdf',
        pinned: true
    },
    {
        id: '4',
        title: 'Upcoming National Holiday Notice',
        category: 'Holiday',
        date: '2026-03-26',
        time: '00:00',
        description: 'All classes and administrative activities will remain suspended on account of Independence Day. Regular activities resume the next working day.',
        postedBy: 'Admin',
        attachment: '',
        pinned: false
    },
    {
        id: '5',
        title: 'Annual Tech Fest Registration Open',
        category: 'Event',
        date: '2026-04-05',
        time: '11:00',
        description: 'Registrations are now open for the annual Intra-Section Coding Competition. Interested students can form teams of up to 3 members.',
        postedBy: 'CR',
        attachment: 'https://example.com/techfest-reg',
        pinned: false
    }
];

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadNotices();
    initCalendar();
    initTheme();
    setupEventListeners();
    renderNotices();
});

// Storage Operations
function loadNotices() {
    const stored = localStorage.getItem('snb_notices');
    if (stored) {
        try {
            notices = JSON.parse(stored);
        } catch (e) {
            notices = [...defaultNotices];
        }
    } else {
        notices = [...defaultNotices];
        saveNotices();
    }
}

function saveNotices() {
    localStorage.setItem('snb_notices', JSON.stringify(notices));
}

// Calendar Logic
let currentCalendarDate = new Date();

function initCalendar() {
    renderCalendar();
    
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });

    document.getElementById('clearDateFilter').addEventListener('click', () => {
        selectedDateStr = null;
        document.getElementById('clearDateFilter').classList.add('hidden');
        renderCalendar();
        renderNotices();
    });
}

function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", 
                        "July", "August", "September", "October", "November", "December"];
    
    document.getElementById('calendarMonthYear').textContent = `${monthNames[month]} ${year}`;
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    const container = document.getElementById('calendarDays');
    container.innerHTML = '';

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('day', 'empty');
        container.appendChild(emptyDiv);
    }

    const today = new Date();

    for (let day = 1; day <= lastDay; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('day');
        dayDiv.textContent = day;

        const monthStr = String(month + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const formattedDate = `${year}-${monthStr}-${dayStr}`;

        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            dayDiv.classList.add('today');
        }

        if (selectedDateStr === formattedDate) {
            dayDiv.classList.add('selected');
        }

        const hasNotice = notices.some(n => n.date === formattedDate);
        if (hasNotice) {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            dayDiv.appendChild(dot);
        }

        dayDiv.addEventListener('click', () => {
            selectedDateStr = formattedDate;
            document.getElementById('clearDateFilter').classList.remove('hidden');
            renderCalendar();
            renderNotices();
        });

        container.appendChild(dayDiv);
    }
}

// Render Notice List
function renderNotices() {
    const container = document.getElementById('noticesContainer');
    const emptyState = document.getElementById('emptyState');
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const categoryVal = document.getElementById('categoryFilter').value;

    let filtered = notices.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchVal) ||
                              (n.description && n.description.toLowerCase().includes(searchVal)) ||
                              n.date.includes(searchVal);
        const matchesCategory = (categoryVal === 'All') || (n.category === categoryVal);
        const matchesDate = selectedDateStr ? (n.date === selectedDateStr) : true;

        return matchesSearch && matchesCategory && matchesDate;
    });

    filtered.sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
        
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        
        return dateA - dateB;
    });

    const feedTitle = document.getElementById('feedTitle');
    feedTitle.textContent = selectedDateStr ? `Notices for ${selectedDateStr}` : 'All Notices';
    document.getElementById('noticeCount').textContent = filtered.length;

    container.innerHTML = '';

    if (filtered.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filtered.forEach(notice => {
            container.appendChild(createNoticeCard(notice));
        });
    }
}

function createNoticeCard(notice) {
    const card = document.createElement('div');
    card.className = `glass-panel notice-card ${notice.pinned ? 'pinned' : ''}`;
    card.id = `notice-${notice.id}`;

    let pinnedMarkup = notice.pinned ? `<span class="pinned-badge">📌 Important</span>` : '';
    let attachmentMarkup = notice.attachment ? 
        `<a href="${escapeHtml(notice.attachment)}" target="_blank" class="btn-action-text"><i class="fa-solid fa-paperclip"></i> Attachment</a>` : '';
    
    let descriptionMarkup = notice.description ? `<p class="notice-desc">${escapeHtml(notice.description)}</p>` : '';

    let adminControlsMarkup = isAdmin ? `
        <div class="admin-card-controls">
            <button onclick="togglePin('${notice.id}')" class="btn-icon-sm" title="${notice.pinned ? 'Unpin' : 'Pin'}">
                <i class="fa-solid fa-thumbtack" style="${notice.pinned ? 'color:var(--accent-pin)' : ''}"></i>
            </button>
            <button onclick="openEditModal('${notice.id}')" class="btn-icon-sm" title="Edit"><i class="fa-solid fa-pen"></i></button>
            <button onclick="confirmDelete('${notice.id}')" class="btn-icon-sm" title="Delete"><i class="fa-solid fa-trash" style="color:var(--danger)"></i></button>
        </div>
    ` : '';

    card.innerHTML = `
        ${pinnedMarkup}
        <div class="notice-meta">
            <span class="notice-category">${escapeHtml(notice.category)}</span>
            <span><i class="fa-regular fa-calendar"></i> ${notice.date}</span>
            <span><i class="fa-regular fa-clock"></i> ${notice.time}</span>
        </div>
        <h3 class="notice-title">${escapeHtml(notice.title)}</h3>
        ${descriptionMarkup}
        <div class="notice-footer">
            <span>Posted by: <strong>${escapeHtml(notice.postedBy)}</strong></span>
            <div class="notice-actions">
                ${attachmentMarkup}
                <button onclick="printNotice('${notice.id}')" class="btn-action-text"><i class="fa-solid fa-print"></i> Print</button>
                <button onclick="copyNotice('${notice.id}')" class="btn-action-text"><i class="fa-solid fa-copy"></i> Copy</button>
                <button onclick="shareNotice('${notice.id}')" class="btn-action-text"><i class="fa-solid fa-share-nodes"></i> Share</button>
                ${adminControlsMarkup}
            </div>
        </div>
    `;

    return card;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[match]));
}

// Theme Handler
function initTheme() {
    const savedTheme = localStorage.getItem('snb_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    document.getElementById('themeToggleBtn').addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('snb_theme', next);
        updateThemeIcon(next);
    });
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('themeToggleBtn');
    btn.innerHTML = theme === 'dark' ? `<i class="fa-solid fa-sun"></i>` : `<i class="fa-solid fa-moon"></i>`;
}

// Global Event Listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', renderNotices);
    document.getElementById('categoryFilter').addEventListener('change', renderNotices);

    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.querySelectorAll('.closeModal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.add('hidden');
        });
    });

    // Admin Auth Popup
    document.getElementById('adminBtn').addEventListener('click', () => {
        if (isAdmin) {
            openAdminDashboard();
        } else {
            document.getElementById('authModal').classList.remove('hidden');
            document.getElementById('pinInput').value = '';
            document.getElementById('pinError').classList.add('hidden');
            document.getElementById('pinInput').focus();
        }
    });

    document.getElementById('authForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = document.getElementById('pinInput').value;
        if (pin === ADMIN_PIN) {
            isAdmin = true;
            document.getElementById('authModal').classList.add('hidden');
            openAdminDashboard();
            renderNotices();
        } else {
            document.getElementById('pinError').classList.remove('hidden');
        }
    });

    document.getElementById('adminLogoutBtn').addEventListener('click', () => {
        isAdmin = false;
        document.getElementById('adminModal').classList.add('hidden');
        renderNotices();
    });

    // Notice Form
    document.getElementById('noticeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveNoticeFromForm();
    });

    document.getElementById('resetFormBtn').addEventListener('click', resetNoticeForm);

    // Delete Notice Confirmation with PIN Verification
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteModal').classList.add('hidden');
        deleteTargetId = null;
    });

    document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
        const pin = document.getElementById('deletePinInput').value;
        if (pin === ADMIN_PIN) {
            if (deleteTargetId) {
                notices = notices.filter(n => n.id !== deleteTargetId);
                saveNotices();
                renderCalendar();
                renderNotices();
                document.getElementById('deleteModal').classList.add('hidden');
                deleteTargetId = null;
            }
        } else {
            document.getElementById('deletePinError').classList.remove('hidden');
        }
    });
}

// Admin Operations
function openAdminDashboard() {
    resetNoticeForm();
    document.getElementById('adminModal').classList.remove('hidden');
}

function resetNoticeForm() {
    document.getElementById('noticeForm').reset();
    document.getElementById('noticeId').value = '';
    document.getElementById('saveNoticeBtn').textContent = 'Publish Notice';
    
    const now = new Date();
    document.getElementById('formDate').value = now.toISOString().split('T')[0];
    document.getElementById('formTime').value = now.toTimeString().slice(0, 5);
}

function saveNoticeFromForm() {
    const id = document.getElementById('noticeId').value;
    const title = document.getElementById('formTitle').value.trim();
    const category = document.getElementById('formCategory').value;
    const date = document.getElementById('formDate').value;
    const time = document.getElementById('formTime').value;
    const postedBy = document.getElementById('formPostedBy').value;
    const attachment = document.getElementById('formAttachment').value.trim();
    const description = document.getElementById('formDescription').value.trim();
    const pinned = document.getElementById('formPinned').checked;

    if (id) {
        const idx = notices.findIndex(n => n.id === id);
        if (idx !== -1) {
            notices[idx] = { id, title, category, date, time, postedBy, attachment, description, pinned };
        }
    } else {
        const newNotice = {
            id: Date.now().toString(),
            title, category, date, time, postedBy, attachment, description, pinned
        };
        notices.unshift(newNotice);
    }

    saveNotices();
    renderCalendar();
    renderNotices();
    document.getElementById('adminModal').classList.add('hidden');
}

function openEditModal(id) {
    const notice = notices.find(n => n.id === id);
    if (!notice) return;

    document.getElementById('noticeId').value = notice.id;
    document.getElementById('formTitle').value = notice.title;
    document.getElementById('formCategory').value = notice.category;
    document.getElementById('formDate').value = notice.date;
    document.getElementById('formTime').value = notice.time;
    document.getElementById('formPostedBy').value = notice.postedBy;
    document.getElementById('formAttachment').value = notice.attachment || '';
    document.getElementById('formDescription').value = notice.description || '';
    document.getElementById('formPinned').checked = notice.pinned;

    document.getElementById('saveNoticeBtn').textContent = 'Save Changes';
    document.getElementById('adminModal').classList.remove('hidden');
}

function togglePin(id) {
    const notice = notices.find(n => n.id === id);
    if (notice) {
        notice.pinned = !notice.pinned;
        saveNotices();
        renderNotices();
    }
}

function confirmDelete(id) {
    deleteTargetId = id;
    document.getElementById('deletePinInput').value = '';
    document.getElementById('deletePinError').classList.add('hidden');
    document.getElementById('deleteModal').classList.remove('hidden');
    document.getElementById('deletePinInput').focus();
}

// Notice Helper Actions
function printNotice(id) {
    const targetCard = document.getElementById(`notice-${id}`);
    if (!targetCard) return;

    targetCard.classList.add('printable');
    window.print();
    targetCard.classList.remove('printable');
}

function copyNotice(id) {
    const notice = notices.find(n => n.id === id);
    if (!notice) return;

    const descPart = notice.description ? `\n\n${notice.description}` : '';
    const content = `[${notice.category}] ${notice.title}\nDate: ${notice.date} Time: ${notice.time}\nPosted By: ${notice.postedBy}${descPart}`;
    
    navigator.clipboard.writeText(content).then(() => {
        alert('Notice copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy notice:', err);
    });
}

function shareNotice(id) {
    const notice = notices.find(n => n.id === id);
    if (!notice) return;

    if (navigator.share) {
        navigator.share({
            title: notice.title,
            text: notice.description || notice.title,
            url: window.location.href
        }).catch(() => {});
    } else {
        copyNotice(id);
    }
}