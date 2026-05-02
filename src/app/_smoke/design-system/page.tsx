/**
 * Design System Smoke Test
 * トークンが正しく読み込まれているか確認するページ
 * URL: /_smoke/design-system
 */
export default function DesignSystemSmokePage() {
  return (
    <main className="min-h-screen bg-base text-text-primary font-noto-sans-jp p-8 space-y-12">
      {/* ===== Headings ===== */}
      <section>
        <h2 className="text-sm font-bold text-text-muted mb-4">HEADINGS — font-rounded-mplus</h2>
        <div className="space-y-3">
          <h1 className="font-rounded-mplus text-4xl font-extrabold">ExtraBold 800 — タイポ確認</h1>
          <h2 className="font-rounded-mplus text-3xl font-bold">Bold 700 — サブ見出し</h2>
          <h3 className="font-rounded-mplus text-2xl font-medium">Medium 500 — セクション</h3>
        </div>
      </section>

      {/* ===== Buttons ===== */}
      <section>
        <h2 className="text-sm font-bold text-text-muted mb-4">BUTTONS — canonical shapes</h2>
        <div className="flex flex-wrap gap-4 items-center">
          {/* Primary CTA (large) */}
          <button className="inline-flex h-14 items-center rounded-[14px] bg-cta-primary-bg px-6 text-white text-sm font-bold shadow-[0_4px_12px_rgba(16,39,32,0.15)]">
            Primary CTA (large)
          </button>
          {/* Primary CTA (small) */}
          <button className="inline-flex h-12 items-center rounded-[14px] bg-cta-primary-bg px-5 text-white text-sm font-bold">
            Primary CTA (small)
          </button>
          {/* Secondary outlined */}
          <button className="inline-flex h-14 items-center rounded-[14px] border-2 border-text-primary px-6 text-text-primary text-sm font-bold">
            Secondary Outlined
          </button>
          {/* On-dark primary */}
          <div className="bg-cta-primary-bg p-4 rounded-[14px]">
            <button className="inline-flex h-12 items-center rounded-[14px] bg-white px-5 text-text-primary text-sm font-bold">
              On-dark Primary
            </button>
          </div>
          {/* On-dark secondary */}
          <div className="bg-cta-primary-bg p-4 rounded-[14px]">
            <button className="inline-flex h-12 items-center rounded-[14px] border border-white px-5 text-white text-sm font-bold">
              On-dark Secondary
            </button>
          </div>
        </div>
      </section>

      {/* ===== Color Swatches ===== */}
      <section>
        <h2 className="text-sm font-bold text-text-muted mb-4">COLOR SWATCHES — base surfaces</h2>
        <div className="flex flex-wrap gap-4">
          <Swatch name="bg-base" className="bg-base" />
          <Swatch name="bg-surface" className="bg-surface" />
          <Swatch name="bg-warm" className="bg-warm" />
          <Swatch name="bg-muted-custom" className="bg-muted-custom" />
          <Swatch name="bg-cta-primary-bg" className="bg-cta-primary-bg text-white" />
        </div>
      </section>

      {/* ===== Roadmap Gradients ===== */}
      <section>
        <h2 className="text-sm font-bold text-text-muted mb-4">ROADMAP GRADIENTS</h2>
        <div className="flex flex-wrap gap-4">
          <GradientSwatch name="career" style={{ background: "var(--gradient-roadmap-career)" }} />
          <GradientSwatch name="ui-beginner" style={{ background: "var(--gradient-roadmap-ui-beginner)" }} />
          <GradientSwatch name="ui-visual" style={{ background: "var(--gradient-roadmap-ui-visual)" }} />
          <GradientSwatch name="info-arch" style={{ background: "var(--gradient-roadmap-info-arch)" }} />
          <GradientSwatch name="ux-design" style={{ background: "var(--gradient-roadmap-ux-design)" }} />
        </div>
      </section>

      {/* ===== LINE Seed JP ===== */}
      <section>
        <h2 className="text-sm font-bold text-text-muted mb-4">LINE SEED JP — font-display</h2>
        <p className="font-display text-3xl font-bold">LINE Seed JP: ABCDあいう123</p>
        <p className="font-display text-xl font-normal mt-2">Regular weight — デザインを学ぼう</p>
      </section>
    </main>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className={`w-24 h-24 rounded-[14px] border border-border-default flex items-end p-2 ${className}`}>
      <span className="text-[10px] font-mono leading-tight">{name}</span>
    </div>
  );
}

function GradientSwatch({ name, style }: { name: string; style: React.CSSProperties }) {
  return (
    <div className="w-32 h-20 rounded-[14px] flex items-end p-2" style={style}>
      <span className="text-[10px] font-mono text-white leading-tight drop-shadow">{name}</span>
    </div>
  );
}
