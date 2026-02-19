/**
 * Moment-A Subscriptions - Tier selection, payment (demo), and profile opportunities display.
 * Solo aplica cuando el usuario está logueado (openEnterModal en auth.js redirige aquí).
 */

const STORAGE_KEY_SUBSCRIPTIONS = 'momentA_subscriptions';

const TIERS = {
    1: {
        name: 'Starter',
        opportunities: 4,
        price: 2.99,
        description: '4 oportunidades = 4 tickets para los Moment-A\'s de este influencer durante el mes de tu suscripción.',
    },
    2: {
        name: 'Creator',
        opportunities: 8,
        price: 4.99,
        description: 'Todo lo de Starter + acceso al feed con publicaciones solo para suscriptores.',
    },
    3: {
        name: 'Premium',
        opportunities: 20,
        price: 9.99,
        description: 'Todo lo de Creator + lives con premios sorpresa.',
    },
};

function getProfileId() {
    const body = document.body;
    if (body && body.dataset.profileId) return body.dataset.profileId;
    const path = (window.location.pathname || '').replace(/\.html$/, '').replace(/^\//, '');
    return path || 'default';
}

function getSubscriptions() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_SUBSCRIPTIONS);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
}

function getSubscription(profileId) {
    const all = getSubscriptions();
    return all[profileId] || null;
}

function setSubscription(profileId, data) {
    const all = getSubscriptions();
    const now = new Date();
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    all[profileId] = {
        tier: data.tier,
        opportunities: data.opportunities,
        price: data.price,
        endMonth: endMonth.toISOString().slice(0, 7),
    };
    localStorage.setItem(STORAGE_KEY_SUBSCRIPTIONS, JSON.stringify(all));
}

function openModal(id, event) {
    const modal = document.getElementById(id);
    if (!modal) return;
    const content = modal.querySelector('.modal-content');
    if (content && event) {
        const rect = event.target.getBoundingClientRect();
        content.style.transformOrigin = `${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`;
    } else if (content) {
        content.style.transformOrigin = 'center center';
    }
    modal.offsetHeight;
    requestAnimationFrame(() => modal.classList.add('active'));
    document.body.style.overflow = 'hidden';
}

function closeModalById(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openTierSelectionModal(event) {
    openModal('tierSelectionModal', event);
}

function closeTierSelectionModal() {
    closeModalById('tierSelectionModal');
}

function openPaymentModal(tierKey) {
    const tier = TIERS[tierKey];
    if (!tier) return;
    const oppEl = document.getElementById('payment-tier-opportunities');
    const priceEl = document.getElementById('payment-tier-price');
    const nameEl = document.getElementById('payment-tier-name');
    if (oppEl) oppEl.textContent = tier.opportunities;
    if (priceEl) priceEl.textContent = tier.price.toFixed(2);
    if (nameEl) nameEl.textContent = tier.name;
    document.getElementById('paymentForm').dataset.selectedTier = tierKey;
    closeTierSelectionModal();
    openModal('paymentModal', null);
}

function closePaymentModal() {
    closeModalById('paymentModal');
}

function showPaymentLoader() {
    document.getElementById('paymentLoaderOverlay')?.classList.add('active');
}

function hidePaymentLoader() {
    const loader = document.getElementById('paymentLoaderOverlay');
    if (loader) {
        loader.classList.remove('active');
    }
}

function showPaymentSuccess() {
    const form = document.getElementById('paymentForm');
    const tierKey = form?.dataset?.selectedTier;
    const tier = TIERS[tierKey];
    closeModalById('paymentModal');
    const success = document.getElementById('paymentSuccessOverlay');
    const msg = document.getElementById('paymentSuccessMessage');
    if (msg && tier) msg.textContent = `¡Éxito! Ya tienes ${tier.opportunities} oportunidades según tu suscripción ${tier.name}.`;
    if (success) success.classList.add('active');
    setTimeout(() => {
        if (success) success.classList.remove('active');
        if (!tier) return;
        const profileId = getProfileId();
        setSubscription(profileId, {
            tier: parseInt(tierKey, 10),
            opportunities: tier.opportunities,
            price: tier.price,
        });
        updateProfileOpportunitiesUI();
    }, 2500);
}

// Regla: badge de oportunidades y loader del banner solo se muestran si el usuario está logueado Y tiene suscripción activa en este perfil (no por crear cuenta, solo por suscribirse).
function updateProfileOpportunitiesUI() {
    const badgeContainer = document.getElementById('profile-opportunities-badge');
    const bannerLoader = document.getElementById('profile-banner-loader');

    const isLoggedIn = typeof window.getCurrentUser === 'function' && !!window.getCurrentUser();
    const profileId = getProfileId();
    const sub = getSubscription(profileId);
    const isSubscribed = !!(sub && sub.opportunities);
    const showSubscribedUI = isLoggedIn && isSubscribed;

    if (badgeContainer) {
        if (showSubscribedUI) {
            badgeContainer.style.display = 'flex';
            const numEl = document.getElementById('profile-opportunities-count');
            if (numEl) numEl.textContent = sub.opportunities;
        } else {
            badgeContainer.style.display = 'none';
        }
    }

    if (bannerLoader) {
        bannerLoader.style.display = showSubscribedUI ? 'flex' : 'none';
    }
}

function initTierButtons() {
    [1, 2, 3].forEach((key) => {
        const btn = document.getElementById(`tier-btn-${key}`);
        if (btn) btn.addEventListener('click', () => openPaymentModal(key));
    });
}

function initPaymentForm() {
    const form = document.getElementById('paymentForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        showPaymentLoader();
        setTimeout(() => {
            hidePaymentLoader();
            showPaymentSuccess();
        }, 2000);
    });
}

function initSubscriptionModals() {
    const tierClose = document.getElementById('closeTierSelectionModal');
    if (tierClose) tierClose.addEventListener('click', closeTierSelectionModal);
    const paymentClose = document.getElementById('closePaymentModal');
    if (paymentClose) paymentClose.addEventListener('click', closePaymentModal);
    document.getElementById('tierSelectionModal')?.addEventListener('click', function (e) {
        if (e.target === this) closeTierSelectionModal();
    });
    document.getElementById('paymentModal')?.addEventListener('click', function (e) {
        if (e.target === this) closePaymentModal();
    });
}

window.openTierSelectionModal = openTierSelectionModal;
window.closeTierSelectionModal = closeTierSelectionModal;
window.updateProfileOpportunitiesUI = updateProfileOpportunitiesUI;

document.addEventListener('DOMContentLoaded', function () {
    initTierButtons();
    initPaymentForm();
    initSubscriptionModals();
    updateProfileOpportunitiesUI();
});
