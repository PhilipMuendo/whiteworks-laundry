"use client";

import { usePrefersReducedMotion } from "@/lib/useMedia";
/**
 * LinenCanvas: a real-time WebGL sheet of white linen.
 *
 * Raw WebGL (no three.js) to keep the bundle light. A tessellated plane is
 * displaced in the vertex shader by layered waves + simplex noise, lit with a
 * wrapped-diffuse key light, a soft sheen and depth fog so it reads as heavy
 * cotton moving through a dark space. Scroll progress (a MotionValue) drives
 * the camera; the pointer adds a gentle parallax and "gusts" of wind.
 *
 * - Renders only while on screen and the tab is visible.
 * - prefers-reduced-motion: time is frozen; it only re-renders on scroll.
 * - Falls back to a still photograph if WebGL is unavailable.
 */

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import type { MotionValue } from "motion/react";

type Variant = "hero" | "rest";

type Props = {
  progress?: MotionValue<number>;
  variant?: Variant;
  fallback: StaticImageData;
  className?: string;
  /** Called once the first frame has been drawn. */
  onReady?: () => void;
};

const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `
precision highp float;
attribute vec2 aUv;
uniform mat4 uProj;
uniform mat4 uView;
uniform mat4 uModel;
uniform float uTime;
uniform float uAmp;
uniform float uEnergy;
uniform vec2 uSize;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
varying float vH;
${NOISE}

float field(vec2 q){
  float t=uTime;
  float h=0.20*sin(q.x*1.15-t*0.55+q.y*0.35)
        +0.11*sin(q.x*2.3+q.y*1.4-t*0.9)
        +0.06*sin(q.y*3.1+q.x*0.7+t*0.7)
        +0.12*snoise(vec3(q*0.75,t*0.11))
        +0.035*snoise(vec3(q*2.4,t*0.23));
  // gusts from the pointer travel across the sheet
  h+=uEnergy*0.07*sin(q.x*4.0-t*3.0+q.y*0.8);
  // edges curl a little, like heavy cotton
  vec2 e=abs(q/(uSize*0.5));
  h+=0.16*pow(e.x,3.0)-0.06*pow(e.y,4.0);
  return h*uAmp;
}

void main(){
  vec2 q=(aUv-0.5)*uSize;
  float eps=0.012;
  float h=field(q);
  float hx=(field(q+vec2(eps,0.0))-field(q-vec2(eps,0.0)))/(2.0*eps);
  float hy=(field(q+vec2(0.0,eps))-field(q-vec2(0.0,eps)))/(2.0*eps);
  vec3 n=normalize(vec3(-hx,-hy,1.0));
  vec4 world=uModel*vec4(q,h,1.0);
  vWorld=world.xyz;
  vNormal=mat3(uModel)*n;
  vUv=aUv;
  vH=h;
  gl_Position=uProj*uView*world;
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uIntro;
uniform vec3 uCam;
uniform vec2 uSize;
uniform float uFog;
uniform float uWhite;
varying vec3 vNormal;
varying vec3 vWorld;
varying vec2 vUv;
varying float vH;

void main(){
  vec3 n=normalize(vNormal);
  if(!gl_FrontFacing) n=-n;
  vec3 V=normalize(uCam-vWorld);
  vec3 L=normalize(vec3(-0.55+0.25*sin(uTime*0.09),0.85,0.75));
  vec3 F=normalize(vec3(0.7,-0.4,0.6));

  float wrap=clamp((dot(n,L)+0.42)/1.42,0.0,1.0);
  float fill=clamp(dot(n,F),0.0,1.0)*0.12;
  float sheen=pow(max(dot(n,normalize(L+V)),0.0),28.0)*0.16;
  float rim=pow(1.0-max(dot(n,V),0.0),3.0)*0.10;
  float ao=mix(0.62,1.0,smoothstep(-0.32,0.22,vH));

  vec3 bone=vec3(0.961,0.961,0.941);
  vec3 shade=vec3(0.075,0.078,0.085);
  vec3 col=mix(shade,bone,smoothstep(0.02,0.9,wrap)*ao)+fill*vec3(0.75,0.8,0.9)+sheen+rim;

  // fine weave
  float weave=sin(vUv.x*uSize.x*620.0)*sin(vUv.y*uSize.y*620.0);
  col*=1.0+weave*0.012;

  // hemmed edge
  vec2 d=min(vUv,1.0-vUv)*uSize;
  float edge=min(d.x,d.y);
  col*=mix(0.8,1.0,smoothstep(0.018,0.042,edge));
  col*=mix(1.0,0.93,smoothstep(0.05,0.056,edge)*(1.0-smoothstep(0.058,0.064,edge)));

  // depth fog into the dark environment
  float depth=length(uCam-vWorld);
  float fog=smoothstep(uFog*0.55,uFog*1.35,depth);
  col=mix(col,vec3(0.031),fog*0.85);

  // as the camera pushes in, the sheet resolves to the page colour
  col=mix(col,bone,uWhite);
  col*=uIntro;
  gl_FragColor=vec4(col,1.0);
}`;

// ── tiny column-major mat4 helpers ────────────────────────────────────────────
type M4 = Float32Array;
const ident = (): M4 => {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
};
const mul = (a: M4, b: M4): M4 => {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let s = 0;
      for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
      o[c * 4 + r] = s;
    }
  return o;
};
const rotX = (t: number): M4 => {
  const m = ident(), c = Math.cos(t), s = Math.sin(t);
  m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
  return m;
};
const rotY = (t: number): M4 => {
  const m = ident(), c = Math.cos(t), s = Math.sin(t);
  m[0] = c; m[2] = -s; m[8] = s; m[10] = c;
  return m;
};
const rotZ = (t: number): M4 => {
  const m = ident(), c = Math.cos(t), s = Math.sin(t);
  m[0] = c; m[1] = s; m[4] = -s; m[5] = c;
  return m;
};
const trans = (x: number, y: number, z: number): M4 => {
  const m = ident();
  m[12] = x; m[13] = y; m[14] = z;
  return m;
};
const persp = (fovy: number, aspect: number, near: number, far: number): M4 => {
  const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far), m = new Float32Array(16);
  m[0] = f / aspect; m[5] = f; m[10] = (far + near) * nf; m[11] = -1; m[14] = 2 * far * near * nf;
  return m;
};

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn("[LinenCanvas] shader", gl.getShaderInfoLog(s));
    return null;
  }
  return s;
}

export default function LinenCanvas({ progress, variant = "hero", fallback, className, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  const reduce = usePrefersReducedMotion();
  const readyRef = useRef(onReady);
  readyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "high-performance" });
    if (!gl) {
      setFailed(true);
      return;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) {
      setFailed(true);
      return;
    }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }
    gl.useProgram(prog);

    // geometry: a tessellated plane in uv space
    const small = window.innerWidth < 768;
    const SX = small ? 120 : 190;
    const SY = small ? 80 : 124;
    const uvs = new Float32Array((SX + 1) * (SY + 1) * 2);
    let k = 0;
    for (let y = 0; y <= SY; y++)
      for (let x = 0; x <= SX; x++) {
        uvs[k++] = x / SX;
        uvs[k++] = y / SY;
      }
    const idx = new Uint16Array(SX * SY * 6);
    k = 0;
    for (let y = 0; y < SY; y++)
      for (let x = 0; x < SX; x++) {
        const a = y * (SX + 1) + x, b = a + 1, c = a + SX + 1, d = c + 1;
        // counter-clockwise winding: the face toward the camera is the front face
        idx[k++] = a; idx[k++] = b; idx[k++] = c;
        idx[k++] = b; idx[k++] = d; idx[k++] = c;
      }
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    const aUv = gl.getAttribLocation(prog, "aUv");
    gl.enableVertexAttribArray(aUv);
    gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);

    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = {
      proj: U("uProj"), view: U("uView"), model: U("uModel"), time: U("uTime"), amp: U("uAmp"),
      energy: U("uEnergy"), size: U("uSize"), intro: U("uIntro"), cam: U("uCam"), fog: U("uFog"), white: U("uWhite"),
    };
    const SIZE: [number, number] = [3.3, 2.15];
    gl.uniform2f(u.size, SIZE[0], SIZE[1]);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    // sizing
    let W = 1, H = 1;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width * dpr));
      H = Math.max(1, Math.round(r.height * dpr));
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      gl.viewport(0, 0, W, H);
      dirty = true;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // pointer
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, energy: 0, lx: 0, ly: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
      const dx = e.clientX - mouse.lx, dy = e.clientY - mouse.ly;
      mouse.lx = e.clientX;
      mouse.ly = e.clientY;
      mouse.energy = Math.min(1, mouse.energy + Math.hypot(dx, dy) / 900);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // visibility
    let visible = true;
    let dirty = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) loop();
    });
    io.observe(canvas);

    const unsub = progress?.on("change", () => (dirty = true));

    let raf = 0;
    let last = performance.now();
    let time = variant === "rest" ? 18 : 6;
    let intro = reduce ? 1 : 0;
    const born = performance.now();
    let firstFrame = true;

    const draw = () => {
      const p = Math.min(1, Math.max(0, progress?.get() ?? 0));
      const aspect = W / H;
      const portrait = aspect < 1;

      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;

      let camZ: number, rx: number, ry: number, rz: number, tx: number, ty: number, amp: number, fog: number, white = 0;
      if (variant === "hero") {
        const e = easeInOut(p);
        camZ = mix(portrait ? 6.2 : 4.3, 0.78, e);
        rx = mix(-1.02, -0.06, easeOut(p)) + mouse.y * 0.06 * (1 - p);
        ry = mix(0.34, 0, p) + mouse.x * 0.1 * (1 - p);
        rz = mix(portrait ? -0.62 : -0.34, 0, e);
        tx = Math.sin(time * 0.07) * 0.22 * (1 - p);
        ty = mix(portrait ? 0.05 : -0.08, 0, e);
        amp = mix(1, 0.4, e) * (1 + mouse.energy * 0.35);
        fog = mix(5.2, 3.0, e);
        const w = Math.min(1, Math.max(0, (p - 0.45) / 0.4));
        white = w * w * (3 - 2 * w);
      } else {
        camZ = portrait ? 5.4 : 3.7;
        rx = -1.18 + mouse.y * 0.04;
        ry = 0.1 + mouse.x * 0.06;
        rz = -0.18;
        tx = 0;
        ty = -0.25;
        amp = 0.55 + mouse.energy * 0.25;
        fog = 4.6;
      }

      const model = mul(trans(tx, ty, 0), mul(rotY(ry), mul(rotX(rx), rotZ(rz))));
      gl.uniformMatrix4fv(u.proj, false, persp((40 * Math.PI) / 180, aspect, 0.05, 50));
      gl.uniformMatrix4fv(u.view, false, trans(0, 0, -camZ));
      gl.uniformMatrix4fv(u.model, false, model);
      gl.uniform3f(u.cam, 0, 0, camZ);
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.amp, amp);
      gl.uniform1f(u.energy, mouse.energy);
      gl.uniform1f(u.intro, easeOut(intro));
      gl.uniform1f(u.fog, fog);
      gl.uniform1f(u.white, white);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);

      if (firstFrame) {
        firstFrame = false;
        readyRef.current?.();
      }
    };

    const loop = () => {
      cancelAnimationFrame(raf);
      const tick = (now: number) => {
        if (!visible || document.hidden) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!reduce) {
          time += dt * (variant === "rest" ? 0.5 : 1);
          // wall-clock fade-in, so slow devices still reach full brightness on time
          intro = Math.min(1, (now - born) / 2400);
          mouse.energy *= 0.965;
          draw();
        } else if (dirty) {
          draw();
          dirty = false;
        }
        raf = requestAnimationFrame(tick);
      };
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    loop();

    const onVis = () => !document.hidden && visible && loop();
    document.addEventListener("visibilitychange", onVis);

    const onLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onLost);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      unsub?.();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteBuffer(vbo);
      gl.deleteBuffer(ibo);
      gl.deleteProgram(prog);
    };
  }, [progress, variant, reduce]);

  if (failed) {
    return (
      <div className={className}>
        <Image src={fallback} alt="" fill sizes="100vw" className="object-cover opacity-70" priority={variant === "hero"} placeholder="blur" />
      </div>
    );
  }

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
