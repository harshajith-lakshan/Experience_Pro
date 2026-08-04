// Auth Slide Toggle Logic
const loginBtn = document.querySelector("label.login");
const signupBtn = document.querySelector("label.signup");
const signupLink = document.getElementById("go-to-signup");
const formInner = document.querySelector(".form-inner");
const glowBox = document.getElementById('auth-glow-box');
const authTitle = document.getElementById('auth-title-text');

if (signupBtn && loginBtn && formInner) {
    signupBtn.addEventListener('click', () => {
        formInner.style.transform = "translateX(-50%)";
        if (glowBox) glowBox.classList.add('signup-active-glow');
        if (authTitle) authTitle.innerText = "Create Account";
    });

    loginBtn.addEventListener('click', () => {
        formInner.style.transform = "translateX(0%)";
        if (glowBox) glowBox.classList.remove('signup-active-glow');
        if (authTitle) authTitle.innerText = "Welcome Back";
    });
}

if (signupLink) {
    signupLink.addEventListener('click', (e) => {
        e.preventDefault();
        const radioSignup = document.getElementById("signup");
        if (radioSignup) {
            radioSignup.checked = true;
            signupBtn.click();
        }
    });
}


// DOB Picker Initialization
if (typeof flatpickr !== 'undefined') {
    flatpickr("#signup-dob", {
        dateFormat: "Y-m-d",
        maxDate: "today", 
        disableMobile: true,
        animate: true
    });
}

/* ==========================================
   Navigation Liquid Pill Logic
========================================== */
function initBottomNav() {
    const navItems = document.querySelectorAll('.navbar-container .nav-item');
    const navWrap = document.getElementById('floating-nav');
    
    // Liquid glare effect
    if (navWrap) {
        navWrap.addEventListener('mousemove', e => {
            const r = navWrap.getBoundingClientRect();
            navWrap.style.setProperty('--gx', `${e.clientX - r.left}px`);
            navWrap.style.setProperty('--gy', `${e.clientY - r.top}px`);
        });
    }

    // Active pill animation
    function updateNavPill() {
        const active = document.querySelector('.navbar-container .nav-item.active');
        const pill = document.getElementById('active-pill');
        if (active && pill) {
            pill.style.width = active.offsetWidth + 'px';
            pill.style.transform = `translateX(${active.offsetLeft}px)`;
        }
    }

    navItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            if (!targetId) return;

            // Update Active Tab State
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            updateNavPill();

            // Hide all sections and display the selected target
            document.querySelectorAll('.app-section').forEach(sec => {
                sec.style.display = 'none';
                sec.classList.remove('active');
            });
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                // small delay for css animation
                setTimeout(() => targetSection.classList.add('active'), 10);
                // Trigger chart resizes for responsiveness
                window.dispatchEvent(new Event('resize'));
            }
        });
    });

    // Initial setup
    setTimeout(updateNavPill, 100);
    window.addEventListener('resize', updateNavPill);
}

document.addEventListener("DOMContentLoaded", () => { 
    initBottomNav(); 
});


/* ==========================================
   Export PDF Logic (Advanced & Beautiful A4)
========================================== */
const exportPdfBtn = document.getElementById('export-pdf-btn');
const reportMonthInput = document.getElementById('report-month-input');
const editNameInput = document.getElementById('edit-name');
const editEmailInput = document.getElementById('edit-email');
const editPhoneInput = document.getElementById('edit-phone');
const editBioInput = document.getElementById('edit-bio');

// Set current month in report picker
if (reportMonthInput) {
    const now = new Date();
    reportMonthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', async () => {
        const selectedMonthStr = reportMonthInput.value;
        if (!selectedMonthStr) return window.showErrorToast ? window.showErrorToast("කරුණාකර රිපෝට් එක සඳහා මාසයක් තෝරන්න!") : alert("Select month");

        const [year, month] = selectedMonthStr.split('-');
        
        // This assumes allTransactions is available globally via window or directly here due to script loading order. 
        // In a real app, you might want to pass it or read from a global store.
        const txList = window.allTransactions || []; 
        const monthlyTxs = txList.filter(tx => {
            if (!tx.date) return false;
            const txDate = new Date(tx.date);
            return txDate.getFullYear() == parseInt(year) && (txDate.getMonth() + 1) == parseInt(month);
        });

        if (monthlyTxs.length === 0) {
            return window.showErrorToast ? window.showErrorToast(`${selectedMonthStr} මාසය සඳහා ගනුදෙනු කිසිවක් හමු නොවීය!`) : alert("No tx found");
        }

        let mIncome = 0;
        let mExpense = 0;
        let tbodyHTML = '';

        monthlyTxs.forEach(tx => {
            if (tx.type === 'income') mIncome += tx.amount;
            if (tx.type === 'expense') mExpense += tx.amount;

            tbodyHTML += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 9px; color: #334155;">${tx.date}</td>
                    <td style="padding: 9px; font-weight: 600; color: #1e293b;">${tx.category}</td>
                    <td style="padding: 9px; color: #64748b;">${tx.wallet}</td>
                    <td style="padding: 9px; color: #64748b;">${tx.note || '-'}</td>
                    <td style="padding: 9px; text-align: right; color: ${tx.type === 'income' ? '#10b981' : '#ef4444'}; font-weight: bold;">
                        ${tx.type === 'income' ? '+' : '-'} LKR ${tx.amount.toFixed(2)}
                    </td>
                </tr>
            `;
        });

        const mBalance = mIncome - mExpense;

        // Populate User Details
        const userName = editNameInput ? editNameInput.value || 'User' : 'User';
        const userEmail = editEmailInput ? editEmailInput.value || '' : '';
        const userPhone = editPhoneInput ? editPhoneInput.value || '' : '';
        const userBio = editBioInput ? editBioInput.value || '' : '';

        document.getElementById('rep-date-range-sub').innerText = `Monthly Financial Report (${selectedMonthStr})`;
        document.getElementById('rep-user-name').innerText = userName;
        document.getElementById('rep-user-email').innerText = userEmail;
        document.getElementById('rep-user-phone-bio').innerText = `${userPhone ? '📞 ' + userPhone + ' | ' : ''} ${userBio}`;
        document.getElementById('rep-gen-date').innerText = new Date().toISOString().split('T')[0];

        // Avatar or Initial
        const avatarBox = document.getElementById('rep-user-avatar-box');
        const activeAvatarImg = document.querySelector('#user-avatar img');
        if (activeAvatarImg) {
            avatarBox.innerHTML = `<img src="${activeAvatarImg.src}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            avatarBox.innerText = userName.charAt(0).toUpperCase();
        }

        // Summary Values
        document.getElementById('rep-tot-income').innerText = `LKR ${mIncome.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        document.getElementById('rep-tot-expense').innerText = `LKR ${mExpense.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        document.getElementById('rep-net-balance').innerText = `LKR ${mBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
        document.getElementById('printable-tbody').innerHTML = tbodyHTML;

        // Capture Charts as Images
        const barCanvas = document.getElementById('incomeExpenseChart');
        const doughnutCanvas = document.getElementById('categoryChart');
        
        if (barCanvas) {
            document.getElementById('rep-chart-img-1').src = barCanvas.toDataURL('image/png');
        }
        if (doughnutCanvas) {
            document.getElementById('rep-chart-img-2').src = doughnutCanvas.toDataURL('image/png');
        }

        const reportElement = document.getElementById('printable-report');
        reportElement.style.display = 'block';
        reportElement.style.position = 'absolute';
        reportElement.style.left = '-9999px';

        exportPdfBtn.innerHTML = `<i data-lucide="loader" width="15" height="15"></i> Generating...`;
        if (window.lucide) lucide.createIcons();
        exportPdfBtn.disabled = true;

        try {
            const canvas = await html2canvas(reportElement.firstElementChild, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; 
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Financial_Report_${selectedMonthStr}.pdf`);
            if (window.showSuccessToast) window.showSuccessToast("මාසික වාර්තාව PDF ලෙස ඩවුන්ලෝඩ් විය! 🎉");
        } catch (err) {
            if (window.showErrorToast) window.showErrorToast("PDF සැකසීමේදී දෝෂයක් ඇති විය: " + err.message);
        } finally {
            reportElement.style.display = 'none';
            exportPdfBtn.innerHTML = `<i data-lucide="download" width="15" height="15"></i> Download PDF`;
            if (window.lucide) lucide.createIcons();
            exportPdfBtn.disabled = false;
        }
    });
}

