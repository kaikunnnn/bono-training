"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type DotFx = 0 | 1 | 2 | 3;
export type SunStyle = 0 | 1 | 2;

export interface DotEffectsParams {
  /** [色1, 色2, 色3, 点/他] の hex 文字列 */
  colors: [string, string, string, string];
  fx: DotFx;
  spacing: number;
  grain: number;
  angle: number;
  // まばら
  size0: number;
  density: number;
  // ハーフトーン
  size1: number;
  // 朝日
  sunR: number;
  glow: number;
  rayCount: number;
  rays: boolean;
  sunDot: number;
  sunStyle: SunStyle;
  // グラデ線
  turns: number;
  radius: number;
  thick: number;
}

export interface DotEffectsPlaygroundHandle {
  exportPNG: (width: number, height: number) => string | null;
}

interface DotEffectsPlaygroundProps extends DotEffectsParams {
  className?: string;
}

const VERT = `attribute vec2 a_pos; void main(){ gl_Position=vec4(a_pos,0.0,1.0); }`;

const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform vec3 u_c1,u_c2,u_c3,u_c4;
uniform float u_spacing,u_grain,u_angle;
uniform int u_fx;
uniform float u_size0,u_density;
uniform float u_size1;
uniform float u_sunR,u_glow,u_rayCount,u_sunDot; uniform int u_rays,u_sunStyle;
uniform float u_turns,u_radius,u_thick;

#define STEPS 220
#define TAU 6.28318530718

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  float a=hash(i), b=hash(i+vec2(1,0)), c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
  vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }

float gradT(vec2 st){
  float ang=u_angle*3.14159/180.0;
  vec2 dir=vec2(cos(ang),sin(ang));
  float g=dot(st-0.5,dir)+0.5;
  g += (fbm(st*2.0)-0.5)*0.35;
  return clamp(g,0.0,1.0);
}
vec3 gradCol(float g){
  return g<0.5 ? mix(u_c1,u_c2,smoothstep(0.0,0.5,g))
               : mix(u_c2,u_c3,smoothstep(0.5,1.0,g));
}
vec2 sunUV(vec2 frag){ return (frag - vec2(0.5*u_res.x,0.0))/u_res.y; }
float sunField(vec2 uv){
  float d=length(uv);
  float disk=smoothstep(u_sunR*0.01, u_sunR*0.01*0.92, d);
  float glow=exp(-max(d-u_sunR*0.01,0.0)*u_glow);
  float f=max(disk,glow);
  if(u_rays==1){
    float a=atan(uv.y,uv.x);
    float ray=0.5+0.5*cos(a*u_rayCount);
    float outer=smoothstep(u_sunR*0.01, u_sunR*0.01*2.5, d);
    f*=mix(1.0, 0.35+0.65*ray, outer);
  }
  return clamp(f,0.0,1.0);
}
float segDist2(vec2 p, vec2 a, vec2 b){
  vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/max(dot(ba,ba),1e-6),0.0,1.0);
  vec2 d=pa-ba*h; return dot(d,d);
}
float helixMask(vec2 uv){
  float rx=u_radius, ry=u_radius*0.24, H=1.3; float best=1e9; vec2 prev;
  for(int i=0;i<STEPS;i++){
    float prog=float(i)/float(STEPS-1);
    float t=prog*u_turns*TAU;
    vec2 p=vec2(rx*cos(t),(prog-0.5)*H+ry*sin(t));
    if(i>0){ float d2=segDist2(uv,prev,p); if(d2<best) best=d2; }
    prev=p;
  }
  float edge=u_thick*0.001;
  return 1.0-smoothstep(edge*0.6,edge,sqrt(best));
}

void main(){
  vec2 st = gl_FragCoord.xy/u_res;
  float sp = u_spacing*(u_res.y/720.0);
  vec2 cell=floor(gl_FragCoord.xy/sp);
  vec2 center=(cell+0.5)*sp;
  float dist=length(gl_FragCoord.xy-center);

  vec3 col;

  if(u_fx==0){
    col = gradCol(gradT(st));
    // 位置と大きさをセルごとに軽くジッターさせて、機械的なグリッド感を抜く
    vec2 jitter=(vec2(hash(cell+3.1),hash(cell+7.7))-0.5)*sp*0.3;
    float jDist=length(gl_FragCoord.xy-(center+jitter));
    float keep=step(1.0-u_density/100.0, hash(cell));
    float sizeJit=0.75+0.5*hash(cell+21.0);
    float r=u_size0*0.18*(u_res.y/720.0)*sizeJit;
    float d=(1.0-smoothstep(r-1.0,r,jDist))*keep;
    col=mix(col,u_c4,d*0.9);
  } else if(u_fx==1){
    col = gradCol(gradT(st));
    float gc=gradT(center/u_res);
    float r=sp*0.5*(0.12+gc*(u_size1/100.0));
    float d=1.0-smoothstep(r-1.5,r,dist);
    vec3 dc=mix(u_c3,u_c4,gc);
    // ドットごとにわずかな明暗差を足して質感を出す
    dc*=0.92+0.16*hash(cell+5.0);
    col=mix(col,dc,d);
  } else if(u_fx==2){
    vec3 sky=mix(u_c2,u_c1,pow(st.y,0.85));
    float b=sunField(sunUV(center));

    if(u_sunStyle==0){
      float r=sp*0.5*(0.12+b*1.05);
      float d=1.0-smoothstep(r-max(1.0,r*0.35),r,dist);
      vec3 dc=mix(u_c4,u_c3,pow(b,0.7));
      col=mix(sky,dc,d);
    } else if(u_sunStyle==1){
      float r=sp*0.5*(u_sunDot/100.0);
      float d=1.0-smoothstep(r-1.5,r,dist);
      vec3 dc=mix(u_c4,u_c3,pow(b,0.7));
      col=mix(sky, dc, d*b);
    } else {
      float r=sp*0.5*(u_sunDot/100.0);
      float d=1.0-smoothstep(r-1.5,r,dist);
      float on=step(0.5, b);
      col=mix(sky, u_c4, d*on);
    }
  } else {
    vec2 uv=(gl_FragCoord.xy-0.5*u_res)/min(u_res.x,u_res.y)*2.0;
    vec3 grad=gradCol(gradT(st));
    float m=helixMask(uv);
    col=mix(u_c1,grad,m);
  }

  // ビネット(周辺をわずかに減光して視線を中央に集める)
  vec2 dv=st-0.5;
  col *= 1.0 - 0.16*dot(dv,dv)*2.0;

  col += (hash(gl_FragCoord.xy)-0.5)*(u_grain/100.0)*0.14;
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
  "u_spacing",
  "u_grain",
  "u_angle",
  "u_fx",
  "u_size0",
  "u_density",
  "u_size1",
  "u_sunR",
  "u_glow",
  "u_rayCount",
  "u_rays",
  "u_sunDot",
  "u_sunStyle",
  "u_turns",
  "u_radius",
  "u_thick",
] as const;

type UniformMap = Partial<Record<(typeof UNIFORM_NAMES)[number], WebGLUniformLocation | null>>;

const DotEffectsPlayground = forwardRef<DotEffectsPlaygroundHandle, DotEffectsPlaygroundProps>(
  function DotEffectsPlayground(
    {
      colors,
      fx,
      spacing,
      grain,
      angle,
      size0,
      density,
      size1,
      sunR,
      glow,
      rayCount,
      rays,
      sunDot,
      sunStyle,
      turns,
      radius,
      thick,
      className,
    },
    ref,
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const uniformsRef = useRef<UniformMap>({});
    const rafRef = useRef<number | null>(null);
    const sizeRef = useRef({ w: 0, h: 0 });
    const paramsRef = useRef<DotEffectsParams>({
      colors,
      fx,
      spacing,
      grain,
      angle,
      size0,
      density,
      size1,
      sunR,
      glow,
      rayCount,
      rays,
      sunDot,
      sunStyle,
      turns,
      radius,
      thick,
    });

    useEffect(() => {
      paramsRef.current = {
        colors,
        fx,
        spacing,
        grain,
        angle,
        size0,
        density,
        size1,
        sunR,
        glow,
        rayCount,
        rays,
        sunDot,
        sunStyle,
        turns,
        radius,
        thick,
      };
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
      gl.uniform1f(uni.u_spacing!, p.spacing);
      gl.uniform1f(uni.u_grain!, p.grain);
      gl.uniform1f(uni.u_angle!, p.angle);
      gl.uniform1i(uni.u_fx!, p.fx);
      gl.uniform1f(uni.u_size0!, p.size0);
      gl.uniform1f(uni.u_density!, p.density);
      gl.uniform1f(uni.u_size1!, p.size1);
      gl.uniform1f(uni.u_sunR!, p.sunR);
      gl.uniform1f(uni.u_glow!, p.glow / 10);
      gl.uniform1f(uni.u_rayCount!, p.rayCount);
      gl.uniform1i(uni.u_rays!, p.rays ? 1 : 0);
      gl.uniform1f(uni.u_sunDot!, p.sunDot);
      gl.uniform1i(uni.u_sunStyle!, p.sunStyle);
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

export default DotEffectsPlayground;
