// Marketing Top — shared UI primitives
function Header() {
  return (
    <header style={{position:'sticky',top:0,zIndex:40,background:'#fff',borderBottom:'1px solid rgba(0,0,0,0.06)'}}>
      <div style={{maxWidth:1280,margin:'0 auto',height:64,display:'flex',alignItems:'center',padding:'0 32px',gap:32}}>
        <a href="#" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <img src="../../assets/bono-logo.svg" alt="BONO" style={{height:22}}/>
        </a>
        <nav style={{display:'flex',gap:24,marginLeft:16}}>
          {['デザインを学ぶ','デザインツール','プレミアム会員'].map(t=>(
            <a key={t} href="#" style={{fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:14,color:'#021710',textDecoration:'none'}}>{t}</a>
          ))}
        </nav>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button style={{background:'transparent',border:'none',color:'#021710',fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:14,cursor:'pointer'}}>ログイン</button>
          <button style={{background:'#102720',color:'#fff',border:'none',padding:'8px 18px',borderRadius:12,fontFamily:'var(--font-rounded)',fontWeight:800,fontSize:13,cursor:'pointer'}}>はじめる</button>
        </div>
      </div>
    </header>
  );
}

function NewBadge({text}) {
  return (
    <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'6px 16px',border:'1px solid #0f172a',borderRadius:9999}}>
      <span style={{fontFamily:'var(--font-rounded)',fontWeight:800,fontSize:11,color:'#0f172a'}}>NEW!</span>
      <span style={{fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:13,color:'#0f172a'}}>{text}</span>
    </div>
  );
}

function CTAPrimary({children,onClick}){
  return <button onClick={onClick} style={{background:'#081c17',color:'#fff',height:48,padding:'0 24px',borderRadius:14,border:'none',fontFamily:'var(--font-rounded)',fontWeight:800,fontSize:14,letterSpacing:'.04em',boxShadow:'0 4px 4px rgba(0,0,0,.25)',cursor:'pointer'}}>{children}</button>;
}
function CTASecondary({children,onClick}){
  return <button onClick={onClick} style={{background:'transparent',color:'#0f172a',height:48,padding:'0 24px',borderRadius:14,border:'1px solid #0f172a',fontFamily:'var(--font-rounded)',fontWeight:800,fontSize:14,letterSpacing:'.04em',cursor:'pointer'}}>{children}</button>;
}

function GoalPill({img,label,active,onClick}){
  return (
    <button onClick={onClick} style={{flex:1,minWidth:160,height:110,background:'#fff',border:'1px solid rgba(0,0,0,.12)',borderRadius:200,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,cursor:'pointer',boxShadow:active?'0 4px 20px rgba(0,0,0,.08)':'none',transform:active?'translateY(-2px)':'none',transition:'all .2s'}}>
      <img src={img} style={{width:32,height:32,objectFit:'contain'}}/>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <span style={{fontFamily:'var(--font-rounded)',fontWeight:800,fontSize:15,color:'#021710'}}>{label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#021710" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5M9 12l3 3 3-3"/></svg>
      </div>
    </button>
  );
}

Object.assign(window, { Header, NewBadge, CTAPrimary, CTASecondary, GoalPill });
