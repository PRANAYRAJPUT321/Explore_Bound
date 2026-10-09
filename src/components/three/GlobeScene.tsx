"use client";

import { Stars, Trail } from "@react-three/drei";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { angularDistance, DEG, landDots, latLngToVector3, spinForLongitude } from "./geo";

export type GlobeMarker = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  region: "domestic" | "international";
  tagline?: string;
};

export type GlobeProps = {
  markers: GlobeMarker[];
  hub: { name: string; lat: number; lng: number };
  focus?: string | null;
  onSelect?: (slug: string) => void;
  showPlane?: boolean;
  showArcs?: boolean;
  showStars?: boolean;
  cameraZ?: number;
};

const R = 1;
const SUN = new THREE.Color("#ffb454");
const AQUA = new THREE.Color("#3fe6c9");
const SKY = new THREE.Color("#5cc8ff");
const VIOLET = new THREE.Color("#8b7bff");

/* ───────────── shaders ───────────── */

const sphereVert = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const sphereFrag = /* glsl */ `
  uniform vec3 uDeep;
  uniform vec3 uRim;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
    float light = max(dot(vNormal, normalize(vec3(-0.6, 0.7, 0.6))), 0.0);
    vec3 col = uDeep * (0.45 + 0.75 * light) + uRim * fres * 0.85;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const atmoFrag = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float i = pow(clamp(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 3.0);
    gl_FragColor = vec4(uColor * i * 1.25, i);
  }
`;

const arcVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const arcFrag = /* glsl */ `
  uniform float uTime;
  uniform float uOffset;
  uniform float uSpeed;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float head = fract(uTime * uSpeed + uOffset) * 1.7 - 0.35;
    float d = head - vUv.x;
    float trail = step(0.0, d) * clamp(1.0 - d / 0.42, 0.0, 1.0);
    float glow = smoothstep(0.035, 0.0, abs(d));
    float a = 0.22 + trail * 0.9 + glow * 1.2;
    vec3 col = mix(uColor, vec3(1.0), glow * 0.8);
    gl_FragColor = vec4(col * a, a);
  }
`;

/* ───────────── pieces ───────────── */

function LandDots({ step, hub }: { step: number; hub: GlobeProps["hub"] }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dots = useMemo(() => landDots(step), [step]);
  const radius = step * DEG * R * 0.3;

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const v = new THREE.Vector3();
    const c = new THREE.Color();
    dots.forEach(([lat, lng], i) => {
      latLngToVector3(lat, lng, R * 1.002, v);
      o.position.copy(v);
      o.lookAt(v.x * 2, v.y * 2, v.z * 2);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      const home = Math.max(0, 1 - angularDistance(lat, lng, hub.lat, hub.lng) / 22);
      const t = (lng + 180) / 360;
      c.copy(AQUA).lerp(SKY, t).lerp(VIOLET, Math.max(0, (Math.abs(lat) - 40) / 60));
      c.lerp(SUN, home * 0.95);
      c.multiplyScalar(0.55 + ((i * 9301 + 49297) % 233280) / 233280 * 0.55 + home * 0.4);
      mesh.setColorAt(i, c);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dots, hub.lat, hub.lng]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, dots.length]} frustumCulled={false}>
      <circleGeometry args={[radius, 6]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0.95} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}

function Arc({ from, to, color, offset, time }: { from: THREE.Vector3; to: THREE.Vector3; color: THREE.Color; offset: number; time: { value: number } }) {
  const geometry = useMemo(() => {
    const dist = from.distanceTo(to);
    const lift = R + 0.06 + dist * 0.42;
    const c1 = from.clone().lerp(to, 0.25).normalize().multiplyScalar(lift);
    const c2 = from.clone().lerp(to, 0.75).normalize().multiplyScalar(lift);
    const curve = new THREE.CubicBezierCurve3(from, c1, c2, to);
    return new THREE.TubeGeometry(curve, 72, 0.0036, 6, false);
  }, [from, to]);
  const uniforms = useMemo(
    () => ({ uTime: time, uOffset: { value: offset }, uSpeed: { value: 0.16 + (offset % 0.1) }, uColor: { value: color } }),
    [time, offset, color],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <shaderMaterial
        vertexShader={arcVert}
        fragmentShader={arcFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function Marker({
  m,
  active,
  onHover,
  onSelect,
  isHub,
}: {
  m: GlobeMarker | { slug: string; name: string; lat: number; lng: number; region: "domestic"; tagline?: string };
  active: boolean;
  onHover: (slug: string | null) => void;
  onSelect?: (slug: string) => void;
  isHub?: boolean;
}) {
  const ring = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Mesh>(null);
  const phase = useMemo(() => (m.lat * 13.7 + m.lng * 7.1) % 1, [m.lat, m.lng]);
  const { position, quaternion } = useMemo(() => {
    const p = latLngToVector3(m.lat, m.lng, R);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), p.clone().normalize());
    return { position: p, quaternion: q };
  }, [m.lat, m.lng]);
  const color = isHub ? "#ffffff" : m.region === "domestic" ? "#ffb454" : "#3fe6c9";
  const h = isHub ? 0.02 : 0.055;

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.55 + phase) % 1;
    if (ring.current) {
      const s = 1 + t * (isHub ? 3.2 : 2.2);
      ring.current.scale.setScalar(s);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.8;
    }
    if (head.current) {
      const target = active ? 1.9 : 1;
      head.current.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      {!isHub && (
        <mesh position={[0, h / 2, 0]}>
          <cylinderGeometry args={[0.0018, 0.0018, h, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.75} toneMapped={false} />
        </mesh>
      )}
      <mesh ref={head} position={[0, h, 0]}>
        <sphereGeometry args={[isHub ? 0.016 : 0.011, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[0.012, 0.016, 32]} />
        <meshBasicMaterial color={isHub ? "#ffb454" : color} transparent opacity={0.8} side={THREE.DoubleSide} toneMapped={false} depthWrite={false} />
      </mesh>
      {!isHub && (
        <mesh
          position={[0, h, 0]}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onHover(m.slug);
          }}
          onPointerOut={() => onHover(null)}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onSelect?.(m.slug);
          }}
        >
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

const planeGeometry = (() => {
  const g = new THREE.BufferGeometry();
  const nose = [0, 0, 1];
  const lw = [-0.75, 0.05, -0.55];
  const rw = [0.75, 0.05, -0.55];
  const back = [0, 0, -0.4];
  const keel = [0, -0.28, -0.5];
  const v = [...nose, ...lw, ...back, ...nose, ...back, ...rw, ...nose, ...keel, ...back, ...nose, ...back, ...keel];
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
})();

function PaperPlane() {
  const ref = useRef<THREE.Group>(null);
  const tilt = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler(0.55, 0, -0.35)), []);
  const tmp = useMemo(
    () => ({ p: new THREE.Vector3(), n: new THREE.Vector3(), f: new THREE.Vector3(), r: new THREE.Vector3(), u: new THREE.Vector3(), m: new THREE.Matrix4() }),
    [],
  );
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = clock.elapsedTime * 0.32;
    const rad = 1.3 + Math.sin(t * 2.3) * 0.04;
    tmp.p.set(Math.cos(t) * rad, Math.sin(t * 3) * 0.03, Math.sin(t) * rad).applyQuaternion(tilt);
    tmp.n.set(Math.cos(t + 0.01) * rad, Math.sin((t + 0.01) * 3) * 0.03, Math.sin(t + 0.01) * rad).applyQuaternion(tilt);
    tmp.f.subVectors(tmp.n, tmp.p).normalize();
    tmp.u.copy(tmp.p).normalize();
    tmp.r.crossVectors(tmp.u, tmp.f).normalize();
    tmp.u.crossVectors(tmp.f, tmp.r).normalize();
    tmp.m.makeBasis(tmp.r, tmp.u, tmp.f);
    g.position.copy(tmp.p);
    g.quaternion.setFromRotationMatrix(tmp.m);
    g.rotateZ(Math.sin(t * 2) * 0.25);
  });
  return (
    <>
      <Trail width={0.12} length={5} decay={1.4} color="#ffcf85" attenuation={(w) => w * w}>
        <group ref={ref} scale={0.05}>
          <mesh geometry={planeGeometry}>
            <meshStandardMaterial color="#ffffff" emissive="#ffe2b0" emissiveIntensity={0.35} side={THREE.DoubleSide} flatShading />
          </mesh>
        </group>
      </Trail>
      <mesh quaternion={tilt} rotation-x={0}>
        <torusGeometry args={[1.3, 0.0012, 6, 220]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
      </mesh>
    </>
  );
}

/** Pull the camera back on narrow canvases so the globe + halo always fit. */
function CameraFit({ baseZ }: { baseZ: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / Math.max(1, size.height);
    const halfV = Math.tan((cam.fov * DEG) / 2);
    const needed = 1.3 / (halfV * Math.min(1, aspect));
    cam.position.z = Math.max(baseZ, needed);
    cam.updateProjectionMatrix();
  }, [camera, size, baseZ]);
  return null;
}

type LabelBridge = { el: React.RefObject<HTMLDivElement | null>; onActive: (m: GlobeMarker | null) => void };

const MARKER_TIP = 0.055 + 0.03;

function World({ markers, hub, focus, onSelect, showPlane = true, showArcs = true, label }: GlobeProps & { label: LabelBridge }) {
  const outer = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const { gl, size } = useThree();
  const time = useMemo(() => ({ value: 0 }), []);
  const step = size.width < 520 ? 1.75 : 1.2;

  const state = useRef({
    spin: spinForLongitude(hub.lng),
    tilt: hub.lat * DEG * 0.75,
    userSpin: 0,
    userTilt: 0,
    vel: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    sway: 0,
  });

  // Drag to rotate (horizontal on touch so the page can still scroll)
  useEffect(() => {
    const el = gl.domElement;
    const s = state.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.vel = 0;
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX;
      const dy = e.clientY - s.lastY;
      s.lastX = e.clientX;
      s.lastY = e.clientY;
      s.userSpin += dx * 0.006;
      s.vel = dx * 0.006;
      if (e.pointerType === "mouse") s.userTilt = Math.max(-0.7, Math.min(0.7, s.userTilt + dy * 0.004));
    };
    const up = () => {
      s.dragging = false;
    };
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [gl]);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  const focused = markers.find((m) => m.slug === focus) ?? null;
  const active = markers.find((m) => m.slug === hovered) ?? focused;
  const { camera } = useThree();
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), n: new THREE.Vector3(), c: new THREE.Vector3() }), []);
  const onActive = label.onActive;

  useEffect(() => {
    onActive(active);
  }, [active, onActive]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    time.value += dt;
    const s = state.current;
    if (!s.dragging) {
      s.userSpin += s.vel;
      s.vel *= 0.92;
    }
    if (!hovered && !s.dragging) s.sway += dt * 0.16;
    let targetSpin: number;
    let targetTilt: number;
    if (focused) {
      targetSpin = spinForLongitude(focused.lng);
      targetTilt = focused.lat * DEG * 0.85;
    } else {
      targetSpin = spinForLongitude(hub.lng) + s.userSpin + Math.sin(s.sway) * 0.95;
      targetTilt = hub.lat * DEG * 0.6 + s.userTilt;
    }
    const diff = Math.atan2(Math.sin(targetSpin - s.spin), Math.cos(targetSpin - s.spin));
    const k = 1 - Math.exp(-(focused ? 3.2 : s.dragging ? 14 : 2.2) * dt);
    s.spin += diff * k;
    s.tilt += (targetTilt - s.tilt) * k;
    if (focused) {
      // keep drag offset in sync so releasing focus doesn't jump
      s.userSpin = s.spin - spinForLongitude(hub.lng) - Math.sin(s.sway) * 0.95;
    }
    if (outer.current) outer.current.rotation.x = s.tilt;
    if (inner.current) inner.current.rotation.y = s.spin;

    // Keep the DOM label pinned above the active marker.
    const el = label.el.current;
    if (el && inner.current) {
      if (!active) {
        el.style.opacity = "0";
      } else {
        inner.current.updateMatrixWorld();
        latLngToVector3(active.lat, active.lng, R + MARKER_TIP, tmp.p).applyMatrix4(inner.current.matrixWorld);
        tmp.n.copy(tmp.p).normalize();
        tmp.c.copy(camera.position).sub(tmp.p).normalize();
        const facing = tmp.n.dot(tmp.c);
        tmp.p.project(camera);
        const x = ((tmp.p.x + 1) / 2) * size.width;
        const y = ((1 - tmp.p.y) / 2) * size.height;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        el.style.opacity = facing > 0.15 ? "1" : "0";
      }
    }
  });

  const hubVec = useMemo(() => latLngToVector3(hub.lat, hub.lng, R), [hub.lat, hub.lng]);
  const arcs = useMemo(
    () =>
      markers
        .filter((m) => angularDistance(m.lat, m.lng, hub.lat, hub.lng) > 6)
        .map((m, i) => ({
          key: m.slug,
          to: latLngToVector3(m.lat, m.lng, R),
          color: m.region === "domestic" ? SUN : i % 2 ? AQUA : SKY,
          offset: (i * 0.137) % 1,
        })),
    [markers, hub.lat, hub.lng],
  );

  const sphereUniforms = useMemo(() => ({ uDeep: { value: new THREE.Color("#0b1736") }, uRim: { value: new THREE.Color("#2a6dff") } }), []);
  const atmoUniforms = useMemo(() => ({ uColor: { value: new THREE.Color("#4fb4ff") } }), []);

  return (
    <>
      <group ref={outer}>
        <group ref={inner}>
          <mesh
            onPointerMove={(e) => e.stopPropagation()}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(null);
            }}
          >
            <sphereGeometry args={[R, 96, 96]} />
            <shaderMaterial vertexShader={sphereVert} fragmentShader={sphereFrag} uniforms={sphereUniforms} />
          </mesh>
          <LandDots step={step} hub={hub} />
          {showArcs && arcs.map((a) => <Arc key={a.key} from={hubVec} to={a.to} color={a.color} offset={a.offset} time={time} />)}
          <Marker m={{ slug: "__hub", name: hub.name, lat: hub.lat, lng: hub.lng, region: "domestic" }} active={false} onHover={() => {}} isHub />
          {markers.map((m) => (
            <Marker key={m.slug} m={m} active={hovered === m.slug || focus === m.slug} onHover={setHovered} onSelect={onSelect} />
          ))}
        </group>
      </group>
      <mesh scale={1.2}>
        <sphereGeometry args={[R, 64, 64]} />
        <shaderMaterial
          vertexShader={sphereVert}
          fragmentShader={atmoFrag}
          uniforms={atmoUniforms}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {showPlane && <PaperPlane />}
    </>
  );
}

export default function GlobeScene(props: GlobeProps & { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const labelEl = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [activeMarker, setActiveMarker] = useState<GlobeMarker | null>(null);
  const label = useMemo<LabelBridge>(() => ({ el: labelEl, onActive: setActiveMarker }), []);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={`relative ${props.className ?? ""}`}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, props.cameraZ ?? 3.35], fov: 40, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        resize={{ offsetSize: true }}
        style={{ touchAction: "pan-y" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[-3, 3, 3]} intensity={1.4} />
        {props.showStars !== false && <Stars radius={60} depth={40} count={1800} factor={3} saturation={0} fade speed={0.6} />}
        <CameraFit baseZ={props.cameraZ ?? 3.35} />
        <World {...props} label={label} />
      </Canvas>
      <div ref={labelEl} className="pointer-events-none absolute top-0 left-0 z-10 transition-opacity duration-200" style={{ opacity: 0 }} aria-hidden>
        {activeMarker && (
          <div className="glass-strong min-w-max -translate-x-1/2 -translate-y-[calc(100%+6px)] rounded-2xl px-3.5 py-2 text-left shadow-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <span className={`h-2 w-2 rounded-full ${activeMarker.region === "domestic" ? "bg-sun-400" : "bg-aqua-400"}`} />
              {activeMarker.name}
            </div>
            {activeMarker.tagline ? <div className="mt-0.5 text-[11px] text-white/60">{activeMarker.tagline}</div> : null}
            {props.onSelect ? <div className="mt-1 text-[10px] font-semibold tracking-wider text-sun-300 uppercase">Click to explore →</div> : null}
          </div>
        )}
      </div>
    </div>
  );
}
