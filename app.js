import { auth, db } from './firebase-db.js';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    collection, addDoc, query, orderBy, onSnapshot, 
    serverTimestamp, doc, getDoc, setDoc, deleteDoc, 
    updateDoc, getDocs, where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/* ==========================================
   1. Dynamic SweetAlert2 Configuration & Helpers (Dark/Light Compatible)
========================================== */
function getSwalColors() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    return {
        bg: isDark ? '#1E293B' : '#FFFFFF',
        color: isDark ? '#F8FAFC' : '#0F172A'
    };
}

function showToast(icon, title) {
    if (typeof Swal !== 'undefined') {
        const theme = getSwalColors();
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: title,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true,
            background: theme.bg,
            color: theme.color,
            customClass: { popup: 'my-swal-popup' },
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });
    }
}

function getCustomSwal() {
    if (typeof Swal === 'undefined') return null;
    const theme = getSwalColors();
    return Swal.mixin({
        background: theme.bg,
        color: theme.color,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#EF4444',
        customClass: {
            popup: 'my-swal-popup',
            title: 'my-swal-title',
            confirmButton: 'my-swal-confirm-btn',
            cancelButton: 'my-swal-cancel-btn'
        }
    });
}

function showSuccessToast(message) { showToast('success', message); }
function showErrorToast(message) { showToast('error', message); }
function showInfoToast(message) { showToast('info', message); }


/* ==========================================
   2. Language Translations (i18n)
========================================== */
const translations = {
    en: {
        auth_title: "Welcome Back", sign_in: "Sign In", sign_up: "Sign Up", no_account: "Don't have an account?",
        dashboard: "Dashboard", logout: "Logout", total_balance: "Total Balance", total_income: "Total Income", total_expense: "Total Expenses",
        recent_transactions: "Recent Transactions", add_transaction: "Add Transaction", income: "Income", expense: "Expense",
        select_category: "Category", select_wallet: "Wallet", save: "Save Transaction",
        nav_dashboard: "Home", nav_wallets: "Wallets", nav_loans: "Loans", nav_reports: "Reports", nav_profile: "Profile", nav_goals: "Goals", nav_settings: "Settings",
        app_title: "Expense Tracker", th_title: "Title", th_category: "Category", th_date: "Date", th_type: "Type", th_amount: "Amount",
        cat_income: "Income", cat_food: "Food & Dining", type_income: "Income", type_expense: "Expense",
        modal_add_title: "Add New Transaction", label_title: "Title", label_amount: "Amount", label_type: "Transaction Type", btn_cancel: "Cancel"
    },
    si: {
        auth_title: "ආයුබෝවන්", sign_in: "ඇතුල් වන්න", sign_up: "ලියාපදිංචි වන්න", no_account: "ගිණුමක් නැද්ද?",
        dashboard: "ප්‍රධාන තිරය", logout: "ඉවත් වන්න", total_balance: "මුළු ශේෂය", total_income: "මුළු ආදායම", total_expense: "මුළු වියදම",
        recent_transactions: "මෑත කාලීන ගනුදෙනු", add_transaction: "ගනුදෙනුවක් එක් කරන්න", income: "ආදායම", expense: "වියදම",
        select_category: "වර්ගය", select_wallet: "පසුම්බිය", save: "සුරකින්න",
        nav_dashboard: "මුල් පිටුව", nav_wallets: "පසුම්බි", nav_loans: "ණය", nav_reports: "වාර්තා", nav_profile: "ගිණුම", nav_goals: "ඉලක්ක", nav_settings: "සැකසුම්",
        app_title: "වියදම් කළමනාකරණය", th_title: "මැතිමතය / මාතෘකාව", th_category: "වර්ගය", th_date: "දිනය", th_type: "වර්ගීකරණය", th_amount: "මුදල",
        cat_income: "ආදායම්", cat_food: "ආහාර සහ පාන", type_income: "ආදායම", type_expense: "වියදම",
        modal_add_title: "අලුත් ගනුදෙනුවක් එක් කරන්න", label_title: "මාතෘකාව", label_amount: "මුදල", label_type: "ගනුදෙනු වර්ගය", btn_cancel: "අවසාන කරන්න"
    },
    ta: {
        auth_title: "நல்வரவு", sign_in: "உள்நுழைய", sign_up: "பதிவு செய்க", no_account: "கணக்கு இல்லையா?",
        dashboard: "முகப்பு", logout: "வெளியேறு", total_balance: "மொத்த மீதி", total_income: "மொத்த வருமானம்", total_expense: "மொத்த செலவு",
        recent_transactions: "சமீபத்திய பரிவர்த்தனைகள்", add_transaction: "பரிவர்த்தனையைச் சேர்க்க", income: "வருமானம்", expense: "செலவு",
        select_category: "வகை", select_wallet: "பணப்பை", save: "சேமி",
        nav_dashboard: "முகப்பு", nav_wallets: "வாலட்டுகள்", nav_loans: "கடன்கள்", nav_reports: "அறிக்கைகள்", nav_profile: "சுயவிவரம்", nav_goals: "இலக்குகள்", nav_settings: "அமைப்புகள்",
        app_title: "செலவு கண்காணிப்பு", th_title: "தலைப்பு", th_category: "வகை", th_date: "தேதி", th_type: "வகைப்பாடு", th_amount: "தொகை",
        cat_income: "வருமானம்", cat_food: "உணவு மற்றும் உணவு விடுதி", type_income: "வருமானம்", type_expense: "செலவு",
        modal_add_title: "புதிய பரிவர்த்தனையைச் சேர்க்கவும்", label_title: "தலைப்பு", label_amount: "தொகை", label_type: "பரிவர்த்தனை வகை", btn_cancel: "ரத்து செய்"
    }
};

window.changeLanguage = function(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) el.innerText = translations[lang][key];
    });
    localStorage.setItem('appLang', lang);
};

const langSwitcher = document.getElementById('lang-switcher');
if (langSwitcher) {
    langSwitcher.addEventListener('change', (e) => window.changeLanguage(e.target.value));
    window.changeLanguage(localStorage.getItem('appLang') || 'en');
}

/* ==========================================
   3. Global Variables & State
========================================== */
let selectedAvatarUrl = '';
let currentUserId = null;
let currentUserObj = null;
let unsubscribeTransactions = null;
let allTransactions = []; 
let currentNetBalanceValue = 0; 

let financeChartInstance = null;
let incomeExpenseChartInstance = null;
let categoryChartInstance = null;
let categoryChoicesInstance = null; 

let defaultIncomeCategories = ["Salary", "Business", "Freelance", "Other Income"];
let defaultExpenseCategories = ["Food & Drinks", "Fuel & Transport", "Bills & Utilities", "Shopping", "Other Expense"];
let userCustomCategories = { income: [], expense: [] };

let userWallets = [
    { id: 'default-cash', name: 'Cash', type: 'cash', initialBalance: 0 },
    { id: 'default-bank', name: 'Bank Account', type: 'bank', initialBalance: 0 }
];

/* ==========================================
   4. Theme Handler
========================================== */
const themeToggleBtn = document.getElementById('theme-toggle');
window.setTheme = function(theme) {
    if (theme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i data-lucide="sun" width="18" height="18"></i>';
    } else {
        document.body.removeAttribute('data-theme');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '<i data-lucide="moon" width="18" height="18"></i>';
    }
    if (window.lucide) lucide.createIcons();
    localStorage.setItem('appTheme', theme);
};

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        window.setTheme(document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
}
window.setTheme(localStorage.getItem('appTheme') || (window.matchMedia("(prefers-color-scheme: dark)").matches ? 'dark' : 'light'));

/* ==========================================
   5. Notifications & Reminders
========================================== */
const reminderToggleBtn = document.getElementById('reminder-toggle-btn');
const testReminderBtn = document.getElementById('test-reminder-btn');
let isReminderActive = localStorage.getItem('dailyReminderActive') === 'true';

function updateReminderUI() {
    if (!reminderToggleBtn) return;
    if (isReminderActive) {
        reminderToggleBtn.classList.add('active-reminder');
        reminderToggleBtn.title = "Reminder: 9:30 PM (On) - Click to turn off";
    } else {
        reminderToggleBtn.classList.remove('active-reminder');
        reminderToggleBtn.title = "Reminder: Off - Click to turn on";
    }
}
updateReminderUI();

function sendExpenseNotification() {
    const title = "Expense Tracker Reminder 🔔";
    const body = "අද වියදම් ටික ඇඩ් කළාද? (Did you add today's expenses?)";

    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body: body, icon: "https://api.dicebear.com/7.x/bottts/svg?seed=Finance" });
    } else {
        showInfoToast(body);
    }
}

setInterval(() => {
    if (!isReminderActive) return;
    const now = new Date();
    if (now.getHours() === 21 && now.getMinutes() === 30) {
        const todayStr = now.toDateString();
        const lastTriggered = localStorage.getItem('lastReminderDate');
        if (lastTriggered !== todayStr) {
            localStorage.setItem('lastReminderDate', todayStr);
            sendExpenseNotification();
        }
    }
}, 15000);

if (reminderToggleBtn) {
    reminderToggleBtn.addEventListener('click', async () => {
        if (!isReminderActive) {
            if ("Notification" in window && Notification.permission !== "granted") {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") showErrorToast("Notifications blocked. Using in-app alerts.");
            }
            isReminderActive = true;
            showSuccessToast("Daily reminder turned ON!");
        } else {
            isReminderActive = false;
            showInfoToast("Daily reminder turned OFF!");
        }
        localStorage.setItem('dailyReminderActive', isReminderActive);
        updateReminderUI();
    });
}

if (testReminderBtn) {
    testReminderBtn.addEventListener('click', async () => {
        if ("Notification" in window && Notification.permission !== "granted") await Notification.requestPermission();
        sendExpenseNotification();
    });
}

/* ==========================================
   6. Firebase Auth State & Login / Signup
========================================== */
function checkAutoLogout() {
    const loginTime = localStorage.getItem('loginTime');
    const hours24 = 24 * 60 * 60 * 1000; 
    
    if (loginTime) {
        if (Date.now() - parseInt(loginTime) > hours24) {
            signOut(auth).then(() => {
                localStorage.removeItem('loginTime');
                showInfoToast("සැසිවාරය අවසන් වී ඇත. කරුණාකර නැවත ඇතුල් වන්න.");
            }).catch(console.error);
        }
    } else {
        localStorage.setItem('loginTime', Date.now());
    }
}

const loaderTimeout = setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader && loader.style.display !== 'none') {
        loader.style.display = 'none';
        const loginPage = document.getElementById('auth-screen');
        const mainApp = document.getElementById('main-app');
        if (loginPage) loginPage.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
    }
}, 2000);

onAuthStateChanged(auth, async (user) => {
    clearTimeout(loaderTimeout);
    
    const loadingScreen = document.getElementById('loading-screen');
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');
    const topControls = document.querySelector('.top-controls');
    const reminderContainer = document.querySelector('.reminder-container');

    if (loadingScreen) loadingScreen.style.display = 'none';

    if (user) {
        checkAutoLogout();
        
        if (authScreen) authScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'block';
        if (topControls) topControls.style.display = 'flex';
        if (reminderContainer) reminderContainer.style.display = 'flex';
        
        currentUserId = user.uid;
        currentUserObj = user;
        
        loadTransactions(user.uid);
        loadLoans(user.uid);

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const displayName = user.displayName || 'User';
            
            const editNameInput = document.getElementById('edit-name');
            const editEmailInput = document.getElementById('edit-email');
            const editPhoneInput = document.getElementById('edit-phone');
            const editBioInput = document.getElementById('edit-bio');
            const nameDisplay = document.getElementById('user-name-display');
            const userBioDisplay = document.getElementById('user-bio-display');
            const avatarEl = document.getElementById('user-avatar');

            if (editNameInput) editNameInput.value = displayName;
            if (editEmailInput) editEmailInput.value = user.email || '';
            if (nameDisplay) nameDisplay.innerText = displayName;
            if (userBioDisplay) userBioDisplay.innerHTML = `<i data-lucide="settings" width="12" height="12"></i> Profile Settings`;
            
            if (userDoc.exists()) {
                const data = userDoc.data();
                if (data.avatar && avatarEl) {
                    avatarEl.innerHTML = `<img src="${data.avatar}" style="width: 100%; height: 100%; border-radius: 50%;">`;
                } else if (avatarEl) {
                    avatarEl.innerText = displayName.charAt(0).toUpperCase();
                }

                if (data.name) {
                    if (editNameInput) editNameInput.value = data.name;
                    if (nameDisplay) nameDisplay.innerText = data.name;
                }
                if (data.phone && editPhoneInput) editPhoneInput.value = data.phone;
                if (data.bio) {
                    if (editBioInput) editBioInput.value = data.bio;
                    if (userBioDisplay) userBioDisplay.innerHTML = `<i data-lucide="settings" width="12" height="12"></i> ${data.bio}`;
                }
                if (data.customCategories) {
                    userCustomCategories = data.customCategories;
                }
            }
            if (window.lucide) lucide.createIcons();
            populateCategoryDropdown();
            await loadAndRenderGoals(); 
        } catch (error) {
            console.error("Error fetching user data:", error);
        }

    } else {
        if (authScreen) authScreen.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
        if (topControls) topControls.style.display = 'none';
        if (reminderContainer) reminderContainer.style.display = 'none';

        currentUserId = null;
        currentUserObj = null;
        
        if (unsubscribeTransactions) unsubscribeTransactions();
        const txList = document.getElementById('transactions-list');
        if (txList) txList.innerHTML = '';
        
        userCustomCategories = { income: [], expense: [] };
        if (financeChartInstance) financeChartInstance.destroy();
        if (incomeExpenseChartInstance) incomeExpenseChartInstance.destroy();
        if (categoryChartInstance) categoryChartInstance.destroy();
    }
});

// Authentication Handlers
const loginFormElement = document.querySelector('form.login') || document.getElementById('login-form');
if (loginFormElement) {
    loginFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = loginFormElement.querySelector('input[type="email"], input[type="text"]');
        const passwordInput = loginFormElement.querySelector('input[type="password"]');
        
        if (!emailInput || !passwordInput) return;
        
        try {
            await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
            showSuccessToast("සාර්ථකව ඇතුළු විය! Welcome back.");
        } catch (err) {
            showErrorToast("Login Error: " + err.message);
        }
    });
}

const signupFormElement = document.querySelector('form.signup') || document.getElementById('signup-form');
if (signupFormElement) {
    signupFormElement.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailInput = signupFormElement.querySelector('input[type="email"]');
        const passwordInput = signupFormElement.querySelector('input[type="password"]');
        const nameInput = signupFormElement.querySelector('input[placeholder*="Name"], input[name="name"]');
        
        if (!emailInput || !passwordInput) return;

        try {
            const userCred = await createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
            const user = userCred.user;
            const displayName = nameInput ? nameInput.value.trim() : 'User';
            
            await updateProfile(user, { displayName });
            await setDoc(doc(db, "users", user.uid), {
                name: displayName,
                email: user.email,
                createdAt: serverTimestamp()
            }, { merge: true });

            showSuccessToast("ලියාපදිංචිය සාර්ථකයි!");
        } catch (err) {
            showErrorToast("Signup Error: " + err.message);
        }
    });
}

document.querySelectorAll('.logout-btn, #logout-btn, [data-action="logout"]').forEach(btn => {
    btn.addEventListener('click', () => {
        if (typeof signOut === 'function') {
            signOut(auth).then(() => {
                localStorage.removeItem('loginTime');
                showInfoToast("සාර්ථකව ඉවත් විය.");
            }).catch(err => showErrorToast("Logout Error: " + err.message));
        }
    });
});

/* ==========================================
   7. Modals & Profile Management
========================================== */
const txModal = document.getElementById('transaction-modal');
const fabBtn = document.getElementById('fab-add-transaction');
const closeTxModal = document.getElementById('close-modal');

if (fabBtn && txModal) fabBtn.addEventListener('click', () => txModal.classList.add('active'));
if (closeTxModal && txModal) closeTxModal.addEventListener('click', () => txModal.classList.remove('active'));
if (txModal) txModal.addEventListener('click', (e) => { if (e.target === txModal) txModal.classList.remove('active'); });

const profileModal = document.getElementById('profile-modal');
const openProfileBtn = document.getElementById('open-profile-modal');
const closeProfileModal = document.getElementById('close-profile-modal');

if (openProfileBtn && profileModal) openProfileBtn.addEventListener('click', () => profileModal.classList.add('active'));
if (closeProfileModal && profileModal) closeProfileModal.addEventListener('click', () => profileModal.classList.remove('active'));
if (profileModal) profileModal.addEventListener('click', (e) => { if (e.target === profileModal) profileModal.classList.remove('active'); });

const avatarGrid = document.getElementById('avatar-grid');
const saveAvatarBtn = document.getElementById('save-avatar-btn');
const avatarList = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Felix', 'https://api.dicebear.com/7.x/bottts/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=John', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
    'https://api.dicebear.com/7.x/micah/svg?seed=Sam', 'https://api.dicebear.com/7.x/micah/svg?seed=Zack'
];

if (avatarGrid) {
    avatarList.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.className = "avatar-choice";
        img.style.width = '100%'; 
        img.style.cursor = 'pointer';

        img.addEventListener('click', () => {
            document.querySelectorAll('#avatar-grid img').forEach(i => i.classList.remove('selected'));
            img.classList.add('selected');
            selectedAvatarUrl = url;
        });
        avatarGrid.appendChild(img);
    });
}

if (saveAvatarBtn) {
    saveAvatarBtn.addEventListener('click', async () => {
        if (!selectedAvatarUrl) return showErrorToast("Please select an avatar first!");
        try {
            await setDoc(doc(db, "users", currentUserId), { avatar: selectedAvatarUrl }, { merge: true });
            const avatarEl = document.getElementById('user-avatar');
            if (avatarEl) avatarEl.innerHTML = `<img src="${selectedAvatarUrl}" style="width: 100%; height: 100%; border-radius: 50%;">`;
            showSuccessToast("Avatar updated successfully!");
        } catch (err) { showErrorToast("Error saving avatar: " + err.message); }
    });
}

const saveProfileInfoBtn = document.getElementById('save-profile-info-btn');
if (saveProfileInfoBtn) {
    saveProfileInfoBtn.addEventListener('click', async () => {
        const newName = document.getElementById('edit-name')?.value.trim();
        const newPhone = document.getElementById('edit-phone')?.value.trim();
        const newEmail = document.getElementById('edit-email')?.value.trim();
        const newBio = document.getElementById('edit-bio')?.value.trim();

        if (!newName) return showErrorToast("Name cannot be empty!");
        try {
            saveProfileInfoBtn.innerText = "Updating...";
            await setDoc(doc(db, "users", currentUserId), { name: newName, phone: newPhone, email: newEmail, bio: newBio }, { merge: true });

            const nameDisplay = document.getElementById('user-name-display');
            const userBioDisplay = document.getElementById('user-bio-display');
            if (nameDisplay) nameDisplay.innerText = newName;
            if (userBioDisplay) userBioDisplay.innerHTML = `<i data-lucide="settings" width="12" height="12"></i> ${newBio || "Profile Settings"}`;
            if (window.lucide) lucide.createIcons();
            
            showSuccessToast("Profile info updated successfully!");
        } catch (err) { showErrorToast("Error updating profile: " + err.message); } 
        finally { saveProfileInfoBtn.innerText = "Update Profile"; }
    });
}

/* ==========================================
   8. Custom Categories & Choices.js Update
========================================== */
function populateCategoryDropdown() {
    const select = document.getElementById('tx-category');
    if (!select) return;

    if (categoryChoicesInstance) {
        categoryChoicesInstance.destroy();
    }

    select.innerHTML = `<option value="" disabled selected>Select Category</option>`;

    const combinedIncomes = [...defaultIncomeCategories, ...(userCustomCategories.income || [])];
    const combinedExpenses = [...defaultExpenseCategories, ...(userCustomCategories.expense || [])];

    const incomeGroup = document.createElement('optgroup');
    incomeGroup.label = "Income Categories";
    combinedIncomes.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = `income-${cat}`; 
        opt.textContent = cat;
        incomeGroup.appendChild(opt);
    });
    select.appendChild(incomeGroup);

    const expenseGroup = document.createElement('optgroup');
    expenseGroup.label = "Expense Categories";
    combinedExpenses.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = `expense-${cat}`; 
        opt.textContent = cat;
        expenseGroup.appendChild(opt);
    });
    select.appendChild(expenseGroup);

    if (typeof Choices !== 'undefined') {
        categoryChoicesInstance = new Choices(select, {
            searchEnabled: false,
            itemSelectText: '',
            shouldSort: false,
            placeholder: true,
            placeholderValue: 'Select Category'
        });
    }
}

const saveCustomCatBtn = document.getElementById('save-custom-cat-btn');
if (saveCustomCatBtn) {
    saveCustomCatBtn.addEventListener('click', async () => {
        const type = document.getElementById('custom-cat-type').value;
        const name = document.getElementById('custom-cat-name').value.trim();

        if (!name) return showErrorToast("Please enter a category name.");
        if (!userCustomCategories[type]) userCustomCategories[type] = [];
        if (userCustomCategories[type].includes(name) || (type === 'income' ? defaultIncomeCategories.includes(name) : defaultExpenseCategories.includes(name))) {
            return showErrorToast("This category already exists!");
        }

        userCustomCategories[type].push(name);
        try {
            saveCustomCatBtn.innerText = "Adding...";
            await setDoc(doc(db, "users", currentUserId), { customCategories: userCustomCategories }, { merge: true });
            populateCategoryDropdown();
            document.getElementById('custom-cat-name').value = '';
            showSuccessToast("Custom category added successfully!");
        } catch (err) { showErrorToast("Error saving category: " + err.message); } 
        finally { saveCustomCatBtn.innerText = "Add Category"; }
    });
}

/* ==========================================
   9. Transaction Operations
========================================== */
const txForm = document.getElementById('transaction-form');
if (txForm) {
    txForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserId) return showErrorToast("Please login first!");

        const rawCategory = document.getElementById('tx-category').value;
        const amount = parseFloat(document.getElementById('tx-amount').value) || 0;
        const wallet = document.getElementById('tx-wallet').value;
        const date = document.getElementById('tx-date').value;
        const note = document.getElementById('tx-note').value;
        
        if (!rawCategory) return showErrorToast("Please select a category!");

        let type = rawCategory.startsWith('income-') ? 'income' : 'expense';
        let category = rawCategory.replace(type + '-', '');
        
        const btn = document.getElementById('save-tx-btn');
        if (btn) btn.innerText = "Saving...";

        try {
            await addDoc(collection(db, "users", currentUserId, "transactions"), {
                type, amount, category, wallet, date, note, timestamp: serverTimestamp()
            });
            txForm.reset();
            if (txModal) txModal.classList.remove('active');
            showSuccessToast("Transaction added successfully!");
        } catch (error) { showErrorToast("Error saving transaction: " + error.message); } 
        finally { if (btn) btn.innerText = translations[localStorage.getItem('appLang') || 'en']?.save || "Save Transaction"; }
    });
}

function loadTransactions(userId) {
    if (!userId) return;
    const q = query(collection(db, "users", userId, "transactions"), orderBy("timestamp", "desc"));
    if (unsubscribeTransactions) unsubscribeTransactions();

    unsubscribeTransactions = onSnapshot(q, (snapshot) => {
        allTransactions = [];
        let totalIncome = 0; let totalExpense = 0;
        
        snapshot.forEach((docSnap) => {
            const tx = { id: docSnap.id, ...docSnap.data() };
            tx.amount = parseFloat(tx.amount) || 0;
            allTransactions.push(tx);
            if (tx.type === 'income') totalIncome += tx.amount;
            if (tx.type === 'expense') totalExpense += tx.amount;
        });

        window.allTransactions = allTransactions;
        currentNetBalanceValue = totalIncome - totalExpense;
        const balanceEl = document.getElementById('total-balance');
        const incomeEl = document.getElementById('total-income');
        const expenseEl = document.getElementById('total-expense');

        if (balanceEl) balanceEl.innerText = `LKR ${currentNetBalanceValue.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        if (incomeEl) incomeEl.innerText = `LKR ${totalIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        if (expenseEl) expenseEl.innerText = `LKR ${totalExpense.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

        renderTransactions();
        updateFinanceChart(totalIncome, totalExpense);
        renderAnalyticsCharts();
        loadAndRenderGoals();
        loadAndRenderWallets();
    }, (error) => { console.error("Error loading transactions:", error); });
}

function renderTransactions() {
    if (!currentUserId) return;
    const list = document.getElementById('transactions-list');
    const searchEl = document.getElementById('search-tx');
    const filterEl = document.getElementById('filter-type');
    if (!list) return;
    
    list.innerHTML = ''; 
    const searchText = searchEl ? searchEl.value.toLowerCase() : '';
    const filterType = filterEl ? filterEl.value : 'all';

    const filteredTxs = allTransactions.filter(tx => {
        const matchesSearch = (tx.category && tx.category.toLowerCase().includes(searchText)) || (tx.note && tx.note.toLowerCase().includes(searchText));
        const matchesType = filterType === 'all' || tx.type === filterType;
        return matchesSearch && matchesType;
    });

    if (filteredTxs.length === 0) {
        list.innerHTML = `<div class="empty-state">No transactions match these filters.</div>`;
        return;
    }

    let txHtml = '';
    filteredTxs.forEach((data) => {
        const txAmount = parseFloat(data.amount) || 0;
        const iconName = data.type === 'income' ? 'trending-up' : 'trending-down';
        txHtml += `
            <div class="transaction-row">
                <div class="tx-info">
                    <div class="tx-icon ${data.type}">
                        <i data-lucide="${iconName}" width="19" height="19"></i>
                    </div>
                    <div class="tx-details">
                        <h4>${data.category || 'General'}</h4>
                        <p>${data.note ? data.note + ' · ' : ''}${data.date || ''} · ${data.wallet || 'Cash'}</p>
                    </div>
                </div>
                <div class="tx-end">
                    <span class="tx-amount ${data.type}">
                        ${data.type === 'income' ? '+' : '-'} LKR ${txAmount.toFixed(2)}
                    </span>
                    <button class="icon-button delete-tx-btn" data-id="${data.id}" title="Delete"><i data-lucide="trash-2" width="15" height="15"></i></button>
                </div>
            </div>
        `;
    });
    list.innerHTML = txHtml;

    if (window.lucide) lucide.createIcons();

    document.querySelectorAll('.delete-tx-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const txId = e.currentTarget.getAttribute('data-id');
            const swalInst = getCustomSwal();
            if (swalInst) {
                swalInst.fire({
                    title: 'Are you sure?', text: "Do you really want to delete this transaction?", icon: 'warning',
                    showCancelButton: true, confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        try {
                            await deleteDoc(doc(db, "users", currentUserId, "transactions", txId));
                            showSuccessToast("Transaction deleted successfully!");
                        } catch (err) { showErrorToast("Delete error: " + err.message); }
                    }
                });
            } else if (confirm("Do you really want to delete this transaction?")) {
                deleteDoc(doc(db, "users", currentUserId, "transactions", txId))
                    .then(() => showSuccessToast("Transaction deleted successfully!"))
                    .catch(err => showErrorToast("Delete error: " + err.message));
            }
        });
    });
}

const searchInput = document.getElementById('search-tx');
const filterSelect = document.getElementById('filter-type');
if (searchInput) searchInput.addEventListener('input', renderTransactions);
if (filterSelect) filterSelect.addEventListener('change', renderTransactions);

/* ==========================================
   10. Chart & Analytics
========================================== */
function updateFinanceChart(income, expense) {
    const canvas = document.getElementById('financeChart');
    if (!canvas || typeof Chart === 'undefined') return;
    const ctx = canvas.getContext('2d');
    if (financeChartInstance) financeChartInstance.destroy();
    
    financeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{ data: [income, expense], backgroundColor: ['#10b981', '#ef4444'], hoverOffset: 4, borderWidth: 0 }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            plugins: { 
                legend: { position: 'bottom', labels: { color: document.body.getAttribute('data-theme') === 'dark' ? '#f8fafc' : '#1e293b' } } 
            },
            cutout: '65%'
        }
    });
}

function renderAnalyticsCharts() {
    if (typeof Chart === 'undefined') return;
    const barCtx = document.getElementById('incomeExpenseChart')?.getContext('2d');
    const doughnutCtx = document.getElementById('categoryChart')?.getContext('2d');
    if (!barCtx || !doughnutCtx) return;

    let monthlyIncome = 0; let monthlyExpense = 0; 
    const categoryTotals = {};

    allTransactions.forEach(data => {
        const amount = parseFloat(data.amount) || 0;
        if (data.type === 'income') { 
            monthlyIncome += amount; 
        } else if (data.type === 'expense') {
            monthlyExpense += amount;
            const cat = data.category || 'Other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + amount;
        }
    });

    if (incomeExpenseChartInstance) incomeExpenseChartInstance.destroy();
    incomeExpenseChartInstance = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Expense'],
            datasets: [{
                label: 'Amount (LKR)', data: [monthlyIncome, monthlyExpense],
                backgroundColor: ['#10b981', '#ef4444'],
                borderRadius: 8
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: 'rgba(150,150,150,0.8)', font: { size: 11 } }, grid: { color: 'rgba(150,150,150,0.1)' } },
                x: { ticks: { color: 'rgba(150,150,150,0.9)', font: { weight: 'bold' } }, grid: { display: false } }
            }
        }
    });

    const catLabels = Object.keys(categoryTotals);
    const catData = Object.values(categoryTotals);

    if (categoryChartInstance) categoryChartInstance.destroy();
    categoryChartInstance = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
            labels: catLabels.length ? catLabels : ['No Expenses'],
            datasets: [{
                data: catData.length ? catData : [1],
                backgroundColor: ['#3b82f6', '#10b981', '#f39c12', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'],
                borderWidth: 2, borderColor: 'transparent'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'right', labels: { color: 'rgba(150,150,150,0.9)', boxWidth: 12, font: { size: 11 } } } }, cutout: '65%'
        }
    });
}

/* ==========================================
   11. Financial Goals Management
========================================== */
const goalModal = document.getElementById('goal-modal');
const openGoalBtn = document.getElementById('open-add-goal-btn');
const closeGoalBtn = document.getElementById('close-goal-modal');
if (openGoalBtn && goalModal) openGoalBtn.addEventListener('click', () => goalModal.classList.add('active'));
if (closeGoalBtn && goalModal) closeGoalBtn.addEventListener('click', () => goalModal.classList.remove('active'));

const saveGoalBtn = document.getElementById('save-goal-btn');
if (saveGoalBtn) {
    saveGoalBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!currentUserId) return showErrorToast("කරුණාකර පළමුව Login වන්න!");
        const goalNameInput = document.getElementById('goal-name');
        const goalAmountInput = document.getElementById('goal-amount') || document.getElementById('goal-target');
        const name = goalNameInput.value.trim();
        const amount = parseFloat(goalAmountInput.value);
        const deadline = document.getElementById('goal-deadline').value;

        if (!name || isNaN(amount) || amount <= 0) return showErrorToast("කරුණාකර වලංගු Goal නමක් සහ මුදලක් ඇතුළත් කරන්න.");

        const newGoal = { id: Date.now().toString(), name: name, amount: amount, deadline: deadline, status: 'active', createdAt: new Date().toISOString() };

        try {
            saveGoalBtn.innerText = "Saving...";
            const userDoc = await getDoc(doc(db, "users", currentUserId));
            let currentGoals = (userDoc.exists() && userDoc.data().goals) ? userDoc.data().goals : [];
            currentGoals.push(newGoal);

            await setDoc(doc(db, "users", currentUserId), { goals: currentGoals }, { merge: true });
            goalNameInput.value = ''; goalAmountInput.value = '';
            if (goalModal) goalModal.classList.remove('active');
            showSuccessToast("Financial Goal එක සාර්ථකව Save වුණා! 🎯");
            await loadAndRenderGoals(); 
        } catch (err) { showErrorToast("Goal එක Save කිරීමේදී දෝෂයක්: " + err.message); } 
        finally { saveGoalBtn.innerText = "Save Goal"; }
    });
}

async function loadAndRenderGoals() {
    if (!currentUserId) return;
    const activeGoalsList = document.getElementById('active-goals-list');
    const completedGoalsList = document.getElementById('completed-goals-list');
    const countBadge = document.getElementById('completed-count-badge');
    if (!activeGoalsList) return;

    try {
        const userDoc = await getDoc(doc(db, "users", currentUserId));
        const goals = (userDoc.exists() && userDoc.data().goals) ? userDoc.data().goals : [];

        const currentBalance = currentNetBalanceValue;

        let activeHtml = '';
        let completedHtml = '';
        let activeCount = 0; let completedCount = 0;

        goals.forEach(goal => {
            const goalAmount = parseFloat(goal.amount) || 1;
            if (goal.status === 'active') {
                activeCount++;
                let progress = ((currentBalance / goalAmount) * 100);
                if (progress < 0) progress = 0; if (progress > 100) progress = 100;

                activeHtml += `
                    <div class="goal-card">
                        <div class="goal-top">
                            <strong>${goal.name}</strong>
                            <button class="icon-button complete-goal-btn" data-id="${goal.id}" title="Complete Goal"><i data-lucide="check-circle" width="16" height="16"></i></button>
                        </div>
                        <div class="goal-amount">LKR ${goalAmount.toFixed(0)}</div>
                        <div class="meta">LKR ${currentBalance.toFixed(0)} saved · Target: ${goal.deadline || 'No date'}</div>
                        <div class="goal-progress"><div class="progress-fill goal-fill" style="width:${progress}%"></div></div>
                        <div class="meta">${progress.toFixed(1)}% complete</div>
                    </div>
                `;
            } else if (goal.status === 'completed') {
                completedCount++;
                completedHtml += `
                    <div class="goal-card" style="border-top-color: #10b981;">
                        <div class="goal-top">
                            <strong style="color: #10b981;">${goal.name}</strong>
                            <span style="font-size: 0.75rem; color: #10b981; font-weight: bold;"><i data-lucide="check" width="14" height="14"></i> Completed</span>
                        </div>
                        <div class="meta">Target: LKR ${goalAmount.toFixed(0)}</div>
                    </div>
                `;
            }
        });

        activeGoalsList.innerHTML = activeHtml || `<div class="empty-state">No active goals yet.</div>`;
        if (completedGoalsList) completedGoalsList.innerHTML = completedHtml || `<div class="empty-state">No completed goals yet.</div>`;
        if (countBadge) countBadge.innerText = `(${completedCount})`;

        if (window.lucide) lucide.createIcons();

        document.querySelectorAll('.complete-goal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => window.markGoalAsCompleted(e.currentTarget.getAttribute('data-id')));
        });

    } catch (err) { console.error("Goals load error:", err); }
}

window.markGoalAsCompleted = function(goalId) {
    const swalInst = getCustomSwal();
    if (!swalInst) {
        if (confirm("මේ Goal එක Completed ලෙස සලකුණු කරන්නද?")) {
            setDoc(doc(db, "users", currentUserId), { 
                goals: userGoals.map(g => g.id === goalId ? { ...g, status: 'completed' } : g) 
            }, { merge: true }).then(() => loadAndRenderGoals());
        }
        return;
    }

    swalInst.fire({
        title: 'Goal එක Complete ද?', text: 'මේ Goal එක Completed Goals ලැයිස්තුවට මාරු කරන්නද?', icon: 'question',
        showCancelButton: true, confirmButtonText: 'ඔව්, Completed!', cancelButtonText: 'නැත'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const userDoc = await getDoc(doc(db, "users", currentUserId));
                if (userDoc.exists() && userDoc.data().goals) {
                    let goals = userDoc.data().goals.map(g => g.id === goalId ? { ...g, status: 'completed' } : g);
                    await setDoc(doc(db, "users", currentUserId), { goals }, { merge: true });
                    showSuccessToast("නියමයි! Goal එක Completed ලෙස සලකුණු කළා. 🎉");
                    await loadAndRenderGoals();
                }
            } catch (err) { showErrorToast("Update කිරීමට නොහැකි විය: " + err.message); }
        }
    });
};

/* ==========================================
   12. Wallets Management
========================================== */
const walletModalAdd = document.getElementById('wallet-modal-add');
const openAddWalletBtn = document.getElementById('open-add-wallet-btn');
const closeWalletModal = document.getElementById('close-wallet-modal');
const walletForm = document.getElementById('wallet-form');

if (openAddWalletBtn && walletModalAdd) {
    openAddWalletBtn.addEventListener('click', () => walletModalAdd.classList.add('active'));
}

if (closeWalletModal && walletModalAdd) {
    closeWalletModal.addEventListener('click', () => walletModalAdd.classList.remove('active'));
}

if (walletModalAdd) {
    walletModalAdd.addEventListener('click', (e) => { 
        if (e.target === walletModalAdd) walletModalAdd.classList.remove('active'); 
    });
}

async function loadAndRenderWallets() {
    if (!currentUserId) return;
    const walletsGrid = document.getElementById('wallets-grid');
    const walletSelect = document.getElementById('tx-wallet');
    try {
        const userDoc = await getDoc(doc(db, "users", currentUserId));
        if (userDoc.exists() && userDoc.data().wallets && userDoc.data().wallets.length > 0) {
            userWallets = userDoc.data().wallets;
        } else {
            userWallets = [
                { id: 'default-cash', name: 'Cash', type: 'cash', initialBalance: 0 },
                { id: 'default-bank', name: 'Bank Account', type: 'bank', initialBalance: 0 }
            ];
        }

        const walletBalances = {};
        userWallets.forEach(w => { walletBalances[w.name.trim().toLowerCase()] = parseFloat(w.initialBalance || 0); });

        allTransactions.forEach(tx => {
            const txWalletKey = (tx.wallet || 'Cash').trim().toLowerCase();
            if (walletBalances[txWalletKey] === undefined) walletBalances[txWalletKey] = 0;
            if (tx.type === 'income') walletBalances[txWalletKey] += parseFloat(tx.amount || 0);
            else if (tx.type === 'expense') walletBalances[txWalletKey] -= parseFloat(tx.amount || 0);
        });

        if (walletSelect) {
            const currentSelectedValue = walletSelect.value;
            walletSelect.innerHTML = `<option value="" disabled ${!currentSelectedValue ? 'selected' : ''}>Select Wallet</option>`;
            userWallets.forEach(w => {
                const opt = document.createElement('option');
                opt.value = w.name; opt.textContent = w.name;
                if (currentSelectedValue === w.name) opt.selected = true;
                walletSelect.appendChild(opt);
            });
        }

        if (walletsGrid) {
            let html = '';
            userWallets.forEach(w => {
                const key = w.name.trim().toLowerCase();
                const currentBal = walletBalances[key] !== undefined ? walletBalances[key] : parseFloat(w.initialBalance || 0);
                html += `
                    <div class="wallet-card">
                        <div class="wallet-top">
                            <div class="wallet-title"><i data-lucide="wallet" width="18" height="18" style="color:var(--color-primary)"></i> ${w.name}</div>
                            ${!w.id.startsWith('default-') ? `<button class="icon-button delete-wallet-btn" data-id="${w.id}" title="Delete Wallet"><i data-lucide="trash-2" width="15" height="15"></i></button>` : ''}
                        </div>
                        <div class="wallet-balance">LKR ${currentBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        <div class="meta"><span class="wallet-type">${w.type}</span> · Current balance</div>
                    </div>
                `;
            });
            walletsGrid.innerHTML = html;
            if (window.lucide) lucide.createIcons();

            document.querySelectorAll('.delete-wallet-btn').forEach(btn => {
                btn.addEventListener('click', (e) => window.deleteWallet(e.currentTarget.getAttribute('data-id')));
            });
        }
    } catch (err) { console.error("Wallet loading error:", err); }
}

if (walletForm) {
    walletForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserId) return showErrorToast("කරුණාකර Login වන්න!");
        const name = document.getElementById('wallet-name').value.trim();
        const type = document.getElementById('wallet-type').value;
        const initialBalance = parseFloat(document.getElementById('wallet-initial-balance').value) || 0;
        
        if (!name) return showErrorToast("Wallet නමක් ඇතුළත් කරන්න.");
        if (userWallets.some(w => w.name.toLowerCase() === name.toLowerCase())) return showErrorToast("මෙම නමින් Wallet එකක් දැනටමත් පවතී!");
        
        const newWallet = { id: 'w-' + Date.now(), name, type, initialBalance };
        userWallets.push(newWallet);
        try {
            document.getElementById('save-wallet-btn').innerText = "Saving...";
            await setDoc(doc(db, "users", currentUserId), { wallets: userWallets }, { merge: true });
            walletForm.reset();
            if (walletModalAdd) walletModalAdd.classList.remove('active');
            showSuccessToast("Wallet එක සාර්ථකව එකතු කළා! 💼");
            await loadAndRenderWallets();
        } catch (err) { showErrorToast("Error saving wallet: " + err.message); } 
        finally { document.getElementById('save-wallet-btn').innerText = "Save Wallet"; }
    });
}

window.deleteWallet = function(walletId) {
    const swalInst = getCustomSwal();
    if (!swalInst) {
        if (confirm("මෙම Wallet එක ඉවත් කිරීමට අවශ්‍යද?")) {
            userWallets = userWallets.filter(w => w.id !== walletId);
            setDoc(doc(db, "users", currentUserId), { wallets: userWallets }, { merge: true }).then(() => loadAndRenderWallets());
        }
        return;
    }

    swalInst.fire({
        title: 'Wallet එක මකන්නද?', text: "මෙම Wallet එක ඉවත් කිරීමට අවශ්‍යද?", icon: 'warning',
        showCancelButton: true, confirmButtonText: 'ඔව්, මකන්න!', cancelButtonText: 'අවලංගු කරන්න'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                userWallets = userWallets.filter(w => w.id !== walletId);
                await setDoc(doc(db, "users", currentUserId), { wallets: userWallets }, { merge: true });
                showSuccessToast("Wallet එක ඉවත් කළා!");
                await loadAndRenderWallets();
            } catch (err) { showErrorToast("Delete error: " + err.message); }
        }
    });
};

/* ==========================================
   13. Loans Tracking Logic
========================================== */
const loanModal = document.getElementById('loan-modal');
const openLoanBtn = document.getElementById('open-add-loan-btn');
const closeLoanBtn = document.getElementById('close-loan-modal');
if (openLoanBtn && loanModal) openLoanBtn.addEventListener('click', () => loanModal.classList.add('active'));
if (closeLoanBtn && loanModal) closeLoanBtn.addEventListener('click', () => loanModal.classList.remove('active'));

const loanForm = document.getElementById('loan-form');
if (loanForm) {
    loanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUserId) return showInfoToast("Please login first!");

        const person = document.getElementById('loan-person').value.trim();
        const type = document.getElementById('loan-type').value;
        const totalAmount = parseFloat(document.getElementById('loan-amount').value) || 0;
        const dueDate = document.getElementById('loan-due-date').value;
        const notes = document.getElementById('loan-notes').value.trim();

        try {
            await addDoc(collection(db, "loans"), {
                userId: currentUserId, person, type, totalAmount, paidAmount: 0, dueDate, notes, status: 'active', createdAt: new Date().toISOString()
            });
            showSuccessToast("Loan record added successfully!");
            loanForm.reset();
            if (loanModal) loanModal.classList.remove('active');
            loadLoans(currentUserId); 
        } catch (err) { showErrorToast("Error saving loan: " + err.message); }
    });
}

async function loadLoans(userId) {
    const loansGrid = document.getElementById('loans-grid');
    if (!loansGrid) return;

    try {
        const q = query(collection(db, "loans"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        
        let html = '';

        querySnapshot.forEach((docSnap) => {
            const loan = docSnap.data();
            const id = docSnap.id;
            const totalAmount = parseFloat(loan.totalAmount) || 0;
            const paidAmount = parseFloat(loan.paidAmount) || 0;
            const remaining = totalAmount - paidAmount;
            const isLent = loan.type === 'lent';
            const p = Math.min(100, (paidAmount / totalAmount) * 100) || 0;

            html += `
                <div class="loan-card" style="border-top-color: ${isLent ? '#10b981' : '#ef4444'};">
                    <div class="loan-top">
                        <strong>${loan.person} (${isLent ? 'Lent' : 'Borrowed'})</strong>
                        ${loan.status === 'active' ? `<button class="icon-button pay-loan-btn" data-id="${id}" data-rem="${remaining}" title="Record Payment"><i data-lucide="plus-circle" width="15" height="15"></i></button>` : `<span style="font-size: 0.75rem; color: #10b981;"><i data-lucide="check" width="14" height="14"></i> Settled</span>`}
                    </div>
                    <div class="loan-amount">LKR ${totalAmount.toLocaleString()}</div>
                    <div class="meta">LKR ${remaining.toLocaleString()} remaining · Due: ${loan.dueDate || 'N/A'}</div>
                    <div class="loan-progress"><div class="progress-fill" style="background:${isLent ? '#10b981' : '#ef4444'}; width:${p}%"></div></div>
                    <div class="meta">${Math.round(p)}% paid back</div>
                </div>
            `;
        });

        loansGrid.innerHTML = html || `<div class="empty-state">No loans recorded yet.</div>`;
        if (window.lucide) lucide.createIcons();

        document.querySelectorAll('.pay-loan-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const rem = parseFloat(e.currentTarget.getAttribute('data-rem'));
                window.payLoanPrompt(id, rem);
            });
        });

    } catch (err) { console.error("Error loading loans:", err); }
}

window.payLoanPrompt = async (loanId, maxAmount) => {
    const swalInst = getCustomSwal();
    if (!swalInst) return;

    swalInst.fire({
        title: 'Record Payment', text: `Enter payment amount (Max: LKR ${maxAmount.toLocaleString()})`,
        input: 'number', inputAttributes: { min: 1, max: maxAmount, step: 'any' },
        showCancelButton: true, confirmButtonText: 'Pay', showLoaderOnConfirm: true,
        preConfirm: async (payment) => {
            const payVal = parseFloat(payment);
            if (isNaN(payVal) || payVal <= 0 || payVal > maxAmount) {
                Swal.showValidationMessage('Invalid amount entered!'); return false;
            }
            try {
                const loanRef = doc(db, "loans", loanId);
                const loanSnap = await getDoc(loanRef);
                if (loanSnap.exists()) {
                    const currentPaid = parseFloat(loanSnap.data().paidAmount) || 0;
                    const newPaidAmount = currentPaid + payVal;
                    const isSettled = (maxAmount - payVal) <= 0;
                    await updateDoc(loanRef, { paidAmount: newPaidAmount, status: isSettled ? 'settled' : 'active' });
                    return true;
                }
            } catch (err) { Swal.showValidationMessage(`Request failed: ${err}`); }
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            showSuccessToast("Payment recorded successfully!");
            loadLoans(currentUserId);
        }
    });
};

/* ==========================================
   14. PDF Export / Download Logic
========================================== */
function generateAndSavePDF() {
    try {
        if (!allTransactions || allTransactions.length === 0) {
            showErrorToast("No transaction data available to export!");
            return;
        }

        // html2pdf / jsPDF තිබේ නම් එයින් Export කිරීම, නැතහොත් Print View එකක් Open කිරීම
        if (typeof html2pdf !== 'undefined') {
            const element = document.getElementById('transactions-list') || document.body;
            const opt = {
                margin:       10,
                filename:     `Transaction_Report_${new Date().toISOString().slice(0,10)}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save().then(() => {
                showSuccessToast("PDF Statement downloaded successfully! 📄");
            }).catch(err => {
                showErrorToast("Failed to generate PDF: " + err.message);
            });
        } else {
            // html2pdf library එක නැතිනම් Window Print Dialog එක පාවිච්චි කිරීම
            window.print();
            showSuccessToast("PDF Statement downloaded successfully! 📄");
        }
    } catch (err) {
        showErrorToast("Failed to generate PDF. Please try again!");
    }
}

const exportPdfBtn = document.getElementById('exportPdfBtn');
if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
        const swalInst = getCustomSwal();
        
        if (swalInst) {
            swalInst.fire({
                title: 'Download Statement?',
                text: "Do you want to download your PDF transaction report?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes, Download',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    generateAndSavePDF(); 
                }
            });
        } else {
            generateAndSavePDF();
        }
    });
}

/* ==========================================
   15. Pickers & Component Handlers Initialization
========================================== */
function initFlatpickr() {
    if (typeof flatpickr === 'undefined') return;

    flatpickr("input[type='date']:not(#signup-dob)", { 
        disableMobile: true, 
        dateFormat: "Y-m-d", 
        animate: true,
        monthSelectorType: "dropdown",
        prevArrow: '<i data-lucide="chevron-left" width="16" height="16"></i>',
        nextArrow: '<i data-lucide="chevron-right" width="16" height="16"></i>',
        onReady: function() { if (window.lucide) lucide.createIcons(); },
        onMonthChange: function() { if (window.lucide) lucide.createIcons(); }
    });

    const dobPicker = document.getElementById("signup-dob");
    if (dobPicker) {
        flatpickr("#signup-dob", { 
            dateFormat: "Y-m-d", 
            maxDate: "today", 
            disableMobile: true, 
            animate: true,
            monthSelectorType: "dropdown",
            prevArrow: '<i data-lucide="chevron-left" width="16" height="16"></i>',
            nextArrow: '<i data-lucide="chevron-right" width="16" height="16"></i>',
            onReady: function() { if (window.lucide) lucide.createIcons(); }
        });
    }
}

// Global Helpers for HTML triggers
window.closePopup = function() {
    const popup = document.getElementById('welcomePopup');
    if (popup) popup.classList.remove('active');
};

window.toggleDropdown = function() {
    const dropdown = document.getElementById('myDropdown');
    if (dropdown) dropdown.classList.toggle('active');
};

window.selectItem = function(text) {
    const selectedVal = document.getElementById('selected-value');
    if (selectedVal) selectedVal.textContent = text;
    const dropdown = document.getElementById('myDropdown');
    if (dropdown) dropdown.classList.remove('active');
};

window.addEventListener('click', function(e) {
    const dropdown = document.getElementById('myDropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

/* Single DOMContentLoaded Wrapper for UI Initialization */
document.addEventListener("DOMContentLoaded", () => { 
    initFlatpickr(); 
    
    // Non-category dropdowns Choices.js init
    const elements = document.querySelectorAll('.custom-select:not(#tx-category)');
    elements.forEach(el => {
        if (typeof Choices !== 'undefined') {
            new Choices(el, { searchEnabled: false, itemSelectText: '', shouldSort: false });
        }
    });

    // Language Dropdown Logic
    const dropdownWrapper = document.getElementById('lang-dropdown-wrapper');
    if (dropdownWrapper) {
        const dropdownBtn = document.getElementById('lang-dropdown-btn');
        const langText = document.getElementById('selected-lang-text');
        const hiddenSelect = document.getElementById('lang-switcher');
        const items = dropdownWrapper.querySelectorAll('.dropdown-item');

        if (hiddenSelect) {
            const currentOpt = hiddenSelect.options[hiddenSelect.selectedIndex];
            if (currentOpt) langText.textContent = currentOpt.textContent;
        }

        dropdownBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownWrapper.classList.toggle('active');
        });

        items.forEach(item => {
            item.addEventListener('click', () => {
                const val = item.getAttribute('data-value');
                const text = item.textContent;

                if (langText) langText.textContent = text;
                dropdownWrapper.classList.remove('active');

                if (hiddenSelect) {
                    hiddenSelect.value = val;
                    hiddenSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });

        document.addEventListener('click', (e) => {
            if (!dropdownWrapper.contains(e.target)) {
                dropdownWrapper.classList.remove('active');
            }
        });
    }

    // Custom Category Popup Logic
    const openCatTypePopup = document.getElementById('open-cat-type-popup');
    const catTypeModal = document.getElementById('cat-type-modal');
    const closeCatTypePopup = document.getElementById('close-cat-type-popup');
    const popupOptionBtns = document.querySelectorAll('.popup-select-btn');
    const hiddenCatSelect = document.getElementById('custom-cat-type');
    const labelDisplay = document.getElementById('selected-cat-type-label');

    if (openCatTypePopup && catTypeModal) openCatTypePopup.addEventListener('click', () => catTypeModal.classList.add('active'));
    if (closeCatTypePopup && catTypeModal) closeCatTypePopup.addEventListener('click', () => catTypeModal.classList.remove('active'));

    popupOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            popupOptionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedValue = btn.getAttribute('data-type');
            if (hiddenCatSelect) hiddenCatSelect.value = selectedValue;

            if (labelDisplay) {
                const formattedType = selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1);
                labelDisplay.innerHTML = `Select Category Type: <b>${formattedType}</b>`;
            }

            if (catTypeModal) catTypeModal.classList.remove('active');
        });
    });

    // Wallet Selection Popup Logic
    const openWalletPopup = document.getElementById('open-wallet-popup');
    const walletModal = document.getElementById('wallet-modal');
    const closeWalletPopup = document.getElementById('close-wallet-popup');
    const walletPopupList = document.getElementById('wallet-popup-list');
    const hiddenWalletSelect = document.getElementById('tx-wallet');
    const selectedWalletLabel = document.getElementById('selected-wallet-label');

    if (openWalletPopup && walletModal) {
        openWalletPopup.addEventListener('click', () => {
            renderWalletPopupList(); 
            walletModal.classList.add('active');
        });
    }

    if (closeWalletPopup && walletModal) closeWalletPopup.addEventListener('click', () => walletModal.classList.remove('active'));

    function renderWalletPopupList() {
        if (!walletPopupList || !hiddenWalletSelect) return;

        walletPopupList.innerHTML = ''; 
        const options = Array.from(hiddenWalletSelect.options).filter(opt => !opt.disabled);

        if (options.length === 0) {
            walletPopupList.innerHTML = `<p style="font-size:0.85rem; color:var(--text-color-muted); padding:10px;">No wallets found. Please add a wallet first.</p>`;
            return;
        }

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `popup-select-btn ${hiddenWalletSelect.value === option.value ? 'active' : ''}`;
            btn.innerHTML = `${getWalletIcon(option.value)}<span>${option.text}</span>`;

            btn.addEventListener('click', () => {
                hiddenWalletSelect.value = option.value;
                if (selectedWalletLabel) selectedWalletLabel.innerHTML = `Select Wallet: <b>${option.text}</b>`;
                hiddenWalletSelect.dispatchEvent(new Event('change'));
                if (walletModal) walletModal.classList.remove('active');
            });

            walletPopupList.appendChild(btn);
        });

        if (window.lucide) lucide.createIcons();
    }

    function getWalletIcon(walletValue) {
        if (!walletValue) return '<i data-lucide="credit-card" style="color: #9b59b6;"></i>';
        const walletName = walletValue.toLowerCase();
        
        if (walletName.includes("bank")) return '<i data-lucide="banknote" style="color: #e74c3c;"></i>';
        if (walletName.includes("card")) return '<i data-lucide="credit-card" style="color: #3498db;"></i>';
        if (walletName.includes("cash")) return '<i data-lucide="banknote" style="color: #2ecc71;"></i>';
        return '<i data-lucide="credit-card" style="color: #9b59b6;"></i>';
    }

    // Wallet Type Popup Modal
    const openWTBtn = document.getElementById('open-wallet-type-popup');
    const modalWT = document.getElementById('wallet-type-modal');
    const closeWTBtn = document.getElementById('close-wallet-type-popup');
    const popupWTList = document.getElementById('wallet-type-popup-list');
    const hiddenWTSelect = document.getElementById('wallet-type');
    const selectedWTLabel = document.getElementById('selected-wallet-type-label');

    if (hiddenWTSelect && selectedWTLabel) {
        const activeOption = hiddenWTSelect.options[hiddenWTSelect.selectedIndex];
        if (activeOption) selectedWTLabel.innerHTML = `Select Type: <b>${activeOption.text}</b>`;
    }

    if (openWTBtn && modalWT) {
        openWTBtn.addEventListener('click', () => {
            renderWalletTypeList();
            modalWT.classList.add('active');
        });
    }

    if (closeWTBtn && modalWT) closeWTBtn.addEventListener('click', () => modalWT.classList.remove('active'));
    if (modalWT) modalWT.addEventListener('click', (e) => { if (e.target === modalWT) modalWT.classList.remove('active'); });

    function renderWalletTypeList() {
        if (!popupWTList || !hiddenWTSelect) return;
        popupWTList.innerHTML = '';
        const options = Array.from(hiddenWTSelect.options).filter(opt => !opt.disabled);

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `popup-select-btn ${hiddenWTSelect.value === option.value ? 'active' : ''}`;
            btn.innerHTML = `${getWalletTypeIcon(option.value)}<span>${option.text}</span>`;

            btn.addEventListener('click', () => {
                hiddenWTSelect.value = option.value;
                if (selectedWTLabel) selectedWTLabel.innerHTML = `Select Type: <b>${option.text}</b>`;
                hiddenWTSelect.dispatchEvent(new Event('change'));
                modalWT.classList.remove('active');
            });

            popupWTList.appendChild(btn);
        });

        if (window.lucide) lucide.createIcons();
    }

    function getWalletTypeIcon(typeValue) {
        switch (typeValue) {
            case 'cash': return '<i data-lucide="banknote" style="color: #2ecc71;"></i>';
            case 'bank': return '<i data-lucide="building-2" style="color: #e74c3c;"></i>';
            case 'card': return '<i data-lucide="credit-card" style="color: #3498db;"></i>';
            case 'other': return '<i data-lucide="piggy-bank" style="color: #f1c40f;"></i>';
            default: return '<i data-lucide="wallet" style="color: #9b59b6;"></i>';
        }
    }

    // Loan Type Modal Handler
    const openLTBtn = document.getElementById('open-loan-type-popup');
    const modalLT = document.getElementById('loan-type-modal');
    const closeLTBtn = document.getElementById('close-loan-type-popup');
    const popupLTList = document.getElementById('loan-type-popup-list');
    const hiddenLTSelect = document.getElementById('loan-type');
    const selectedLTLabel = document.getElementById('selected-loan-type-label');

    if (hiddenLTSelect && selectedLTLabel) {
        const activeOption = hiddenLTSelect.options[hiddenLTSelect.selectedIndex];
        if (activeOption) selectedLTLabel.innerHTML = `Select Loan Type: <b>${activeOption.text}</b>`;
    }

    if (openLTBtn && modalLT) {
        openLTBtn.addEventListener('click', () => {
            renderLoanTypeList();
            modalLT.classList.add('active');
        });
    }

    if (closeLTBtn && modalLT) closeLTBtn.addEventListener('click', () => modalLT.classList.remove('active'));
    if (modalLT) modalLT.addEventListener('click', (e) => { if (e.target === modalLT) modalLT.classList.remove('active'); });

    function renderLoanTypeList() {
        if (!popupLTList || !hiddenLTSelect) return;
        popupLTList.innerHTML = '';
        const options = Array.from(hiddenLTSelect.options).filter(opt => !opt.disabled);

        options.forEach(option => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `popup-select-btn ${hiddenLTSelect.value === option.value ? 'active' : ''}`;
            btn.innerHTML = `${getLoanTypeIcon(option.value)}<span>${option.text}</span>`;

            btn.addEventListener('click', () => {
                hiddenLTSelect.value = option.value;
                if (selectedLTLabel) selectedLTLabel.innerHTML = `Select Loan Type: <b>${option.text}</b>`;
                hiddenLTSelect.dispatchEvent(new Event('change'));
                modalLT.classList.remove('active');
            });

            popupLTList.appendChild(btn);
        });

        if (window.lucide) lucide.createIcons();
    }

    function getLoanTypeIcon(typeValue) {
        switch (typeValue) {
            case 'lent': return '<i data-lucide="arrow-up-right" style="color: #2ecc71;"></i>';
            case 'borrowed': return '<i data-lucide="arrow-down-left" style="color: #e74c3c;"></i>';
            default: return '<i data-lucide="handshake" style="color: #3498db;"></i>';
        }
    }

    // Month Picker Modal Logic
    const monthModal = document.getElementById('month-picker-modal');
    const closeMonthBtn = document.getElementById('close-month-picker');
    const prevYearBtn = document.getElementById('mp-prev-year');
    const nextYearBtn = document.getElementById('mp-next-year');
    const yearDisplay = document.getElementById('mp-current-year');
    const monthsGrid = document.getElementById('mp-months-grid') || document.querySelector('#month-picker-modal .popup-option-list');

    let activeInput = null;
    let selectedYear = new Date().getFullYear();
    let selectedMonth = new Date().getMonth();

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    document.querySelectorAll('input[type="month"]').forEach(input => {
        input.addEventListener('click', (e) => {
            e.preventDefault();
            activeInput = input;
            
            if (input.value) {
                const parts = input.value.split('-');
                selectedYear = parseInt(parts[0]);
                selectedMonth = parseInt(parts[1]) - 1;
            } else {
                const today = new Date();
                selectedYear = today.getFullYear();
                selectedMonth = today.getMonth();
            }

            renderMonthPicker();
            if (monthModal) monthModal.classList.add('active');
        });
    });

    if (prevYearBtn) prevYearBtn.addEventListener('click', () => { selectedYear--; renderMonthPicker(); });
    if (nextYearBtn) nextYearBtn.addEventListener('click', () => { selectedYear++; renderMonthPicker(); });
    if (closeMonthBtn && monthModal) closeMonthBtn.addEventListener('click', () => monthModal.classList.remove('active'));
    if (monthModal) monthModal.addEventListener('click', (e) => { if (e.target === monthModal) monthModal.classList.remove('active'); });

    function renderMonthPicker() {
        if (!yearDisplay || !monthsGrid) return;

        yearDisplay.textContent = selectedYear;
        monthsGrid.className = 'mp-months-grid';
        monthsGrid.innerHTML = '';

        monthNames.forEach((month, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `mp-month-btn ${index === selectedMonth ? 'active' : ''}`;
            btn.textContent = month;

            btn.addEventListener('click', () => {
                selectedMonth = index;
                const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
                const val = `${selectedYear}-${formattedMonth}`;

                if (activeInput) {
                    activeInput.value = val;
                    activeInput.dispatchEvent(new Event('change', { bubbles: true }));
                }

                if (monthModal) monthModal.classList.remove('active');
            });

            monthsGrid.appendChild(btn);
        });

        if (window.lucide) lucide.createIcons();
    }
});
