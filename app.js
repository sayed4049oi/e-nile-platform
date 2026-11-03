const API = 'https://e-nile-platform.onrender.com/api';
const language = localStorage.getItem('language') || 'ar';
const translations = {
    'نظام الامتحانات': 'Examination System', 'طالب': 'Student', 'إدارة': 'Administration', 'الرقم الجامعي': 'University ID',
    'دخول': 'Login', 'خروج': 'Logout', 'لوحة التحكم': 'Dashboard', 'قائمة الطلاب': 'Students', 'الأقسام والمواد': 'Departments & Subjects',
    'كل القاعات': 'All Rooms', 'إعدادات النظام': 'System Settings', 'إدارة الأدمنز': 'Admin Management', 'مدير عام': 'Super Admin',
    'أدمن': 'Admin', 'شكل لوحة الإدارة': 'Admin panel display', 'لوحة كاملة': 'Full panel', 'أيقونات فقط': 'Icons only',
    'مزودو الذكاء الاصطناعي': 'AI providers', 'إضافة مزود': 'Add provider', 'تعديل': 'Edit', 'مسح': 'Delete',
    'النسخ الاحتياطي والاسترجاع': 'Backup and restore', 'تحميل نسخة احتياطية': 'Download backup', 'استرجاع نسخة': 'Restore backup',
    'منطقة الخطر': 'Danger zone', 'حذف كل البيانات': 'Delete all data', 'مفعل': 'Enabled', 'متوقف': 'Disabled',
    'الموديل تلقائي': 'Automatic model', 'مفتاح API': 'API key', 'اسم المزود': 'Provider name', 'عنوان API الأساسي': 'API base URL',
    'الموديل (اختياري للاكتشاف التلقائي)': 'Model (optional for auto-discovery)', 'أضف مزود ذكاء اصطناعي': 'Add AI provider',
    'الموديل': 'Model', 'تشغيل مزود واحد': 'Use one provider', 'تشغيل كل المزودين': 'Use all providers',
    'اختيار طريقة تشغيل الذكاء الاصطناعي': 'Choose AI operation mode', 'جاهز': 'Ready', 'غير مضبوط': 'Not configured',
    'عربي': 'Arabic', 'إنجليزي': 'English', 'مرحباً بك': 'Welcome', 'إدارة منصة كلية شرق النيل من مكان واحد.': 'Manage East Nile College from one place.',
    'الطلاب': 'Students', 'الأقسام': 'Departments', 'القاعات المفتوحة': 'Open rooms', 'المسودات': 'Drafts',
    'فتح القائمة': 'Open list', 'إدارة الأقسام': 'Manage departments', 'عرض القاعات': 'View rooms', 'مراجعة المسودات': 'Review drafts',
    'إدارة الامتحانات': 'Manage exams', 'إضافة طالب': 'Add student', 'لا يوجد طلاب.': 'No students.', 'حذف': 'Delete',
    'إضافة قسم': 'Add department', 'إضافة مادة': 'Add subject', 'إضافة قاعة': 'Add room', 'إضافة امتحان': 'Add exam',
    'ورشة إعداد الامتحان': 'Exam builder', 'إدارة القاعات': 'Room management', 'تفاصيل القاعة': 'Room details',
    'امتحانات مادة': 'Subject exams', 'مواد قسم': 'Department subjects', 'الاسم': 'Name', 'الرقم': 'ID',
    'الصلاحية': 'Role', 'إجراءات': 'Actions', 'المستخدم': 'Username', 'المحتوى المصدر قصير جداً': 'The source content is too short',
    'أرفق ملفاً أو أدخل محتوى لا يقل عن 30 حرفاً': 'Attach a file or enter at least 30 characters',
    'اختيار من متعدد': 'Multiple choice', 'صح أو خطأ': 'True or false', 'مقالية': 'Essay',
    'متوسط': 'Medium', 'سهل': 'Easy', 'صعب': 'Hard', 'العربية': 'Arabic', 'English': 'English',
    'ملف المصدر': 'Source file', 'أو الصق محتوى المحاضرة هنا...': 'Or paste lecture content here...',
    'تعليمات إضافية اختيارية، مثل: ركز على الوحدة الثالثة': 'Optional instructions, e.g. focus on unit three',
    'تحسين أسئلة الامتحان الحالية بدل إنشاء أسئلة من الصفر': 'Improve existing exam questions instead of creating new ones',
    'تحليل وإنشاء مسودة': 'Analyze and create draft', 'إضافة إلى الامتحان': 'Add to exam', 'إلغاء': 'Cancel',
    'إعدادات الامتحان': 'Exam settings', 'حفظ الإعدادات': 'Save settings', 'اسم الامتحان': 'Exam name',
    'المدة (دقيقة)': 'Duration (minutes)', 'رمز الدخول (PIN)': 'Access PIN', 'إعلان الدرجات': 'Publish grades',
    'إعدادات الحماية:': 'Protection settings:', 'منع النسخ': 'Prevent copying', 'منع كليك يمين': 'Prevent right click',
    'كشف التبويب': 'Detect tab switching', 'كاميرا': 'Camera', 'مراجعة الطالب': 'Student review',
    'عشوائية اختيارات': 'Randomize choices', 'حفظ هذه الإعدادات كقالب للاستخدام لاحقاً': 'Save these settings as a reusable template',
    'لا توجد مزودات.': 'No providers.', 'جاري قراءة إعدادات الخادم...': 'Reading server settings...',
    'لم يتم ضبط أي مفتاح API بعد.': 'No API key has been configured yet.', 'المفتاح يُرسل عبر اتصال آمن ويُحفظ مشفراً في قاعدة البيانات.': 'The key is sent securely and encrypted in the database.',
    'تم حفظ إعدادات الذكاء الاصطناعي بشكل مشفر': 'AI settings saved securely', 'تعذر حفظ الإعدادات': 'Could not save settings',
    'تم مسح المفتاح': 'Key deleted', 'تم التحميل': 'Downloaded', 'تم الاسترجاع': 'Restored'
};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
function translateRenderedContent() {
    if (language === 'ar') return;
    document.documentElement.lang = 'en';
    document.documentElement.dir = 'ltr';
    document.querySelectorAll('#app *').forEach(element => {
        element.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                let translated = node.textContent;
                Object.keys(translations).sort((a, b) => b.length - a.length).forEach(key => {
                    translated = translated.split(key).join(translations[key]);
                });
                node.textContent = translated;
            }
        });
        ['placeholder', 'title', 'aria-label'].forEach(attribute => {
            const value = element.getAttribute(attribute);
            if (value && translations[value]) element.setAttribute(attribute, translations[value]);
        });
    });
}
function toggleLanguage() {
    localStorage.setItem('language', language === 'ar' ? 'en' : 'ar');
    location.reload();
}
function addLanguageControl() {
    if (document.getElementById('language-control')) return;
    const button = document.createElement('button');
    button.id = 'language-control';
    button.type = 'button';
    button.onclick = toggleLanguage;
    button.className = 'language-control';
    button.textContent = language === 'ar' ? 'English' : 'العربية';
    document.body.appendChild(button);
}
let token = localStorage.getItem('token') || null;
let user = JSON.parse(localStorage.getItem('user')) || null;
const app = document.getElementById('app');
const languageObserver = new MutationObserver(translateRenderedContent);
languageObserver.observe(app, { childList: true, subtree: true });
let examState = { attempt: null, room: null, questions: [], currentIdx: 0, flagged: [], isPreview: false };
let globalRooms = [], globalDepts = [], globalSubjects = [], globalTemplates = [];
let activeRoomId = null, activeDeptId = null, activeSubjectId = null;
let timerInterval = null, snapshotInterval = null;
let activeQuestionId = null;
let pendingAnswers = JSON.parse(localStorage.getItem('pendingAnswers') || '[]');

function showConnectionStatus() {
    const el = document.getElementById('connection-status');
    if (!el) return;
    el.textContent = navigator.onLine ? 'تم استعادة الاتصال' : 'أنت غير متصل - سيتم حفظ الإجابات محلياً';
    el.className = `fixed bottom-4 right-4 z-[10000] rounded-xl px-4 py-3 text-sm font-bold shadow-lg ${navigator.onLine ? 'bg-green-600 text-white' : 'bg-amber-500 text-black'}`;
    setTimeout(() => { if (navigator.onLine) el.classList.add('hidden'); }, 3500);
}
async function flushPendingAnswers() {
    if (!navigator.onLine || !token || !pendingAnswers.length) return;
    const remaining = [];
    for (const answer of pendingAnswers) {
        try {
            const res = await fetch(API + `/attempts/${answer.attemptId}/answer`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ qId: answer.qId, cId: answer.cId }) });
            if (!res.ok) remaining.push(answer);
        } catch { remaining.push(answer); }
    }
    pendingAnswers = remaining;
    localStorage.setItem('pendingAnswers', JSON.stringify(pendingAnswers));
}
window.addEventListener('online', () => { showConnectionStatus(); flushPendingAnswers(); });
window.addEventListener('offline', showConnectionStatus);

if(user && user.type === 'admin' && user.isSuper === undefined) { localStorage.clear(); location.reload(); }

const authHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token });
const showToast = (title, icon = 'success') => Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, icon, title });

function init() {
    addLanguageControl();
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    if (token && user) { user.type === 'admin' ? renderAdminDashboard('students') : renderStudentDashboard(); } else { renderLogin(); }
}

// ================= LOGIN =================
function renderLogin() {
    const backgroundLogos = Array.from({ length: 96 }, () => {
        const size = Math.floor(Math.random() * 96) + 50;
        const rotation = Math.floor(Math.random() * 361) - 180;
        const hue = Math.floor(Math.random() * 360);
        const opacity = (Math.random() * 0.18 + 0.16).toFixed(2);
        const left = Math.floor(Math.random() * 106) - 5;
        const top = Math.floor(Math.random() * 106) - 5;
        return `<img src="logo.jpg" alt="" aria-hidden="true" class="absolute object-contain pointer-events-none select-none" style="left:${left}%;top:${top}%;width:${size}px;height:${size}px;opacity:${opacity};transform:translate(-50%,-50%) rotate(${rotation}deg);filter:hue-rotate(${hue}deg) saturate(1.8);mix-blend-mode:multiply;">`;
    }).join('');

    app.innerHTML = `<div class="relative min-h-screen flex items-center justify-center overflow-hidden p-4 bg-gradient-to-br from-blue-50 via-blue-200 to-indigo-300"><div class="absolute inset-0 overflow-hidden" aria-hidden="true">${backgroundLogos}</div><div class="glass relative z-10 max-w-md w-full rounded-2xl shadow-2xl p-8"><div class="text-center mb-8"><img src="logo.jpg" alt="شعار كلية شرق النيل" class="w-28 h-28 object-contain rounded-2xl mx-auto mb-4 shadow-sm"><h1 class="text-3xl font-extrabold text-gray-800">كلية شرق النيل</h1><p class="text-gray-500 mt-2">نظام الامتحانات</p></div><div class="flex bg-gray-100 p-1 rounded-xl mb-6"><button onclick="switchLoginTab('student')" id="tab-student" class="flex-1 py-2 rounded-lg font-bold bg-white shadow text-primary">طالب</button><button onclick="switchLoginTab('admin')" id="tab-admin" class="flex-1 py-2 rounded-lg font-bold text-gray-500">إدارة</button></div><div id="login-form"></div></div></div>`;
    switchLoginTab('student');
}
function switchLoginTab(type) {
    const isStudent = type === 'student';
    document.getElementById('tab-student').className = isStudent ? 'flex-1 py-2 rounded-lg font-bold bg-white shadow text-primary' : 'flex-1 py-2 rounded-lg font-bold text-gray-500';
    document.getElementById('tab-admin').className = !isStudent ? 'flex-1 py-2 rounded-lg font-bold bg-white shadow text-primary' : 'flex-1 py-2 rounded-lg font-bold text-gray-500';
    document.getElementById('login-form').innerHTML = isStudent ? `<div class="space-y-4"><input type="text" id="uni-id" class="w-full p-3 rounded-xl border border-gray-200 outline-none" placeholder="الرقم الجامعي"><button onclick="doLogin('student')" class="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg">دخول</button></div>` : `<div class="space-y-4"><input type="text" id="username" value="admin" class="w-full p-3 rounded-xl border border-gray-200 outline-none"><input type="password" id="password" value="admin123" class="w-full p-3 rounded-xl border border-gray-200 outline-none"><button onclick="doLogin('admin')" class="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-lg">دخول</button></div>`;
}
async function doLogin(type) {
    try {
        let payload = type === 'student' ? { universityId: document.getElementById('uni-id').value } : { username: document.getElementById('username').value, password: document.getElementById('password').value };
        const res = await fetch(API + '/auth/' + (type === 'student' ? 'student/enter' : 'admin/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await res.json(); if (!res.ok) throw new Error(data.error);
        token = data.token; user = type === 'student' ? { type: 'student', ...data.student, rooms: data.rooms } : { type: 'admin', ...data.admin };
        localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user));
        type === 'student' ? renderStudentDashboard() : renderAdminDashboard('students');
    } catch (e) { Swal.fire({ icon: 'error', title: 'خطأ', text: e.message }); }
}
const logout = () => { localStorage.clear(); location.reload(); };

// ================= ADMIN =================
async function renderAdminDashboard(view = 'students', deptId = null, subId = null, roomId = null) {
    const sidebarMode = localStorage.getItem('adminSidebarMode') || 'panel';
    if (view === 'home') {
        const [depts, subjects, rooms, students] = await Promise.all([
            fetch(API + '/departments', { headers: authHeaders() }).then(r => r.json()),
            fetch(API + '/subjects', { headers: authHeaders() }).then(r => r.json()),
            fetch(API + '/rooms', { headers: authHeaders() }).then(r => r.json()),
            fetch(API + '/students-list', { headers: authHeaders() }).then(r => r.json())
        ]);
        globalDepts = depts;
        globalSubjects = subjects;
        globalRooms = rooms;
        window.dashboardStudentCount = students.reduce((total, department) => total + department.students.length, 0);
    }
    if (view === 'departments' || view === 'subjects' || view === 'subject-details' || view === 'exam-builder') {
        const [resDepts, resSubs] = await Promise.all([fetch(API + '/departments', { headers: authHeaders() }), fetch(API + '/subjects', { headers: authHeaders() })]);
        globalDepts = await resDepts.json(); globalSubjects = await resSubs.json();
    }

    if (view === 'subject-details' || view === 'rooms' || view === 'room-details' || view === 'exam-builder') {
        const resRooms = await fetch(API + '/rooms', { headers: authHeaders() }); globalRooms = await resRooms.json();
    }

    activeDeptId = deptId; activeSubjectId = subId; activeRoomId = roomId;
    const activeDept = globalDepts.find(d => d.id === deptId);
    const activeSubject = globalSubjects.find(s => s.id === subId);

    let headerTitle = view === 'home' ? 'لوحة التحكم' : view === 'students' ? 'قائمة الطلاب' : view === 'departments' ? 'الأقسام' : view === 'subjects' ? `مواد قسم (${activeDept ? activeDept.name : ''})` : view === 'subject-details' ? `امتحانات مادة (${activeSubject ? activeSubject.name : ''})` : view === 'exam-builder' ? 'ورشة إعداد الامتحان' : view === 'rooms' ? 'إدارة القاعات' : view === 'room-details' ? 'تفاصيل القاعة' : view === 'admins' ? 'إدارة الأدمنز' : 'إعدادات النظام';

    app.innerHTML = `
    <div class="admin-shell flex min-h-screen bg-gray-50">
        <aside id="admin-sidebar" class="admin-sidebar ${sidebarMode === 'icons' ? 'sidebar-icons' : ''} bg-primary text-white flex flex-col shadow-2xl">
            <div class="h-20 flex items-center justify-center gap-3 border-b border-blue-800"><img src="logo.jpg" alt="شعار كلية شرق النيل" class="w-12 h-12 object-contain rounded-lg bg-white"><span class="sidebar-label text-xl font-bold">كلية شرق النيل</span></div>
            <nav class="flex-1 p-3 space-y-2">
                <a title="لوحة التحكم" onclick="renderAdminDashboard('home')" class="sidebar-link ${view==='home' ? 'active' : ''}"><i class="fa-solid fa-chart-pie"></i><span class="sidebar-label">لوحة التحكم</span></a>
                <a title="قائمة الطلاب" onclick="renderAdminDashboard('students')" class="sidebar-link ${view==='students' ? 'active' : ''}"><i class="fa-solid fa-users"></i><span class="sidebar-label">قائمة الطلاب</span></a>
                <a title="الأقسام والمواد" onclick="renderAdminDashboard('departments')" class="sidebar-link ${view==='departments' || view==='subjects' || view==='subject-details' || view==='exam-builder' ? 'active' : ''}"><i class="fa-solid fa-building-columns"></i><span class="sidebar-label">الأقسام والمواد</span></a>
                <a title="كل القاعات" onclick="renderAdminDashboard('rooms')" class="sidebar-link ${view==='rooms' || view==='room-details' ? 'active' : ''}"><i class="fa-solid fa-door-open"></i><span class="sidebar-label">كل القاعات</span></a>
                ${user.isSuper ? `<a title="إعدادات النظام" onclick="renderAdminDashboard('settings')" class="sidebar-link danger ${view==='settings' ? 'active' : ''}"><i class="fa-solid fa-gear"></i><span class="sidebar-label">إعدادات النظام</span></a>` : ''}
            </nav>
            <div class="sidebar-footer p-3 border-t border-blue-800"><div class="sidebar-profile"><div class="w-10 h-10 shrink-0 rounded-full bg-blue-400 flex items-center justify-center font-bold text-lg">${user.name[0]}</div><div class="sidebar-label mr-3 min-w-0"><p class="font-bold text-sm truncate">${user.name}</p><p class="text-xs text-blue-300">${user.isSuper ? 'مدير عام' : 'أدمن'}</p></div></div><button onclick="logout()" title="خروج" class="sidebar-logout"><i class="fa-solid fa-right-from-bracket"></i><span class="sidebar-label">خروج</span></button></div>
        </aside>
        <main class="flex-1 flex flex-col overflow-y-auto">
            <header class="bg-white shadow-sm h-20 flex items-center px-8 justify-between">
                <h2 class="text-2xl font-bold text-gray-800">${headerTitle}</h2>
                <div class="flex gap-2">
                    ${view === 'students' ? `<input type="text" id="search-student" oninput="filterStudents(this.value)" placeholder="ابحث..." class="p-2 border rounded-xl outline-none focus:border-primary"><button onclick="openBulkImportModal()" class="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg"><i class="fa-solid fa-file-import ml-1"></i> استيراد</button>` : ''}
                    ${view === 'departments' ? `<button onclick="openCreateDeptModal()" class="bg-secondary text-white px-6 py-2 rounded-xl font-bold"><i class="fa-solid fa-plus ml-2"></i> إضافة قسم</button>` : ''}
                    ${view === 'subjects' ? `<button onclick="renderAdminDashboard('departments')" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl font-bold"><i class="fa-solid fa-arrow-right ml-2"></i> رجوع</button><button onclick="openAddSubjectModal('${activeDeptId}', '${activeDept ? activeDept.name : ''}')" class="bg-secondary text-white px-6 py-2 rounded-xl font-bold"><i class="fa-solid fa-plus ml-2"></i> إضافة مادة</button>` : ''}
                    ${view === 'subject-details' ? `<button onclick="renderAdminDashboard('subjects', '${activeDeptId}')" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl font-bold"><i class="fa-solid fa-arrow-right ml-2"></i> رجوع للمواد</button><button onclick="openCreateRoomModal('${activeSubjectId}')" class="bg-secondary text-white px-6 py-2 rounded-xl font-bold"><i class="fa-solid fa-plus ml-2"></i> إضافة امتحان</button>` : ''}
                    ${view === 'exam-builder' ? `<button onclick="renderAdminDashboard('subject-details', '${activeDeptId}', '${activeSubjectId}')" class="bg-gray-200 text-gray-800 px-6 py-2 rounded-xl font-bold"><i class="fa-solid fa-arrow-right ml-2"></i> رجوع للامتحانات</button>` : ''}
                    ${view === 'rooms' ? `<button onclick="openCreateRoomModal()" class="bg-secondary text-white px-6 py-2 rounded-xl font-bold"><i class="fa-solid fa-plus ml-2"></i> إضافة قاعة</button>` : ''}
                    ${view === 'room-details' ? `<button onclick="renderAdminDashboard('rooms')" class="bg-gray-200 px-6 py-2 rounded-xl font-bold">رجوع</button>` : ''}
                    ${view === 'admins' ? `<button onclick="openAddAdminModal()" class="bg-secondary text-white px-6 py-2 rounded-xl font-bold"><i class="fa-solid fa-plus ml-2"></i> إضافة أدمن</button>` : ''}
                </div>
            </header>
            <div class="p-8" id="admin-content"></div>
        </main>
    </div>`;
    if(view === 'home') loadAdminHome();
    else if(view === 'students') loadStudentsList();
    else if(view === 'departments') loadDepartments();
    else if(view === 'subjects') loadSubjects();
    else if(view === 'subject-details') loadSubjectExams();
    else if(view === 'exam-builder') loadExamBuilder();
    else if(view === 'rooms') loadAdminRooms();
    else if(view === 'room-details') loadRoomDetails();
    else if(view === 'admins') loadAdmins();
    else if(view === 'settings') loadSettings();
}

function loadAdminHome() {
    const activeRooms = globalRooms.filter(room => room.isOpen).length;
    const draftRooms = globalRooms.filter(room => room.status === 'draft').length;
    document.getElementById('admin-content').innerHTML = `<div class="space-y-8">
        <div class="rounded-3xl bg-gradient-to-l from-primary to-blue-600 p-8 text-white shadow-xl"><p class="text-blue-100 mb-2">مرحباً بك</p><h3 class="text-3xl font-extrabold text-white mb-2">${user.name}</h3><p class="text-blue-100">إدارة منصة كلية شرق النيل من مكان واحد.</p></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div class="dashboard-stat"><span class="dashboard-stat-icon bg-blue-100 text-blue-700"><i class="fa-solid fa-users"></i></span><p>الطلاب</p><strong>${window.dashboardStudentCount || 0}</strong><button onclick="renderAdminDashboard('students')">فتح القائمة</button></div>
            <div class="dashboard-stat"><span class="dashboard-stat-icon bg-indigo-100 text-indigo-700"><i class="fa-solid fa-building-columns"></i></span><p>الأقسام</p><strong>${globalDepts.length}</strong><button onclick="renderAdminDashboard('departments')">إدارة الأقسام</button></div>
            <div class="dashboard-stat"><span class="dashboard-stat-icon bg-green-100 text-green-700"><i class="fa-solid fa-door-open"></i></span><p>القاعات المفتوحة</p><strong>${activeRooms}</strong><button onclick="renderAdminDashboard('rooms')">عرض القاعات</button></div>
            <div class="dashboard-stat"><span class="dashboard-stat-icon bg-amber-100 text-amber-700"><i class="fa-solid fa-file-pen"></i></span><p>المسودات</p><strong>${draftRooms}</strong><button onclick="renderAdminDashboard('rooms')">مراجعة المسودات</button></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <button onclick="renderAdminDashboard('departments')" class="dashboard-action"><i class="fa-solid fa-layer-group"></i><span><b>الأقسام والمواد</b><small>${globalDepts.length} أقسام و${globalSubjects.length} مواد</small></span><i class="fa-solid fa-arrow-left"></i></button>
            <button onclick="renderAdminDashboard('rooms')" class="dashboard-action"><i class="fa-solid fa-calendar-check"></i><span><b>إدارة الامتحانات</b><small>${globalRooms.length} قاعات مسجلة</small></span><i class="fa-solid fa-arrow-left"></i></button>
        </div>
    </div>`;
}

// ================= SETTINGS & STUDENTS & DEPTS =================
function loadSettings() {
    document.getElementById('admin-content').innerHTML = `<div class="max-w-3xl mx-auto space-y-6">
        <div class="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm"><h3 class="text-xl font-bold text-gray-800 mb-3"><i class="fa-solid fa-display text-primary ml-2"></i> شكل لوحة الإدارة</h3><p class="text-sm text-gray-500 mb-4">اختر هل تظهر القائمة الجانبية كلوحة كاملة أم كأيقونات مختصرة.</p><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><button onclick="setSidebarMode('panel')" class="sidebar-mode-option ${localStorage.getItem('adminSidebarMode') !== 'icons' ? 'selected' : ''}"><i class="fa-solid fa-table-columns"></i><span><b>لوحة كاملة</b><small>الأيقونة مع اسم القسم</small></span></button><button onclick="setSidebarMode('icons')" class="sidebar-mode-option ${localStorage.getItem('adminSidebarMode') === 'icons' ? 'selected' : ''}"><i class="fa-solid fa-icons"></i><span><b>أيقونات فقط</b><small>مربعات الأيقونات لتوفير المساحة</small></span></button></div></div>
        <div class="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"><h3 class="text-xl font-bold text-gray-800 mb-4"><i class="fa-solid fa-download text-primary ml-2"></i> النسخ الاحتياطي والاسترجاع</h3><div class="flex flex-wrap gap-3"><button onclick="downloadBackup()" class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">تحميل نسخة احتياطية</button><button onclick="restoreBackup()" class="bg-green-600 text-white px-6 py-3 rounded-xl font-bold">استرجاع نسخة</button></div><p class="text-sm text-gray-500 mt-3">الاسترجاع يستبدل البيانات الحالية بالكامل.</p></div>
        ${user.isSuper ? `<div class="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm"><h3 class="text-xl font-bold text-gray-800 mb-3"><i class="fa-solid fa-users-gear text-primary ml-2"></i> إدارة الأدمنز</h3><p class="text-sm text-gray-500 mb-4">إضافة وتعديل وحذف حسابات الأدمنز من إعدادات النظام.</p><button onclick="renderAdminDashboard('admins')" class="bg-primary text-white px-5 py-3 rounded-xl font-bold">فتح إدارة الأدمنز</button></div>` : ''}
        ${user.isSuper ? `<div class="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"><h3 class="text-xl font-bold text-gray-800 mb-3"><i class="fa-solid fa-list-check text-primary ml-2"></i> سجل التدقيق</h3><p class="text-sm text-gray-500 mb-4">تتبع العمليات الحساسة مثل تغيير المفاتيح وإدارة الأدمنز والنسخ الاحتياطية.</p><button onclick="loadAuditEvents()" class="bg-gray-800 text-white px-5 py-3 rounded-xl font-bold">عرض آخر العمليات</button><div id="audit-events-list" class="mt-4"></div></div>` : ''}
        <div class="bg-purple-50 border border-purple-200 rounded-2xl p-8 shadow-sm"><div class="flex items-center justify-between gap-3 mb-3"><h3 class="text-xl font-bold text-purple-800"><i class="fa-solid fa-wand-magic-sparkles ml-2"></i> مزودو الذكاء الاصطناعي</h3><button onclick="editAIConfig()" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"><i class="fa-solid fa-plus ml-1"></i> إضافة مزود</button></div><p id="ai-config-status" class="text-sm text-purple-900 mb-4">جاري قراءة إعدادات الخادم...</p><div class="bg-white rounded-xl p-4 border mb-4"><label class="block font-bold mb-2">اختيار طريقة تشغيل الذكاء الاصطناعي</label><select id="ai-mode-input" onchange="setAIMode(this.value)" class="w-full p-3 border rounded-xl"><option value="single">تشغيل مزود واحد</option><option value="all">تشغيل كل المزودين</option></select><p class="text-xs text-gray-500 mt-2">في وضع كل المزودين تُجمع النتائج من جميع المزودين النشطين.</p></div><div id="ai-providers-list" class="grid md:grid-cols-2 gap-4"></div><p class="text-xs text-gray-600 mt-3">المفاتيح الجديدة تُدخل من هنا وتُحفظ مشفرة. استخدم «اختبار الاتصال» للتأكد من أن الرابط والمفتاح والموديل يعملون فعليًا.</p></div>
        <div class="bg-red-50 border border-red-200 rounded-2xl p-8 shadow-sm"><h3 class="text-2xl font-bold text-red-700 mb-4">منطقة الخطر</h3><button onclick="confirmSystemWipe()" class="bg-red-600 text-white px-6 py-3 rounded-xl font-bold">حذف كل البيانات</button></div></div>`;
    fetch(API + '/ai/config', { headers: authHeaders() }).then(res => res.json()).then(config => {
        window.aiProviders = config.providers || [];
        const status = document.getElementById('ai-config-status');
        if (status) status.textContent = config.configured ? `${config.providers.length} مزود جاهز` : 'لم يتم ضبط أي مفتاح API بعد.';
        const modeInput = document.getElementById('ai-mode-input');
        if (modeInput) modeInput.value = config.mode || 'single';
        const list = document.getElementById('ai-providers-list');
        if (list) list.innerHTML = (config.providers || []).map(item => `<div class="bg-white rounded-xl p-4 border"><div class="flex justify-between gap-2"><h4 class="font-bold">${escapeHtml(item.name)}</h4><span class="text-xs ${item.enabled ? 'text-green-600' : 'text-gray-400'}">${item.enabled ? 'مفعل' : 'متوقف'}</span></div><p class="text-xs text-gray-500 mt-2">${item.protocol === 'anthropic' ? 'Anthropic Messages' : 'OpenAI-compatible'} | ${escapeHtml(item.baseUrl)}</p><p class="text-xs text-gray-500 mb-3">${escapeHtml(item.model || 'الموديل تلقائي')}${item.last4 ? ` | المفتاح ينتهي بـ ****${escapeHtml(item.last4)}` : ''}</p><button onclick="testAIProvider('${item.id}')" class="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-bold">اختبار الاتصال</button><button onclick="toggleAIProvider('${item.id}', ${!item.enabled})" class="mr-2 ${item.enabled ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'} px-3 py-2 rounded-lg text-sm font-bold">${item.enabled ? 'إيقاف' : 'تفعيل'}</button><button onclick="editAIConfig('${item.id}')" class="mr-2 bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-bold">تعديل</button><button onclick="deleteAIConfig('${item.id}')" class="mr-2 bg-red-50 text-red-600 px-3 py-2 rounded-lg text-sm font-bold">مسح</button></div>`).join('') || '<p class="text-sm text-gray-500">لا توجد مزودات.</p>';
    }).catch(() => {});
}
async function loadAuditEvents() {
    const container = document.getElementById('audit-events-list');
    if (!container) return;
    const response = await fetch(API + '/audit-events?limit=50', { headers: authHeaders() });
    const events = await response.json();
    if (!response.ok) return showToast(events.error || 'تعذر تحميل سجل التدقيق', 'error');
    container.innerHTML = events.length
        ? `<div class="overflow-x-auto"><table class="w-full text-right text-sm"><thead><tr class="bg-gray-100"><th class="p-3">الوقت</th><th class="p-3">العملية</th><th class="p-3">المورد</th><th class="p-3">المنفذ</th></tr></thead><tbody>${events.map(event => `<tr class="border-b"><td class="p-3">${new Date(event.createdAt).toLocaleString()}</td><td class="p-3 font-bold">${escapeHtml(event.action)}</td><td class="p-3">${escapeHtml(event.resource || '-')}</td><td class="p-3">${escapeHtml(event.actorId || '-')}</td></tr>`).join('')}</tbody></table></div>`
        : '<p class="text-sm text-gray-500">لا توجد عمليات مسجلة.</p>';
}
function setSidebarMode(mode) {
    if (!['panel', 'icons'].includes(mode)) return;
    localStorage.setItem('adminSidebarMode', mode);
    renderAdminDashboard('settings');
}
async function setAIMode(mode) {
    const response = await fetch(API + '/ai/mode', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ mode }) });
    if (!response.ok) showToast('تعذر حفظ طريقة التشغيل', 'error');
}
async function toggleAIProvider(providerId, enabled) {
    const response = await fetch(API + `/ai/config/${providerId}`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ enabled }) });
    if (!response.ok) return showToast('تعذر تغيير حالة المزود', 'error');
    loadSettings();
}
async function testAIProvider(providerId) {
    showToast('جاري اختبار الاتصال...', 'info');
    const response = await fetch(API + `/ai/test/${providerId}`, { method: 'POST', headers: authHeaders() });
    const data = await response.json();
    if (!response.ok) return Swal.fire('فشل الاختبار', data.error || 'تعذر الاتصال بالمزود', 'error');
    Swal.fire('الاتصال يعمل', `تم الاتصال بـ ${data.provider} باستخدام الموديل ${data.model}`, 'success');
}
async function editAIConfig(providerId = '') {
    const current = (window.aiProviders || []).find(item => item.id === providerId) || {};
    const result = await Swal.fire({
        title: current.id ? 'تعديل مزود الذكاء الاصطناعي' : 'إضافة مزود ذكاء اصطناعي',
        html: `<input id="ai-name-input" class="swal2-input" value="${current.name || ''}" placeholder="اسم المزود"><select id="ai-protocol-input" class="swal2-select" onchange="document.getElementById('ai-url-input').value=this.value==='anthropic'?'https://api.anthropic.com/v1':'https://api.openai.com/v1'"><option value="openai" ${current.protocol !== 'anthropic' ? 'selected' : ''}>OpenAI-compatible (OpenAI, DeepSeek, Qwen, Mistral, OpenRouter وغيرها)</option><option value="anthropic" ${current.protocol === 'anthropic' ? 'selected' : ''}>Anthropic Messages (Claude)</option></select><input id="ai-url-input" class="swal2-input" value="${current.baseUrl || 'https://api.openai.com/v1'}" placeholder="عنوان API الأساسي"><input id="ai-model-input" class="swal2-input" value="${current.model || ''}" placeholder="الموديل (اختياري للاكتشاف التلقائي)"><input id="ai-key-input" type="password" class="swal2-input" placeholder="${current.id ? 'مفتاح API الجديد (اختياري)' : 'مفتاح API'}"><p class="text-xs text-gray-500">استخدم OpenAI-compatible لمعظم المزودين، أو Anthropic للـClaude. الموديل يكتشف تلقائيًا فقط مع OpenAI-compatible.</p>`,
        showCancelButton: true,
        confirmButtonText: 'حفظ مشفراً',
        preConfirm: () => ({ id: current.id, name: document.getElementById('ai-name-input').value.trim(), protocol: document.getElementById('ai-protocol-input').value, baseUrl: document.getElementById('ai-url-input').value.trim(), model: document.getElementById('ai-model-input').value.trim(), apiKey: document.getElementById('ai-key-input').value.trim() })
    });
    if (!result.isConfirmed) return;
    const response = await fetch(API + '/ai/config', { method: 'PUT', headers: authHeaders(), body: JSON.stringify(result.value) });
    const data = await response.json();
    if (!response.ok) return Swal.fire('خطأ', data.error || 'تعذر حفظ الإعدادات', 'error');
    showToast('تم حفظ إعدادات الذكاء الاصطناعي بشكل مشفر');
    loadSettings();
}
async function deleteAIConfig(provider) {
    const result = await Swal.fire({ title: 'مسح مفتاح API؟', text: 'لن يستطيع النظام استخدام هذا المزود بعد المسح.', icon: 'warning', showCancelButton: true, confirmButtonText: 'مسح', confirmButtonColor: '#dc2626' });
    if (!result.isConfirmed) return;
    const response = await fetch(API + `/ai/config/${provider}`, { method: 'DELETE', headers: authHeaders() });
    const data = await response.json();
    if (!response.ok) return Swal.fire('خطأ', data.error || 'تعذر مسح المفتاح', 'error');
    showToast('تم مسح المفتاح');
    loadSettings();
}
async function downloadBackup() { try { const res = await fetch(API + '/system/backup', { headers: authHeaders() }); const blob = await res.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'e-nile-backup.json'; a.click(); showToast('تم التحميل'); } catch(e) { Swal.fire('خطأ', 'تعذر التحميل', 'error'); } }
async function restoreBackup() {
    const input = document.createElement('input'); input.type = 'file'; input.accept = '.json';
    input.onchange = async () => {
        const file = input.files[0]; if (!file) return;
        const confirmed = await Swal.fire({ title: 'استرجاع النسخة؟', text: 'سيتم استبدال جميع البيانات الحالية.', icon: 'warning', showCancelButton: true, confirmButtonText: 'استرجاع' });
        if (!confirmed.isConfirmed) return;
        try {
            const backup = JSON.parse(await file.text());
            const res = await fetch(API + '/system/restore', { method: 'POST', headers: authHeaders(), body: JSON.stringify(backup) });
            const data = await res.json(); if (!res.ok) throw new Error(data.error);
            await Swal.fire('تم الاسترجاع', 'تمت استعادة البيانات بنجاح.', 'success'); renderAdminDashboard('students');
        } catch (e) { Swal.fire('خطأ', e.message || 'ملف النسخة غير صالح', 'error'); }
    };
    input.click();
}
async function confirmSystemWipe() { const { value: text } = await Swal.fire({ title: 'متأكد؟', html: `اكتب كلمة <b class="text-red-600">حذف</b> للتأكيد.`, input: 'text', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', preConfirm: (val) => val === 'حذف' }); if (text) { await fetch(API + '/system/reset', { method: 'POST', headers: authHeaders() }); Swal.fire('تم التصفير', '', 'success').then(() => renderAdminDashboard('students')); } }

function filterStudents(query) { document.querySelectorAll('.student-card').forEach(c => c.style.display = c.innerText.toLowerCase().includes(query.toLowerCase()) ? 'block' : 'none'); }
async function loadStudentsList() {
    const res = await fetch(API + '/students-list', { headers: authHeaders() }); const depts = await res.json();
    document.getElementById('admin-content').innerHTML = `<div class="space-y-6">${depts.map(d => `<div class="student-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"><div class="bg-gray-50 p-4 border-b flex justify-between items-center"><h3 class="text-lg font-bold text-primary"><i class="fa-solid fa-building-columns ml-2"></i> ${d.name} (${d.students.length})</h3>${d.id !== 'general' ? `<button onclick="openAddStudentToDeptModal('${d.id}')" class="bg-green-50 text-green-700 px-3 py-1 rounded-lg font-bold text-sm">إضافة طالب</button>` : ''}</div><table class="w-full text-right"><tr class="bg-gray-100 text-sm text-gray-600"><th class="p-3">الاسم</th><th class="p-3">الرقم</th><th class="p-3">القاعات</th><th class="p-3 text-center">حذف</th></tr>${d.students.map(s => `<tr class="border-b"><td class="p-3 font-bold">${s.name}</td><td class="p-3">${s.universityId}</td><td class="p-3 text-sm">${s.rooms || '-'}</td><td class="p-3 text-center"><button onclick="deleteStudent('${s.id}', '${s.name}')" class="text-red-500 bg-red-50 px-2 py-1 rounded">حذف</button></td></tr>`).join('') || '<tr><td colspan="4" class="p-4 text-center">لا يوجد طلاب.</td></tr>'}</table></div>`).join('')}</div>`;
}
function openAddStudentToDeptModal(deptId) { Swal.fire({ title: 'طالب جديد', html: `<input id="n" class="swal2-input" placeholder="الاسم"><input id="u" class="swal2-input" placeholder="الرقم">`, preConfirm: () => ({ name: document.getElementById('n').value, universityId: document.getElementById('u').value }) }).then(async r => { if(r.isConfirmed) { await fetch(API + `/departments/${deptId}/students`, { method: 'POST', headers: authHeaders(), body: JSON.stringify(r.value) }); loadStudentsList(); } }); }
async function deleteStudent(id, name) { const res = await Swal.fire({ title: 'حذف الطالب؟', text: name, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' }); if(res.isConfirmed) { await fetch(API + '/students/' + id, { method: 'DELETE', headers: authHeaders() }); loadStudentsList(); } }
async function openBulkImportModal() {
    const res = await fetch(API + '/departments', { headers: authHeaders() }); const depts = await res.json();
    Swal.fire({ title: 'استيراد طلاب', html: `<select id="d" class="swal2-input">${depts.map(x => `<option value="${x.id}">${x.name}</option>`).join('')}</select><input type="file" id="f" accept=".xlsx" class="swal2-file"><textarea id="t" class="swal2-textarea" placeholder="أو الصق هنا..."></textarea>`, preConfirm: async () => {
        const d = document.getElementById('d').value, file = document.getElementById('f').files[0], text = document.getElementById('t').value;
        let stds = [];
        if (file) stds = await new Promise(r => { const rd = new FileReader(); rd.onload = e => { const wb = XLSX.read(e.target.result, {type:'binary'}); r(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1}).map(row => ({name:row[0], universityId:String(row[1])})).filter(x=>x.name && x.universityId)); }; rd.readAsBinaryString(file); });
        else if(text) stds = text.split('\n').filter(l=>l.trim()).map(l => { const p = l.split(/[-,]/); return p.length>=2 ? {name:p[0].trim(), universityId:p[1].trim()} : null; }).filter(Boolean);
        if(!stds.length) return false; return { deptId: d, students: stds };
    }}).then(async r => { if(r.isConfirmed) { await fetch(API + `/departments/${r.value.deptId}/students/bulk`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ students: r.value.students }) }); loadStudentsList(); } });
}

async function loadDepartments() { document.getElementById('admin-content').innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-6">${globalDepts.map(d => `<div onclick="renderAdminDashboard('subjects', '${d.id}')" class="bg-white p-6 rounded-2xl shadow-sm border cursor-pointer hover:shadow-lg"><div class="flex justify-between mb-4"><div class="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center text-2xl"><i class="fa-solid fa-building-columns"></i></div><button onclick="event.stopPropagation(); deleteDept('${d.id}')" class="text-red-400"><i class="fa-solid fa-trash"></i></button></div><h3 class="text-xl font-bold text-primary">${d.name}</h3><p class="text-gray-500 font-bold">${globalSubjects.filter(s=>s.departmentId===d.id).length} مادة</p></div>`).join('')}</div>`; }
async function loadSubjects() { document.getElementById('admin-content').innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-6">${globalSubjects.filter(s=>s.departmentId===activeDeptId).map(s => `<div onclick="renderAdminDashboard('subject-details', '${activeDeptId}', '${s.id}')" class="bg-white p-6 rounded-2xl shadow-sm border cursor-pointer hover:shadow-lg"><div class="flex justify-between mb-4"><div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-2xl"><i class="fa-solid fa-book"></i></div><button onclick="event.stopPropagation(); deleteSubject('${s.id}')" class="text-red-400"><i class="fa-solid fa-trash"></i></button></div><h3 class="text-xl font-bold text-gray-800">${s.name}</h3></div>`).join('')}</div>`; }
function openCreateDeptModal() { Swal.fire({ title: 'قسم جديد', input: 'text', showCancelButton: true }).then(async r => { if(r.isConfirmed && r.value) { await fetch(API + '/departments', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name: r.value }) }); renderAdminDashboard('departments'); } }); }
async function deleteDept(id) { if((await Swal.fire({title:'حذف القسم؟',icon:'warning',showCancelButton:true})).isConfirmed) { await fetch(API + '/departments/' + id, { method: 'DELETE', headers: authHeaders() }); renderAdminDashboard('departments'); } }
async function deleteSubject(id) { if((await Swal.fire({title:'حذف المادة؟',icon:'warning',showCancelButton:true})).isConfirmed) { await fetch(API + '/subjects/' + id, { method: 'DELETE', headers: authHeaders() }); renderAdminDashboard('subjects', activeDeptId); } }
function openAddSubjectModal(id, name) { Swal.fire({ title: 'مادة جديدة', input: 'text', showCancelButton: true }).then(async r => { if(r.isConfirmed && r.value) { await fetch(API + '/subjects', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ departmentId: id, name: r.value }) }); renderAdminDashboard('subjects', id); } }); }

// ================= SUBJECT EXAMS =================
async function loadSubjectExams() {
    const subRooms = globalRooms.filter(r=>r.subjectId===activeSubjectId);
    document.getElementById('admin-content').innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-6">${subRooms.map(r => `
        <div class="bg-white p-6 rounded-2xl shadow-sm border flex flex-col">
            <div class="flex justify-between mb-4">
                <div class="w-12 h-12 ${r.status==='active' ? 'bg-green-100 text-green-600' : r.status==='closed' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} rounded-xl flex items-center justify-center text-2xl"><i class="fa-solid fa-file-signature"></i></div>
                <div class="flex gap-1">
                    <button onclick="duplicateExam('${r.id}')" class="text-blue-500 hover:bg-blue-50 p-1.5 rounded" title="نسخ"><i class="fa-solid fa-copy"></i></button>
                    <button onclick="deleteRoom('${r.id}')" class="text-red-500 hover:bg-red-50 p-1.5 rounded" title="حذف"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <h3 class="text-xl font-bold mb-1">${r.name}</h3>
            <div class="flex gap-2 mb-2">
                <span class="px-2 py-1 text-xs font-bold rounded bg-gray-100 text-gray-600">${r.status === 'draft' ? 'مسودة' : r.status === 'active' ? 'مفتوح' : 'مغلق'}</span>
                <span class="px-2 py-1 text-xs font-bold rounded ${r.isGradesPublished ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${r.isGradesPublished ? 'الدرجات معلنة' : 'الدرجات مخفية'}</span>
            </div>
            <p class="text-sm text-gray-500 mb-2">${r.durationMin} دقيقة | ${r.questions.length} سؤال</p>
            ${r.scheduledOpenAt || r.scheduledCloseAt ? `<p class="text-xs text-indigo-600 mb-4"><i class="fa-solid fa-clock ml-1"></i> ${r.scheduledOpenAt ? `فتح: ${new Date(r.scheduledOpenAt).toLocaleString('ar')}` : ''}${r.scheduledCloseAt ? ` | إغلاق: ${new Date(r.scheduledCloseAt).toLocaleString('ar')}` : ''}</p>` : ''}
            <button onclick="renderAdminDashboard('exam-builder', '${activeDeptId}', '${activeSubjectId}', '${r.id}')" class="mt-auto bg-primary text-white py-2 rounded-lg font-bold">دخول ورشة الامتحان</button>
        </div>
    `).join('')}</div>`;
}
async function duplicateExam(id) {
    const res = await Swal.fire({ title: 'نسخ الامتحان؟', text: 'سيتم إنشاء نسخة جديدة (مسودة).', icon: 'info', showCancelButton: true });
    if(res.isConfirmed) { await fetch(API + `/rooms/${id}/duplicate`, { method: 'POST', headers: authHeaders() }); const rRes = await fetch(API + '/rooms', { headers: authHeaders() }); globalRooms = await rRes.json(); loadSubjectExams(); showToast('تم النسخ'); }
}
async function deleteRoom(id) { if((await Swal.fire({title:'حذف الامتحان؟',icon:'warning',showCancelButton:true})).isConfirmed) { await fetch(API + '/rooms/' + id, { method: 'DELETE', headers: authHeaders() }); const rRes = await fetch(API + '/rooms', { headers: authHeaders() }); globalRooms = await rRes.json(); loadSubjectExams(); } }
async function openCreateRoomModal(subId) {
    Swal.fire({
        title: 'إنشاء امتحان جديد',
        html: `<input id="n" class="swal2-input" placeholder="اسم الامتحان"><input id="t" type="number" class="swal2-input" value="60" placeholder="المدة (دقيقة)"><label class="block text-right font-bold mt-3">فتح تلقائي (اختياري)</label><input id="open-at" type="datetime-local" class="swal2-input"><label class="block text-right font-bold mt-3">إغلاق تلقائي (اختياري)</label><input id="close-at" type="datetime-local" class="swal2-input"><select id="tpl" class="swal2-select"><option value="">بدون قالب (إعدادات افتراضية)</option></select>`,
        didOpen: async () => {
            const tplRes = await fetch(API + '/templates', { headers: authHeaders() }); globalTemplates = await tplRes.json();
            const tplSelect = document.getElementById('tpl');
            globalTemplates.forEach(t => { tplSelect.innerHTML += `<option value="${t.id}">${t.name} (${t.durationMin} دقيقة)</option>`; });
        },
        preConfirm: () => {
            const tplId = document.getElementById('tpl').value;
            const tpl = globalTemplates.find(x => x.id === tplId);
            const scheduledOpenAt = document.getElementById('open-at').value || null;
            const scheduledCloseAt = document.getElementById('close-at').value || null;
            if (scheduledOpenAt && scheduledCloseAt && new Date(scheduledCloseAt) <= new Date(scheduledOpenAt)) { Swal.showValidationMessage('وقت الإغلاق يجب أن يكون بعد وقت الفتح'); return false; }
            return { name: document.getElementById('n').value, durationMin: Number(document.getElementById('t').value), subjectId: subId, pin: '', scheduledOpenAt, scheduledCloseAt, protection: tpl ? tpl.protection : {} };
        }
    }).then(async r => {
        if(r.isConfirmed && r.value.name) {
            const res = await fetch(API + '/rooms', { method: 'POST', headers: authHeaders(), body: JSON.stringify(r.value) });
            const room = await res.json(); renderAdminDashboard('exam-builder', activeDeptId, subId, room.id);
        }
    });
}

// ================= EXAM BUILDER =================
async function loadExamBuilder() {
    const room = globalRooms.find(r => r.id === activeRoomId);
    if(!room) return showToast('الامتحان غير موجود', 'error');

    if (!activeQuestionId && room.questions.length > 0) activeQuestionId = room.questions[0].id;

    document.getElementById('admin-content').innerHTML = `
    <div class="max-w-6xl mx-auto space-y-6">
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-xl bg-blue-50 text-primary flex items-center justify-center text-2xl"><i class="fa-solid fa-file-signature"></i></div>
                <div><h2 class="text-2xl font-bold text-gray-800">${room.name}</h2><p class="text-gray-500 font-bold text-sm">${room.questions.length} سؤال | ${room.durationMin} دقيقة | الحالة: ${room.status === 'draft' ? 'مسودة' : room.status === 'active' ? 'مفتوح' : 'مغلق'}</p></div>
            </div>
            <div class="flex gap-2 flex-wrap">
                <button onclick="previewExam('${room.id}')" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200"><i class="fa-solid fa-eye ml-2"></i> معاينة</button>
                <button onclick="openExamSettingsModal('${room.id}')" class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-200"><i class="fa-solid fa-gear ml-2"></i> الإعدادات</button>
                <button onclick="openImportQuestionsModal('${room.id}')" class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100"><i class="fa-solid fa-file-import ml-2"></i> استيراد أسئلة</button>
                <button onclick="openAIQuestionsModal('${room.id}')" class="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700"><i class="fa-solid fa-wand-magic-sparkles ml-2"></i> الذكاء الاصطناعي</button>
                ${room.status === 'draft' ? `<button onclick="publishExam()" class="bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 shadow-md"><i class="fa-solid fa-rocket ml-2"></i> رفع وفتح للطلاب</button>` : `<button onclick="closeRoom('${room.id}')" class="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 shadow-md"><i class="fa-solid fa-lock ml-2"></i> قفل القاعة</button>`}
            </div>
        </div>

        <div class="flex flex-col lg:flex-row gap-6 items-start">
            <div class="w-full lg:w-1/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <button onclick="addBlankQuestion()" class="w-full bg-primary text-white py-3 rounded-xl font-bold mb-4 hover:bg-blue-800 transition-colors flex items-center justify-center"><i class="fa-solid fa-plus ml-2"></i> إضافة سؤال جديد</button>
                <div class="space-y-2 max-h-[60vh] overflow-y-auto pr-2" id="questions-list">
                    ${room.questions.length > 0 ? room.questions.map((q, i) => `
                        <div draggable="true" ondragstart="handleDragStart(event, '${q.id}')" ondragover="handleDragOver(event)" ondrop="handleDrop(event, '${q.id}')" onclick="selectQuestion('${q.id}')" class="p-3 rounded-lg border cursor-pointer transition-colors ${activeQuestionId === q.id ? 'border-primary bg-blue-50 shadow-sm' : 'border-gray-200 hover:bg-gray-50'}">
                            <div class="flex justify-between items-center"><span class="font-bold text-gray-700">سؤال ${i+1}</span><div class="flex gap-2"><span class="text-xs bg-gray-200 px-2 py-1 rounded font-bold">${q.points || 1} ن</span><span class="text-xs px-2 py-1 rounded font-bold ${q.type === 'essay' ? 'bg-orange-100 text-orange-700' : q.type === 'tf' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${q.type === 'essay' ? 'مقالي' : q.type === 'tf' ? 'صح/خطأ' : 'اختياري'}</span></div></div>
                            <p class="text-sm text-gray-500 truncate mt-1">${q.text || 'سؤال جديد...'}</p>
                        </div>
                    `).join('') : '<div class="text-center text-gray-500 py-6 text-sm">لا توجد أسئلة. اضغط "إضافة سؤال جديد".</div>'}
                </div>
            </div>

            <div class="w-full lg:w-2/3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[400px]">
                ${activeQuestionId ? renderQuestionEditor(room, activeQuestionId) : '<div class="text-center text-gray-500 py-20 font-bold flex flex-col items-center"><i class="fa-solid fa-arrow-right text-4xl mb-4 text-gray-300"></i> اختر سؤالاً من القائمة أو أضف سؤالاً جديداً.</div>'}
            </div>
        </div>
    </div>`;
}

function renderQuestionEditor(room, qId) {
    const q = room.questions.find(x => x.id === qId);
    if(!q) return '';
    const isMcq = q.type !== 'tf' && q.type !== 'essay';

    return `
    <div class="space-y-6">
        <div class="flex justify-between items-center border-b pb-4">
            <div class="flex items-center gap-4">
                <h3 class="text-xl font-bold text-primary"><i class="fa-solid fa-pen-to-square ml-2"></i> محرر السؤال</h3>
                <select id="q-type" onchange="changeQuestionType('${q.id}', this.value)" class="p-2 border rounded-lg bg-gray-50 font-bold outline-none">
                    <option value="mcq" ${q.type === 'mcq' || !q.type ? 'selected' : ''}>اختيار من متعدد</option>
                    <option value="tf" ${q.type === 'tf' ? 'selected' : ''}>صح / خطأ</option>
                    <option value="essay" ${q.type === 'essay' ? 'selected' : ''}>مقالي</option>
                </select>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="deleteQuestionFromBuilder('${room.id}', '${q.id}')" class="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg" title="حذف السؤال"><i class="fa-solid fa-trash"></i></button>
                <input type="number" id="q-points" value="${q.points || 1}" class="w-20 p-2 border rounded-lg text-center font-bold outline-none focus:border-primary" min="1"><span class="text-gray-600 font-bold">نقطة</span>
            </div>
        </div>
        <div><label class="block font-bold text-gray-700 mb-2">نص السؤال:</label><textarea id="q-text" class="w-full p-4 border rounded-xl h-32 outline-none focus:border-primary text-lg">${q.text}</textarea></div>

        ${isMcq ? `
        <div>
            <label class="block font-bold text-gray-700 mb-2 flex justify-between items-center"><span>الاختيارات (حدد الدائرة للإجابة الصحيحة):</span><button onclick="addChoiceInput()" class="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition-colors"><i class="fa-solid fa-plus ml-1"></i> إضافة اختيار</button></label>
            <div id="choices-container" class="space-y-3">
                ${q.choices.map((c, i) => `<div class="flex items-center gap-3 choice-row"><input type="radio" name="correct-choice" value="${i}" ${c.isCorrect ? 'checked' : ''} class="w-6 h-6 text-primary cursor-pointer"><input type="text" value="${c.text}" class="flex-1 p-3 border rounded-lg outline-none focus:border-primary choice-input" placeholder="نص الاختيار"><button onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-600 p-2" title="حذف الاختيار"><i class="fa-solid fa-xmark"></i></button></div>`).join('')}
            </div>
        </div>` : q.type === 'tf' ? `
        <div class="bg-gray-50 p-4 rounded-xl border">
            <label class="block font-bold text-gray-700 mb-2">الإجابة الصحيحة:</label>
            <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="tf-answer" value="true" ${q.choices && q.choices[0]?.isCorrect ? 'checked' : ''} class="w-5 h-5 text-primary"> صح</label>
                <label class="flex items-center gap-2 cursor-pointer"><input type="radio" name="tf-answer" value="false" ${q.choices && q.choices[1]?.isCorrect ? 'checked' : ''} class="w-5 h-5 text-primary"> خطأ</label>
            </div>
        </div>` : `
        <div class="bg-orange-50 p-4 rounded-xl border border-orange-200 text-orange-800"><p class="font-bold"><i class="fa-solid fa-circle-info ml-1"></i> السؤال المقالي:</p><p class="text-sm mt-1">سيظهر للطالب كمساحة نصية فارغة للكتابة. لن يتم تصحيحه آلياً، بل ستتم مراجعته يدوياً من قبل الدكتور.</p></div>
        `}

        <div class="flex justify-end pt-4 border-t"><button onclick="saveQuestionChanges('${room.id}', '${q.id}')" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-colors"><i class="fa-solid fa-floppy-disk ml-2"></i> حفظ التعديلات</button></div>
    </div>`;
}

function changeQuestionType(qId, newType) {
    const room = globalRooms.find(r => r.id === activeRoomId);
    const q = room.questions.find(x => x.id === qId);
    if(newType === 'tf') { q.type = 'tf'; q.choices = [{id: 't', text: 'صح', isCorrect: true}, {id: 'f', text: 'خطأ', isCorrect: false}]; }
    else if(newType === 'essay') { q.type = 'essay'; q.choices = []; }
    else { q.type = 'mcq'; if(q.choices.length === 0) q.choices = [{id:'1', text:'', isCorrect:true},{id:'2', text:'', isCorrect:false}]; }
    loadExamBuilder();
}

function selectQuestion(qId) { activeQuestionId = qId; loadExamBuilder(); }
async function addBlankQuestion() {
    const newQ = { id: Math.random().toString(), text: '', type: 'mcq', points: 1, choices: [{ id: Math.random().toString(), text: '', isCorrect: true }, { id: Math.random().toString(), text: '', isCorrect: false }] };
    await fetch(API + `/rooms/${activeRoomId}/questions`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ questions: [newQ] }) });
    const rRes = await fetch(API + '/rooms', { headers: authHeaders() }); globalRooms = await rRes.json();
    activeQuestionId = newQ.id; loadExamBuilder(); showToast('تم إضافة سؤال جديد');
}

function addChoiceInput() {
    const container = document.getElementById('choices-container');
    const div = document.createElement('div'); div.className = 'flex items-center gap-3 choice-row';
    div.innerHTML = `<input type="radio" name="correct-choice" class="w-6 h-6 text-primary cursor-pointer"><input type="text" class="flex-1 p-3 border rounded-lg outline-none focus:border-primary choice-input" placeholder="نص الاختيار"><button onclick="this.parentElement.remove()" class="text-red-400 hover:text-red-600 p-2"><i class="fa-solid fa-xmark"></i></button>`;
    container.appendChild(div);
}

async function saveQuestionChanges(roomId, qId) {
    const text = document.getElementById('q-text').value;
    const points = Number(document.getElementById('q-points').value) || 1;
    const qType = document.getElementById('q-type').value;
    let choices = [], hasCorrect = false;

    if (qType === 'mcq') {
        const rows = document.querySelectorAll('.choice-row');
        rows.forEach((row) => {
            const choiceText = row.querySelector('.choice-input').value;
            const isCorrect = row.querySelector('input[type="radio"]').checked;
            if (isCorrect) hasCorrect = true;
            if (choiceText.trim()) choices.push({ id: Math.random().toString(), text: choiceText.trim(), isCorrect });
        });
        if (choices.length < 2) return showToast('أدخل اختيارين على الأقل', 'warning');
        if (!hasCorrect) return showToast('حدد إجابة صحيحة واحدة', 'warning');
    } else if (qType === 'tf') {
        const isTrue = document.querySelector('input[name="tf-answer"][value="true"]').checked;
        choices = [{id:'t', text:'صح', isCorrect: isTrue}, {id:'f', text:'خطأ', isCorrect: !isTrue}];
    }

    if (!text.trim()) return showToast('أدخل نص السؤال', 'warning');

    await fetch(API + `/rooms/${roomId}/questions/${qId}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ text, points, type: qType, choices }) });
    showToast('تم حفظ السؤال بنجاح');
    const rRes = await fetch(API + '/rooms', { headers: authHeaders() }); globalRooms = await rRes.json(); loadExamBuilder();
}

async function deleteQuestionFromBuilder(roomId, qId) {
    const res = await Swal.fire({ title: 'حذف السؤال؟', text: 'سيتم حذف هذا السؤال نهائياً.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if(res.isConfirmed) { await fetch(API + `/rooms/${roomId}/questions/${qId}`, { method: 'DELETE', headers: authHeaders() }); const rRes = await fetch(API + '/rooms', { headers: authHeaders() }); globalRooms = await rRes.json(); activeQuestionId = globalRooms.find(r => r.id === roomId).questions[0]?.id || null; loadExamBuilder(); showToast('تم حذف السؤال'); }
}

// Drag and Drop Logic
let draggedQId = null;
function handleDragStart(e, qId) { draggedQId = qId; e.dataTransfer.effectAllowed = 'move'; }
function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
async function handleDrop(e, targetQId) {
    e.preventDefault();
    if (draggedQId === targetQId) return;
    const room = globalRooms.find(r => r.id === activeRoomId);
    const qs = [...room.questions];
    const dragIdx = qs.findIndex(q => q.id === draggedQId);
    const targetIdx = qs.findIndex(q => q.id === targetQId);
    const [draggedQ] = qs.splice(dragIdx, 1);
    qs.splice(targetIdx, 0, draggedQ);
    room.questions = qs; loadExamBuilder(); // Update UI immediately
    await fetch(API + `/rooms/${activeRoomId}/questions/reorder`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ questions: qs }) }); // Send to backend
}

// Exam Settings & Preview & Publish
function openExamSettingsModal(roomId) {
    const room = globalRooms.find(r => r.id === roomId);
    Swal.fire({
        title: 'إعدادات الامتحان', width: '650px',
        html: `<div class="text-right space-y-4 mt-4"><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-bold mb-1">اسم الامتحان</label><input type="text" id="set-name" class="w-full p-3 border rounded-xl" value="${room.name}"></div><div><label class="block text-sm font-bold mb-1">المدة (دقيقة)</label><input type="number" id="set-time" class="w-full p-3 border rounded-xl" value="${room.durationMin}"></div></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-bold mb-1">فتح تلقائي</label><input type="datetime-local" id="set-open-at" class="w-full p-3 border rounded-xl" value="${room.scheduledOpenAt ? new Date(room.scheduledOpenAt).toISOString().slice(0,16) : ''}"></div><div><label class="block text-sm font-bold mb-1">إغلاق تلقائي</label><input type="datetime-local" id="set-close-at" class="w-full p-3 border rounded-xl" value="${room.scheduledCloseAt ? new Date(room.scheduledCloseAt).toISOString().slice(0,16) : ''}"></div></div><div class="grid grid-cols-2 gap-4"><div><label class="block text-sm font-bold mb-1">رمز الدخول (PIN)</label><input type="text" id="set-pin" class="w-full p-3 border rounded-xl" value="${room.pin || ''}" placeholder="اتركه فارغاً لإلغاء الرمز"></div><div><label class="block text-sm font-bold mb-1">إعلان الدرجات</label><select id="set-grades" class="w-full p-3 border rounded-xl"><option value="false" ${!room.isGradesPublished ? 'selected' : ''}>مخفي (لحين المراجعة)</option><option value="true" ${room.isGradesPublished ? 'selected' : ''}>معلن للطلاب</option></select></div></div><hr class="my-4"><h4 class="font-bold text-primary mb-2">إعدادات الحماية:</h4><div class="grid grid-cols-2 gap-2"><label class="flex items-center p-3 bg-gray-50 rounded-xl border cursor-pointer"><input type="checkbox" id="bp1" ${room.protection?.preventCopy ? 'checked' : ''} class="ml-2"><span class="text-sm font-bold">منع النسخ</span></label><label class="flex items-center p-3 bg-gray-50 rounded-xl border cursor-pointer"><input type="checkbox" id="bp2" ${room.protection?.preventRightClick ? 'checked' : ''} class="ml-2"><span class="text-sm font-bold">منع كليك يمين</span></label><label class="flex items-center p-3 bg-gray-50 rounded-xl border cursor-pointer"><input type="checkbox" id="bp3" ${room.protection?.detectTabSwitch ? 'checked' : ''} class="ml-2"><span class="text-sm font-bold">كشف التبويب</span></label><label class="flex items-center p-3 bg-gray-50 rounded-xl border cursor-pointer"><input type="checkbox" id="bp4" ${room.protection?.enableCamera ? 'checked' : ''} class="ml-2"><span class="text-sm font-bold">كاميرا</span></label><label class="flex items-center p-3 bg-gray-50 rounded-xl border cursor-pointer"><input type="checkbox" id="bp5" ${room.protection?.allowReview ? 'checked' : ''} class="ml-2"><span class="text-sm font-bold">مراجعة الطالب</span></label><label class="flex items-center p-3 bg-gray-50 rounded-xl border cursor-pointer"><input type="checkbox" id="bp6" ${room.protection?.randomizeChoices ? 'checked' : ''} class="ml-2"><span class="text-sm font-bold">عشوائية اختيارات</span></label></div><button onclick="saveAsTemplate()" class="mt-4 text-sm text-blue-600 hover:underline"><i class="fa-solid fa-save ml-1"></i> حفظ هذه الإعدادات كقالب للاستخدام لاحقاً</button></div>`,
        confirmButtonText: 'حفظ الإعدادات', confirmButtonColor: '#10b981', showCancelButton: true,
        preConfirm: () => { const name = document.getElementById('set-name').value; const durationMin = Number(document.getElementById('set-time').value); if (!name || !durationMin) return false; return { name, durationMin, scheduledOpenAt: document.getElementById('set-open-at').value || null, scheduledCloseAt: document.getElementById('set-close-at').value || null, pin: document.getElementById('set-pin').value, isGradesPublished: document.getElementById('set-grades').value === 'true', protection: { preventCopy: document.getElementById('bp1').checked, preventRightClick: document.getElementById('bp2').checked, detectTabSwitch: document.getElementById('bp3').checked, enableCamera: document.getElementById('bp4').checked, allowReview: document.getElementById('bp5').checked, randomizeChoices: document.getElementById('bp6').checked } }; }
    }).then(async r => { if (r.isConfirmed) { await fetch(API + `/rooms/${roomId}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(r.value) }); const rRes = await fetch(API + '/rooms', { headers: authHeaders() }); globalRooms = await rRes.json(); loadExamBuilder(); showToast('تم الحفظ'); } });
}

async function saveAsTemplate() {
    const name = document.getElementById('set-name').value;
    const durationMin = Number(document.getElementById('set-time').value);
    const protection = { preventCopy: document.getElementById('bp1').checked, preventRightClick: document.getElementById('bp2').checked, detectTabSwitch: document.getElementById('bp3').checked, enableCamera: document.getElementById('bp4').checked, allowReview: document.getElementById('bp5').checked, randomizeChoices: document.getElementById('bp6').checked };
    await fetch(API + '/templates', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ name, durationMin, protection }) });
    showToast('تم حفظ القالب بنجاح');
}

function previewExam(roomId) {
    const room = globalRooms.find(r => r.id === roomId);
    examState = { attempt: { answers: {} }, room: room, questions: room.questions, currentIdx: 0, flagged: [], isPreview: true };
    renderExamUI();
}

async function publishExam() {
    const res = await Swal.fire({ title: 'رفع القاعة للطلاب؟', text: "سيتم فتح القاعة الآن للطلاب المسجلين.", icon: 'question', showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'نعم، افتح القاعة', cancelButtonText: 'إلغاء' });
    if(!res.isConfirmed) return;
    await fetch(API + `/rooms/${activeRoomId}/open`, { method: 'POST', headers: authHeaders() }); showToast('تم رفع القاعة وفتحها للطلاب', 'success'); const rRes = await fetch(API + '/rooms', { headers: authHeaders() }); globalRooms = await rRes.json(); loadExamBuilder();
}
function closeRoom(id) { Swal.fire({ title: 'قفل القاعة؟', icon: 'warning', showCancelButton: true }).then(async r => { if(r.isConfirmed) { await fetch(API + `/rooms/${id}/close`, { method: 'POST', headers: authHeaders() }); const rRes = await fetch(API + '/rooms', { headers: authHeaders() }); globalRooms = await rRes.json(); loadExamBuilder(); } }); }

async function openImportQuestionsModal(roomId) {
    Swal.fire({
        title: 'استيراد أسئلة', width: '650px',
        html: `<div class="text-right space-y-4 mt-4"><div class="bg-blue-50 p-3 rounded-xl text-sm text-blue-800"><p class="font-bold mb-1"><i class="fa-solid fa-circle-info ml-1"></i> تعليمات:</p><ul class="list-disc pr-5"><li>السؤال في سطر.</li><li>الاختيارات بعده.</li><li>ضع <b class="text-red-500">(*)</b> قبل الإجابة الصحيحة.</li><li>سطر فارغ بين كل سؤال.</li></ul></div><div><label class="block text-sm font-bold mb-1">1. ملف Word أو PDF:</label><input type="file" id="exam-file" accept=".docx, .pdf" class="block w-full border p-3 rounded-xl bg-gray-50"></div><div class="text-center text-gray-400 font-bold py-2">- أو -</div><div><label class="block text-sm font-bold mb-1">2. الصق النص:</label><textarea id="exam-text" class="w-full p-3 border rounded-xl h-32" placeholder="1. ما ناتج 2+2؟&#10;3&#10;*4&#10;5"></textarea></div></div>`,
        confirmButtonText: 'تحليل وإضافة', confirmButtonColor: '#10b981', showCancelButton: true, cancelButtonText: 'إلغاء',
        preConfirm: async () => {
            const file = document.getElementById('exam-file').files[0]; const textVal = document.getElementById('exam-text').value; let finalText = textVal;
            if (file) { Swal.showLoading(); try { if (file.name.endsWith('.docx')) { const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() }); finalText = result.value; } else if (file.name.endsWith('.pdf')) { const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise; let ext = ""; for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const textContent = await page.getTextContent(); ext += textContent.items.map(item => item.str).join(' ') + '\n'; } finalText = ext; } } catch (e) { Swal.showValidationMessage('خطأ في الملف: ' + e.message); return false; } }
            if (!finalText || !finalText.trim()) { Swal.showValidationMessage('أرفق ملف أو الصق نص'); return false; }
            const blocks = finalText.split(/\n\s*\n/); let parsedQuestions = [];
            blocks.forEach(block => { const lines = block.split('\n').map(l => l.trim()).filter(l => l); if (lines.length >= 3) { const qText = lines[0]; let choices = []; let hasCorrect = false; lines.slice(1).forEach((l) => { const isCorrect = l.startsWith('*'); if (isCorrect) hasCorrect = true; choices.push({ id: Math.random().toString(), text: l.replace(/^\*/, '').trim(), isCorrect }); }); if (hasCorrect) parsedQuestions.push({ id: Math.random().toString(), text: qText, type: 'mcq', points: 1, choices }); } });
            if (parsedQuestions.length === 0) { Swal.showValidationMessage('لم يتم العثور على أسئلة صالحة'); return false; }
            return parsedQuestions;
        }
    }).then(async (r) => { if (r.isConfirmed) { await fetch(API + `/rooms/${roomId}/questions`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ questions: r.value }) }); Swal.fire('تم بنجاح', `تم استيراد ${r.value.length} سؤال.`, 'success'); const rRes = await fetch(API + '/rooms', { headers: authHeaders() }); globalRooms = await rRes.json(); loadExamBuilder(); } });
}

async function extractAIFileText(file) {
    if (!file) return '';
    const name = file.name.toLowerCase();
    if (name.endsWith('.docx')) {
        return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
    }
    if (name.endsWith('.pdf')) {
        const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
        let text = '';
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            const page = await pdf.getPage(pageNumber);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n';
        }
        return text;
    }
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        return workbook.SheetNames.map(sheet => XLSX.utils.sheet_to_csv(workbook.Sheets[sheet])).join('\n');
    }
    throw new Error('الملف المدعوم يجب أن يكون PDF أو DOCX أو XLSX');
}

async function openAIQuestionsModal(roomId) {
    const room = globalRooms.find(r => r.id === roomId);
    if (!room) return;
    if (!window.aiProviders) {
        const configResponse = await fetch(API + '/ai/config', { headers: authHeaders() });
        if (configResponse.ok) window.aiProviders = (await configResponse.json()).providers || [];
    }
    const providers = (window.aiProviders || []).filter(item => item.configured && item.enabled !== false);
    if (!providers.length) return Swal.fire('لا توجد مزودات', 'أضف مفتاح API من إعدادات النظام أولاً.', 'warning');
    const providerOptions = `<option value="" data-model="">كل المزودين حسب الإعداد</option>${providers.map(item => `<option value="${item.id}" data-model="${item.model || ''}">${item.name}</option>`).join('')}`;
    Swal.fire({
        title: 'إنشاء أسئلة بالذكاء الاصطناعي',
        width: '720px',
        html: `<div class="text-right space-y-3">
            <div class="bg-purple-50 text-purple-900 p-3 rounded-xl text-sm">المفاتيح محفوظة في الخادم. لن يتم إرسالها إلى المتصفح أو تخزينها في المشروع.</div>
            <div class="grid grid-cols-2 gap-3">
                <select id="ai-provider" class="swal2-select" onchange="document.getElementById('ai-model').value=this.options[this.selectedIndex].dataset.model || ''">${providerOptions}</select>
                <input id="ai-model" class="swal2-input" placeholder="اسم الموديل (اختياري)">
                <input id="ai-count" type="number" min="1" max="50" value="10" class="swal2-input" placeholder="عدد الأسئلة">
                <select id="ai-type" class="swal2-select"><option value="mcq">اختيار من متعدد</option><option value="tf">صح أو خطأ</option><option value="essay">مقالية</option></select>
                <select id="ai-difficulty" class="swal2-select"><option value="متوسط">متوسط</option><option value="سهل">سهل</option><option value="صعب">صعب</option></select>
                <select id="ai-language" class="swal2-select"><option value="العربية">العربية</option><option value="English">English</option></select>
            </div>
            <label class="block font-bold">ملف المصدر</label>
            <input id="ai-file" type="file" accept=".pdf,.docx,.xlsx,.xls" class="block w-full border p-3 rounded-xl bg-gray-50">
            <textarea id="ai-text" class="w-full p-3 border rounded-xl h-28" placeholder="أو الصق محتوى المحاضرة هنا..."></textarea>
            <textarea id="ai-instruction" class="w-full p-3 border rounded-xl h-20" placeholder="تعليمات إضافية اختيارية، مثل: ركز على الوحدة الثالثة"></textarea>
            <label class="flex items-center gap-2 font-bold"><input id="ai-improve" type="checkbox"> تحسين أسئلة الامتحان الحالية بدل إنشاء أسئلة من الصفر</label>
        </div>`,
        confirmButtonText: 'تحليل وإنشاء مسودة',
        confirmButtonColor: '#7c3aed',
        showCancelButton: true,
        cancelButtonText: 'إلغاء',
        preConfirm: async () => {
            const file = document.getElementById('ai-file').files[0];
            const pastedText = document.getElementById('ai-text').value;
            const sourceText = pastedText.trim() || await extractAIFileText(file);
            if (sourceText.trim().length < 30) {
                Swal.showValidationMessage('أرفق ملفاً أو أدخل محتوى لا يقل عن 30 حرفاً');
                return false;
            }
            const improve = document.getElementById('ai-improve').checked;
            const provider = document.getElementById('ai-provider').value;
            const model = document.getElementById('ai-model').value.trim();
            Swal.showLoading();
            try {
                const response = await fetch(API + '/ai/generate-questions', {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify({
                        provider, model, sourceText,
                        count: Number(document.getElementById('ai-count').value),
                        type: document.getElementById('ai-type').value,
                        difficulty: document.getElementById('ai-difficulty').value,
                        language: document.getElementById('ai-language').value,
                        instruction: document.getElementById('ai-instruction').value,
                        existingQuestions: improve ? room.questions : null
                    })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'تعذر إنشاء الأسئلة');
                return data.questions;
            } catch (error) {
                Swal.showValidationMessage(error.message);
                return false;
            }
        }
    }).then(async result => {
        if (!result.isConfirmed || !result.value?.length) return;
        const questions = result.value;
        const preview = questions.map((q, index) => `<div class="text-right border-b py-2"><b>${index + 1}. ${q.text}</b><div class="text-sm text-gray-500">${q.choices?.map(c => `${c.isCorrect ? '✓ ' : ''}${c.text}`).join(' | ') || 'سؤال مقالي'}</div></div>`).join('');
        const approved = await Swal.fire({ title: `مسودة ${questions.length} سؤال`, html: `<div class="max-h-96 overflow-y-auto">${preview}</div>`, icon: 'info', showCancelButton: true, confirmButtonText: 'إضافة إلى الامتحان', cancelButtonText: 'إلغاء' });
        if (!approved.isConfirmed) return;
        const response = await fetch(API + `/rooms/${roomId}/questions`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ questions }) });
        if (!response.ok) return Swal.fire('خطأ', 'تعذر إضافة الأسئلة إلى الامتحان', 'error');
        const roomsResponse = await fetch(API + '/rooms', { headers: authHeaders() });
        globalRooms = await roomsResponse.json();
        loadExamBuilder();
        showToast('تمت إضافة مسودة الأسئلة');
    });
}

// ================= ADMIN EXTRA =================
async function loadAdminRooms() { document.getElementById('admin-content').innerHTML = `<div class="grid grid-cols-1 md:grid-cols-3 gap-6">${globalRooms.map(r => `<div class="bg-white p-6 rounded-2xl shadow-sm border flex flex-col"><div class="flex justify-between mb-4"><div class="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center text-2xl"><i class="fa-solid fa-door-open"></i></div></div><h3 class="text-xl font-bold mb-1">${r.name}</h3><p class="text-sm font-bold text-primary mb-1">${r.departmentName} - ${r.subjectName}</p><p class="text-sm text-gray-500 mb-4">${r.questions.length} سؤال | ${r.isOpen ? 'مفتوحة' : 'مغلقة'}</p><button onclick="renderAdminDashboard('exam-builder', null, null, '${r.id}')" class="mt-auto bg-gray-100 text-gray-700 py-2 rounded-lg font-bold">إدارة</button></div>`).join('')}</div>`; }
async function loadRoomDetails() { renderAdminDashboard('exam-builder', null, null, activeRoomId); }

// ================= ADMINS =================
async function loadAdmins() { const res = await fetch(API + '/admins', { headers: authHeaders() }); const admins = await res.json(); document.getElementById('admin-content').innerHTML = `<div class="bg-white rounded-2xl shadow-sm border overflow-hidden"><table class="w-full text-right"><tr class="bg-gray-100 border-b"><th class="p-4">الاسم</th><th class="p-4">المستخدم</th><th class="p-4">الصلاحية</th><th class="p-4">إجراءات</th></tr>${admins.map(a => `<tr class="border-b"><td class="p-4 font-bold">${a.name}</td><td class="p-4">${a.username}</td><td class="p-4"><span class="px-3 py-1 rounded text-xs font-bold ${a.isSuper ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}">${a.isSuper ? 'مدير عام' : 'أدمن'}</span></td><td class="p-4 flex gap-2"><button onclick="editAdminModal('${a.id}', '${a.name}', '${a.username}')" class="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold text-sm">تعديل</button>${!a.isSuper && a.id !== user.id ? `<button onclick="deleteAdmin('${a.id}', '${a.name}')" class="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-bold text-sm">حذف</button>` : ''}</td></tr>`).join('')}</table></div>`; }
function editAdminModal(id, name, username) { Swal.fire({ title: 'تعديل', html: `<input id="n" class="swal2-input" value="${name}"><input id="u" class="swal2-input" value="${username}"><input id="p" type="password" class="swal2-input" placeholder="مرور جديد (اختياري)">`, preConfirm: () => ({ name: document.getElementById('n').value, username: document.getElementById('u').value, password: document.getElementById('p').value || undefined }) }).then(async r => { if(r.isConfirmed) { const res = await fetch(API + '/admins/' + id, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(r.value) }); if(res.ok) loadAdmins(); else { const err = await res.json(); Swal.fire('خطأ', err.error, 'error'); } } }); }
function openAddAdminModal() { Swal.fire({ title: 'إضافة أدمن', html: `<input id="n" class="swal2-input" placeholder="الاسم"><input id="u" class="swal2-input" placeholder="المستخدم"><input id="p" type="password" class="swal2-input" placeholder="المرور">`, preConfirm: () => ({ name: document.getElementById('n').value, username: document.getElementById('u').value, password: document.getElementById('p').value }) }).then(async r => { if(r.isConfirmed) { const res = await fetch(API + '/admins', { method: 'POST', headers: authHeaders(), body: JSON.stringify(r.value) }); if(res.ok) loadAdmins(); else { const err = await res.json(); Swal.fire('خطأ', err.error, 'error'); } } }); }
async function deleteAdmin(id, name) { if((await Swal.fire({ title: 'حذف؟', text: name, icon: 'warning', showCancelButton: true })).isConfirmed) { await fetch(API + '/admins/' + id, { method: 'DELETE', headers: authHeaders() }); loadAdmins(); } }

// ================= STUDENT =================
function renderStudentDashboard() { app.innerHTML = `<div class="min-h-screen bg-gray-50"><header class="bg-white shadow-sm"><div class="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between"><h1 class="text-xl font-bold">بوابة الطالب</h1><button onclick="logout()" class="text-red-500 font-bold">خروج</button></div></header><main class="max-w-5xl mx-auto px-4 py-8"><h2 class="text-2xl font-bold mb-8">أهلاً ${user.name}</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-6">${user.rooms.map(r => `<div class="bg-white p-6 rounded-2xl shadow-sm border"><h3 class="text-xl font-bold mb-4">${r.name}</h3><button onclick="showInstructions('${r.id}')" class="w-full bg-primary text-white py-3 rounded-xl font-bold">دخول</button></div>`).join('')}</div></main></div>`; }
function showInstructions(roomId) { Swal.fire({ title: 'تعليمات', text: 'سيتم تشغيل الكاميرا، والغش مسجل.', icon: 'info', confirmButtonText: 'ابدأ' }).then(r => { if(r.isConfirmed) askForPin(roomId); }); }
async function askForPin(roomId) {
    const { value: pin } = await Swal.fire({ title: 'رمز الدخول', input: 'password', inputLabel: 'أدخل الرمز السري للامتحان (إن وجد)', showCancelButton: true, confirmButtonText: 'دخول', cancelButtonText: 'إلغاء' });
    if(pin !== undefined) startExam(roomId, pin);
}
async function startExam(roomId, pin = '') {
    try { const elem = document.documentElement; if (elem.requestFullscreen) { await elem.requestFullscreen(); } } catch (e) {}
    const res = await fetch(API + '/attempts/start', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ roomId, pin }) });
    const data = await res.json(); if(!res.ok) return Swal.fire('خطأ', data.error, 'error');
    examState = { attempt: data.attempt, room: data.room, questions: data.room.questions, currentIdx: 0, flagged: [], isPreview: false };
    setupProtection(data.room.protection); renderExamUI(); startTimer(data.room.durationMin * 60); startSnapshots(data.room.protection);
}
function renderExamUI() {
    const { room, questions, currentIdx, flagged, isPreview } = examState; const q = questions[currentIdx]; const isFlagged = flagged.includes(q.id);
    let navHtml = questions.map((x, i) => { let cls = 'w-8 h-8 rounded-lg font-bold text-sm flex items-center justify-center cursor-pointer '; if (i === currentIdx) cls += 'bg-primary text-white'; else if (flagged.includes(x.id)) cls += 'bg-yellow-100 text-yellow-700'; else if (examState.attempt.answers && examState.attempt.answers[x.id] !== undefined) cls += 'bg-green-100 text-green-700'; else cls += 'bg-gray-100 text-gray-600'; return `<button onclick="jumpToQ(${i})" class="${cls}">${i+1}</button>`; }).join('');

    let contentHtml = '';
    if (q.type === 'essay') {
        contentHtml = `<textarea id="essay-input" class="w-full p-4 border rounded-xl h-64 outline-none focus:border-primary text-lg" placeholder="اكتب إجابتك هنا..." oninput="saveEssayAnswer('${q.id}', this.value)">${examState.attempt.answers[q.id] || ''}</textarea>`;
    } else {
        contentHtml = q.choices.map(c => `<label class="block p-4 border rounded-xl cursor-pointer hover:bg-blue-50 ${examState.attempt.answers && examState.attempt.answers[q.id] === c.id ? 'border-primary bg-blue-50' : ''}"><input type="${q.type === 'tf' ? 'radio' : 'radio'}" name="q" onchange="saveAnswer('${q.id}', '${c.id}')" class="ml-4" ${examState.attempt.answers && examState.attempt.answers[q.id] === c.id ? 'checked' : ''}> ${c.text}</label>`).join('');
    }

    app.innerHTML = `
    <div class="min-h-screen bg-gray-100 flex flex-col" id="exam-container">
        <header class="bg-primary text-white p-4 flex justify-between items-center shadow-md">
            <h2 class="font-bold flex items-center gap-2">${room.name} ${isPreview ? '<span class="bg-yellow-400 text-black px-2 py-1 rounded text-xs">وضع المعاينة</span>' : ''}</h2>
            <div class="flex items-center gap-4">
                ${!isPreview ? `<span id="timer-display" class="font-mono text-xl bg-blue-800 px-4 py-1 rounded">--:--</span><button onclick="submitExam()" class="bg-red-500 px-4 py-2 rounded-lg text-sm font-bold">تسليم</button>` : `<button onclick="renderAdminDashboard('exam-builder', '${activeDeptId}', '${activeSubjectId}', '${activeRoomId}')" class="bg-white text-primary px-4 py-2 rounded-lg text-sm font-bold">خروج من المعاينة</button>`}
            </div>
        </header>
        <main class="flex-1 max-w-4xl w-full mx-auto p-4 py-8 flex gap-6">
            <div class="flex-1">
                <div class="bg-white p-8 rounded-2xl shadow-sm">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-xl font-bold text-gray-800">السؤال ${currentIdx+1}: ${q.text}</h3>
                        <button onclick="toggleFlag('${q.id}')" class="text-2xl ${isFlagged ? 'text-yellow-500' : 'text-gray-300'}"><i class="fa-solid fa-flag"></i></button>
                    </div>
                    <div class="space-y-3">${contentHtml}</div>
                    <div class="flex justify-between mt-8">
                        <button onclick="prevQ()" class="bg-gray-200 px-6 py-2 rounded-lg font-bold" ${currentIdx===0?'disabled':''}>السابق</button>
                        ${currentIdx === questions.length-1 ? (isPreview ? '' : `<button onclick="submitExam()" class="bg-green-500 text-white px-8 py-2 rounded-lg font-bold">تسليم</button>`) : `<button onclick="nextQ()" class="bg-primary text-white px-6 py-2 rounded-lg font-bold">التالي</button>`}
                    </div>
                </div>
            </div>
            <div class="w-64 bg-white p-4 rounded-2xl shadow-sm h-fit">
                <h4 class="font-bold mb-3 border-b pb-2">خريطة الأسئلة</h4>
                <div class="grid grid-cols-4 gap-2">${navHtml}</div>
            </div>
        </main>
    </div>`;
}
window.jumpToQ = (idx) => { examState.currentIdx = idx; renderExamUI(); };
window.toggleFlag = (qId) => { if(examState.flagged.includes(qId)) examState.flagged = examState.flagged.filter(id => id !== qId); else examState.flagged.push(qId); renderExamUI(); };
async function saveAnswer(qId, cId) {
    examState.attempt.answers = examState.attempt.answers || {}; examState.attempt.answers[qId] = cId; renderExamUI();
    if (examState.isPreview) return;
    try {
        const res = await fetch(API + `/attempts/${examState.attempt.id}/answer`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ qId, cId }) });
        if (!res.ok) throw new Error('answer sync failed');
    } catch {
        pendingAnswers = pendingAnswers.filter(a => !(a.attemptId === examState.attempt.id && a.qId === qId));
        pendingAnswers.push({ attemptId: examState.attempt.id, qId, cId });
        localStorage.setItem('pendingAnswers', JSON.stringify(pendingAnswers));
        showConnectionStatus();
    }
}
async function saveEssayAnswer(qId, text) { return saveAnswer(qId, text); }
function nextQ() { examState.currentIdx++; renderExamUI(); } function prevQ() { examState.currentIdx--; renderExamUI(); }
function startTimer(sec) { clearInterval(timerInterval); let t = sec; timerInterval = setInterval(() => { if(t <= 0) { clearInterval(timerInterval); submitExam(true); } const m = Math.floor(t/60).toString().padStart(2, '0'), s = (t%60).toString().padStart(2, '0'); const el = document.getElementById('timer-display'); if(el) el.innerText = `${m}:${s}`; t--; }, 1000); }
function startSnapshots(prot) { clearInterval(snapshotInterval); if(prot.enableCamera) { snapshotInterval = setInterval(() => { const vid = document.getElementById('cam-feed'); if(vid && vid.srcObject) { const canvas = document.createElement('canvas'); canvas.width = vid.videoWidth; canvas.height = vid.videoHeight; canvas.getContext('2d').drawImage(vid, 0, 0); const imgBase64 = canvas.toDataURL('image/jpeg'); fetch(API + `/attempts/${examState.attempt.id}/violation`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ type: 'periodic_snapshot', image: imgBase64 }) }); } }, 180000); } }
async function submitExam(isAuto) {
    if(!isAuto) { const res = await Swal.fire({ title: 'تسليم؟', text: "لن تتمكن من العودة.", icon: 'question', showCancelButton: true, confirmButtonText: 'نعم' }); if(!res.isConfirmed) return; }
    clearInterval(timerInterval); clearInterval(snapshotInterval); if (document.exitFullscreen) { document.exitFullscreen().catch(e=>{}); }
    const res = await fetch(API + `/attempts/${examState.attempt.id}/submit`, { method: 'POST', headers: authHeaders() }); const data = await res.json();
    const cam = document.getElementById('cam-feed'); if(cam && cam.srcObject) cam.srcObject.getTracks().forEach(t => t.stop());
    if(data.allowReview) { Swal.fire({ title: 'تم التسليم', text: `الدرجة: ${data.score} من ${data.total}`, icon: 'success' }).then(() => logout()); }
    else { Swal.fire({ title: 'تم التسليم', text: 'النتيجة قيد المراجعة الإدارية.', icon: 'success' }).then(() => logout()); }
}
function setupProtection(prot) {
    if(examState.isPreview) return;
    if(prot.preventRightClick) document.oncontextmenu = (e) => e.preventDefault(); if(prot.preventCopy) { document.oncopy = (e) => e.preventDefault(); document.body.style.userSelect = 'none'; }
    if(prot.enableCamera) { navigator.mediaDevices.getUserMedia({ video: true }).then(stream => { const vid = document.getElementById('cam-feed'); vid.srcObject = stream; vid.classList.remove('hidden'); }).catch(() => {}); }

    // Anti-Screenshot logic
    window.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen' || e.keyCode === 44) {
            navigator.clipboard.writeText(''); // Clear clipboard
            document.body.style.filter = 'blur(20px)';
            setTimeout(() => document.body.style.filter = 'none', 2000);
            fetch(API + `/attempts/${examState.attempt.id}/violation`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ type: 'screenshot_attempt' }) });
            Swal.fire({ icon: 'warning', title: 'ممنوع!', text: 'تم تسجيل محاولة أخذ لقطة شاشة.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
        }
    });

    if(prot.detectTabSwitch) { document.addEventListener('visibilitychange', () => { if(document.hidden && examState.attempt) { const vid = document.getElementById('cam-feed'); let imgBase64 = null; if(vid && vid.srcObject) { const canvas = document.createElement('canvas'); canvas.width = vid.videoWidth; canvas.height = vid.videoHeight; canvas.getContext('2d').drawImage(vid, 0, 0); imgBase64 = canvas.toDataURL('image/jpeg'); } fetch(API + `/attempts/${examState.attempt.id}/violation`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ type: 'tab_switch', image: imgBase64 }) }); Swal.fire({ icon: 'warning', title: 'تحذير!', text: 'تم تسجيل خروجك من الشاشة.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 }); } }); }
    document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && examState.attempt) { fetch(API + `/attempts/${examState.attempt.id}/violation`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ type: 'exit_fullscreen' }) }); Swal.fire({ icon: 'warning', title: 'تحذير!', text: 'الخروج من وضع ملء الشاشة يعتبر محاولة غش!', showConfirmButton: false, timer: 3000 }); setTimeout(() => { document.documentElement.requestFullscreen().catch(e=>{}); }, 1000); } });
}

init();
