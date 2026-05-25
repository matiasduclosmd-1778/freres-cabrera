gsap.registerPlugin(ScrollTrigger);

// ── TOUCH DETECTION ────────────────────────────────────────────
const isTouch = window.matchMedia('(pointer: coarse)').matches;

// ── FRAME SEQUENCE ─────────────────────────────────────────────
const heroImg = document.getElementById('heroImg');
const TOTAL   = 73;
const proxy   = { frame: 0 };

const frames = Array.from({ length: TOTAL }, (_, i) => {
  const img = new Image();
  img.src = `img/video/vid/video_${String(i).padStart(5, '0')}.jpg`;
  return img;
});

function draw(index) {
  const i = Math.round(Math.max(0, Math.min(TOTAL - 1, index)));
  heroImg.src = frames[i].src;
}

gsap.to(proxy, {
  frame: TOTAL - 1,
  ease: 'none',
  scrollTrigger: { trigger: '#heroSection', start: 'top top', end: '40% top', scrub: 2 },
  onUpdate: () => draw(proxy.frame),
});

gsap.to('.hero-logo', {
  opacity: 0, scale: 0.88, y: -40, ease: 'power3.inOut',
  scrollTrigger: { trigger: '#heroSection', start: 'top top', end: '10% top', scrub: 3 },
});

// ── CALLIGRAPHY ────────────────────────────────────────────────
const heroText  = document.getElementById('heroText');
const hotspot   = document.getElementById('hotspot');
const hotspot2  = document.getElementById('hotspot2');
const bonVivant = document.getElementById('bonVivantText');

function playCalligraphy() {
  const len = bonVivant.getTotalLength?.() || 20000;
  gsap.fromTo(bonVivant,
    { strokeDasharray: len, strokeDashoffset: len },
    { strokeDashoffset: 0, duration: 3.2, ease: 'power2.inOut' }
  );
  gsap.fromTo(bonVivant,
    { fill: 'none' },
    { fill: 'white', duration: 1.5, ease: 'power2.in', delay: 1.2 }
  );
}

function resetCalligraphy() {
  const len = bonVivant.getTotalLength?.() || 20000;
  gsap.killTweensOf(bonVivant);
  gsap.set(bonVivant, { strokeDasharray: len, strokeDashoffset: len, fill: 'none' });
}

ScrollTrigger.create({
  trigger: '#heroSection',
  start: '37% top',
  end:   'bottom bottom',
  onEnter() {
    gsap.to(heroText, { opacity: 1, duration: 0.8, ease: 'power2.out' });
    playCalligraphy();
    gsap.to([hotspot, hotspot2], {
      opacity: 1, duration: 1, ease: 'power2.out', stagger: 0.15,
      onComplete: () => {
        hotspot.style.pointerEvents  = 'auto';
        hotspot2.style.pointerEvents = 'auto';
      },
    });
  },
  onLeaveBack() {
    gsap.to(heroText,            { opacity: 0, duration: 0.4, ease: 'power2.in' });
    gsap.to([hotspot, hotspot2], { opacity: 0, duration: 0.4, ease: 'power2.in' });
    hotspot.style.pointerEvents  = 'none';
    hotspot2.style.pointerEvents = 'none';
    closeCard();
    resetCalligraphy();
  },
});

// ── PRODUCT CARD ───────────────────────────────────────────────
const productCard = document.getElementById('productCard');
gsap.set(productCard, { transformOrigin: isTouch ? 'left bottom' : 'right center' });
let cardOpen = false, cardSticky = false;

function openCard() {
  if (cardOpen) return;
  cardOpen = true;
  gsap.killTweensOf(productCard);
  productCard.style.pointerEvents = 'auto';
  gsap.fromTo(productCard,
    { opacity: 0, scale: 0.92, x: -16 },
    { opacity: 1, scale: 1,    x: 0, duration: 0.55, ease: 'power3.out' }
  );
}

function closeCard() {
  if (!cardOpen) return;
  cardOpen = false;
  cardSticky = false;
  gsap.killTweensOf(productCard);
  gsap.to(productCard, {
    opacity: 0, scale: 0.92, x: -16, duration: 0.35, ease: 'power2.in',
    onComplete: () => { productCard.style.pointerEvents = 'none'; },
  });
}

hotspot.addEventListener('mouseenter',  openCard);
hotspot2.addEventListener('mouseenter', openCard);
hotspot.addEventListener('mouseleave',  () => { if (!cardSticky) closeCard(); });
hotspot2.addEventListener('mouseleave', () => { if (!cardSticky) closeCard(); });

hotspot.addEventListener('click',  () => { cardSticky = true; openCard(); });
hotspot2.addEventListener('click', () => { cardSticky = true; openCard(); });

document.addEventListener('click', e => {
  if (!cardOpen) return;
  if (productCard.contains(e.target) || hotspot.contains(e.target) || hotspot2.contains(e.target)) return;
  closeCard();
});

// ── CURSOR ─────────────────────────────────────────────────────
if (!isTouch) {
  const cursor = document.getElementById('cursor');
  const mouse  = { x: innerWidth / 2, y: innerHeight / 2 };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  gsap.ticker.add(() => {
    gsap.to(cursor, { x: mouse.x, y: mouse.y, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
  });
}

// ── SNAP ───────────────────────────────────────────────────────
const heroSection = document.getElementById('heroSection');
let snapping = false;

function scrollToY(target) {
  snapping = true;
  const snap = { y: window.scrollY };
  gsap.to(snap, {
    y: target, duration: 1.7, ease: 'power2.inOut',
    onUpdate()   { window.scrollTo(0, snap.y); },
    onComplete() { snapping = false; },
  });
}

if (!isTouch) {
  window.addEventListener('wheel', e => {
    const scrollY = window.scrollY;
    const heroEnd = heroSection.offsetHeight - window.innerHeight;
    if (scrollY < 0 || scrollY > heroEnd) return;
    if (snapping) { e.preventDefault(); return; }
    const goingDown = e.deltaY > 0;
    if (goingDown && scrollY >= heroEnd) return;
    if (!goingDown && scrollY <= 0) return;
    e.preventDefault();
    scrollToY(goingDown ? heroEnd : 0);
  }, { passive: false });
} else {
  let snapTimeout;
  window.addEventListener('scroll', () => {
    if (snapping) return;
    clearTimeout(snapTimeout);
    snapTimeout = setTimeout(() => {
      const scrollY = window.scrollY;
      const heroEnd = heroSection.offsetHeight - window.innerHeight;
      if (scrollY <= 0 || scrollY >= heroEnd) return;
      scrollToY(scrollY < heroEnd / 2 ? 0 : heroEnd);
    }, 160);
  }, { passive: true });
}
