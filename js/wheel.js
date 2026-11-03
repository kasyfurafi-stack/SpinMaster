/**
 * WHEEL.JS - Canvas Wheel Rendering & Physics
 */

const WheelRenderer = (function () {
  let canvas = null;
  let ctx = null;
  let names = [];
  let currentRotation = 0; // in radians
  let isSpinning = false;
  let lastTickSlice = -1;

  // Rich Harmonious Color Palette for Slices
  const sliceColors = [
    '#e74c3c', '#3498db', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#e84393',
    '#00cec9', '#6c5ce7', '#fdcb6e', '#d63031'
  ];

  function getSliceColor(index, total) {
    if (total <= sliceColors.length) {
      return sliceColors[index % sliceColors.length];
    }
    const hue = (index * (360 / total)) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  function init(canvasElement) {
    canvas = canvasElement;
    if (canvas) {
      ctx = canvas.getContext('2d');
    }
  }

  function setNames(newNames) {
    names = [...newNames];
    draw();
  }

  function getNames() {
    return names;
  }

  function draw() {
    if (!canvas || !ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = cx - 18;

    ctx.clearRect(0, 0, width, height);

    if (names.length === 0) {
      // Empty state
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#182834';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffd966';
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Belum Ada Peserta', cx, cy);
      ctx.restore();
      return;
    }

    const total = names.length;
    const sliceAngle = (2 * Math.PI) / total;

    // Draw Slices
    for (let i = 0; i < total; i++) {
      const startAngle = currentRotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = getSliceColor(i, total);
      ctx.fill();

      // Border between slices
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.stroke();
      ctx.restore();

      // Draw Radial Text
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sliceAngle / 2);

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 5;

      // Dynamic font size
      let fontSize = 23;
      if (total > 28) fontSize = 13;
      else if (total > 18) fontSize = 16;
      else if (total > 10) fontSize = 19;

      ctx.font = `bold ${fontSize}px Segoe UI, sans-serif`;

      let displayName = names[i];
      const maxLen = 15;
      if (displayName.length > maxLen) {
        displayName = displayName.substring(0, maxLen - 1) + '…';
      }

      ctx.fillText(displayName, radius - 26, 0);
      ctx.restore();
    }

    // Outer Golden Rim with 3D feel
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    const goldGrad = ctx.createLinearGradient(0, 0, width, height);
    goldGrad.addColorStop(0, '#ffe082');
    goldGrad.addColorStop(0.5, '#ffd966');
    goldGrad.addColorStop(1, '#b38f40');
    ctx.strokeStyle = goldGrad;
    ctx.stroke();
    ctx.restore();

    // Center Hub Decorative Pin
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 36, 0, 2 * Math.PI);
    const hubGrad = ctx.createRadialGradient(cx - 7, cy - 7, 3, cx, cy, 36);
    hubGrad.addColorStop(0, '#fffbe6');
    hubGrad.addColorStop(0.5, '#ffd966');
    hubGrad.addColorStop(1, '#99732e');
    ctx.fillStyle = hubGrad;
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Inner rivet
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#102027';
    ctx.fill();
    ctx.restore();
  }

  // Pointer needle is at top (12 o'clock / angle = 3*PI/2)
  function getWinnerIndexAtCurrentAngle() {
    if (names.length === 0) return -1;
    const total = names.length;
    const sliceAngle = (2 * Math.PI) / total;
    const pointerAngle = (3 * Math.PI) / 2;

    let relAngle = (pointerAngle - currentRotation) % (2 * Math.PI);
    if (relAngle < 0) relAngle += 2 * Math.PI;

    return Math.floor(relAngle / sliceAngle) % total;
  }

  function checkTick() {
    const curIndex = getWinnerIndexAtCurrentAngle();
    if (curIndex !== lastTickSlice && curIndex >= 0) {
      lastTickSlice = curIndex;
      SoundEngine.playTick();
    }
  }

  // Spin with Ease-Out Animation
  function spin(onFinishCallback) {
    if (isSpinning || names.length < 2) return;

    isSpinning = true;
    lastTickSlice = -1;

    const total = names.length;
    const sliceAngle = (2 * Math.PI) / total;

    // Pick random target winner
    const targetIndex = Math.floor(Math.random() * total);

    // Compute rotation needed so targetIndex lands under pointer at 3*PI/2
    const pointerAngle = (3 * Math.PI) / 2;
    const safeMarginInSlice = (0.2 + Math.random() * 0.6) * sliceAngle;
    const targetSliceCenter = targetIndex * sliceAngle + safeMarginInSlice;

    const desiredFinalMod = (pointerAngle - targetSliceCenter) % (2 * Math.PI);
    const currentMod = currentRotation % (2 * Math.PI);

    let deltaAngle = desiredFinalMod - currentMod;
    while (deltaAngle < 0) deltaAngle += 2 * Math.PI;

    const fullSpins = 6 + Math.floor(Math.random() * 4); // 6 - 9 full rotations
    const totalDelta = fullSpins * 2 * Math.PI + deltaAngle;

    const startRot = currentRotation;
    const duration = 4800 + Math.random() * 700; // ~5 seconds
    const startTime = performance.now();

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3.2);
    }

    function animate(time) {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      currentRotation = startRot + totalDelta * eased;
      draw();
      checkTick();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        const winnerIdx = getWinnerIndexAtCurrentAngle();
        const winnerName = names[winnerIdx] || names[targetIndex];
        if (typeof onFinishCallback === 'function') {
          onFinishCallback(winnerName, winnerIdx);
        }
      }
    }

    requestAnimationFrame(animate);
  }

  return {
    init: init,
    setNames: setNames,
    getNames: getNames,
    draw: draw,
    spin: spin,
    isSpinning: function () {
      return isSpinning;
    }
  };
})();

