/**
 * Moment-A unified "Enter Moment-A" flow.
 * Single entry: handleEnterMomentA(hostId, event)
 * Flow A: Not logged in → enterRequiredModal → after login chain to Flow B/C
 * Flow B: Logged in, no subscription → subscriptionModal (plan → payment → success)
 * Flow C: Logged in, subscribed → chancesModal (use chances / already in / buy more)
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'momentA_subscriptions';
    var HOST_NAMES = {
        carlifestyle: 'CarLifestyle',
        sneakerhead: 'SneakerHead',
        techguru: 'TechGuru',
        ireviewer: 'iReviewer',
        travelwithme: 'TravelWithMe'
    };
    var hostData = {
        carlifestyle: {
            name: 'CarLifestyle',
            displayName: '@CarLifestyle',
            prize: 'Win a Toyota RAV4 2024',
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400'
        },
        sneakerhead: {
            name: 'SneakerHead',
            displayName: '@SneakerHead',
            prize: 'Win Nike Air Jordan 1 Retro',
            image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'
        },
        techguru: {
            name: 'TechGuru',
            displayName: '@TechGuru',
            prize: 'Win an iPhone 15 Pro',
            image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400'
        },
        ireviewer: {
            name: 'iReviewer',
            displayName: '@iReviewer',
            prize: 'Win an iPhone 15 Pro Max',
            image: 'https://images.unsplash.com/photo-1696446702183-cbd227bed6db?w=400'
        },
        travelwithme: {
            name: 'TravelWithMe',
            displayName: '@TravelWithMe',
            prize: 'Win a Trip to Cancún',
            image: 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=400'
        }
    };
    var PLANS = {
        starter: { name: 'Starter', chances: 3, price: 2.99 },
        popular: { name: 'Popular', chances: 7, price: 5.99 },
        premium: { name: 'Premium', chances: 15, price: 10.99 }
    };

    var PRICE_PER_OPPORTUNITY = 0.99;
    var selectedPlanKey = null;
    var selectedExtraCount = null;
    var transactionId = null;
    var currentHostId = null;

    function getCurrentUser() {
        try {
            var raw = localStorage.getItem('momentA_currentUser');
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

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

    function getHostName(hostId) {
        if (!hostId) return 'Host';
        var id = (hostId + '').toLowerCase();
        return HOST_NAMES[id] || (id.charAt(0).toUpperCase() + id.slice(1));
    }

    function normalizeSub(s) {
        var h = s.hostId || s.hostProfile;
        var total = s.totalChances != null ? s.totalChances : (s.chances || 0);
        var remaining = s.remainingChances != null ? s.remainingChances : total;
        var used = s.usedChances != null ? s.usedChances : 0;
        return { hostId: h, totalChances: total, remainingChances: remaining, usedChances: used, plan: s.plan, price: s.price, transactionId: s.transactionId, timestamp: s.timestamp };
    }

    function getSubscriptionForHost(hostId) {
        if (!hostId) return null;
        var list = getSubscriptions();
        var id = (hostId + '').toLowerCase();
        for (var i = 0; i < list.length; i++) {
            var h = (list[i].hostId || list[i].hostProfile || '').toLowerCase();
            if (h === id) return normalizeSub(list[i]);
        }
        return null;
    }

    function hasSubscriptionForHost(hostId) {
        return !!getSubscriptionForHost(hostId);
    }

    function openModal(modalId, event) {
        if (typeof window.openModal === 'function') {
            window.openModal(modalId, event);
            return;
        }
        var modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        if (typeof window.closeModal === 'function') {
            window.closeModal(modalId);
            return;
        }
        var modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    // ---------- Subscription modal (inject once) ----------
    function getHostData(hostId) {
        var id = (hostId + '').toLowerCase();
        return hostData[id] || { name: id, displayName: '@' + id, prize: 'Win this Moment-A', image: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400' };
    }

    function getSubscriptionModalHTML(hostId) {
        var host = getHostData(hostId);
        var imgUrl = host.image || '';
        var prizeTitle = host.prize || 'Win this Moment-A';
        var displayName = host.displayName || '@Host';
        return '<div class="modal-content flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl max-w-sm md:max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">' +
            '<div id="subscription-prize-panel" class="relative w-full md:w-[40%] min-h-[150px] md:min-h-[320px] flex-shrink-0 rounded-t-2xl md:rounded-l-2xl overflow-hidden">' +
            '<img id="subscription-prize-image" src="' + imgUrl + '" alt="" class="absolute inset-0 w-full h-full object-cover" />' +
            '<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>' +
            '<div class="absolute bottom-0 left-0 right-0 p-4 text-white">' +
            '<p id="subscription-prize-title" class="text-lg font-bold">' + prizeTitle + '</p>' +
            '<p id="subscription-prize-host" class="text-white/80 text-sm mt-0.5">' + displayName + '</p>' +
            '<span class="inline-block mt-2 text-xs font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">Upcoming</span>' +
            '</div></div>' +
            '<div id="subscription-right-panel" class="flex-1 relative overflow-hidden min-h-0 flex flex-col">' +
            '<div id="subscription-close-wrap" class="flex justify-end p-6 pb-0 flex-shrink-0">' +
            '<button type="button" id="subscription-close-btn" class="text-gray-400 hover:text-gray-600 transition-colors -mt-1 -mr-1"><span class="material-symbols-outlined text-2xl">close</span></button>' +
            '</div>' +
            '<div id="subscription-step1" class="p-6 pt-2 overflow-y-auto flex-1 min-h-0">' +
            '<h2 class="text-lg font-bold text-gray-900 mb-1">Choose Your Plan</h2>' +
            '<p id="subscription-subtitle" class="text-sm text-gray-500 mb-4">Select your chances in ' + displayName.replace(/</g, '&lt;') + '\'s Moment-A</p>' +
            '<div class="space-y-2">' +
            '<div class="subscription-plan-card rounded-lg border border-gray-200 bg-white hover:border-primary hover:bg-primary/5 transition cursor-pointer p-4" data-subscription-plan="starter">' +
            '<div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2 flex-shrink-0"><span class="material-symbols-outlined text-primary text-xl">confirmation_number</span><span class="font-semibold text-gray-900 text-sm whitespace-nowrap">Starter</span></div><span class="text-sm font-semibold text-primary flex-shrink-0">3 Chances</span><div class="flex items-center gap-1 flex-shrink-0"><span class="text-lg font-bold text-gray-900">$2.99</span><span class="material-symbols-outlined text-gray-400 text-lg">chevron_right</span></div></div>' +
            '<p class="mt-1 text-xs text-gray-500">Perfect for trying your luck</p>' +
            '<div class="mt-1 flex flex-wrap gap-x-3 gap-y-1"><span class="flex items-center gap-1 text-xs text-gray-600"><span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>3 entries in the draw</span><span class="flex items-center gap-1 text-xs text-gray-600"><span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>Basic participant badge</span></div></div>' +
            '<div class="subscription-plan-card rounded-lg border-2 border-primary bg-primary/5 cursor-pointer p-4" data-subscription-plan="popular">' +
            '<div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2 flex-shrink-0"><span class="material-symbols-outlined text-primary text-xl">confirmation_number</span><span class="font-semibold text-gray-900 text-sm whitespace-nowrap">Popular</span><span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full whitespace-nowrap">BEST VALUE</span></div><span class="text-sm font-semibold text-primary flex-shrink-0">7 Chances</span><div class="flex items-center gap-1 flex-shrink-0"><span class="text-lg font-bold text-gray-900">$5.99</span><span class="material-symbols-outlined text-gray-500 text-lg">chevron_right</span></div></div>' +
            '<p class="mt-1 text-xs text-gray-500">Best value for regular players</p>' +
            '<div class="mt-1 flex flex-wrap gap-x-3 gap-y-1"><span class="flex items-center gap-1 text-xs text-gray-600"><span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>7 entries in the draw</span><span class="flex items-center gap-1 text-xs text-gray-600"><span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>Priority badge</span><span class="flex items-center gap-1 text-xs text-gray-600"><span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>Chat access</span></div></div>' +
            '<div class="subscription-plan-card rounded-lg border border-gray-200 bg-white hover:border-primary hover:bg-primary/5 transition cursor-pointer p-4" data-subscription-plan="premium">' +
            '<div class="flex items-center justify-between gap-3"><div class="flex items-center gap-2 flex-shrink-0"><span class="material-symbols-outlined text-primary text-xl">confirmation_number</span><span class="font-semibold text-gray-900 text-sm whitespace-nowrap">Premium</span></div><span class="text-sm font-semibold text-primary flex-shrink-0">15 Chances</span><div class="flex items-center gap-1 flex-shrink-0"><span class="text-lg font-bold text-gray-900">$10.99</span><span class="material-symbols-outlined text-gray-400 text-lg">chevron_right</span></div></div>' +
            '<p class="mt-1 text-xs text-gray-500">Maximum chances to win</p>' +
            '<div class="mt-1 flex flex-wrap gap-x-3 gap-y-1"><span class="flex items-center gap-1 text-xs text-gray-600"><span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>15 entries in the draw</span><span class="flex items-center gap-1 text-xs text-gray-600"><span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>VIP badge</span><span class="flex items-center gap-1 text-xs text-gray-600"><span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>Chat access</span><span class="flex items-center gap-1 text-xs text-gray-600"><span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>Early access to next Moment-A</span></div></div>' +
            '</div>' +
            '<p class="text-xs text-gray-400 mt-3">All plans include verified participation and instant entry</p></div>' +
            '<div id="subscription-step2" style="display:none" class="p-6 pt-2 overflow-y-auto flex-1 min-h-0">' +
            '<button type="button" id="subscription-back-to-plans" class="text-primary hover:underline text-sm mb-3 flex items-center gap-1"><span class="material-symbols-outlined text-base">arrow_back</span> Back to plans</button>' +
            '<h2 class="text-lg font-bold text-gray-900 mb-2">Payment Details</h2>' +
            '<p id="subscription-selected-summary" class="bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 text-sm font-medium text-gray-800 mb-4"></p>' +
            '<div class="rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 p-4 text-white mb-4">' +
            '<p class="text-xs text-white/70 mb-0.5">Card number</p><p class="font-mono text-base tracking-wider">4532 •••• •••• 7891</p>' +
            '<p class="text-xs text-white/70 mt-3 mb-0.5">Cardholder</p><p class="font-medium text-sm">Carlos A. Demo</p>' +
            '<p class="text-xs text-white/70 mt-1">Expires 09/28</p></div>' +
            '<div class="space-y-3 mb-3">' +
            '<div><label class="block text-xs font-medium text-gray-700 mb-1">Cardholder Name</label>' +
            '<input type="text" value="Carlos A. Demo" class="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-primary" /></div>' +
            '<div><label class="block text-xs font-medium text-gray-700 mb-1">Card Number</label>' +
            '<input type="text" value="4532 •••• •••• 7891" class="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-primary" /></div>' +
            '<div class="grid grid-cols-2 gap-3"><div><label class="block text-xs font-medium text-gray-700 mb-1">Expiry</label>' +
            '<input type="text" value="09/28" class="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-primary" /></div>' +
            '<div><label class="block text-xs font-medium text-gray-700 mb-1">CVV</label>' +
            '<input type="text" value="•••" class="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-primary" /></div></div>' +
            '<div><label class="block text-xs font-medium text-gray-700 mb-1">Billing Country</label>' +
            '<select class="w-full px-3 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm focus:ring-2 focus:ring-primary focus:border-primary"><option value="Peru" selected>Peru</option><option value="United States">United States</option><option value="Mexico">Mexico</option></select></div></div>' +
            '<p class="text-xs text-gray-400 mb-3 flex items-center gap-1"><span class="material-symbols-outlined text-xs">lock</span> SSL Encrypted &nbsp; Visa &nbsp; Mastercard</p>' +
            '<button type="button" id="subscription-pay-btn" class="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 transition text-sm">Pay $5.99 USD →</button></div>' +
            '<div id="subscription-step3" style="display:none" class="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-r-2xl">' +
            '<div class="w-12 h-12 loader-spin flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-purple-600 mb-4">' +
            '<span class="material-symbols-outlined text-white text-3xl">all_inclusive</span></div>' +
            '<p class="text-gray-500 text-sm animate-pulse">Processing payment...</p></div>' +
            '<div id="subscription-step4" style="display:none" class="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-r-2xl pointer-events-none">' +
            '<span class="material-symbols-outlined text-green-500 text-4xl">check_circle</span>' +
            '<h2 class="text-xl font-bold text-gray-900 mt-3">Subscription Successful!</h2>' +
            '<p class="text-gray-600 text-sm mt-2">You now have <strong id="subscription-success-chances">7</strong> opportunities in this Moment-A!</p>' +
            '<p id="subscription-success-txn" class="text-xs text-gray-400 font-mono mt-3">TXN-2026-XXXX</p></div>' +
            '<div id="subscription-step5" style="display:none" class="p-6 pt-2 overflow-y-auto flex-1 min-h-0">' +
            '<h2 class="text-lg font-bold text-gray-900 mb-1">Get More Opportunities</h2>' +
            '<p id="subscription-step5-subtitle" class="text-sm text-gray-500 mb-4">You currently have <strong id="step5-current-count">7</strong> opportunities</p>' +
            '<div class="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5">' +
            '<label class="block text-sm font-medium text-gray-700 mb-2">How many opportunities do you want to add?</label>' +
            '<input type="number" id="step5-input" min="1" value="1" placeholder="Enter quantity" class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-900 text-2xl font-bold text-center focus:ring-2 focus:ring-primary focus:border-primary transition" />' +
            '</div>' +
            '<div class="bg-gray-50 rounded-xl p-4 mb-5">' +
            '<div class="flex justify-between items-center mb-2"><span class="text-sm text-gray-600">Price per opportunity</span><span class="text-sm font-medium text-gray-900">$' + PRICE_PER_OPPORTUNITY.toFixed(2) + '</span></div>' +
            '<div class="flex justify-between items-center mb-2"><span class="text-sm text-gray-600">Quantity</span><span id="step5-qty-summary" class="text-sm font-medium text-gray-900">× 1</span></div>' +
            '<div class="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center"><span class="text-sm font-bold text-gray-900">Total</span><span id="step5-total" class="text-lg font-bold text-primary">$' + PRICE_PER_OPPORTUNITY.toFixed(2) + '</span></div>' +
            '</div>' +
            '<button type="button" id="step5-pay-btn" class="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 transition text-sm">Pay $' + PRICE_PER_OPPORTUNITY.toFixed(2) + ' USD →</button>' +
            '</div>' +
            '</div></div>';
    }

    function updateSubscriptionModalHost(hostId) {
        var host = getHostData(hostId);
        var img = document.getElementById('subscription-prize-image');
        var title = document.getElementById('subscription-prize-title');
        var hostEl = document.getElementById('subscription-prize-host');
        var sub = document.getElementById('subscription-subtitle');
        if (img && host.image) img.src = host.image;
        if (img) img.alt = host.prize || '';
        if (title) title.textContent = host.prize || 'Win this Moment-A';
        if (hostEl) hostEl.textContent = host.displayName || '@Host';
        if (sub) sub.textContent = 'Select your chances in ' + (host.displayName || '@Host') + '\'s Moment-A';
    }

    function ensureSubscriptionModal() {
        var existing = document.getElementById('subscriptionModal');
        if (existing) {
            if (currentHostId) updateSubscriptionModalHost(currentHostId);
            return;
        }
        var hostId = currentHostId || 'carlifestyle';
        var wrap = document.createElement('div');
        wrap.id = 'subscriptionModal';
        wrap.className = 'modal-overlay';
        wrap.innerHTML = getSubscriptionModalHTML(hostId);
        document.body.appendChild(wrap);
        bindSubscriptionModal();
    }

    function showSubscriptionStep(step) {
        for (var i = 1; i <= 5; i++) {
            var el = document.getElementById('subscription-step' + i);
            if (el) el.style.display = i === step ? (i === 3 || i === 4 ? 'flex' : 'block') : 'none';
        }
        var closeWrap = document.getElementById('subscription-close-wrap');
        if (closeWrap) closeWrap.style.display = (step === 3) ? 'none' : 'flex';
    }

    function openSubscriptionModal(hostId, event) {
        currentHostId = hostId;
        ensureSubscriptionModal();
        updateSubscriptionModalHost(hostId);
        selectedPlanKey = null;
        selectedExtraCount = null;
        transactionId = null;

        var existingSub = getSubscriptionForHost(hostId);
        if (existingSub) {
            showSubscriptionStep(5);
            initBuyMoreCalculator(hostId, existingSub);
        } else {
            showSubscriptionStep(1);
        }
        openModal('subscriptionModal', event);
    }

    function closeSubscriptionModal() {
        closeModal('subscriptionModal');
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
        var plan = PLANS[selectedPlanKey];
        var hostId = currentHostId;
        setTimeout(function () {
            showSubscriptionStep(4);
            var chancesEl = document.getElementById('subscription-success-chances');
            if (chancesEl && plan) chancesEl.textContent = plan.chances;
            var txnEl = document.getElementById('subscription-success-txn');
            if (txnEl) txnEl.textContent = transactionId;
            setTimeout(function () {
                if (hostId && plan) {
                    var list = getSubscriptions();
                    var existing = null;
                    for (var j = 0; j < list.length; j++) {
                        if ((list[j].hostId || list[j].hostProfile || '').toLowerCase() === (hostId + '').toLowerCase()) {
                            existing = list[j];
                            break;
                        }
                    }
                    var totalChances = plan.chances;
                    var remainingChances = plan.chances;
                    var usedChances = 0;
                    if (existing) {
                        totalChances = (existing.totalChances || existing.chances || 0) + plan.chances;
                        remainingChances = (existing.remainingChances != null ? existing.remainingChances : (existing.chances || 0)) + plan.chances;
                        usedChances = existing.usedChances != null ? existing.usedChances : 0;
                    }
                    var rec = {
                        hostId: (hostId + '').toLowerCase(),
                        plan: selectedPlanKey,
                        totalChances: totalChances,
                        remainingChances: remainingChances,
                        usedChances: usedChances,
                        price: plan.price,
                        transactionId: transactionId,
                        timestamp: Date.now()
                    };
                    if (existing) {
                        for (var k = 0; k < list.length; k++) {
                            if ((list[k].hostId || list[k].hostProfile || '').toLowerCase() === (hostId + '').toLowerCase()) {
                                list[k] = rec;
                                break;
                            }
                        }
                    } else {
                        list.push(rec);
                    }
                    saveSubscriptions(list);
                }
                closeSubscriptionModal();
                updateEnterButton(hostId);
                renderEntriesSectionIfPresent(hostId);
            }, 1500);
        }, 2000);
    }

    function bindSubscriptionModal() {
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
    }

    // ---------- Buy more calculator (step 5) ----------
    function initBuyMoreCalculator(hostId, existingSub) {
        var currentEl = document.getElementById('step5-current-count');
        if (currentEl) currentEl.textContent = existingSub.totalChances || 0;

        var input = document.getElementById('step5-input');
        var qtySummary = document.getElementById('step5-qty-summary');
        var totalEl = document.getElementById('step5-total');
        var payBtn = document.getElementById('step5-pay-btn');

        function getQty() {
            var v = parseInt(input ? input.value : '1', 10);
            return (v > 0) ? v : 1;
        }

        function updateCalc() {
            var qty = getQty();
            if (qtySummary) qtySummary.textContent = '× ' + qty;
            var total = (qty * PRICE_PER_OPPORTUNITY).toFixed(2);
            if (totalEl) totalEl.textContent = '$' + total;
            if (payBtn) payBtn.textContent = 'Pay $' + total + ' USD →';
        }

        if (input) input.oninput = updateCalc;

        if (payBtn) {
            payBtn.onclick = function () {
                selectedExtraCount = getQty();
                transactionId = 'TXN-2026-' + Math.floor(1000 + Math.random() * 9000);
                showSubscriptionStep(3);
                setTimeout(function () {
                    showSubscriptionStep(4);
                    var chancesEl = document.getElementById('subscription-success-chances');
                    if (chancesEl) chancesEl.textContent = (existingSub.totalChances || 0) + selectedExtraCount;
                    var txnEl = document.getElementById('subscription-success-txn');
                    if (txnEl) txnEl.textContent = transactionId;
                    setTimeout(function () {
                        var list = getSubscriptions();
                        var id = (hostId + '').toLowerCase();
                        for (var i = 0; i < list.length; i++) {
                            if ((list[i].hostId || list[i].hostProfile || '').toLowerCase() === id) {
                                if (list[i].totalChances == null) list[i].totalChances = list[i].chances || 0;
                                list[i].totalChances += selectedExtraCount;
                                if (list[i].remainingChances == null) list[i].remainingChances = 0;
                                list[i].remainingChances += selectedExtraCount;
                                list[i].transactionId = transactionId;
                                list[i].timestamp = Date.now();
                                saveSubscriptions(list);
                                break;
                            }
                        }
                        closeSubscriptionModal();
                        updateEnterButton(hostId);
                    }, 1500);
                }, 2000);
            };
        }
        updateCalc();
    }

    // ---------- Chances modal (inject once) ----------
    function ensureChancesModal() {
        if (document.getElementById('chancesModal')) return;
        var wrap = document.createElement('div');
        wrap.id = 'chancesModal';
        wrap.className = 'modal-overlay';
        wrap.innerHTML = '<div id="chances-modal-content" class="modal-content bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] min-h-[70vh] overflow-y-auto p-8 flex flex-col"></div>';
        document.body.appendChild(wrap);
        var modal = document.getElementById('chancesModal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeModal('chancesModal');
            });
        }
    }

    function renderChancesModal(hostId) {
        currentHostId = hostId;
        ensureChancesModal();
        var sub = getSubscriptionForHost(hostId);
        var hostName = getHostName(hostId);
        var container = document.getElementById('chances-modal-content');
        if (!container) return;

        if (sub.remainingChances > 0) {
            // C1: Has remaining opportunities — dropdown to choose how many to use
            var used = sub.usedChances || 0;
            var total = sub.totalChances || 0;
            var remaining = sub.remainingChances;
            var planName = (PLANS[sub.plan] && PLANS[sub.plan].name) ? PLANS[sub.plan].name : (sub.plan || 'Plan');
            var optionsHtml = '';
            for (var n = 1; n <= remaining; n++) {
                optionsHtml += '<option value="' + n + '">' + n + (n === 1 ? ' opportunity' : ' opportunities') + (n === remaining && remaining > 1 ? ' (all)' : '') + '</option>';
            }
            container.innerHTML = '<div id="chances-close-wrap" class="flex justify-end mb-4">' +
                '<button type="button" id="chances-close-btn" class="text-gray-400 hover:text-gray-600 transition-colors"><span class="material-symbols-outlined text-3xl">close</span></button></div>' +
                '<h2 class="text-2xl font-bold text-gray-900 mb-2">Enter @' + hostName + '\'s Moment-A</h2>' +
                '<div class="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">' +
                '<p class="text-gray-800 font-semibold">You have <span class="text-primary text-2xl font-bold">' + remaining + '</span> opportunities</p>' +
                '<p class="text-gray-500 text-sm mt-1">' + planName + ' Plan · ' + total + ' total · ' + used + ' used · ' + remaining + ' remaining</p>' +
                '<div class="flex gap-1 mt-2 flex-wrap">' + (function () {
                    var h = '';
                    for (var i = 0; i < total; i++) {
                        h += '<span class="material-symbols-outlined text-lg ' + (i < used ? 'text-green-500' : 'text-primary') + '">confirmation_number</span>';
                    }
                    return h;
                })() + '</div></div>' +
                '<label class="block text-sm font-medium text-gray-700 mb-2">How many opportunities do you want to use?</label>' +
                '<select id="chances-dropdown" class="w-full mb-6 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-900 font-medium focus:ring-2 focus:ring-primary focus:border-primary transition">' + optionsHtml + '</select>' +
                '<button type="button" id="chances-enter-btn" class="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 transition mb-4">Enter with 1 opportunity</button>' +
                '<p class="text-center text-sm text-gray-500 mb-1">Want to increase your odds?</p>' +
                '<button type="button" id="chances-buy-more" class="w-full text-primary hover:underline text-sm font-medium">Get more opportunities</button>';
            var dropdown = document.getElementById('chances-dropdown');
            var enterBtn = document.getElementById('chances-enter-btn');
            if (dropdown && enterBtn) {
                function updateEnterBtnText() {
                    var val = parseInt(dropdown.value, 10) || 1;
                    enterBtn.dataset.use = val;
                    enterBtn.textContent = 'Enter with ' + val + (val === 1 ? ' opportunity' : ' opportunities');
                }
                dropdown.addEventListener('change', updateEnterBtnText);
                updateEnterBtnText();
            }
            if (enterBtn) {
                enterBtn.addEventListener('click', function () {
                    var use = parseInt(this.dataset.use, 10) || 1;
                    submitChances(hostId, use);
                });
            }
            var buyMoreBtn = document.getElementById('chances-buy-more');
            if (buyMoreBtn) {
                buyMoreBtn.addEventListener('click', function () {
                    closeModal('chancesModal');
                    openSubscriptionModal(hostId, null);
                });
            }
        } else {
            // C2: All opportunities used
            var totalUsed = sub.usedChances || sub.totalChances || 0;
            container.innerHTML = '<div id="chances-close-wrap" class="flex justify-end mb-4">' +
                '<button type="button" id="chances-close-btn" class="text-gray-400 hover:text-gray-600 transition-colors"><span class="material-symbols-outlined text-3xl">close</span></button></div>' +
                '<h2 class="text-2xl font-bold text-gray-900 mb-4">You\'re Already In!</h2>' +
                '<div class="flex items-center gap-2 text-green-600 mb-4"><span class="material-symbols-outlined text-3xl">check_circle</span>' +
                '<p>You\'ve used all ' + totalUsed + ' opportunities in @' + hostName + '\'s Moment-A</p></div>' +
                '<p class="text-gray-600 mb-4">You\'re entered with ' + totalUsed + ' opportunities. Sit back and wait for the Moment-A to go live!</p>' +
                '<p class="text-xs text-gray-400 mb-6">Moment-A starts: Mar 1, 2026 at 7:00 PM</p>' +
                '<button type="button" id="chances-buy-more-btn" class="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:opacity-90 transition mb-2">Get more opportunities</button>' +
                '<button type="button" id="chances-close-secondary" class="w-full py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition">Close</button>';
            document.getElementById('chances-buy-more-btn').addEventListener('click', function () {
                closeModal('chancesModal');
                openSubscriptionModal(hostId, null);
            });
            document.getElementById('chances-close-secondary').addEventListener('click', function () { closeModal('chancesModal'); });
        }

        var closeBtn = document.getElementById('chances-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', function () { closeModal('chancesModal'); });
    }

    function submitChances(hostId, useCount) {
        var container = document.getElementById('chances-modal-content');
        if (!container) return;
        container.innerHTML = '<div class="flex-1 flex flex-col items-center justify-center text-center">' +
            '<div class="w-16 h-16 mx-auto loader-spin flex items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-purple-500 to-purple-600">' +
            '<span class="material-symbols-outlined text-white text-4xl">all_inclusive</span></div>' +
            '<p class="mt-4 text-gray-500 text-sm loader-pulse">Entering Moment-A...</p></div>';
        setTimeout(function () {
            var list = getSubscriptions();
            var id = (hostId + '').toLowerCase();
            for (var i = 0; i < list.length; i++) {
                if ((list[i].hostId || list[i].hostProfile || '').toLowerCase() === id) {
                    var r = list[i].remainingChances != null ? list[i].remainingChances : (list[i].chances || 0);
                    var u = list[i].usedChances != null ? list[i].usedChances : 0;
                    if (list[i].totalChances == null) list[i].totalChances = list[i].chances || 0;
                    list[i].remainingChances = Math.max(0, r - useCount);
                    list[i].usedChances = u + useCount;
                    list[i].hostId = id;
                    saveSubscriptions(list);
                    break;
                }
            }
            var hostName = getHostName(hostId);
            var oppText = useCount === 1 ? '1 opportunity' : useCount + ' opportunities';
            container.innerHTML = '<div class="flex justify-end mb-2"><button type="button" id="chances-close-success" class="text-gray-400 hover:text-gray-600 transition-colors"><span class="material-symbols-outlined text-3xl">close</span></button></div>' +
                '<div class="flex-1 flex flex-col items-center justify-center text-center px-4">' +
                '<span class="material-symbols-outlined text-green-500 text-5xl">check_circle</span>' +
                '<h2 class="text-2xl font-bold text-gray-900 mt-4">Success!</h2>' +
                '<p class="text-gray-600 mt-2">' + oppText + ' entered in @' + hostName + '\'s Moment-A.</p>' +
                '<p class="text-gray-600 mt-4 font-medium">Wait until the day of the Moment-A to see if you win. Good luck!</p>' +
                '<p class="text-xs text-gray-400 mt-4">Moment-A starts: Mar 1, 2026 at 7:00 PM</p>' +
                '<div class="flex flex-col sm:flex-row gap-3 mt-6">' +
                '<button type="button" id="chances-success-more" class="px-6 py-2.5 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition text-sm">Get more opportunities</button>' +
                '<button type="button" id="chances-close-success-btn" class="px-6 py-2.5 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition text-sm">Close</button></div></div>';
            var moreBtn = document.getElementById('chances-success-more');
            if (moreBtn) {
                moreBtn.addEventListener('click', function () {
                    closeModal('chancesModal');
                    openSubscriptionModal(hostId, null);
                    updateEnterButton(hostId);
                });
            }
            var closeSuccess = document.getElementById('chances-close-success');
            var closeSuccessBtn = document.getElementById('chances-close-success-btn');
            function closeAndUpdate() {
                closeModal('chancesModal');
                updateEnterButton(hostId);
            }
            if (closeSuccess) closeSuccess.addEventListener('click', closeAndUpdate);
            if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeAndUpdate);
        }, 1500);
    }

    function openChancesModal(hostId, event) {
        currentHostId = hostId;
        renderChancesModal(hostId);
        openModal('chancesModal', event);
    }

    // ---------- Enter button & entries section (profile pages) ----------
    var BADGE_STYLE = 'flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg';
    var BADGE_ICON_HTML = '<div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0"><span class="material-symbols-outlined text-white text-xl">all_inclusive</span></div>';

    function getBannerChancesBadgeHTML(count) {
        return '<div class="' + BADGE_STYLE + '">' + BADGE_ICON_HTML +
            '<span class="text-white font-semibold text-sm whitespace-nowrap">' + count + ' opportunities</span></div>';
    }

    function updateEnterButton(hostId) {
        var section = document.getElementById('enter-moment-a-section');
        if (!section) return;
        var btn = section.querySelector('button[onclick*="handleEnterMomentA"], button[onclick*="openEnterModal"]');
        if (!btn) btn = section.querySelector('button');
        if (!btn) return;
        var sub = getSubscriptionForHost(hostId);

        // Banner badge: top-right — shows total opportunities owned (totalChances)
        var badgeContainer = document.getElementById('moment-a-banner-chances');
        if (badgeContainer) {
            if (sub) {
                var total = sub.totalChances || 0;
                var remaining = sub.remainingChances || 0;
                badgeContainer.innerHTML = getBannerChancesBadgeHTML(total);
                badgeContainer.style.display = '';
                badgeContainer.style.cursor = 'pointer';
                badgeContainer.onclick = remaining > 0
                    ? function () { handleEnterMomentA(hostId, null); }
                    : function () { openSubscriptionModal(hostId, null); };
            } else {
                badgeContainer.innerHTML = '';
                badgeContainer.style.display = 'none';
                badgeContainer.onclick = null;
            }
        }

        // When showing the badge, hide the "Your Moment-A Entries" grid section (redundant)
        var entriesSection = document.getElementById('moment-a-entries-section');
        if (entriesSection && sub && ((sub.remainingChances || 0) > 0 || (sub.usedChances || 0) > 0)) {
            entriesSection.style.display = 'none';
        }

        if (!sub) {
            btn.textContent = 'Enter Moment-A';
            btn.className = (btn.className || '').replace(/bg-green-500|text-green-600/g, '');
            if (btn.className.indexOf('bg-primary') === -1) btn.className = btn.className + ' bg-primary text-white rounded-full font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/30';
            return;
        }
        if ((sub.remainingChances || 0) > 0) {
            btn.innerHTML = '';
            btn.textContent = 'Enter Moment-A';
            btn.className = 'w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/30 text-lg cursor-pointer';
            btn.onclick = function (e) { handleEnterMomentA(hostId, e); };
        } else if ((sub.usedChances || 0) > 0) {
            btn.innerHTML = '';
            btn.textContent = 'Buy more opportunities';
            btn.className = 'w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/30 text-lg cursor-pointer';
            btn.onclick = function () { openSubscriptionModal(hostId, null); };
        }
    }

    function renderEntriesSectionIfPresent(hostId) {
        var sub = getSubscriptionForHost(hostId);
        if (!sub) return;
        var enterSection = document.getElementById('enter-moment-a-section');
        var entriesSection = document.getElementById('moment-a-entries-section');
        if (enterSection) enterSection.style.display = '';
        if (!entriesSection) return;
        // Do not show the entries grid — we show "X opportunities" in the banner badge instead
        entriesSection.style.display = 'none';
        var plan = PLANS[sub.plan] || { name: sub.plan, chances: sub.totalChances || 3 };
        var hostName = getHostName(hostId);
        var titleEl = entriesSection.querySelector('[data-entries-title]');
        if (titleEl) titleEl.textContent = 'Your Moment-A Entries';
        var badgeEl = entriesSection.querySelector('[data-entries-badge]');
        if (badgeEl) badgeEl.textContent = plan.name + ' Plan';
        var gridEl = entriesSection.querySelector('[data-entries-grid]');
        if (gridEl) {
            gridEl.innerHTML = '';
            var total = sub.totalChances || plan.chances;
            for (var i = 1; i <= total; i++) {
                var card = document.createElement('div');
                card.className = 'bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center hover:shadow-md transition hover:scale-105';
                var used = (sub.usedChances || 0) >= i;
                card.innerHTML = '<span class="material-symbols-outlined text-primary text-2xl block mb-2">confirmation_number</span><span class="font-bold text-gray-900 text-sm block">Entry #' + i + '</span><span class="text-' + (used ? 'green' : 'gray') + '-500 text-xs block mt-1">' + (used ? 'Entered ✓' : 'Active ✓') + '</span>';
                gridEl.appendChild(card);
            }
        }
        var infoEl = entriesSection.querySelector('[data-entries-info]');
        if (infoEl) infoEl.textContent = 'Your entries are confirmed for @' + hostName + '\'s Moment-A. Good luck!';
        var exploreBtn = entriesSection.querySelector('[data-entries-explore]');
        if (exploreBtn) exploreBtn.href = 'hosts.html';
    }

    // ---------- Main entry: handleEnterMomentA ----------
    function handleEnterMomentA(hostId, event) {
        if (!hostId) return;
        var user = getCurrentUser();
        if (!user || !user.dni) {
            window.__momentA_pendingHostId = hostId;
            if (typeof window.openEnterModal === 'function') {
                window.openEnterModal(event);
            } else {
                var m = document.getElementById('enterRequiredModal');
                if (m) { m.setAttribute('data-login-state', 'form'); openModal('enterRequiredModal', event); }
            }
            return;
        }
        if (!hasSubscriptionForHost(hostId)) {
            openSubscriptionModal(hostId, event);
            return;
        }
        openChancesModal(hostId, event);
    }

    window.handleEnterMomentA = handleEnterMomentA;
    window.openSubscriptionModal = openSubscriptionModal;
    window.closeSubscriptionModal = closeSubscriptionModal;
    window.updateEnterButton = updateEnterButton;
    window.renderEntriesSectionIfPresent = renderEntriesSectionIfPresent;

    function init() {
        var hostSlug = document.body && document.body.getAttribute('data-host-slug');
        if (hostSlug) {
            var hostId = hostSlug;
            if (getCurrentUser() && hasSubscriptionForHost(hostId)) {
                updateEnterButton(hostId);
                renderEntriesSectionIfPresent(hostId);
            }
        }
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;
            var sub = document.getElementById('subscriptionModal');
            var ch = document.getElementById('chancesModal');
            if (sub && sub.classList.contains('active')) closeSubscriptionModal();
            else if (ch && ch.classList.contains('active')) closeModal('chancesModal');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
