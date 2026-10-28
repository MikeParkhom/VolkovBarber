// 3D-сцена: стальные ножницы и опасная бритва с молочными накладками.
// Канвас лежит поверх страницы (pointer-events: none). Положение инструментов
// задаётся ключевыми кадрами, привязанными к разделам: при прокрутке они
// вылетают из первого экрана, проносятся над работами и возвращаются к записи.
import * as THREE from 'three';

const canvas = document.getElementById('stage3d');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

function init() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 12);

  scene.environment = studioEnvironment(renderer);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8580, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff4e6, 0.8);
  rim.position.set(-6, -2, 4);
  scene.add(rim);

  const steel = new THREE.MeshPhysicalMaterial({ color: 0xdfe1e4, metalness: 1, roughness: 0.2, clearcoat: 0.4, clearcoatRoughness: 0.2 });
  const steelDark = new THREE.MeshPhysicalMaterial({ color: 0x9a9da3, metalness: 1, roughness: 0.32 });
  const graphite = new THREE.MeshPhysicalMaterial({ color: 0x2a2a2d, metalness: 0.5, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const milk = new THREE.MeshPhysicalMaterial({ color: 0xf0e9dc, metalness: 0, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.15, sheen: 0.3 });

  const scissors = buildScissors(steel, graphite, steelDark);
  const razor = buildRazor(steel, milk, steelDark);
  scene.add(scissors.root, razor.root);

  // Ключевые кадры. fx/fy — доля половины ширины/высоты кадра, s — масштаб,
  // r* — повороты, o — раскрытие (0 закрыты, 1 открыты).
  // Якорь: el — раздел, edge — точка раздела (0 верх, 1 низ),
  // align — где в окне стоит эта точка (0 верх окна, 0.5 середина).
  const OFF_SC_A = { fx: -1.8, fy: 1.15, z: 1, s: 1, rx: 0.7, ry: 0.5, rz: 2.8, o: 0.6 };
  const OFF_SC_B = { fx: -1.9, fy: -1.3, z: 1, s: 0.9, rx: 0.4, ry: -0.6, rz: -5.6, o: 0.3 };
  const OFF_RZ_A = { fx: 1.9, fy: -0.9, z: 1, s: 1, rx: 0.4, ry: 0.4, rz: -2.4, o: 1 };
  const OFF_RZ_B = { fx: 1.9, fy: 1.2, z: 0, s: 0.8, rx: 0.2, ry: 0.6, rz: -1, o: 0.2 };
  const OFF_RZ_C = { fx: -1.95, fy: -1.15, z: 0, s: 0.8, rx: 0.5, ry: -0.4, rz: 3.6, o: 1 };
  const OFF_RZ_D = { fx: 1.95, fy: 1.4, z: 1, s: 0.8, rx: 0.3, ry: 0.4, rz: 6.2, o: 0.3 };

  const desktop = {
    scissors: [
      [{ el: 'top', edge: 0, align: 0 }, { fx: 0.47, fy: 0.12, z: 0, s: 1, rx: 0.25, ry: -0.35, rz: -0.75, o: 0.3 }],
      [{ el: 'about', edge: 0, align: 0.5 }, OFF_SC_A],
      [{ el: 'booking', edge: 0, align: 0.6 }, OFF_SC_A],
      [{ el: 'booking', edge: 0.5, align: 0.5 }, { fx: -0.68, fy: 0.02, z: 0, s: 0.78, rx: 0.2, ry: 0.5, rz: -2.3, o: 0.4 }],
      [{ el: 'booking', edge: 0.62, align: 0.5 }, { fx: -0.68, fy: 0.02, z: 0, s: 0.78, rx: 0.2, ry: 0.5, rz: -2.3, o: 0.4 }],
      [{ el: 'booking', edge: 1, align: 0.45 }, OFF_SC_B],
    ],
    razor: [
      [{ el: 'top', edge: 0, align: 0 }, { fx: 0.6, fy: -0.32, z: -0.6, s: 0.92, rx: 0.35, ry: 0.25, rz: 0.35, o: 0.9 }],
      [{ el: 'about', edge: 0, align: 0.5 }, OFF_RZ_A],
      [{ el: 'works', edge: 0, align: 0.55 }, OFF_RZ_B],
      [{ el: 'works', edge: 0, align: 0.3 }, OFF_RZ_C],
      [{ el: 'booking', edge: 0, align: 0.6 }, OFF_RZ_B],
      [{ el: 'booking', edge: 0.5, align: 0.5 }, { fx: 0.63, fy: -0.04, z: 0, s: 0.8, rx: 0.3, ry: -0.4, rz: 2.6, o: 0.92 }],
      [{ el: 'booking', edge: 0.62, align: 0.5 }, { fx: 0.63, fy: -0.04, z: 0, s: 0.8, rx: 0.3, ry: -0.4, rz: 2.6, o: 0.92 }],
      [{ el: 'booking', edge: 1, align: 0.45 }, OFF_RZ_D],
    ],
  };
  // На телефоне инструменты стоят над текстом: в блоке над заголовком первого
  // экрана и в верхнем отступе раздела записи.
  const mobile = {
    scissors: [
      [{ el: 'top', edge: 0, align: 0 }, { fx: -0.2, fy: 0.42, z: 0, s: 0.5, rx: 0.25, ry: -0.3, rz: -0.55, o: 0.3 }],
      [{ el: 'about', edge: 0, align: 0.6 }, OFF_SC_A],
      [{ el: 'booking', edge: 0, align: 1 }, OFF_SC_A],
      [{ el: 'booking', edge: 0, align: 0 }, { fx: -0.45, fy: 0.72, z: 0, s: 0.36, rx: 0.2, ry: 0.3, rz: -1.57, o: 0.4 }],
      [{ el: 'booking', edge: 0.1, align: 0 }, { fx: -0.45, fy: 0.72, z: 0, s: 0.36, rx: 0.2, ry: 0.3, rz: -1.57, o: 0.4 }],
      [{ el: 'booking', edge: 0.6, align: 0.2 }, OFF_SC_B],
    ],
    razor: [
      [{ el: 'top', edge: 0, align: 0 }, { fx: 0.2, fy: 0.3, z: -0.4, s: 0.45, rx: 0.35, ry: 0.25, rz: 0.4, o: 0.9 }],
      [{ el: 'about', edge: 0, align: 0.6 }, OFF_RZ_A],
      [{ el: 'works', edge: 0, align: 0.7 }, OFF_RZ_B],
      [{ el: 'works', edge: 0, align: 0.45 }, OFF_RZ_C],
      [{ el: 'booking', edge: 0, align: 1 }, OFF_RZ_B],
      [{ el: 'booking', edge: 0, align: 0 }, { fx: 0.5, fy: 0.72, z: 0, s: 0.3, rx: 0.3, ry: -0.3, rz: 0.1, o: 0.9 }],
      [{ el: 'booking', edge: 0.1, align: 0 }, { fx: 0.5, fy: 0.72, z: 0, s: 0.3, rx: 0.3, ry: -0.3, rz: 0.1, o: 0.9 }],
      [{ el: 'booking', edge: 0.6, align: 0.2 }, OFF_RZ_D],
    ],
  };

  let tracks = null;
  let halfH = 1, halfW = 1;
  let vw = 0, vh = 0;

  function layout() {
    vw = window.innerWidth; vh = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, vw < 860 ? 1.5 : 2));
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.updateProjectionMatrix();
    halfH = camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    halfW = halfH * camera.aspect;
    const set = vw < 860 ? mobile : desktop;
    tracks = {};
    for (const name of Object.keys(set)) {
      tracks[name] = set[name].map(([a, st]) => {
        const el = a.el === 'top' ? null : document.getElementById(a.el);
        let y = 0;
        if (el) {
          const r = el.getBoundingClientRect();
          y = r.top + window.scrollY + a.edge * r.height - a.align * vh;
        }
        return { y: Math.max(0, y), st };
      }).sort((p, q) => p.y - q.y);
    }
  }

  const KEYS = ['fx', 'fy', 'z', 's', 'rx', 'ry', 'rz', 'o'];
  const smooth = (t) => t * t * (3 - 2 * t);
  function sample(track, y) {
    if (y <= track[0].y) return track[0].st;
    for (let i = 0; i < track.length - 1; i++) {
      const a = track[i], b = track[i + 1];
      if (y < b.y) {
        const t = smooth((y - a.y) / Math.max(1, b.y - a.y));
        const out = {};
        for (const k of KEYS) out[k] = a.st[k] + (b.st[k] - a.st[k]) * t;
        return out;
      }
    }
    return track[track.length - 1].st;
  }

  const cur = { scissors: null, razor: null };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = (e.clientX / vw) * 2 - 1;
    mouse.ty = (e.clientY / vh) * 2 - 1;
  }, { passive: true });

  function apply(tool, st, t, speed, idlePhase) {
    const bob = reduced ? 0 : Math.sin(t * 1.1 + idlePhase) * 0.02;
    tool.root.position.set(st.fx * halfW, (st.fy + bob) * halfH, st.z);
    tool.root.scale.setScalar(st.s * (vw < 860 ? 1.05 : 1));
    tool.root.rotation.set(
      st.rx + mouse.y * 0.18,
      st.ry + mouse.x * 0.3 + (reduced ? 0 : Math.sin(t * 0.6 + idlePhase) * 0.12),
      st.rz + (reduced ? 0 : Math.sin(t * 0.8 + idlePhase) * 0.04)
    );
    tool.setOpen(st.o, t, speed);
  }

  let last = performance.now();
  let lastScroll = window.scrollY;
  let speed = 0;
  let running = true;

  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    const y = window.scrollY;
    speed += (Math.min(1, Math.abs(y - lastScroll) / 40) - speed) * Math.min(1, dt * 6);
    lastScroll = y;
    mouse.x += (mouse.tx - mouse.x) * Math.min(1, dt * 3);
    mouse.y += (mouse.ty - mouse.y) * Math.min(1, dt * 3);

    let visible = false;
    for (const name of ['scissors', 'razor']) {
      const target = sample(tracks[name], y);
      if (!cur[name] || reduced) cur[name] = { ...target };
      else {
        const k = 1 - Math.exp(-dt * 5);
        for (const key of KEYS) cur[name][key] += (target[key] - cur[name][key]) * k;
      }
      const tool = name === 'scissors' ? scissors : razor;
      apply(tool, cur[name], t, speed, name === 'scissors' ? 0 : 1.7);
      if (Math.abs(cur[name].fx) < 1.45 && Math.abs(cur[name].fy) < 1.45) visible = true;
    }
    if (reduced) canvas.style.opacity = String(Math.max(0, 1 - y / (vh * 0.6)));
    if (visible) renderer.render(scene, camera);
    else renderer.clear();
    requestAnimationFrame(frame);
  }

  layout();
  window.addEventListener('resize', layout);
  window.addEventListener('load', layout);
  if ('ResizeObserver' in window) new ResizeObserver(() => layout()).observe(document.body);
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { last = performance.now(); requestAnimationFrame(frame); }
  });
  requestAnimationFrame(frame);
  document.documentElement.classList.add('has-3d');
}

// Простая «студия» для отражений на металле: мягкие белые панели вокруг.
function studioEnvironment(renderer) {
  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), new THREE.MeshBasicMaterial({ color: 0xa8a39b, side: THREE.BackSide }));
  env.add(room);
  const panel = (w, h, x, y, z, ry, rx, intensity) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 0.98, 0.95).multiplyScalar(intensity), side: THREE.DoubleSide });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    p.position.set(x, y, z); p.rotation.set(rx, ry, 0);
    env.add(p);
  };
  panel(10, 4, 0, 8, 0, 0, Math.PI / 2, 3.5);
  panel(6, 8, -9, 1, 2, Math.PI / 2, 0, 2.2);
  panel(6, 8, 9, 0, -2, -Math.PI / 2, 0, 1.6);
  panel(8, 3, 0, -2, 9, Math.PI, 0, 1.2);
  const pm = new THREE.PMREMGenerator(renderer);
  const tex = pm.fromScene(env, 0.04).texture;
  pm.dispose();
  return tex;
}

const EXTRUDE = (depth, bevel) => ({ depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 24 });

function buildScissors(steel, ringMat, pinMat) {
  // Половинка ножниц: лезвие вверх от оси (0,0), ручка с кольцом вниз-вправо.
  function half() {
    const g = new THREE.Group();
    const s = new THREE.Shape();
    s.moveTo(-0.07, -0.1);
    s.quadraticCurveTo(0.2, 0.25, 0.15, 0.9);
    s.quadraticCurveTo(0.1, 1.9, 0.0, 2.6);
    s.quadraticCurveTo(-0.05, 1.6, -0.06, 0.8);
    s.lineTo(-0.09, 0.0);
    s.closePath();
    const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(s, EXTRUDE(0.03, 0.012)), steel);
    blade.position.z = -0.015;
    g.add(blade);

    const shankCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 0.05, 0),
      new THREE.Vector3(0.12, -0.45, 0),
      new THREE.Vector3(0.3, -0.85, 0),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(shankCurve, 24, 0.06, 12), steel));

    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.075, 18, 56), ringMat);
    ring.position.set(0.42, -1.2, 0);
    ring.scale.set(1, 0.82, 1);
    g.add(ring);
    return g;
  }

  const root = new THREE.Group();
  const inner = new THREE.Group();
  inner.position.y = -0.5;
  root.add(inner);

  const aWrap = new THREE.Group();
  const bWrap = new THREE.Group();
  const a = half();
  a.position.z = 0.03;
  const b = half();
  b.scale.x = -1;
  b.position.z = -0.03;
  // Упор для пальца на одной половинке
  const tangCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.6, -1.45, 0), new THREE.Vector3(0.82, -1.75, 0), new THREE.Vector3(0.7, -2.05, 0),
  ]);
  b.add(new THREE.Mesh(new THREE.TubeGeometry(tangCurve, 16, 0.04, 10), ringMat));
  aWrap.add(a);
  bWrap.add(b);
  inner.add(aWrap, bWrap);

  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.16, 24), pinMat);
  pin.rotation.x = Math.PI / 2;
  inner.add(pin);

  return {
    root,
    setOpen(o, t, speed) {
      // В полёте ножницы «стригут» быстрее
      const snip = 0.5 + 0.5 * Math.sin(t * (2.2 + speed * 9));
      const amount = Math.min(1, o * 0.6 + snip * (0.25 + speed * 0.4));
      const ang = amount * 0.55;
      aWrap.rotation.z = ang;
      bWrap.rotation.z = -ang;
    },
  };
}

function buildRazor(steel, scaleMat, pinMat) {
  const root = new THREE.Group();
  const inner = new THREE.Group();
  inner.position.x = -1.0;
  root.add(inner);

  // Накладки рукояти (молочные), от оси вправо
  const hs = new THREE.Shape();
  const L = 2.35, H = 0.2;
  hs.moveTo(0, -H);
  hs.lineTo(L - 0.25, -H * 0.85);
  hs.quadraticCurveTo(L, -H * 0.8, L, 0);
  hs.quadraticCurveTo(L, H * 0.8, L - 0.25, H * 0.85);
  hs.lineTo(0, H);
  hs.quadraticCurveTo(-0.22, H, -0.22, 0);
  hs.quadraticCurveTo(-0.22, -H, 0, -H);
  const scaleGeo = new THREE.ExtrudeGeometry(hs, EXTRUDE(0.045, 0.02));
  const s1 = new THREE.Mesh(scaleGeo, scaleMat);
  s1.position.z = 0.04;
  const s2 = new THREE.Mesh(scaleGeo, scaleMat);
  s2.position.z = -0.085;
  inner.add(s1, s2);

  for (const x of [0, L - 0.15]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 16), pinMat);
    p.rotation.x = Math.PI / 2;
    p.position.x = x;
    inner.add(p);
  }

  // Лезвие: хвостовик, обух сверху, режущая кромка снизу, скруглённый носок
  const bs = new THREE.Shape();
  bs.moveTo(-0.05, -0.1);
  bs.lineTo(0.38, -0.13);
  bs.quadraticCurveTo(1.2, -0.42, 1.95, -0.36);
  bs.quadraticCurveTo(2.2, -0.05, 1.98, 0.27);
  bs.lineTo(0.5, 0.25);
  bs.lineTo(0.32, 0.12);
  bs.lineTo(-0.05, 0.1);
  bs.closePath();
  const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(bs, EXTRUDE(0.022, 0.01)), steel);
  blade.position.z = -0.011;
  const bladeWrap = new THREE.Group();
  bladeWrap.add(blade);
  inner.add(bladeWrap);

  return {
    root,
    setOpen(o) {
      bladeWrap.rotation.z = o * Math.PI * 0.92;
    },
  };
}

if (canvas && webglOk()) init();
