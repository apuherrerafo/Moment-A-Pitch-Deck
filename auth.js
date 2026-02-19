/**
 * Moment-A Auth - Demo auth with localStorage
 * Sign Up: DNI, phone, email → OTP (code) → 6-digit PIN
 * Login: phone/email + 6-digit PIN
 * Display username: abc123 when logged in
 */

const STORAGE_KEY_USERS = 'momentA_users';
const STORAGE_KEY_CURRENT = 'momentA_currentUser';
const DISPLAY_USERNAME = 'abc123';
const VALID_OTP = '111111'; // Demo OTP for testing

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
    openModal('enterRequiredModal', event);
}

function closeEnterModal() {
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
    openModal('logInModal', event);
}

function closeLogInModal() {
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
        pin: pin
    };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser({ displayName: DISPLAY_USERNAME, email: newUser.email, phone: newUser.phone });
    signupTempData = null;
    showSignUpStep(4);
}

function handleSignUpStep4OK() {
    closeModal('signUpModal');
    updateNavForAuth();
}

// Login: phone or email + 6-digit PIN
function doLogin(identifier, pin, modalId, successMessage) {
    if (!identifier || !pin) {
        alert('Please enter your phone/email and 6-digit PIN.');
        return;
    }
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        alert('Please enter a valid 6-digit PIN.');
        return;
    }

    const users = getUsers();
    const id = identifier.trim().toLowerCase();
    const user = users.find(u =>
        (u.email && u.email.toLowerCase() === id) || u.phone === identifier.trim()
    );

    if (!user || user.pin !== pin) {
        alert('Invalid credentials. Please try again.');
        return;
    }

    setCurrentUser({ displayName: DISPLAY_USERNAME, email: user.email, phone: user.phone });
    alert(successMessage);
    closeModal(modalId);
    updateNavForAuth();
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
        const identifier = document.getElementById('enter-identifier')?.value;
        const pin = document.getElementById('enter-pin')?.value;
        doLogin(identifier, pin, 'enterRequiredModal', 'Welcome back! You can now participate in this Moment-A.');
        form.reset();
    });
}

function initLogInForm() {
    const form = document.getElementById('logInForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier')?.value;
        const pin = document.getElementById('login-pin')?.value;
        doLogin(identifier, pin, 'logInModal', 'Welcome back to Moment-A!');
        form.reset();
    });
}

function updateNavForAuth() {
    const isLoggedIn = !!getCurrentUser();
    const guestEl = document.getElementById('nav-guest');
    const userEl = document.getElementById('nav-user');
    if (guestEl) guestEl.style.display = isLoggedIn ? 'none' : '';
    if (userEl) {
        userEl.style.display = isLoggedIn ? '' : 'none';
        const nameEl = userEl.querySelector('[data-username]');
        if (nameEl) nameEl.textContent = DISPLAY_USERNAME;
    }
}

function initModalCloseHandlers() {
    ['enterRequiredModal', 'signUpModal', 'logInModal'].forEach(id => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === this) {
                    if (id === 'signUpModal') closeSignUpModal();
                    else closeModal(id);
                }
            });
        }
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeSignUpModal();
            closeModal('enterRequiredModal');
            closeModal('logInModal');
        }
    });
}

window.openEnterModal = openEnterModal;
window.closeEnterModal = closeEnterModal;
window.switchToSignUpFromEnter = switchToSignUpFromEnter;
window.openSignUpModal = openSignUpModal;
window.closeSignUpModal = closeSignUpModal;
window.openLogInModal = openLogInModal;
window.closeLogInModal = closeLogInModal;
window.switchToSignUp = switchToSignUp;

document.addEventListener('DOMContentLoaded', function () {
    initSignUpForm();
    initEnterLoginForm();
    initLogInForm();
    initModalCloseHandlers();
    updateNavForAuth();
});
