// Training (logged-in learner) — primitives
function AppHeader({user}){
  return (
    <header style={{position:'sticky',top:0,zIndex:40,background:'#fff',borderBottom:'1px solid rgba(0,0,0,0.06)'}}>
      <div style={{maxWidth:1280,margin:'0 auto',height:64,display:'flex',alignItems:'center',padding:'0 32px',gap:24}}>
        <a href="#" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none'}}>
          <img src="../../assets/bono-logo.svg" alt="BONO" style={{height:22}}/>
        </a>
        <nav style={{display:'flex',gap:24,marginLeft:16}}>
          {['ロードマップ','レッスン','トレーニング','ブログ'].map(t=>(
            <a key={t} href="#" style={{fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:14,color:'#021710',textDecoration:'none'}}>{t}</a>
          ))}
        </nav>
        <div style={{marginLeft:'auto',display:'flex',gap:12,alignItems:'center'}}>
          <div style={{position:'relative',width:260}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#677470" strokeWidth="2" style={{position:'absolute',left:12,top:10}}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input placeholder="レッスンを検索" style={{width:'100%',boxSizing:'border-box',padding:'8px 12px 8px 34px',border:'1px solid #D4D6CC',borderRadius:9999,fontFamily:'var(--font-sans)',fontSize:13,background:'#F9F9F7'}}/>
          </div>
          <img src={user.avatar} style={{width:34,height:34,borderRadius:9999,background:'#fff'}}/>
        </div>
      </div>
    </header>
  );
}

function SectionHeading({eyebrow,title,icon}){
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:20}}>
      {eyebrow && <div style={{display:'flex',alignItems:'center',gap:8}}>
        {icon && <img src={icon} style={{width:22,height:22}}/>}
        <span style={{fontFamily:'var(--font-rounded)',fontWeight:800,fontSize:13,letterSpacing:'.06em',color:'#77850E',textTransform:'uppercase'}}>{eyebrow}</span>
      </div>}
      <h2 style={{margin:0,fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:28,lineHeight:1.4,color:'#021710'}}>{title}</h2>
    </div>
  );
}

function Sidebar({sections,active,onPick}){
  return (
    <aside style={{width:260,flexShrink:0,background:'#fff',borderRight:'1px solid rgba(0,0,0,.06)',padding:'24px 16px',minHeight:'calc(100vh - 64px)',position:'sticky',top:64,alignSelf:'flex-start'}}>
      <div style={{fontFamily:'var(--font-rounded)',fontWeight:800,fontSize:11,letterSpacing:'.08em',color:'#677470',padding:'6px 10px',textTransform:'uppercase'}}>コース</div>
      {sections.map(s=>(
        <button key={s.id} onClick={()=>onPick(s.id)} style={{display:'flex',alignItems:'center',gap:10,width:'100%',background:active===s.id?'#F2F3F0':'transparent',border:'none',borderRadius:12,padding:'10px 12px',cursor:'pointer',textAlign:'left',marginBottom:2}}>
          <img src={s.icon} style={{width:22,height:22}}/>
          <div style={{flex:1}}>
            <div style={{fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:13,color:'#021710'}}>{s.title}</div>
            <div style={{fontFamily:'var(--font-sans)',fontSize:11,color:'#677470',marginTop:2}}>{s.count}</div>
          </div>
        </button>
      ))}
    </aside>
  );
}

Object.assign(window,{AppHeader,SectionHeading,Sidebar});
