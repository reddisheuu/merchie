const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

let width, height;
function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Latar belakang bintang kelap-kelip
const stars = Array.from({ length: 80 }, () => ({
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 1.5 + 0.5,
  alpha: Math.random(),
  speed: Math.random() * 0.02 + 0.005
}));

const flowers = [];
const particles = [];

let clickCount = 0;

// Konfigurasi Jenis Bunga & Warna Sesuai Siklus Ketukan
const flowerTypes = [
  {
    type: 'lily',         // Ketukan 1: Lily Pink
    color1: '#fcc2d7',
    color2: '#e64980',
    sparkleHue: 330
  },
  {
    type: 'tulip',        // Ketukan 2: Tulip Pink Kuncup (Sesuai Foto 1)
    color1: '#ffdeeb',
    color2: '#f783ac',
    sparkleHue: 340
  },
  {
    type: 'sunflower',    // Ketukan 3: Bunga Matahari Orange
    color1: '#ffb703',
    color2: '#fb8500',
    sparkleHue: 25
  }
];

class Flower {
  constructor(targetX, targetY, config) {
    this.startX = targetX + (Math.random() - 0.5) * 30;
    this.startY = height;
    this.targetX = targetX;
    this.targetY = targetY;
    
    this.growth = 0;
    this.growSpeed = 0.012;
    
    this.type = config.type;
    this.color1 = config.color1;
    this.color2 = config.color2;
    this.sparkleHue = config.sparkleHue;

    this.maxSize = 45 + Math.random() * 10;
    this.angle = (Math.random() - 0.5) * 0.15;
    
    this.controlX = (this.startX + this.targetX) / 2 + (Math.random() - 0.5) * 60;
    this.controlY = (this.startY + this.targetY) / 2;

    // Animasi Goyang (Sway)
    this.swayOffset = Math.random() * Math.PI * 2;
    this.swaySpeed = 0.02 + Math.random() * 0.015;
    this.swayAmount = 6 + Math.random() * 8;
    this.currentSway = 0;
  }

  update() {
    if (this.growth < 1) {
      this.growth += this.growSpeed;
      if (this.growth > 1) this.growth = 1;

      const currentPos = this.getStemPoint(this.growth, 0);
      if (Math.random() < 0.6) {
        particles.push(new Sparkle(currentPos.x, currentPos.y, this.sparkleHue));
      }
    }

    this.swayOffset += this.swaySpeed;
    this.currentSway = Math.sin(this.swayOffset) * this.swayAmount * this.growth;
  }

  getStemPoint(t, sway) {
    const swayFactor = t * t; 
    const currentControlX = this.controlX + sway * 0.5 * swayFactor;
    const currentTargetX = this.targetX + sway * swayFactor;

    const invT = 1 - t;
    const x = invT * invT * this.startX + 2 * invT * t * currentControlX + t * t * currentTargetX;
    const y = invT * invT * this.startY + 2 * invT * t * this.controlY + t * t * this.targetY;
    return { x, y };
  }

  draw() {
    ctx.save();

    // 1. Gambar Batang
    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);

    const steps = 50;
    const currentSteps = Math.floor(steps * this.growth);

    for (let i = 1; i <= currentSteps; i++) {
      const pt = this.getStemPoint(i / steps, this.currentSway);
      ctx.lineTo(pt.x, pt.y);
    }

    ctx.strokeStyle = '#5c940d';
    ctx.lineWidth = this.type === 'tulip' ? 6 : 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. Gambar Daun Khas Sesuai Bunga
    if (this.growth > 0.2) {
      const leafScale = Math.min((this.growth - 0.2) * 1.25, 1);

      if (this.type === 'tulip') {
        // Daun Panjang Tegak Khas Tulip (Sesuai Foto 1)
        const pBase = this.getStemPoint(0.1, this.currentSway);
        this.drawTulipLeaves(pBase.x, pBase.y, leafScale);
      } else {
        // Daun Samping untuk Lily dan Bunga Matahari
        const p1 = this.getStemPoint(0.35, this.currentSway);
        const p2 = this.getStemPoint(0.6, this.currentSway);
        this.drawStandardLeaf(p1.x, p1.y, -0.7 + (this.currentSway * 0.005), leafScale);
        this.drawStandardLeaf(p2.x, p2.y, 0.7 + (this.currentSway * 0.005), leafScale);
      }
    }

    // 3. Gambar Bunga Mekar di Puncak
    if (this.growth > 0.8) {
      const bloomFactor = (this.growth - 0.8) / 0.2;
      const top = this.getStemPoint(1, this.currentSway);

      ctx.translate(top.x, top.y);
      ctx.rotate(this.angle + (this.currentSway * 0.012));

      if (this.type === 'lily') {
        this.drawLily(bloomFactor);
      } else if (this.type === 'tulip') {
        this.drawTulip(bloomFactor);
      } else if (this.type === 'sunflower') {
        this.drawSunflower(bloomFactor);
      }
    }

    ctx.restore();
  }

  // --- Bunga Tulip Kuncup (Sesuai Foto 1) ---
  drawTulip(bloom) {
    const scale = bloom * (this.maxSize / 40);
    ctx.scale(scale, scale);

    const drawPetalPath = (x1, y1, x2, y2, x3, y3, x4, y4) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
    };

    // Kelopak Belakang Kiri
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-30, -20, -30, -65, -10, -75);
    ctx.bezierCurveTo(5, -60, 0, -20, 0, 0);
    const gradBackL = ctx.createLinearGradient(0, 0, 0, -75);
    gradBackL.addColorStop(0, '#fcc2d7');
    gradBackL.addColorStop(1, '#e64980');
    ctx.fillStyle = gradBackL;
    ctx.fill();
    ctx.strokeStyle = '#a61e4d';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Kelopak Belakang Kanan
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(30, -20, 30, -65, 10, -75);
    ctx.bezierCurveTo(-5, -60, 0, -20, 0, 0);
    const gradBackR = ctx.createLinearGradient(0, 0, 0, -75);
    gradBackR.addColorStop(0, '#fcc2d7');
    gradBackR.addColorStop(1, '#e64980');
    ctx.fillStyle = gradBackR;
    ctx.fill();
    ctx.strokeStyle = '#a61e4d';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Kelopak Belakang Tengah
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-15, -20);
    ctx.bezierCurveTo(-20, -60, -10, -80, 0, -82);
    ctx.bezierCurveTo(10, -80, 20, -60, 15, -20);
    ctx.fillStyle = '#f783ac';
    ctx.fill();
    ctx.strokeStyle = '#a61e4d';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // Kelopak Depan Utama (Kuncup Bulat)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-35, -15, -35, -60, 0, -70);
    ctx.bezierCurveTo(35, -60, 35, -15, 0, 0);

    const gradFront = ctx.createRadialGradient(0, -35, 5, 0, -35, 35);
    gradFront.addColorStop(0, '#ffffff');
    gradFront.addColorStop(0.5, '#ffdeeb');
    gradFront.addColorStop(1, '#f783ac');

    ctx.fillStyle = gradFront;
    ctx.fill();
    ctx.strokeStyle = '#a61e4d';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // Daun Panjang Khas Tulip
  drawTulipLeaves(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Daun Kiri
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-30, -60, -40, -140, -45, -200);
    ctx.bezierCurveTo(-15, -140, -5, -60, 0, 0);
    const gradLeafL = ctx.createLinearGradient(-45, -200, 0, 0);
    gradLeafL.addColorStop(0, '#a9e34b');
    gradLeafL.addColorStop(0.5, '#74b816');
    gradLeafL.addColorStop(1, '#2b8a3e');
    ctx.fillStyle = gradLeafL;
    ctx.fill();
    ctx.strokeStyle = '#2b8a3e';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Daun Kanan
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(30, -60, 40, -140, 45, -190);
    ctx.bezierCurveTo(15, -140, 5, -60, 0, 0);
    const gradLeafR = ctx.createLinearGradient(45, -190, 0, 0);
    gradLeafR.addColorStop(0, '#a9e34b');
    gradLeafR.addColorStop(0.5, '#74b816');
    gradLeafR.addColorStop(1, '#2b8a3e');
    ctx.fillStyle = gradLeafR;
    ctx.fill();
    ctx.strokeStyle = '#2b8a3e';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  // --- Bunga Lily Pink Mekar (Sesuai Foto 2) ---
  drawLily(bloom) {
    const size = this.maxSize * bloom;

    // 6 Kelopak Lily Mekar Lengkung
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 3);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-size * 0.4, -size * 0.4, -size * 0.5, -size * 0.8, -size * 0.1, -size);
      ctx.bezierCurveTo(size * 0.2, -size * 0.8, size * 0.4, -size * 0.4, 0, 0);

      const grad = ctx.createLinearGradient(0, 0, 0, -size);
      grad.addColorStop(0, '#e64980');    // Merah tua pangkal
      grad.addColorStop(0.25, '#ffecf1'); // Pink sangat lembut
      grad.addColorStop(0.7, '#f783ac');  // Pink
      grad.addColorStop(1, '#d6336c');    // Pink tua tepi

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = '#a61e4d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Corak Serat/Semburat Kuning/Oranye di Tengah Pangkal Kelopak
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(-size * 0.1, -size * 0.35);
      ctx.lineTo(0, -size * 0.4);
      ctx.lineTo(size * 0.1, -size * 0.35);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 183, 3, 0.5)';
      ctx.fill();

      ctx.restore();
    }

    // Benang Sari Panjang dengan Ujung Cokelat/Marun
    if (bloom > 0.4) {
      const stamenBloom = (bloom - 0.4) / 0.6;
      const angles = [-0.6, -0.25, 0.1, 0.45, 0.8];
      
      angles.forEach((ang) => {
        ctx.save();
        ctx.rotate(ang);

        const len = size * 0.7 * stamenBloom;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(5, -len * 0.5, 8, -len);
        ctx.strokeStyle = '#a61e4d';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Kepala Sari Marun (Anther)
        ctx.beginPath();
        ctx.ellipse(8, -len, 3, 6, Math.PI / 6, 0, Math.PI * 2);
        ctx.fillStyle = '#5c061c';
        ctx.fill();

        ctx.restore();
      });
    }
  }

  // --- Bunga Matahari Orange ---
  drawSunflower(bloom) {
    const petalCount = 14;
    const size = (this.maxSize - 5) * bloom;
    const centerRadius = 14 * bloom;

    for (let i = 0; i < petalCount; i++) {
      ctx.save();
      ctx.rotate((i * Math.PI * 2) / petalCount);
      
      ctx.beginPath();
      ctx.moveTo(0, -centerRadius * 0.8);
      ctx.bezierCurveTo(-size * 0.25, -size * 0.5, -size * 0.2, -size, 0, -size * 1.2);
      ctx.bezierCurveTo(size * 0.2, -size, size * 0.25, -size * 0.5, 0, -centerRadius * 0.8);

      const grad = ctx.createLinearGradient(0, -centerRadius, 0, -size * 1.2);
      grad.addColorStop(0, '#ffb703');
      grad.addColorStop(1, '#fb8500');

      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, centerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#582f0e';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#331800';
    ctx.stroke();
  }

  // Daun Standar untuk Lily & Bunga Matahari
  drawStandardLeaf(x, y, dir, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(dir);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(20, -15, 35, -8, 50, 10);
    ctx.bezierCurveTo(30, 20, 12, 12, 0, 0);

    const gradLeaf = ctx.createLinearGradient(0, 0, 50, 0);
    gradLeaf.addColorStop(0, '#2b8a3e');
    gradLeaf.addColorStop(1, '#a9e34b');

    ctx.fillStyle = gradLeaf;
    ctx.fill();
    ctx.restore();
  }
}

// Efek Percikan Cahaya / Sparkle
class Sparkle {
  constructor(x, y, baseHue) {
    this.x = x + (Math.random() - 0.5) * 10;
    this.y = y + (Math.random() - 0.5) * 10;
    this.size = Math.random() * 2.5 + 1;
    this.alpha = 1;
    this.decay = Math.random() * 0.03 + 0.015;
    this.color = `hsl(${baseHue + (Math.random() - 0.5) * 20}, 100%, 75%)`;
  }

  update() {
    this.alpha -= this.decay;
    this.y -= 0.5;
  }

  draw() {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 6;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

function addFlower(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
  const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

  const typeConfig = flowerTypes[clickCount % flowerTypes.length];
  flowers.push(new Flower(x, y, typeConfig));

  clickCount++;
}

window.addEventListener('click', addFlower);
window.addEventListener('touchstart', (e) => {
  addFlower(e);
});

function animate() {
  ctx.clearRect(0, 0, width, height);

  stars.forEach(star => {
    star.alpha += star.speed;
    if (star.alpha > 1 || star.alpha < 0) star.speed = -star.speed;
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });

  flowers.forEach(flower => {
    flower.update();
    flower.draw();
  });

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  requestAnimationFrame(animate);
}

animate();