import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, useGLTF } from '@react-three/drei';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CARS, DEFAULT_CAR } from './cars';
import { LAP, SEQUENCE, sampleLap, sampleSwap } from './circuit';
import { getDock, onDock } from './dock';
import styles from './CarStage.module.css';

// Every model is normalised to this length on load, so one camera path covers
// all of them regardless of the scale each was authored at.
const CAR_LENGTH = 4.3;

// Half-extents of a normalised car: half-width, half-height, half-length.
// Fitting a bounding SPHERE instead of this box is what made the car tiny —
// the sphere enclosing a 4.3 m long, 1.1 m tall car has a radius of 2.5 m, so
// it reserves more than a metre of empty margin above and below the bodywork.
const HALF = [0.95, 0.6, 2.15];

/**
 * Distance at which the car exactly fills the frame from a given direction.
 *
 * Standard AABB projection onto the camera's right/up axes: the projected
 * half-extent on an axis is the sum of each half-extent times the absolute
 * component of that axis. Then solve the larger of the two required distances
 * so neither dimension overflows.
 */
function fitDistance(eyeDir, up, vFov, aspect, rollDeg = 0) {
  const fwd = eyeDir.clone().normalize().negate();
  const right = new THREE.Vector3().crossVectors(up, fwd).normalize();
  const camUp = new THREE.Vector3().crossVectors(fwd, right).normalize();

  // Roll turns the frame about the view axis, which swaps how much of the car
  // lands on each screen axis. Fitting without it would size for the unrolled
  // frame and then crop.
  if (rollDeg) {
    const r = THREE.MathUtils.degToRad(rollDeg);
    right.applyAxisAngle(fwd, r);
    camUp.applyAxisAngle(fwd, r);
  }

  const halfW = Math.abs(right.x) * HALF[0]
    + Math.abs(right.y) * HALF[1]
    + Math.abs(right.z) * HALF[2];
  const halfH = Math.abs(camUp.x) * HALF[0]
    + Math.abs(camUp.y) * HALF[1]
    + Math.abs(camUp.z) * HALF[2];

  const tanV = Math.tan(vFov / 2);
  const tanH = Math.tan(vFov / 2) * aspect;
  return Math.max(halfH / tanV, halfW / tanH);
}

/**
 * Environment lighting.
 *
 * The MP4/4's CarPaint carries KHR_materials_clearcoat at 0.85; a clearcoat
 * needs something to reflect and punctual lights give it nothing.
 * RoomEnvironment is procedural — real reflections for a few kB of JS and zero
 * network bytes. drei's <Environment preset> would fetch a 1-3 MB HDR instead.
 */
function Gloss() {
  const get = useThree((s) => s.get);

  useEffect(() => {
    const { gl, scene, invalidate } = get();
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;
    // A bright white box at full strength floods saturated paint, and ACES then
    // rolls the blown channels toward white — which is how Rosso Corsa turns
    // into pale salmon.
    scene.environmentIntensity = 0.55;
    invalidate();
    return () => {
      scene.environment = null;
      env.texture.dispose();
      pmrem.dispose();
    };
  }, [get]);

  return null;
}

function Car({ url, yawRef, fadeRef }) {
  const { scene: cached } = useGLTF(url);
  const get = useThree((s) => s.get);
  const turn = useRef(null);
  const lastFade = useRef(-1);

  // Clone the cached scene AND its materials.
  //
  // Two reasons, both load-bearing. During a handover both cars are mounted at
  // once, and the MP4/4 appears twice in the lap — without a clone the second
  // mount would share materials with the first and fading one would fade the
  // other. And opacity is written per-instance below, which must not leak back
  // into the shared cache and dim the model the next time it is used.
  const scene = useMemo(() => {
    const copy = cached.clone(true);
    copy.traverse((o) => {
      if (!o.material) return;
      o.material = Array.isArray(o.material)
        ? o.material.map((m) => m.clone())
        : o.material.clone();
    });
    return copy;
  }, [cached]);

  // The Rig writes the lap's yaw every frame; applying it here rather than as
  // a prop keeps the car off React's render path entirely.
  useFrame(() => {
    if (turn.current && yawRef) {
      turn.current.rotation.y = THREE.MathUtils.degToRad(yawRef.current);
    }

    // Cross-dissolve. Guarded on change: traversing a few hundred meshes every
    // frame to write the same number would be pure waste, and a handover only
    // occupies a fraction of the lap.
    const want = fadeRef ? fadeRef.current : 1;
    if (Math.abs(want - lastFade.current) < 0.004) return;
    lastFade.current = want;

    const solid = want > 0.995;
    scene.traverse((o) => {
      const m = o.material;
      if (!m) return;
      const mats = Array.isArray(m) ? m : [m];
      mats.forEach((mm) => {
        mm.transparent = !solid;
        mm.opacity = want;
        // Keeping depth writes on through a fade makes the outgoing car punch
        // a hole in the incoming one. Off until it is essentially solid.
        mm.depthWrite = solid;
      });
    });
  });

  // Normalise whatever arrived. The downloaded cars are modelled at their own
  // scale, sitting at their own origin, pointing whichever way the author left
  // them. A derivation of `scene`, not state — doing this in an effect and
  // calling setState would cascade a render on every swap.
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const longest = Math.max(size.x, size.z);
    return {
      scale: longest > 0 ? CAR_LENGTH / longest : 1,
      offset: [-centre.x, -box.min.y, -centre.z],
      swap: size.x > size.z,
    };
  }, [scene]);

  useEffect(() => {
    const { gl, invalidate } = get();
    const maxAniso = gl.capabilities.getMaxAnisotropy();

    scene.traverse((o) => {
      const m = o.material;
      if (!m) return;

      // Anisotropic filtering. The biggest sharpness win for a car seen at an
      // angle — without it every decal on an oblique surface smears.
      if (m.map && m.map.anisotropy !== maxAniso) {
        m.map.anisotropy = maxAniso;
        m.map.needsUpdate = true;
      }

      // A whisper of self-illumination on the red, so the paint carries a
      // little light of its own in the dark rather than going flat black
      // wherever the key does not reach. Scaled by how red the surface
      // already is, so carbon, rubber and metal are untouched.
      if (m.color && m.emissive) {
        const { r, g, b } = m.color;
        const redness = Math.max(0, r - Math.max(g, b));
        if (redness > 0.12) {
          m.emissive.setRGB(0.78, 0.06, 0.11);
          m.emissiveIntensity = 0.16 * redness;
        }
      }

      // Sharpen the clearcoat so highlights read as wet paint, not plastic.
      if (m.clearcoat !== undefined && m.clearcoat > 0) {
        m.clearcoatRoughness = Math.min(m.clearcoatRoughness ?? 0.08, 0.06);
      }
    });

    invalidate();
  }, [scene, get]);

  // Outer group turns the car into the lap so its nose always leads; inner
  // groups normalise whatever scale and axis the model arrived at. Kept
  // separate so the two never have to be reasoned about together.
  return (
    <group ref={turn}>
      <group rotation={[0, fit.swap ? Math.PI / 2 : 0, 0]} scale={fit.scale}>
        <group position={fit.offset}>
          <primitive object={scene} />
        </group>
      </group>
    </group>
  );
}

/**
 * Drives the camera from scroll and reports which car should be resident.
 *
 * Damped rather than snapped to the sampled value: a raw mapping tracks the
 * scroll wheel's own jitter, and the result feels mechanical. The damping also
 * gives the canvas a natural stopping condition — it keeps asking for frames
 * only while it is still settling.
 */
function Rig({
  progress, onCar, onOutgoing, invalidateRef, yawRef, fadeInRef, fadeOutRef,
  tunnelRef,
}) {
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const eye = useRef(new THREE.Vector3(0, 12, 0.2));
  const aim = useRef(new THREE.Vector3(0, 0.3, 0));
  const fov = useRef(17);
  const roll = useRef(90);
  const dockNow = useRef({ x: 0, y: 0, scale: 1 });
  const pinned = useRef(null);
  const car = useRef(null);
  const outgoing = useRef(null);

  // Hand the scroll listener a way to ask for a frame. Without this the camera
  // would only move when something else happened to trigger a draw.
  useEffect(() => {
    if (invalidateRef) invalidateRef.current = invalidate;
    return () => {
      if (invalidateRef) invalidateRef.current = null;
    };
  }, [invalidateRef, invalidate]);

  // A section claiming or releasing the dock has to wake the canvas too —
  // that movement is not caused by scrolling and would otherwise never draw.
  useEffect(() => onDock((d) => {
    // `hold` is how completely a section owns the screen, already computed for
    // pinning the lap. Reused here so the render recedes behind reading and
    // returns full strength in the gaps — one number, one behaviour.
    //
    // Fade only where the car is BEHIND the text, never where it is beside it.
    //
    // A full-width section pushes the car nowhere (x = 0) and lays type right
    // across it — there it must recede to 12% or it is a dull grey shape
    // behind the words. A section that shares the frame pushes the car well
    // aside (|x| ~ 0.45) and means it to be looked at; fading that one guts
    // the very shots it exists for.
    //
    // The dock's own offset already distinguishes the two, so it decides.
    const aside = Math.min(1, Math.abs(d.x) / 0.4);
    // 0.48 floor, not 0.12. Twelve per cent was not atmosphere, it was
    // absence — the car could barely be seen at all. Just under half keeps
    // it plainly there behind the type without competing with it.
    const focus = 1 - 0.52 * Math.min(1, Math.max(0, d.hold)) * (1 - aside);
    document.documentElement.style.setProperty('--stage-focus', focus.toFixed(3));
    invalidate();
  }), [invalidate]);

  useFrame((state, delta) => {
    // While a section owns the screen the lap is pinned where it was when the
    // section took over, so the car sits still to be looked at instead of
    // crawling round behind someone who is reading. `hold` ramps, so the
    // camera eases to a stop rather than freezing mid-move.
    const want = getDock();
    if (want.hold > 0.5) {
      if (pinned.current === null) pinned.current = progress.current;
    } else {
      pinned.current = null;
    }
    // The lap SLOWS through a section, it does not stop.
    //
    // This used to multiply by `(1 - hold)`, and hold reaches 1.0 whenever a
    // section owns the screen — so the lap froze outright and the car became a
    // still photograph for the whole of a long block like Experience. The
    // intent was to stop it crawling round behind someone reading; the effect
    // was a dead frame.
    //
    // 0.58 leaves 42% of normal speed at full hold: slow enough that it never
    // pulls the eye off the text, fast enough that the car is plainly alive
    // and the light keeps moving across it. A camera that stops moving stops
    // being a camera.
    const at = pinned.current === null
      ? progress.current
      : pinned.current + (progress.current - pinned.current) * (1 - want.hold * 0.58);

    const s = sampleLap(at);

    // Handover. Both cars stay mounted across the swap window and dissolve
    // into one another. `sampleSwap` reads scroll position rather than running
    // a timer, so scrubbing backwards runs the dissolve backwards instead of
    // desyncing, and nothing animates while the page sits still.
    const swap = sampleSwap(at);
    if (swap) {
      // Smoothstep, so the changeover has no hard start or stop.
      const e = swap.k * swap.k * (3 - 2 * swap.k);
      if (outgoing.current !== swap.from) {
        outgoing.current = swap.from;
        onOutgoing(swap.from);
      }
      fadeOutRef.current = 1 - e;
      fadeInRef.current = e;
      invalidate();
    } else if (outgoing.current !== null) {
      outgoing.current = null;
      onOutgoing(null);
      fadeOutRef.current = 0;
      fadeInRef.current = 1;
    } else {
      fadeInRef.current = 1;
    }

    if (s.car !== car.current) {
      car.current = s.car;
      onCar(s.car, s.next);
    }

    // How far the car has turned into the lap. Read by <Car> next frame.
    if (yawRef) yawRef.current = s.yaw;
    // Published for the light rig, which dims with it.
    if (tunnelRef) tunnelRef.current = s.tunnel;

    const aspect = size.width / Math.max(1, size.height);
    const vFov = (s.fov * Math.PI) / 180;
    const dir = new THREE.Vector3(...s.dir).normalize();
    const worldUp = new THREE.Vector3(0, 1, 0);

    // A car is long and thin, so its long axis has to lie along the screen's
    // long axis or the short axis fills and the rest is empty. On a portrait
    // viewport that means a quarter turn off every keyframe's roll — without
    // it the phone fills 93% of the width and 20% of the height, which is the
    // same wasted space the desktop had, rotated.
    const rollEff = s.roll + (aspect < 1 ? -90 : 0);

    // Damped separately from the camera so a section arriving mid-corner does
    // not fight the lap. `want` was already read above to decide the pin.
    const d = dockNow.current;
    const dk = 1 - Math.exp(-7 * Math.min(delta, 0.05));
    d.x += (want.x - d.x) * dk;
    d.y += (want.y - d.y) * dk;
    d.scale += (want.scale - d.scale) * dk;

    // 1.08 leaves an eighth of the shorter axis as breathing room. Then the
    // lap's own distance factor (tight in corners, open on straights), then
    // however far the section has pushed the car back.
    const base = fitDistance(dir, worldUp, vFov, aspect, rollEff) * 1.08;
    const distance = (base * s.dist) / Math.max(0.06, d.scale);

    // Docking slides the AIM POINT sideways in screen space rather than moving
    // the car in world space — the car keeps its place on the circuit and only
    // the framing changes. Offsets are in half-frames at the fitted distance,
    // so they hold at any viewport size.
    const halfH = Math.tan(vFov / 2) * distance;
    const halfW = halfH * aspect;
    const fwd = dir.clone().negate();
    // right = fwd × up, NOT up × fwd. The two differ by a sign, and the wrong
    // one made every dock push the car to the SAME side as the text instead of
    // the opposite one — the car ended up behind the copy on every section
    // while the free half of the frame sat empty. camUp is unchanged by the
    // swap (cross(right, fwd) with the corrected right gives the same vector
    // as cross(fwd, right) did with the old one), so vertical docking and the
    // mobile corner park are unaffected.
    const right = new THREE.Vector3().crossVectors(fwd, worldUp).normalize();
    const camUp = new THREE.Vector3().crossVectors(right, fwd).normalize();

    // Roll these too, exactly as fitDistance does.
    //
    // The camera is rolled about the view axis AFTER lookAt, so an offset
    // computed on the un-rolled axes points somewhere else by the time it is
    // seen. At the plan views, which roll a full 90 degrees, a sideways dock
    // push became a straight-up push and threw the car off the top of the
    // frame — measured at 1-3% of frame height during the hold, and entirely
    // out of shot on the way in. Rolling the basis keeps "left" meaning left
    // on screen at every attitude.
    if (Math.abs(rollEff) > 0.01) {
      const rr = THREE.MathUtils.degToRad(rollEff);
      right.applyAxisAngle(fwd, rr);
      camUp.applyAxisAngle(fwd, rr);
    }

    // Composition + docking, in that order of authority.
    //
    // `s.frame` is where the shot wants the car to sit — lead room, or low with
    // air above it. `d` is where the SECTION wants it, to clear the text. When
    // a section takes over, its need wins: the compositional offset is faded
    // out by how hard the dock is pulling, so the two never stack up and shove
    // the car off the edge of the frame.
    const free = Math.max(0, 1 - Math.abs(d.x));
    const fx = (s.frame?.[0] ?? 0) * free;
    const fy = (s.frame?.[1] ?? 0) * free;

    const wantAim = new THREE.Vector3(0, 0.34, 0)
      .addScaledVector(right, -(d.x + fx) * halfW)
      .addScaledVector(camUp, -(d.y + fy) * halfH);
    const wantEye = dir.multiplyScalar(distance).add(wantAim);

    // Frame-rate independent damping.
    const k = 1 - Math.exp(-6 * Math.min(delta, 0.05));
    eye.current.lerp(wantEye, k);
    aim.current.lerp(wantAim, k);
    fov.current += (s.fov - fov.current) * k;
    roll.current += (rollEff - roll.current) * k;

    // Not `invalidate` — the Rig already holds one from useThree above, and
    // re-destructuring it here put the whole function body in its temporal
    // dead zone, so the swap block's call threw on every single frame.
    const { camera, scene } = get();
    camera.up.set(0, 1, 0);
    camera.position.copy(eye.current);
    camera.lookAt(aim.current);
    // Roll about the view axis, after lookAt has established the orientation.
    if (Math.abs(roll.current) > 0.01) {
      camera.rotateZ(THREE.MathUtils.degToRad(roll.current));
    }
    camera.fov = fov.current;
    camera.near = Math.max(0.1, distance - HALF[2] * 3);
    camera.far = distance + HALF[2] * 20;
    camera.updateProjectionMatrix();

    // The tunnel is the one stretch of a Monaco lap with no sky. Pull the
    // environment down through it so the car falls back on rim light, then
    // comes back out into the open.
    if (scene.environmentIntensity !== undefined) {
      scene.environmentIntensity = 0.55 - 0.34 * s.tunnel;
    }

    // Keep drawing while the camera or the dock is still settling.
    if (eye.current.distanceToSquared(wantEye) > 1e-5
      || Math.abs(want.scale - d.scale) > 1e-4) invalidate();
  });

  return null;
}

/**
 * The rig, dimmed through the tunnel.
 *
 * The tunnel used to ramp only `environmentIntensity`, which is reflections —
 * the three lights below carried on at full power, so the "dark" stretch never
 * got dark. Measured peak luminance through it: 243-255, indistinguishable
 * from open track.
 *
 * The key and fill drop to a fifth; the Rosso rim is left almost untouched, so
 * the car keeps a lit edge and reads as a shape in the dark rather than
 * disappearing. That contrast is the whole point of a tunnel.
 */
function Lights({ tunnelRef }) {
  const key = useRef(null);
  const fill = useRef(null);
  const rim = useRef(null);
  const last = useRef(-1);
  const get = useThree((s) => s.get);

  useFrame(() => {
    const t = tunnelRef?.current ?? 0;
    if (Math.abs(t - last.current) < 0.01) return;
    last.current = t;
    if (key.current) key.current.intensity = 0.85 * (1 - 0.80 * t);
    if (fill.current) fill.current.intensity = 0.22 * (1 - 0.85 * t);
    if (rim.current) rim.current.intensity = 0.9 * (1 - 0.15 * t);
    get().invalidate();
  });

  return (
    <>
      <directionalLight ref={key} position={[2.5, 9, 4]} intensity={0.85} />
      <directionalLight ref={fill} position={[-6, 4, -3]} intensity={0.22} color="#c8d4ff" />
      {/* Rim from behind, in Rosso. Separates the bodywork from the ground at
          grazing camera angles, where the key alone leaves it a silhouette. */}
      <directionalLight ref={rim} position={[-3, 1.4, -6]} intensity={0.9} color="#c8102e" />
    </>
  );
}

/**
 * Ground.
 *
 * Without this the car hangs in a void and the whole flight reads as a render
 * rather than a place — the exact complaint. A plane the camera can graze, a
 * contact shadow so the tyres are planted, and painted lines to give the eye
 * something to measure the motion against.
 */
function Ground() {
  // One texture, tiled for the lines, and a second single-shot texture used as
  // an alpha mask. A plane with a hard edge reads as a grey stripe across the
  // frame the moment the camera drops near the deck; fading it to nothing
  // radially means there is no horizon to see.
  const [lines, fade] = useMemo(() => {
    const grid = document.createElement('canvas');
    grid.width = grid.height = 256;
    const g = grid.getContext('2d');
    g.fillStyle = '#0a0a0b';
    g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(255,255,255,0.05)';
    g.lineWidth = 1;
    for (let i = 0; i <= 256; i += 32) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke();
      g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke();
    }
    const lineTex = new THREE.CanvasTexture(grid);
    lineTex.wrapS = lineTex.wrapT = THREE.RepeatWrapping;
    lineTex.repeat.set(14, 14);
    lineTex.anisotropy = 8;

    const mask = document.createElement('canvas');
    mask.width = mask.height = 256;
    const m = mask.getContext('2d');
    const r = m.createRadialGradient(128, 128, 8, 128, 128, 124);
    r.addColorStop(0, '#ffffff');
    r.addColorStop(0.42, 'rgba(255,255,255,0.55)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    m.fillStyle = r;
    m.fillRect(0, 0, 256, 256);
    const fadeTex = new THREE.CanvasTexture(mask);

    return [lineTex, fadeTex];
  }, []);

  useEffect(() => () => {
    lines.dispose();
    fade.dispose();
  }, [lines, fade]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.004, 0]} receiveShadow>
        <planeGeometry args={[34, 34]} />
        <meshStandardMaterial
          map={lines}
          alphaMap={fade}
          transparent
          depthWrite={false}
          color="#0e1013"
          roughness={0.9}
          metalness={0.03}
        />
      </mesh>
      <ContactShadows
        position={[0, 0.006, 0]}
        opacity={0.9}
        scale={11}
        blur={2.4}
        far={3}
        resolution={512}
        color="#000000"
      />
    </group>
  );
}

/**
 * One fixed canvas behind the whole document.
 *
 * Sections scroll over it with solid backgrounds; the gaps between them are
 * windows onto this. Because there is a single continuous camera rather than
 * one per band, the car appears to keep moving between windows instead of
 * resetting — which is the whole point.
 */
export default function CarStage({ progress, invalidateRef }) {
  const [active, setActive] = useState(DEFAULT_CAR);
  // The car being dissolved out. Null except during a handover, so the second
  // <Car> only exists for the fraction of the lap that needs it.
  const [leaving, setLeaving] = useState(null);
  const loaded = useRef([DEFAULT_CAR]);
  const yawRef = useRef(0);
  const fadeIn = useRef(1);
  const fadeOut = useRef(0);
  const tunnel = useRef(0);

  const onCar = (next, upcoming) => {
    setActive(next);

    // Two cars of lead, not one — see preloadAhead.
    if (upcoming && CARS[upcoming] && !loaded.current.includes(upcoming)) {
      loaded.current.push(upcoming);
    }
    preloadAhead(next);

    // Drop anything two swaps behind. All five resident at once is 10.8 MB and
    // roughly 700k triangles, which is more than this needs to hold.
    const order = loaded.current;
    const here = order.indexOf(next);
    order.slice(0, Math.max(0, here - 1)).forEach((k) => {
      if (CARS[k]) useGLTF.clear(CARS[k].url);
    });
    if (here > 1) loaded.current = order.slice(here - 1);
  };

  return (
    <div className={styles.stage} aria-hidden="true">
      <Canvas
        className={styles.canvas}
        // On demand: the Rig re-invalidates while the camera is settling, so
        // frames are drawn during scroll and not while the page sits still.
        frameloop="demand"
        dpr={[1, 2]}
        camera={{ position: [0, 12, 0.2], fov: 16, near: 0.1, far: 90 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          // Under 1.0 on purpose: ACES lifts midtones and the paint must not
          // drift off its specified hex.
          toneMappingExposure: 0.9,
        }}
        style={{ background: 'transparent' }}
      >
        <Rig
          progress={progress}
          onCar={onCar}
          onOutgoing={setLeaving}
          invalidateRef={invalidateRef}
          yawRef={yawRef}
          fadeInRef={fadeIn}
          fadeOutRef={fadeOut}
          tunnelRef={tunnel}
        />
        <Gloss />
        <Lights tunnelRef={tunnel} />
        <Ground />
        {/* Both cars are on stage only across a handover. The outgoing one is
            listed first so it draws before the incoming car during the
            dissolve. Separate Suspense boundaries: if the incoming model is
            still arriving, the outgoing one must keep rendering rather than
            both being suspended and the frame going empty — which is exactly
            what the old single boundary did. */}
        {leaving && leaving !== active ? (
          <Suspense fallback={null}>
            <Car
              key={`out-${leaving}`}
              url={(CARS[leaving] ?? CARS[DEFAULT_CAR]).url}
              yawRef={yawRef}
              fadeRef={fadeOut}
            />
          </Suspense>
        ) : null}
        <Suspense fallback={null}>
          <Car
            key={`in-${active}`}
            url={(CARS[active] ?? CARS[DEFAULT_CAR]).url}
            yawRef={yawRef}
            fadeRef={fadeIn}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

/**
 * Preload the first car eagerly, and keep TWO more ready ahead of the lap.
 *
 * One step ahead was not enough: someone who drags the scrollbar jumps two or
 * three cars forward, the model is not there, and the frame is empty.
 * Measured by sampling in 6.7% jumps — three of sixteen points came back
 * completely black, peak luminance 22-31.
 *
 * Preloading all four at idle fixed that and cost too much: 8.6 MB pulled for
 * a visitor who may never leave the first screen, and enough sustained load to
 * make the page miss frames while it happened. Two ahead covers any plausible
 * jump for a fraction of the bytes, and the work is spread across the lap
 * instead of landing in one burst.
 */
function preloadAhead(from) {
  const order = SEQUENCE;
  const i = order.indexOf(from);
  if (i < 0) return;
  order.slice(i + 1, i + 3).forEach((k) => {
    if (CARS[k]) useGLTF.preload(CARS[k].url);
  });
}


export { LAP };
