/**
 * APP.JS - Main Application Controller
 * Handles Navigation, State, Mode 1 (Juara 1-3 Tournament), Mode 2 (Bulk Randomizer), Modals & Toasts
 */

(function () {
  'use strict';

  // --- STATE ---
  let participants = [
    "Andi Pratama",
    "Budi Santoso",
    "Citra Lestari",
    "Dewi Anggraini",
    "Eko Kurniawan",
    "Fani Rahmawati",
    "Gilang Ramadhan",
    "Hana Novita"
  ];

  // Tournament Stages: Juara 3 -> Juara 2 -> Juara 1 (Standard giveaway sequence)
  const stages = [
    {
      id: 3,
      label: "JUARA 3",
      rankTitle: "Juara 3 (Perunggu)",
      banner: "Mencari JUARA 3",
      desc: "Putar roda untuk menentukan pemenang Juara 3 (🥉 Perunggu)",
      badgeClass: "bg-amber-800 text-amber-100"
    },
    {
      id: 2,
      label: "JUARA 2",
      rankTitle: "Juara 2 (Perak)",
      banner: "Mencari JUARA 2",
      desc: "Putar roda untuk menentukan pemenang Juara 2 (🥈 Perak)",
      badgeClass: "bg-slate-400 text-slate-900"
    },
    {
      id: 1,
      label: "JUARA 1",
      rankTitle: "JUARA 1 (GRAND PRIZE)",
      banner: "Mencari JUARA 1 (UTAMA)",
      desc: "Putaran Puncak untuk Juara Utama 1 (🥇 Emas)!",
      badgeClass: "bg-amber-400 text-amber-950 font-black"
    }
  ];

  let currentStageIndex = 0;
  let winners = { 1: null, 2: null, 3: null };
  let tempPendingWinner = null;
  let bulkResults = [];

  // --- DOM ELEMENTS ---
  const el = {
    // Views
    viewHome: document.getElementById('view-home'),
    viewWinners: document.getElementById('view-mode-winners'),
    viewBulk: document.getElementById('view-mode-bulk'),

    // Home
    homeInput: document.getElementById('home-names-input'),
    homeCountBadge: document.getElementById('home-count-badge'),

    // Mode 1: Tournament
    targetBannerText: document.getElementById('target-stage-text'),
    targetBannerDesc: document.getElementById('target-stage-desc'),
    btnSpinAction: document.getElementById('btn-spin-action'),
    btnSpinLabel: document.getElementById('btn-spin-label'),
    btnSpinCenter: document.getElementById('btn-spin-center'),
    podiumStatus: document.getElementById('podium-status-badge'),
    winner1: document.getElementById('winner-name-1'),
    winner2: document.getElementById('winner-name-2'),
    winner3: document.getElementById('winner-name-3'),

    // Mode 2: Bulk
    btnSpinBulk: document.getElementById('btn-spin-bulk'),
    bulkTickerWrap: document.getElementById('slot-ticker-container'),
    bulkTickerName: document.getElementById('slot-ticker-name'),
    bulkResultsCard: document.getElementById('bulk-results-card'),
    bulkList: document.getElementById('bulk-result-list'),
    bulkTimestamp: document.getElementById('bulk-timestamp'),

    // Modals
    modalWinner: document.getElementById('modal-winner'),
    modalWinnerBadge: document.getElementById('modal-winner-stage-badge'),
    modalWinnerName: document.getElementById('modal-winner-name'),
    modalWinnerIcon: document.getElementById('modal-winner-icon-wrap'),
    modalEdit: document.getElementById('modal-edit-names'),
    modalEditInput: document.getElementById('modal-names-input'),

    // Audio & Toast
    iconSound: document.getElementById('icon-sound'),
    toast: document.getElementById('toast'),
    toastText: document.getElementById('toast-text')
  };

  // --- INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', () => {
    // Init Wheel
    const canvas = document.getElementById('wheel-canvas');
    WheelRenderer.init(canvas);
    WheelRenderer.setNames(participants);

    // Sync input text
    syncParticipantsUI();
    updateAudioIcon();

    // Attach listeners
    attachEventListeners();
  });

  function updateAudioIcon() {
    if (SoundEngine.isEnabled()) {
      el.iconSound.className = 'ph-bold ph-speaker-high text-lg text-amber-400';
    } else {
      el.iconSound.className = 'ph-bold ph-speaker-slash text-lg text-slate-400';
    }
  }

  function syncParticipantsUI() {
    el.homeInput.value = participants.join('\n');
    el.homeCountBadge.textContent = `${participants.length} Peserta`;
    document.querySelectorAll('.count-badge').forEach(badge => {
      badge.textContent = participants.length;
    });
    WheelRenderer.setNames(participants);
  }

  // Parse text into trimmed list
  function parseLines(text) {
    return text.split('\n').map(s => s.trim()).filter(Boolean);
  }

  // --- NAVIGATION ---
  window.goToHome = function () {
    el.viewHome.classList.remove('hidden');
    el.viewWinners.classList.add('hidden');
    el.viewBulk.classList.add('hidden');
    syncParticipantsUI();
  };

  window.selectMode = function (mode) {
    if (participants.length < 2) {
      alert('Mohon masukkan minimal 2 nama peserta terlebih dahulu!');
      return;
    }

    el.viewHome.classList.add('hidden');
    if (mode === 'winners') {
      el.viewWinners.classList.remove('hidden');
      el.viewBulk.classList.add('hidden');
      updateStageUI();
      WheelRenderer.draw();
    } else if (mode === 'bulk') {
      el.viewWinners.classList.add('hidden');
      el.viewBulk.classList.remove('hidden');
    }
  };

  // --- SAMPLE & RESET ACTIONS ---
  window.loadSampleNames = function () {
    participants = [
      "Andi Pratama", "Budi Santoso", "Citra Lestari",
      "Dewi Anggraini", "Eko Kurniawan", "Fani Rahmawati",
      "Gilang Ramadhan", "Hana Novita", "Indra Wijaya", "Joko Susilo"
    ];
    syncParticipantsUI();
    showToast("10 Nama contoh berhasil dimuat!");
  };

  window.clearNames = function () {
    participants = [];
    syncParticipantsUI();
    showToast("Daftar nama dikosongkan");
  };

  // --- MODE 1: SPIN JUARA 1, 2, 3 LOGIC ---
  function updateStageUI() {
    if (currentStageIndex < stages.length) {
      const cur = stages[currentStageIndex];
      el.targetBannerText.innerHTML = `<i class="ph-fill ph-trophy text-amber-300"></i> ${cur.banner}`;
      el.targetBannerDesc.textContent = cur.desc;
      el.btnSpinLabel.textContent = `PUTAR UNTUK ${cur.label}`;
      el.btnSpinAction.disabled = false;
      if (el.btnSpinCenter) el.btnSpinCenter.disabled = false;
    } else {
      el.targetBannerText.innerHTML = `<i class="ph-fill ph-check-circle text-emerald-400"></i> SEMUA JUARA LENGKAP!`;
      el.targetBannerDesc.textContent = "Podium Juara 1, 2, dan 3 telah terisi semua!";
      el.btnSpinLabel.textContent = "SELESAI - RESET UNTUK ULANGI";
      el.btnSpinAction.disabled = true;
      if (el.btnSpinCenter) el.btnSpinCenter.disabled = true;
    }
  }

  function updatePodiumDisplay() {
    el.winner1.textContent = winners[1] || '(Belum Ada)';
    el.winner2.textContent = winners[2] || '(Belum Ada)';
    el.winner3.textContent = winners[3] || '(Belum Ada)';

    let count = 0;
    if (winners[3]) count++;
    if (winners[2]) count++;
    if (winners[1]) count++;
    el.podiumStatus.textContent = `${count}/3 Terpilih`;
  }

  window.spinWheel = function () {
    if (WheelRenderer.isSpinning()) return;

    if (participants.length === 0) {
      alert("Semua nama sudah terpilih atau daftar kosong!");
      return;
    }

    if (currentStageIndex >= stages.length) {
      alert("Semua Juara (1, 2, 3) telah terpilih! Silakan tekan tombol reset untuk memulai putaran baru.");
      return;
    }

    el.btnSpinAction.disabled = true;
    if (el.btnSpinCenter) el.btnSpinCenter.disabled = true;
    el.btnSpinLabel.textContent = "RODA SEDANG BERPUTAR...";

    WheelRenderer.spin((winnerName, winnerIndex) => {
      handleWinnerSelected(winnerName, winnerIndex);
    });
  };

  function handleWinnerSelected(winnerName, winnerIndex) {
    tempPendingWinner = { name: winnerName, index: winnerIndex };
    const curStage = stages[currentStageIndex];

    // Audio & Confetti
    SoundEngine.playVictory();
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 110,
        spread: 75,
        origin: { y: 0.6 }
      });
    }

    // Modal Display
    el.modalWinnerBadge.textContent = curStage.label;
    el.modalWinnerBadge.className = `px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-md ${curStage.badgeClass}`;
    el.modalWinnerName.textContent = winnerName;

    el.modalWinner.classList.remove('hidden');
  }

  window.confirmWinner = function (removeAfterWin) {
    const curStage = stages[currentStageIndex];
    winners[curStage.id] = tempPendingWinner.name;

    if (removeAfterWin) {
      participants = participants.filter(n => n !== tempPendingWinner.name);
      syncParticipantsUI();
    }

    updatePodiumDisplay();
    currentStageIndex++;
    updateStageUI();

    el.modalWinner.classList.add('hidden');

    if (currentStageIndex >= stages.length) {
      SoundEngine.playGrandFanfare();
      if (typeof confetti === 'function') {
        setTimeout(() => {
          confetti({
            particleCount: 180,
            spread: 100,
            origin: { y: 0.5 }
          });
        }, 300);
      }
      showToast("🎉 Selamat! Podium Juara 1, 2, dan 3 telah lengkap!");
    }
  };

  window.resetWinnersTournament = function () {
    if (confirm("Reset seluruh papan pemenang dan mulai dari Juara 3 lagi?")) {
      currentStageIndex = 0;
      winners = { 1: null, 2: null, 3: null };
      updatePodiumDisplay();
      updateStageUI();
      WheelRenderer.draw();
      showToast("Papan juara di-reset");
    }
  };

  // --- MODE 2: BULK RANDOMIZER LOGIC ---
  window.spinBulkAll = function () {
    if (participants.length < 2) {
      alert("Harap masukkan minimal 2 nama peserta!");
      return;
    }

    el.bulkTickerWrap.classList.remove('hidden');
    el.btnSpinBulk.disabled = true;
    el.bulkResultsCard.classList.add('hidden');

    let tickCount = 0;
    const maxTicks = 26;
    const interval = setInterval(() => {
      const randName = participants[Math.floor(Math.random() * participants.length)];
      el.bulkTickerName.textContent = randName;
      SoundEngine.playTick();
      tickCount++;

      if (tickCount >= maxTicks) {
        clearInterval(interval);

        // Fisher-Yates Complete Shuffle
        bulkResults = [...participants];
        for (let i = bulkResults.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bulkResults[i], bulkResults[j]] = [bulkResults[j], bulkResults[i]];
        }

        el.bulkTickerWrap.classList.add('hidden');
        el.btnSpinBulk.disabled = false;

        renderBulkResults();
        SoundEngine.playVictory();

        if (typeof confetti === 'function') {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
        }
      }
    }, 70);
  };

  function renderBulkResults() {
    const now = new Date();
    el.bulkTimestamp.textContent = `Diacak pada ${now.toLocaleTimeString('id-ID')} WIB (${bulkResults.length} Peserta)`;
    el.bulkList.innerHTML = '';

    bulkResults.forEach((name, idx) => {
      const rank = idx + 1;
      let badgeStyle = "bg-white/10 text-slate-300";
      let rankIcon = "";

      if (rank === 1) {
        badgeStyle = "bg-amber-400 text-amber-950 font-black shadow-md shadow-amber-400/20";
        rankIcon = " ";
      } else if (rank === 2) {
        badgeStyle = "bg-slate-300 text-slate-900 font-bold";
        rankIcon = " ";
      } else if (rank === 3) {
        badgeStyle = "bg-amber-700 text-amber-100 font-bold";
        rankIcon = " ";
      }

      const row = document.createElement('div');
      row.className = "flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 transition border-b border-white/5";
      row.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-lg ${badgeStyle} flex items-center justify-center text-xs">
            ${rank}
          </span>
          <span class="font-semibold text-sm text-slate-100">
            ${rankIcon}${escapeHTML(name)}
          </span>
        </div>
        <span class="text-xs font-mono text-slate-400">#${rank}</span>
      `;
      el.bulkList.appendChild(row);
    });

    el.bulkResultsCard.classList.remove('hidden');
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, t => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[t] || t));
  }

  window.copyBulkResults = function () {
    if (bulkResults.length === 0) return;
    const text = bulkResults.map((n, i) => `${i + 1}. ${n}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      showToast("Daftar urutan acak berhasil disalin!");
    }).catch(() => {
      showToast("Gagal menyalin teks");
    });
  };

  window.downloadBulkResults = function () {
    if (bulkResults.length === 0) return;
    const text = `HASIL PENGACAKAN SEMUA PESERTA (SPINMASTER)\nTanggal: ${new Date().toLocaleString('id-ID')}\nTotal Peserta: ${bulkResults.length}\n=========================================\n\n` +
      bulkResults.map((n, i) => `${i + 1}. ${n}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Hasil_Acak_Peserta_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("File TXT berhasil diunduh!");
  };

  // --- MODAL: EDIT PARTICIPANTS ---
  window.openEditModal = function () {
    el.modalEditInput.value = participants.join('\n');
    el.modalEdit.classList.remove('hidden');
  };

  window.closeEditModal = function () {
    el.modalEdit.classList.add('hidden');
  };

  window.saveEditModal = function () {
    const parsed = parseLines(el.modalEditInput.value);
    if (parsed.length < 2) {
      alert("Harap masukkan minimal 2 nama peserta!");
      return;
    }
    participants = parsed;
    syncParticipantsUI();
    closeEditModal();
    showToast("Daftar peserta diperbarui");
  };

  window.loadSampleEditModal = function () {
    el.modalEditInput.value = [
      "Andi Pratama", "Budi Santoso", "Citra Lestari",
      "Dewi Anggraini", "Eko Kurniawan", "Fani Rahmawati",
      "Gilang Ramadhan", "Hana Novita"
    ].join('\n');
  };

  // --- TOAST UTILITY ---
  function showToast(msg) {
    el.toastText.textContent = msg;
    el.toast.classList.remove('opacity-0');
    setTimeout(() => {
      el.toast.classList.add('opacity-0');
    }, 2400);
  }
  window.showToast = showToast;

  // --- SOUND TOGGLE ---
  window.toggleSound = function () {
    const isNowOn = SoundEngine.toggle();
    updateAudioIcon();
    showToast(isNowOn ? "Suara diaktifkan 🔊" : "Suara dimatikan 🔇");
  };

  // --- ATTACH LISTENERS ---
  function attachEventListeners() {
    el.homeInput.addEventListener('input', (e) => {
      participants = parseLines(e.target.value);
      el.homeCountBadge.textContent = `${participants.length} Peserta`;
      document.querySelectorAll('.count-badge').forEach(b => b.textContent = participants.length);
      WheelRenderer.setNames(participants);
    });
  }

})();

