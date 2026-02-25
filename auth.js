/**
 * Moment-A Auth - Demo auth with localStorage
 * Sign Up: DNI, phone, email → OTP (code) → 6-digit PIN
 * Login: DNI + 6-digit PIN
 * Display username: abc123 when logged in
 *
 * DEMO RESET: To reset all demo data, run in browser console:
 * localStorage.clear(); localStorage.setItem('momentA_users', JSON.stringify([{dni:"72188813",phone:"+51 999 000 000",email:"demo@momenta.com",pin:"123456",role:"entrant",displayName:"abc123"},{dni:"72188820",phone:"+51 999 000 001",email:"host@momenta.com",pin:"123456",role:"host",displayName:"CarLifestyle"}])); location.reload();
 */

const STORAGE_KEY_USERS = 'momentA_users';
const STORAGE_KEY_CURRENT = 'momentA_currentUser';
const DISPLAY_USERNAME = 'abc123';
const VALID_OTP = '111111'; // Demo OTP for testing

// Roles: "entrant" = regular user (default for Sign Up), "host" = creator with Business Manager access

let signupTempData = null;

function getUsers() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_USERS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function getCurrentUser() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_CURRENT);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem(STORAGE_KEY_CURRENT, JSON.stringify(user));
    } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT);
    }
}

function seedDemoAccount() {
    let users = [];
    try {
        const data = localStorage.getItem(STORAGE_KEY_USERS);
        users = data ? JSON.parse(data) : [];
    } catch (e) {
        users = [];
    }
    let changed = false;
    // Account 1 — Entrant
    const entrant = users.find(u => u.dni === '72188813');
    if (!entrant) {
        users.push({
            dni: '72188813',
            phone: '+51 999 000 000',
            email: 'demo@momenta.com',
            pin: '123456',
            role: 'entrant',
            displayName: 'abc123'
        });
        changed = true;
    } else {
        if (entrant.role === undefined) { entrant.role = 'entrant'; changed = true; }
        if (entrant.displayName === undefined) { entrant.displayName = 'abc123'; changed = true; }
    }
    // Account 2 — Host
    const host = users.find(u => u.dni === '72188820');
    if (!host) {
        users.push({
            dni: '72188820',
            phone: '+51 999 000 001',
            email: 'host@momenta.com',
            pin: '123456',
            role: 'host',
            displayName: 'CarLifestyle'
        });
        changed = true;
    } else {
        if (host.role === undefined) { host.role = 'host'; changed = true; }
        if (host.displayName === undefined) { host.displayName = 'CarLifestyle'; changed = true; }
    }
    if (changed) {
        try {
            localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
        } catch (err) { /* ignore */ }
    }
    // Debug: verify both accounts exist (remove or comment out after confirming)
    try {
        var stored = localStorage.getItem(STORAGE_KEY_USERS);
        console.log('[Moment-A auth] momentA_users after seed:', stored ? JSON.parse(stored) : []);
    } catch (e) { console.log('[Moment-A auth] momentA_users:', []); }
}

seedDemoAccount();

function openModal(modalId, event) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent && event) {
        const rect = event.target.getBoundingClientRect();
        modalContent.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
    } else if (modalContent) {
        modalContent.style.transformOrigin = 'center center';
    }
    modal.offsetHeight;
    requestAnimationFrame(() => modal.classList.add('active'));
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
    document.body.style.overflow = 'auto';
}

function openEnterModal(event) {
    // Used when handleEnterMomentA(hostId) determined user is not logged in.
    // Just open the login modal; after login, handleEnterMomentA(pendingHostId) will run.
    var m = document.getElementById('enterRequiredModal');
    if (m) m.setAttribute('data-login-state', 'form');
    openModal('enterRequiredModal', event);
}

function closeEnterModal() {
    resetLoginForm('enterRequiredModal');
    closeModal('enterRequiredModal');
}

function switchToSignUpFromEnter(event) {
    if (event) event.preventDefault();
    closeModal('enterRequiredModal');
    setTimeout(() => openModal('signUpModal'), 100);
}

function openSignUpModal(event) {
    signupTempData = null;
    resetSignUpSteps();
    openModal('signUpModal', event);
}

function closeSignUpModal() {
    signupTempData = null;
    resetSignUpSteps();
    closeModal('signUpModal');
}

function openLogInModal(event) {
    var m = document.getElementById('logInModal');
    if (m) m.setAttribute('data-login-state', 'form');
    openModal('logInModal', event);
}

function closeLogInModal() {
    resetLoginForm('logInModal');
    closeModal('logInModal');
}

function switchToSignUp(event) {
    if (event) event.preventDefault();
    closeModal('logInModal');
    setTimeout(() => openSignUpModal(), 100);
}

function resetSignUpSteps() {
    const s1 = document.getElementById('signUpStep1');
    const s2 = document.getElementById('signUpStep2');
    const s3 = document.getElementById('signUpStep3');
    const s4 = document.getElementById('signUpStep4');
    if (s1) s1.style.display = '';
    if (s2) s2.style.display = 'none';
    if (s3) s3.style.display = 'none';
    if (s4) s4.style.display = 'none';
}

function showSignUpStep(step) {
    [1, 2, 3, 4].forEach(n => {
        const el = document.getElementById('signUpStep' + n);
        if (el) el.style.display = n === step ? '' : 'none';
    });
}

// Sign Up flow handlers
function handleSignUpStep1() {
    const dni = document.getElementById('dni')?.value?.trim();
    const phone = document.getElementById('phone')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const terms = document.getElementById('terms')?.checked;
    const privacy = document.getElementById('privacy')?.checked;
    const marketing = document.getElementById('marketing')?.checked;

    if (!dni || !phone || !email) {
        alert('Please fill in DNI, phone number, and email.');
        return;
    }
    if (!terms || !privacy) {
        alert('You must accept the Terms and Conditions and Privacy Policy.');
        return;
    }

    signupTempData = { dni, phone, email, marketing };
    showSignUpStep(2);
}

function handleSignUpStep2() {
    const codeInput = document.getElementById('otp-code');
    const code = codeInput?.value?.trim();

    if (!code || code.length !== 6) {
        alert('Please enter the 6-digit code.');
        return;
    }
    if (code !== VALID_OTP) {
        alert('Invalid code. Please try again.');
        return;
    }

    showSignUpStep(3);
}

function handleSignUpStep3() {
    const pinInput = document.getElementById('signup-pin');
    const pin = pinInput?.value?.trim();

    if (!pin || pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        alert('Please enter a valid 6-digit PIN.');
        return;
    }

    const users = getUsers();
    if (users.some(u => (u.email && u.email.toLowerCase() === signupTempData.email.toLowerCase()) || u.phone === signupTempData.phone)) {
        alert('An account with this email or phone already exists.');
        return;
    }

    const newUser = {
        dni: signupTempData.dni,
        phone: signupTempData.phone,
        email: signupTempData.email,
        pin: pin,
        role: 'entrant',
        displayName: DISPLAY_USERNAME
    };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser({ displayName: DISPLAY_USERNAME, email: newUser.email, phone: newUser.phone, dni: newUser.dni, role: 'entrant' });
    signupTempData = null;
    showSignUpStep(4);
}

function handleSignUpStep4OK() {
    closeModal('signUpModal');
    updateNavForAuth();
}

// Login: DNI + PIN — loader 1.5s → welcome 1s → fade-out 0.5s → close (no X, no click-outside during loader/welcome)
function showLoginLoader(modalId) {
    const isEnter = modalId === 'enterRequiredModal';
    const modal = document.getElementById(modalId);
    const formContent = document.getElementById(isEnter ? 'enterLoginFormContent' : 'loginFormContent');
    const loader = document.getElementById(isEnter ? 'enterLoginLoader' : 'loginLoader');
    const welcome = document.getElementById(isEnter ? 'enterLoginWelcome' : 'loginWelcome');
    if (modal) modal.setAttribute('data-login-state', 'loader');
    const closeWrap = modal ? modal.querySelector('.login-modal-close-wrap') : null;
    if (closeWrap) closeWrap.style.display = 'none';
    if (formContent) formContent.style.display = 'none';
    if (welcome) {
        welcome.style.display = 'none';
        welcome.classList.add('hidden');
        welcome.classList.remove('welcome-fade-out');
    }
    if (loader) {
        loader.style.display = 'flex';
        loader.classList.remove('hidden');
    }
}

function showLoginWelcome(modalId, user) {
    const isEnter = modalId === 'enterRequiredModal';
    const modal = document.getElementById(modalId);
    const loader = document.getElementById(isEnter ? 'enterLoginLoader' : 'loginLoader');
    const welcome = document.getElementById(isEnter ? 'enterLoginWelcome' : 'loginWelcome');
    if (modal) modal.setAttribute('data-login-state', 'welcome');
    if (loader) {
        loader.style.display = 'none';
        loader.classList.add('hidden');
    }
    if (welcome) {
        const h2 = welcome.querySelector('h2');
        const sub = welcome.querySelector('p');
        if (user && user.role === 'host') {
            if (h2) h2.textContent = 'Welcome back, ' + (user.displayName || 'CarLifestyle') + '!';
            if (sub) sub.textContent = 'Redirecting to your Business Manager...';
        } else {
            if (h2) h2.textContent = 'Welcome back!';
            if (sub) sub.textContent = (isEnter ? "You're all set. You can now participate in this Moment-A." : "You're all set. Let's find your next Moment-A.");
        }
        welcome.classList.remove('welcome-fade-out');
        welcome.style.display = 'flex';
        welcome.classList.remove('hidden');
    }
}

function resetLoginForm(modalId) {
    const isEnter = modalId === 'enterRequiredModal';
    const modal = document.getElementById(modalId);
    const formContent = document.getElementById(isEnter ? 'enterLoginFormContent' : 'loginFormContent');
    const loader = document.getElementById(isEnter ? 'enterLoginLoader' : 'loginLoader');
    const welcome = document.getElementById(isEnter ? 'enterLoginWelcome' : 'loginWelcome');
    if (modal) modal.setAttribute('data-login-state', 'form');
    const closeWrap = modal ? modal.querySelector('.login-modal-close-wrap') : null;
    if (closeWrap) closeWrap.style.display = '';
    if (formContent) formContent.style.display = '';
    if (loader) {
        loader.style.display = 'none';
        loader.classList.add('hidden');
    }
    if (welcome) {
        welcome.style.display = 'none';
        welcome.classList.add('hidden');
        welcome.classList.remove('welcome-fade-out');
    }
    const form = document.getElementById(isEnter ? 'enterLoginForm' : 'logInForm');
    if (form) form.reset();
}

function doLogin(dni, pin, modalId, successMessage) {
    if (dni === undefined || dni === null || pin === undefined || pin === null) {
        alert('Please enter your DNI and 6-digit PIN.');
        return;
    }
    var dniTrim = String(dni).trim();
    var pinTrim = String(pin).trim();
    if (!dniTrim || !pinTrim) {
        alert('Please enter your DNI and 6-digit PIN.');
        return;
    }
    if (pinTrim.length !== 6 || !/^\d{6}$/.test(pinTrim)) {
        alert('Please enter a valid 6-digit PIN.');
        return;
    }

    const users = getUsers();
    const user = users.find(function (u) {
        return String(u.dni).trim() === dniTrim && String(u.pin).trim() === pinTrim;
    });

    if (!user) {
        alert('Invalid credentials. Please try again.');
        return;
    }

    var userRole = user.role || 'entrant';
    setCurrentUser({
        displayName: user.displayName || (userRole === 'host' ? 'CarLifestyle' : DISPLAY_USERNAME),
        email: user.email,
        phone: user.phone,
        dni: user.dni,
        role: userRole
    });

    var redirectTarget = (userRole === 'host') ? 'host-dashboard.html' : 'hosts.html#hosts';

    // Step 1: Show loader immediately
    showLoginLoader(modalId);

    // Step 2: After 1.5s, swap loader for welcome message
    setTimeout(function () {
        showLoginWelcome(modalId, user);

        // Step 3: After 1s, start fade-out animation
        setTimeout(function () {
            var welcomeEl = document.getElementById(modalId === 'enterRequiredModal' ? 'enterLoginWelcome' : 'loginWelcome');
            if (welcomeEl) welcomeEl.classList.add('welcome-fade-out');

            // Step 4: After 0.5s fade completes, redirect
            setTimeout(function () {
                window.location.href = redirectTarget;
            }, 500);

        }, 1000);

    }, 1500);
}

function initSignUpForm() {
    const form = document.getElementById('signUpForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const s1 = document.getElementById('signUpStep1');
        const s2 = document.getElementById('signUpStep2');
        const s3 = document.getElementById('signUpStep3');
        const s4 = document.getElementById('signUpStep4');

        if (s1 && s1.style.display !== 'none') {
            handleSignUpStep1();
        } else if (s2 && s2.style.display !== 'none') {
            handleSignUpStep2();
        } else if (s3 && s3.style.display !== 'none') {
            handleSignUpStep3();
        }
    });

    const okBtn = document.getElementById('signUpOkBtn');
    if (okBtn) {
        okBtn.addEventListener('click', handleSignUpStep4OK);
    }

    const otpBtn = document.getElementById('signUpOtpBtn');
    if (otpBtn) {
        otpBtn.addEventListener('click', function (e) {
            e.preventDefault();
            handleSignUpStep2();
        });
    }
}

function initEnterLoginForm() {
    const form = document.getElementById('enterLoginForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const dni = document.getElementById('enter-dni')?.value;
        const pin = document.getElementById('enter-pin')?.value;
        doLogin(dni, pin, 'enterRequiredModal', 'Welcome back! You can now participate in this Moment-A.');
        form.reset();
    });
}

function initLogInForm() {
    const form = document.getElementById('logInForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const dni = document.getElementById('login-dni')?.value;
        const pin = document.getElementById('login-pin')?.value;
        doLogin(dni, pin, 'logInModal', 'Welcome back to Moment-A!');
        form.reset();
    });
}

function updateNavForAuth() {
    const cur = getCurrentUser();
    const isLoggedIn = !!cur;
    const guestEl = document.getElementById('nav-guest');
    const userEl = document.getElementById('nav-user');
    if (guestEl) guestEl.style.display = isLoggedIn ? 'none' : '';
    if (userEl) {
        userEl.style.display = isLoggedIn ? '' : 'none';
        const displayName = (cur && cur.displayName) ? cur.displayName : DISPLAY_USERNAME;
        const nameEl = userEl.querySelector('[data-username]');
        if (nameEl) nameEl.textContent = displayName;
        const dropdownLabel = userEl.querySelector('[data-dropdown-username]');
        if (dropdownLabel) dropdownLabel.textContent = displayName;
        const secondaryEl = userEl.querySelector('[data-dropdown-secondary]');
        if (secondaryEl) secondaryEl.textContent = (cur && (cur.email || cur.dni)) ? (cur.email || cur.dni) : '';
        const bizLink = document.getElementById('nav-dropdown-business-manager');
        if (bizLink) bizLink.style.display = (cur && cur.role === 'host') ? '' : 'none';
    }
}

function closeUserDropdown() {
    const d = document.getElementById('nav-user-dropdown');
    const trigger = document.querySelector('#nav-user [data-dropdown-trigger]');
    if (d) {
        d.classList.add('nav-user-dropdown-closed');
    }
    if (trigger) trigger.classList.remove('nav-user-dropdown-open');
}

function toggleUserDropdown(event) {
    if (event) event.stopPropagation();
    const d = document.getElementById('nav-user-dropdown');
    const trigger = document.querySelector('#nav-user [data-dropdown-trigger]');
    if (!d) return;
    d.classList.toggle('nav-user-dropdown-closed');
    if (trigger) trigger.classList.toggle('nav-user-dropdown-open');
}

function logOut() {
    // Save users before clearing (so demo accounts persist)
    const users = localStorage.getItem('momentA_users');

    // Clear everything — removes subscriptions, currentUser, etc.
    localStorage.clear();

    // Restore only the users array
    if (users) {
        localStorage.setItem('momentA_users', users);
    }

    // Re-seed demo accounts in case they were affected
    seedDemoAccount();

    // Force full page reload — clears ALL in-memory JavaScript (e.g. momenta-flow.js state)
    window.location.href = 'index.html';
}

function initModalCloseHandlers() {
    ['enterRequiredModal', 'signUpModal', 'logInModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target !== this) return;
                if (id === 'signUpModal') {
                    closeSignUpModal();
                    return;
                }
                var state = modal.getAttribute('data-login-state');
                if ((id === 'logInModal' || id === 'enterRequiredModal') && (state === 'loader' || state === 'welcome')) return;
                closeModal(id);
            });
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var enterModal = document.getElementById('enterRequiredModal');
        var loginModal = document.getElementById('logInModal');
        if (enterModal && enterModal.classList.contains('active')) {
            var s = enterModal.getAttribute('data-login-state');
            if (s === 'loader' || s === 'welcome') return;
        }
        if (loginModal && loginModal.classList.contains('active')) {
            var s2 = loginModal.getAttribute('data-login-state');
            if (s2 === 'loader' || s2 === 'welcome') return;
        }
        closeSignUpModal();
        closeModal('enterRequiredModal');
        closeModal('logInModal');
    });
}

function initUserDropdown() {
    document.addEventListener('click', function (e) {
        const dropdown = document.getElementById('nav-user-dropdown');
        const navUser = document.getElementById('nav-user');
        if (dropdown && navUser && !navUser.contains(e.target)) {
            closeUserDropdown();
        }
    });
}

function navigateExplore(e) {
    if (e) e.preventDefault();
    var cur = getCurrentUser();
    if (cur) {
        window.location.href = 'hosts.html#hosts';
    } else {
        openExploreGate();
    }
}

function openExploreGate() {
    var existing = document.getElementById('explore-gate-modal');
    if (existing) existing.remove();

    if (!document.getElementById('explore-gate-style')) {
        var style = document.createElement('style');
        style.id = 'explore-gate-style';
        style.textContent = '@keyframes modalSlideUp{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}';
        document.head.appendChild(style);
    }

    var overlay = document.createElement('div');
    overlay.id = 'explore-gate-modal';
    overlay.className = 'modal-overlay active';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';
    overlay.onclick = function(ev) { if (ev.target === overlay) overlay.remove(); };

    overlay.innerHTML = '<div style="background:white;border-radius:1.5rem;padding:2.5rem;max-width:420px;width:90%;text-align:center;animation:modalSlideUp 0.3s ease-out;">'
        + '<div style="width:64px;height:64px;margin:0 auto 1.25rem;background:linear-gradient(135deg,#22d3ee,#a855f7);border-radius:1rem;display:flex;align-items:center;justify-content:center;">'
        + '<span class="material-symbols-outlined" style="color:white;font-size:32px;">explore</span></div>'
        + '<h2 style="font-size:1.375rem;font-weight:700;color:#111827;margin-bottom:0.5rem;">Join Moment-A to Explore</h2>'
        + '<p style="color:#6b7280;font-size:0.9rem;line-height:1.5;margin-bottom:1.75rem;">To continue exploring giveaways and creators, you need an account.<br><strong style="color:#111827;">It\'s completely free!</strong></p>'
        + '<button onclick="document.getElementById(\'explore-gate-modal\').remove();openSignUpModal(event);" style="width:100%;padding:0.75rem;background:linear-gradient(135deg,#22d3ee,#a855f7);color:white;border:none;border-radius:9999px;font-size:0.9rem;font-weight:600;cursor:pointer;margin-bottom:0.75rem;transition:opacity 0.2s;" onmouseover="this.style.opacity=0.9" onmouseout="this.style.opacity=1">Create Free Account</button>'
        + '<button onclick="document.getElementById(\'explore-gate-modal\').remove();openLogInModal(event);" style="width:100%;padding:0.75rem;background:transparent;color:#6b7280;border:1px solid #e5e7eb;border-radius:9999px;font-size:0.9rem;font-weight:600;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.borderColor=\'#a855f7\';this.style.color=\'#a855f7\'" onmouseout="this.style.borderColor=\'#e5e7eb\';this.style.color=\'#6b7280\'">I already have an account</button>'
        + '</div>';

    document.body.appendChild(overlay);
}

function closeExploreGate() {
    var el = document.getElementById('explore-gate-modal');
    if (el) el.remove();
}

window.navigateExplore = navigateExplore;
window.closeExploreGate = closeExploreGate;
window.openEnterModal = openEnterModal;
window.closeEnterModal = closeEnterModal;
window.switchToSignUpFromEnter = switchToSignUpFromEnter;
window.openSignUpModal = openSignUpModal;
window.closeSignUpModal = closeSignUpModal;
window.openLogInModal = openLogInModal;
window.closeLogInModal = closeLogInModal;
window.switchToSignUp = switchToSignUp;
window.toggleUserDropdown = toggleUserDropdown;
window.logOut = logOut;

document.addEventListener('DOMContentLoaded', function () {
    initSignUpForm();
    initEnterLoginForm();
    initLogInForm();
    initModalCloseHandlers();
    initUserDropdown();
    updateNavForAuth();
});

// Secret reset: Ctrl+Shift+K (Cmd+Shift+K on Mac) — clears all demo activity data and redirects to index
document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        const users = localStorage.getItem('momentA_users');
        localStorage.clear();
        if (users) localStorage.setItem('momentA_users', users);
        seedDemoAccount();
        console.log('🔄 Demo reset complete. All activity data cleared.');
        window.location.href = 'index.html';
    }
});

