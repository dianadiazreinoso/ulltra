/* =============================================================================
   ARCHETYPE · sculpture-gl.module.js
   -----------------------------------------------------------------------------
   A real React Three Fiber / Three.js island that loads the cara.glb sculpture
   and renders it as a luxury, Apple-Vision-Pro-grade product beat:

     · GLB loaded with drei useGLTF + <Suspense> (progressive loading + progress)
     · HDRI "studio" lighting built procedurally from <Lightformer> softboxes
       inside drei <Environment> — image-based lighting, NO external HDR fetch
     · drei <ContactShadows> for a soft grounded floor shadow
     · N8AO ambient occlusion (postprocessing)
     · very subtle <Bloom>
     · cinematic ACES filmic <ToneMapping> via EffectComposer
     · SCROLL → rotation (the shell's GSAP ScrollTrigger writes window.__archetype
       .rotTarget; we lerp toward it each frame for buttery 60fps)
     · CURSOR → an independent, springy 3D tilt layered on top of the scroll spin

   Pure ESM + htm (no JSX build step). Mounts itself into the .sc-gl host that the
   React shell renders; polls until the host exists so it works in either page.
   ========================================================================== */

import * as THREE from "three";
import React, { Suspense, useRef, useMemo, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import htm from "htm";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, ContactShadows, Environment, Lightformer, Center, useProgress, AdaptiveDpr } from "@react-three/drei";
import { EffectComposer, N8AO, Bloom, ToneMapping, SMAA } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";

const html = htm.bind(React.createElement);
const MODEL_URL = "assets/sculpture/cara.glb";

// Shared bridge with the shell (scroll → rotation). Defined defensively.
window.__archetype = window.__archetype || { rotTarget: 0, angleDeg: 0, ready: false };
// Base yaw that turns the GLB's natural orientation to face the camera (the raw
// model rests in profile; this rotates the FACE toward the viewer). The earlier
// value rested the model on its BACK (face pointing away), so the section opened
// on the least interesting view. Flipped 180 deg so the face is front-facing at
// rest — the scroll spin now begins and settles on the front.
window.__archetype.baseYaw = -1.811 + Math.PI;

/* ── The model ────────────────────────────────────────────────────────────── */
function Sculpture() {
  const { scene } = useGLTF(MODEL_URL);
  const groupRef = useRef();
  const sm = useRef({ rot: 0, cx: 0, cy: 0 });   // smoothed values
  const mouse = useRef({ x: 0, y: 0 });
  const invalidate = useThree((s) => s.invalidate);   // request a render on demand
  const glDom = useThree((s) => s.gl.domElement);
  const inView = useRef(true);                          // gate rendering to on-screen

  // Normalise: recenter at origin + scale longest axis to a fixed size, and
  // enable shadows + crisp IBL response on every mesh. Runs once per model.
  const prepared = useMemo(() => {
    const clone = scene;
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = 2.25 / maxDim;
    clone.scale.setScalar(s);
    clone.position.set(-center.x * s, -center.y * s, -center.z * s);
    clone.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        o.frustumCulled = false;
        const m = o.material;
        if (m) {
          m.envMapIntensity = 1.15;
          if (m.roughness !== undefined) m.roughness = Math.min(m.roughness ?? 0.7, 0.85);
          m.needsUpdate = true;
        }
      }
    });
    let meshes = 0; clone.traverse((o) => { if (o.isMesh) meshes++; });
    window.__archetype.modelInfo = {
      meshes, scaledSize: [+(size.x*s).toFixed(2), +(size.y*s).toFixed(2), +(size.z*s).toFixed(2)],
    };
    console.log("[archetype] model prepared:", JSON.stringify(window.__archetype.modelInfo));
    return clone;
  }, [scene]);

  // Independent cursor tilt (works even when scroll/rotation is static).
  // With frameloop="demand" we must explicitly request a render whenever the
  // pose can change (cursor) — and ONLY while the canvas is on-screen.
  useEffect(() => {
    window.__archetype.group = groupRef.current;
    window.__archetype.invalidate = invalidate;   // the shell's scroll bridge kicks renders
    const onMove = (e) => {
      if (!inView.current) return;                  // ignore cursor while off-screen
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
      invalidate();
    };
    const onLeave = () => { mouse.current.x = 0; mouse.current.y = 0; if (inView.current) invalidate(); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    // Render ONLY while the canvas is actually visible. Off-screen → no renders.
    let io = null;
    if (glDom && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver((entries) => {
        const vis = entries.some((en) => en.isIntersecting);
        inView.current = vis;
        if (vis) invalidate();                       // repaint the latest pose on re-entry
      }, { threshold: 0 });
      io.observe(glDom);
    }

    invalidate();                                    // one initial paint
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (io) io.disconnect();
    };
  }, [invalidate, glDom]);

  useFrame((_, dt) => {
    const a = window.__archetype || {};
    const k = 1 - Math.pow(0.001, dt);           // frame-rate independent lerp
    sm.current.rot += ((a.rotTarget || 0) - sm.current.rot) * Math.min(k * 1.1, 1);
    sm.current.cx  += (mouse.current.x - sm.current.cx) * Math.min(k * 0.8, 1);
    sm.current.cy  += (mouse.current.y - sm.current.cy) * Math.min(k * 0.8, 1);
    const g = groupRef.current;
    const base = (a.baseYaw || 0);
    if (g) {
      if (typeof a.forceYaw === "number") {        // debug: lock to an absolute yaw
        g.rotation.y = base + a.forceYaw;
        g.rotation.x = 0; g.position.x = 0; g.position.y = 0;
      } else {
        g.rotation.y = base + sm.current.rot + sm.current.cx * 0.26;  // spin + cursor yaw
        g.rotation.x = sm.current.cy * 0.16;                          // cursor pitch
        g.position.x = sm.current.cx * 0.12;                          // subtle parallax
        g.position.y = -sm.current.cy * 0.06;
      }
    }
    a.angleDeg = ((sm.current.rot * 180 / Math.PI) % 360 + 360) % 360;

    // Demand loop: keep requesting frames only while something is still moving
    // AND the canvas is on-screen. When the pose settles (or we scroll away) the
    // loop goes idle — zero renders — instead of running continuously.
    const moving =
      Math.abs((a.rotTarget || 0) - sm.current.rot) > 0.0004 ||
      Math.abs(mouse.current.x - sm.current.cx) > 0.0004 ||
      Math.abs(mouse.current.y - sm.current.cy) > 0.0004 ||
      typeof a.forceYaw === "number";
    if (inView.current && moving) invalidate();
  });

  return html`
    <${Center} disableY>
      <group ref=${groupRef}>
        <primitive object=${prepared} />
      </group>
    <//>
  `;
}

function DebugBridge() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    window.__archetype.three = { gl, scene, camera };
  }, [gl, scene, camera]);
  return null;
}

/* ── Procedural studio HDRI from soft light planes (no external fetch) ─────── */
function StudioEnvironment() {
  return html`
    <${Environment} resolution=${256} frames=${1}>
      <group rotation=${[0, 0, 0]}>
        <${Lightformer} intensity=${2.6} position=${[0, 2.4, 4]} scale=${[9, 9, 1]} color="#fff6ec" />
        <${Lightformer} intensity=${1.5} position=${[-5, 1, 2]} scale=${[4, 9, 1]} color="#ffe2c2" />
        <${Lightformer} intensity=${1.8} position=${[5, 2, -2]} scale=${[6, 7, 1]} color="#cfe0ff" />
        <${Lightformer} form="ring" intensity=${1.1} position=${[0, 5, -3]} scale=${5} color="#ffffff" />
        <${Lightformer} intensity=${0.7} position=${[0, -3, 3]} scale=${[8, 4, 1]} color="#6a6f80" />
      </group>
    <//>
  `;
}

/* ── Scene (everything that suspends sits under one <Suspense>) ───────────── */
/* ── Viewport helper: true at ≤680px, recalculated on resize ──────────────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" &&
    window.matchMedia("(max-width:680px)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width:680px)");
    const onChange = () => {
      setIsMobile(mq.matches);
      // frameloop="demand": kick a render so the change applies without scrolling
      if (window.__archetype && window.__archetype.invalidate) window.__archetype.invalidate();
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    window.addEventListener("resize", onChange, { passive: true });
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
      window.removeEventListener("resize", onChange);
    };
  }, []);
  return isMobile;
}

function Scene() {
  const isMobile = useIsMobile();
  // After the contact-shadow toggle commits, force one more on-demand render.
  useEffect(() => {
    if (window.__archetype && window.__archetype.invalidate) window.__archetype.invalidate();
  }, [isMobile]);
  return html`
    <${React.Fragment}>
      <ambientLight intensity=${0.18} />
      <directionalLight
        castShadow
        position=${[5, 8, 5]}
        intensity=${2.3}
        shadow-mapSize=${[1024, 1024]}
        shadow-bias=${-0.00018}
        shadow-normalBias=${0.02}
      >
        <orthographicCamera attach="shadow-camera" args=${[-4, 4, 4, -4, 0.1, 30]} />
      </directionalLight>
      <directionalLight position=${[-6, 3, -4]} intensity=${0.85} color="#ffd9b3" />
      <directionalLight position=${[0, 2, -7]} intensity=${1.15} color="#bcd4ff" />

      <${Sculpture} />
      <${DebugBridge} />

      <${StudioEnvironment} />

      ${!isMobile && html`
      <${ContactShadows}
        position=${[0, -1.2, 0]}
        opacity=${0.7}
        scale=${8}
        blur=${2.8}
        far=${3.4}
        resolution=${512}
        color="#000000"
      />
      `}

      ${!window.__NOPOST && html`
      <${EffectComposer} disableNormalPass multisampling=${0}>
        <${N8AO} halfRes color="black" aoRadius=${2.2} intensity=${1.25} aoSamples=${4} denoiseSamples=${3} denoiseRadius=${10} />
        <${Bloom} mipmapBlur intensity=${0.16} luminanceThreshold=${0.9} luminanceSmoothing=${0.22} />
        <${SMAA} />
        <${ToneMapping} mode=${ToneMappingMode.ACES_FILMIC} />
      <//>
      `}

      <${AdaptiveDpr} pixelated=${false} />
    <//>
  `;
}

/* ── Branded progress overlay (drei useProgress) ──────────────────────────── */
function Loader() {
  const { progress, active } = useProgress();
  const pct = Math.min(100, Math.round(progress));
  return html`
    <div class=${"sc-loader" + (active ? "" : " is-hidden")}>
      <div class="sc-loader-k">Cargando la pieza</div>
      <div class="sc-loader-bar"><div class="sc-loader-fill" style=${{ width: pct + "%" }}></div></div>
      <div class="sc-loader-pct">${String(pct).padStart(3, "0")}%</div>
    </div>
  `;
}

/* ── Island root ──────────────────────────────────────────────────────────── */
function Island() {
  return html`
    <${React.Fragment}>
      <${Loader} />
      <${Canvas}
        shadows
        frameloop="demand"
        dpr=${[1, 1.5]}
        gl=${{ antialias: false, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: false }}
        camera=${{ position: [0, 0.15, 4.7], fov: 32, near: 0.1, far: 100 }}
        onCreated=${({ gl }) => {
          gl.toneMapping = THREE.NoToneMapping;          // ACES applied in composer
          gl.outputColorSpace = THREE.SRGBColorSpace;
          window.__archetype.ready = true;
        }}
      >
        <${Suspense} fallback=${null}>
          <${Scene} />
        <//>
      <//>
    <//>
  `;
}

useGLTF.preload(MODEL_URL);

/* ── Mount: wait for the shell's host element, then render ─────────────────── */
window.__archetype.moduleRan = true;

function mountInto(host) {
  if (!host || host.__archetypeMounted) return;

  // Defer heavy WebGL init (R3F mount + three.js + shader compile) until the
  // branded loader's reveal animation has finished, so it doesn't contend with
  // the aperture expansion for the main thread. Pages without the loader (or if
  // the reveal never signals) mount immediately / after a safety timeout.
  if (!window.__ullRevealDone && document.getElementById("ull-loader")) {
    window.addEventListener("ull-reveal-done", function () { mountInto(host); }, { once: true });
    setTimeout(function () {
      if (!host.__archetypeMounted) { window.__ullRevealDone = true; mountInto(host); }
    }, 9000);
    return;
  }

  // Wait for layout to give the host real dimensions — R3F measures its
  // container on mount and caches 0 if it mounts pre-layout / off-screen.
  const r = host.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) { requestAnimationFrame(() => mountInto(host)); return; }

  host.__archetypeMounted = true;
  createRoot(host).render(html`<${Island} />`);

  // R3F (react-use-measure) re-measures on window resize, but it only attaches
  // that listener after React commits the Canvas — which on this heavy page can
  // be several seconds after mount (Babel compiling the rest of the app blocks
  // the main thread). So poll: keep firing resize until the canvas drawing
  // buffer actually matches the host, then stop. Self-terminating + robust.
  const fix = setInterval(() => {
    const cv = host.querySelector("canvas");
    const r = host.getBoundingClientRect();
    if (cv && r.width > 2 && Math.abs(cv.clientWidth - r.width) < 2 && cv.width > 2 &&
        Math.abs(cv.width / (window.devicePixelRatio || 1) - r.width) < r.width * 0.5) {
      clearInterval(fix);
      return;
    }
    window.dispatchEvent(new Event("resize"));
  }, 250);
  setTimeout(() => clearInterval(fix), 30000);

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        window.dispatchEvent(new Event("resize"));
        requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
      }
    }, { threshold: 0.01 });
    io.observe(host);
  }
}

(function mountWhenReady() {
  const existing = document.querySelector(".sc-gl");
  if (existing) { mountInto(existing); return; }
  // The host is rendered by the main site's React app, which can mount well
  // after this module loads — observe indefinitely rather than polling a finite
  // number of frames (which could expire during a heavy initial compile/mount).
  const obs = new MutationObserver(() => {
    const host = document.querySelector(".sc-gl");
    if (host) { obs.disconnect(); mountInto(host); }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
