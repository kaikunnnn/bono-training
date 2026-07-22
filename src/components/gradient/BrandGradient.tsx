"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type GradientMode = 0 | 1 | 2;

export interface BrandGradientParams {
  /** [色1, 色2, 色3, 他色] の hex 文字列 */
  colors: [string, string, string, string];
  blend: number;
  grain: number;
  grainScale: number;
  angle: number;
  mode: GradientMode;
  turns: number;
  radius: number;
  thick: number;
}

export interface BrandGradientHandle {
  /** 現在の状態を PNG の dataURL として書き出す。GL未初期化時は null */
  exportPNG: (width: number, height: number) => string | null;
}

interface BrandGradientProps extends BrandGradientParams {
  className?: string;
}

const VERT = `attribute vec2 a_pos; void main(){ gl_Position=vec4(a_pos,0.0,1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform vec3 u_c1, u_c2, u_c3, u_c4;
uniform float u_blend, u_grain, u_grainScale, u_angle;
uniform int   u_mode;
uniform float u_turns, u_radius, u_thick;

#define STEPS 150
#define TAU 6.28318530718

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }

vec3 gradientColor(vec2 st){
  float ang=u_angle*3.14159/180.0;
  vec2 dir=vec2(cos(ang), sin(ang));
  float g=dot(st-0.5, dir)+0.5;
  g += (fbm(st*2.0)-0.5) * (u_blend/100.0) * 0.6;
  g=clamp(g,0.0,1.0);
  vec3 col = g<0.5 ? mix(u_c1,u_c2,smoothstep(0.0,0.5,g))
                   : mix(u_c2,u_c3,smoothstep(0.5,1.0,g));
  float gs=mix(1.0,4.0,u_grainScale/100.0);
  col += (hash(floor(gl_FragCoord.xy/gs))-0.5) * (u_grain/100.0) * 0.18;
  return col;
}

float segDist2(vec2 p, vec2 a, vec2 b){
  vec2 pa=p-a, ba=b-a;
  float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-6),0.0,1.0);
  vec2 d=pa-ba*h; return dot(d,d);
}
float helixMask(vec2 uv){
  float rx=u_radius, ry=u_radius*0.24, H=1.3;
  float best=1e9; vec2 prev;
  for(int i=0;i<STEPS;i++){
    float prog=float(i)/float(STEPS-1);
    float t=prog*u_turns*TAU;
    vec2 p=vec2(rx*cos(t), (prog-0.5)*H + ry*sin(t));
    if(i>0){ float d2=segDist2(uv,prev,p); if(d2<best) best=d2; }
    prev=p;
  }
  float edge=u_thick*0.001;
  return 1.0 - smoothstep(edge*0.6, edge, sqrt(best));
}

void main(){
  vec2 st = gl_FragCoord.xy / u_res;
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res)/min(u_res.x,u_res.y)*2.0;

  vec3 grad = gradientColor(st);
  vec3 col;

  if(u_mode==0){
    col = grad;
  } else if(u_mode==1){
    float m = helixMask(uv);
    vec3 bg = u_c4;
    col = mix(bg, grad, m);
  } else {
    float m = helixMask(uv);
    col = mix(grad, u_c4, m);
  }

  vec2 d=st-0.5; col *= 1.0 - 0.18*dot(d,d)*2.0;
  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);
}
`;

function hexToRgb01(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const UNIFORM_NAMES = [
  "u_res",
  "u_c1",
  "u_c2",
  "u_c3",
  "u_c4",
  "u_blend",
  "u_grain",
  "u_grainScale",
  "u_angle",
  "u_mode",
  "u_turns",
  "u_radius",
  "u_thick",
] as const;

type UniformMap = Partial<Record<(typeof UNIFORM_NAMES)[number], WebGLUniformLocation | null>>;

const BrandGradient = forwardRef<BrandGradientHandle, BrandGradientProps>(
  function BrandGradient(
    { colors, blend, grain, grainScale, angle, mode, turns, radius, thick, className },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const uniformsRef = useRef<UniformMap>({});
    const rafRef = useRef<number | null>(null);
    const sizeRef = useRef({ w: 0, h: 0 });
    const paramsRef = useRef<BrandGradientParams>({
      colors,
      blend,
      grain,
      grainScale,
      angle,
      mode,
      turns,
      radius,
      thick,
    });

    // 最新の props を常に ref に反映しておく（rAFループのクロージャが古い値を掴まないように）
    useEffect(() => {
      paramsRef.current = { colors, blend, grain, grainScale, angle, mode, turns, radius, thick };
    });

    const draw = useCallback(() => {
      const gl = glRef.current;
      const uni = uniformsRef.current;
      const canvas = canvasRef.current;
      if (!gl || !canvas) return;
      const p = paramsRef.current;
      const [c1, c2, c3, c4] = p.colors;

      gl.uniform2f(uni.u_res!, canvas.width, canvas.height);
      gl.uniform3fv(uni.u_c1!, hexToRgb01(c1));
      gl.uniform3fv(uni.u_c2!, hexToRgb01(c2));
      gl.uniform3fv(uni.u_c3!, hexToRgb01(c3));
      gl.uniform3fv(uni.u_c4!, hexToRgb01(c4));
      gl.uniform1f(uni.u_blend!, p.blend);
      gl.uniform1f(uni.u_grain!, p.grain);
      gl.uniform1f(uni.u_grainScale!, p.grainScale);
      gl.uniform1f(uni.u_angle!, p.angle);
      gl.uniform1i(uni.u_mode!, p.mode);
      gl.uniform1f(uni.u_turns!, p.turns);
      gl.uniform1f(uni.u_radius!, p.radius / 100);
      gl.uniform1f(uni.u_thick!, p.thick);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }, []);

    const resize = useCallback(() => {
      const gl = glRef.current;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!gl || !canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w <= 0 || h <= 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sizeRef.current = { w, h };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw();
    }, [draw]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const gl = canvas.getContext("webgl", {
        antialias: false,
        preserveDrawingBuffer: true,
      });
      if (!gl) {
        console.error("この環境ではWebGLが使えません。");
        return;
      }
      glRef.current = gl;

      // React StrictMode（開発時）はこのeffectを一度マウント→クリーンアップ→再マウントする。
      // クリーンアップで WEBGL_lose_context によりコンテキストを破棄しているため、
      // 再マウント時に同じ<canvas>から取得する gl は「失われたまま」になり得る。
      // その場合は明示的に restoreContext() して復帰を待ってから初期化する。
      let cancelled = false;
      const loseCtxExt = gl.getExtension("WEBGL_lose_context");

      function setup() {
        if (cancelled || !gl) return;

        const vs = compileShader(gl, gl.VERTEX_SHADER, VERT);
        const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          console.error(gl.getProgramInfoLog(program));
          return;
        }
        gl.useProgram(program);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW,
        );
        const posLoc = gl.getAttribLocation(program, "a_pos");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const uniforms: UniformMap = {};
        UNIFORM_NAMES.forEach((name) => {
          uniforms[name] = gl.getUniformLocation(program, name);
        });
        uniformsRef.current = uniforms;

        resize();

        const tick = () => {
          const container = containerRef.current;
          if (container) {
            const rect = container.getBoundingClientRect();
            const w = Math.round(rect.width);
            const h = Math.round(rect.height);
            if (w > 0 && h > 0 && (w !== sizeRef.current.w || h !== sizeRef.current.h)) {
              resize();
            } else {
              draw();
            }
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }

      if (gl.isContextLost()) {
        const onRestored = () => {
          canvas.removeEventListener("webglcontextrestored", onRestored);
          setup();
        };
        canvas.addEventListener("webglcontextrestored", onRestored);
        loseCtxExt?.restoreContext();
      } else {
        setup();
      }

      return () => {
        cancelled = true;
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        loseCtxExt?.loseContext();
        glRef.current = null;
      };
      // マウント時に一度だけ初期化する（props変化はpropsRef経由でdraw()が拾う）
    }, [draw, resize]);

    useImperativeHandle(
      ref,
      () => ({
        exportPNG(width, height) {
          const gl = glRef.current;
          const canvas = canvasRef.current;
          if (!gl || !canvas) return null;
          if (width <= 0 || height <= 0) return null;

          const oldW = canvas.width;
          const oldH = canvas.height;
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
          gl.viewport(0, 0, canvas.width, canvas.height);
          draw();
          const url = canvas.toDataURL("image/png");

          canvas.width = oldW;
          canvas.height = oldH;
          gl.viewport(0, 0, oldW, oldH);
          draw();

          return url;
        },
      }),
      [draw],
    );

    return (
      <div ref={containerRef} className={className}>
        <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      </div>
    );
  },
);

export default BrandGradient;
