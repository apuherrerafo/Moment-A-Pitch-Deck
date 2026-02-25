/**
 * Subscription modal flow for "Enter Moment-A" (logged-in users).
 * Steps: 1=Choose Plan, 2=Payment, 3=Processing, 4=Success → close and show entries on page.
 */
(function () {
    var STORAGE_KEY = 'momentA_subscriptions';
    var PLANS = {
        starter: { name: 'Starter', chances: 3, price: 2.99 },
        popular: { name: 'Popular', chances: 7, price: 5.99 },
        premium: { name: 'Premium', chances: 15, price: 10.99 }
    };
    var selectedPlanKey = null;
    var transactionId = null;

    function getSubscriptions() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) { return []; }
    }

    function saveSubscriptions(arr) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
        } catch (e) {}
    }

    function getHostSlug() {
        var body = document.body;
        return (body && body.getAttribute('data-host-slug')) || '';
    }

    function getHostName() {
        var body = document.body;
        return (body && body.getAttribute('data-host-name')) || 'Host';
    }

    function hasSubscriptionForHost(hostSlug) {
        if (!hostSlug) return false;
        var list = getSubscriptions();
        return list.some(function (s) { return (s.hostProfile || '').toLowerCase() === hostSlug.toLowerCase(); });
    }

    function getSubscriptionForHost(hostSlug) {
        var list = getSubscriptions();
        for (var i = 0; i < list.length; i++) {
            if ((list[i].hostProfile || '').toLowerCase() === hostSlug.toLowerCase()) return list[i];
        }
        return null;
    }

    function showSubscriptionStep(step) {
        for (var i = 1; i <= 4; i++) {
            var el = document.getElementById('subscription-step' + i);
            if (el) el.style.display = i === step ? 'block' : 'none';
        }
        var closeWrap = document.getElementById('subscription-close-wrap');
        if (closeWrap) closeWrap.style.display = (step === 3) ? 'none' : '';
    }

    function openSubscriptionModal(event) {
        var hostSlug = getHostSlug();
        if (hasSubscriptionForHost(hostSlug)) {
            renderEntriesSection(hostSlug);
            return;
        }
        selectedPlanKey = null;
        transactionId = null;
        var modal = document.getElementById('subscriptionModal');
        if (!modal) return;
        showSubscriptionStep(1);
        if (typeof openModal === 'function') {
            openModal('subscriptionModal', event);
        } else {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeSubscriptionModal() {
        var modal = document.getElementById('subscriptionModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    function selectPlan(planKey) {
        selectedPlanKey = planKey;
        var plan = PLANS[planKey];
        if (!plan) return;
        var summaryEl = document.getElementById('subscription-selected-summary');
        if (summaryEl) summaryEl.textContent = plan.name + ' Plan — ' + plan.chances + ' Chances — $' + plan.price.toFixed(2) + ' USD';
        var payBtnEl = document.getElementById('subscription-pay-btn');
        if (payBtnEl) payBtnEl.textContent = 'Pay $' + plan.price.toFixed(2) + ' USD →';
        showSubscriptionStep(2);
    }

    function backToPlans() {
        showSubscriptionStep(1);
    }

    function submitPayment() {
        showSubscriptionStep(3);
        transactionId = 'TXN-2026-' + Math.floor(1000 + Math.random() * 9000);
        setTimeout(function () {
            showSubscriptionStep(4);
            var plan = PLANS[selectedPlanKey];
            var chancesEl = document.getElementById('subscription-success-chances');
            if (chancesEl && plan) chancesEl.textContent = plan.chances;
            var txnEl = document.getElementById('subscription-success-txn');
            if (txnEl) txnEl.textContent = transactionId;
            setTimeout(function () {
                var hostSlug = getHostSlug();
                var plan = PLANS[selectedPlanKey];
                if (hostSlug && plan) {
                    var list = getSubscriptions();
                    list.push({
                        hostProfile: hostSlug,
                        plan: selectedPlanKey,
                        chances: plan.chances,
                        price: plan.price,
                        transactionId: transactionId,
                        timestamp: Date.now()
                    });
                    saveSubscriptions(list);
                }
                closeSubscriptionModal();
                renderEntriesSection(hostSlug);
            }, 1500);
        }, 2000);
    }

    function renderEntriesSection(hostSlug) {
        var sub = getSubscriptionForHost(hostSlug);
        if (!sub) return;
        var enterSection = document.getElementById('enter-moment-a-section');
        var entriesSection = document.getElementById('moment-a-entries-section');
        if (enterSection) enterSection.style.display = 'none';
        if (!entriesSection) return;
        entriesSection.style.display = 'block';
        var plan = PLANS[sub.plan] || { name: sub.plan, chances: sub.chances || 3 };
        var hostName = getHostName();
        var titleEl = entriesSection.querySelector('[data-entries-title]');
        if (titleEl) titleEl.textContent = 'Your Moment-A Entries';
        var badgeEl = entriesSection.querySelector('[data-entries-badge]');
        if (badgeEl) badgeEl.textContent = plan.name + ' Plan';
        var gridEl = entriesSection.querySelector('[data-entries-grid]');
        if (gridEl) {
            gridEl.innerHTML = '';
            for (var i = 1; i <= plan.chances; i++) {
                var card = document.createElement('div');
                card.className = 'bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center hover:shadow-md transition hover:scale-105';
                card.innerHTML = '<span class="material-symbols-outlined text-primary text-2xl block mb-2">confirmation_number</span><span class="font-bold text-gray-900 text-sm block">Entry #' + i + '</span><span class="text-green-500 text-xs block mt-1">Active ✓</span>';
                gridEl.appendChild(card);
            }
        }
        var infoEl = entriesSection.querySelector('[data-entries-info]');
        if (infoEl) infoEl.textContent = "Your entries are confirmed for @" + hostName + "'s Moment-A. Good luck!";
        var exploreBtn = entriesSection.querySelector('[data-entries-explore]');
        if (exploreBtn) exploreBtn.href = 'hosts.html';
    }

    function initSubscriptionModal() {
        document.querySelectorAll('[data-subscription-plan]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                selectPlan(btn.getAttribute('data-subscription-plan'));
            });
        });
        var backBtn = document.getElementById('subscription-back-to-plans');
        if (backBtn) backBtn.addEventListener('click', backToPlans);
        var payBtn = document.getElementById('subscription-pay-btn');
        if (payBtn) payBtn.addEventListener('click', submitPayment);
        var closeBtn = document.getElementById('subscription-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', closeSubscriptionModal);
        var modal = document.getElementById('subscriptionModal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeSubscriptionModal();
            });
        }
        var hostSlug = getHostSlug();
        if (hostSlug && hasSubscriptionForHost(hostSlug)) {
            renderEntriesSection(hostSlug);
        }
    }

    window.openSubscriptionModal = openSubscriptionModal;
    window.closeSubscriptionModal = closeSubscriptionModal;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSubscriptionModal);
    } else {
        initSubscriptionModal();
    }
})();
