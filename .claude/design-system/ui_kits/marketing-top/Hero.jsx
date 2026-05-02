function Hero({onGoRoadmaps}){
  const cards = [
    {slug:'galaxy',title:'UIデザインのきほん',grad:'linear-gradient(135deg,#667EEA,#764BA2)',rot:-1.83},
    {slug:'info',title:'情報設計を体系的に',grad:'linear-gradient(135deg,#6B7280,#92400E)',rot:0},
    {slug:'ui',title:'UIビジュアル実践',grad:'linear-gradient(135deg,#304750,#5D5B65)',rot:1.83},
  ];
  return (
    <section style={{position:'relative',padding:'72px 24px 96px',background:'linear-gradient(180deg,#E0E5F8 0%,#FAF4F0 36.7%,#F9F9F7 100%)',display:'flex',flexDirection:'column',alignItems:'center',gap:48}}>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20,maxWidth:760,textAlign:'center'}}>
        <NewBadge text="AIプロトタイピングコースがリリース"/>
        <h1 style={{margin:0,fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:'clamp(32px,4vw,52px)',lineHeight:1.42,color:'#0f172a'}}>ワクワクするものつくるために<br/>体系的にスキルフルになろう</h1>
        <p style={{margin:0,fontFamily:'var(--font-sans)',fontSize:18,lineHeight:1.6,color:'#0f172a',maxWidth:540}}>ユーザー価値から考えてデザインするスキルを身につける人のためのトレーニングサービスです</p>
        <div style={{display:'flex',gap:14,marginTop:8}}>
          <CTAPrimary>はじめ方を見る</CTAPrimary>
          <CTASecondary onClick={onGoRoadmaps}>ロードマップを見る</CTASecondary>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:20,width:'100%'}}>
        <p style={{margin:0,fontFamily:'var(--font-rounded)',fontWeight:800,fontSize:15,color:'#293525',letterSpacing:'.02em'}}>目的に合わせたロードマップでデザインの楽しさを探究しよう</p>
        <div style={{display:'flex',gap:24,justifyContent:'center',flexWrap:'wrap',padding:'16px 0'}}>
          {cards.map(c=>(
            <a key={c.slug} href="#" style={{transform:`rotate(${c.rot}deg)`,textDecoration:'none'}}>
              <div style={{width:300,height:380,borderRadius:28,background:c.grad,boxShadow:'0 1px 12px rgba(0,0,0,.08)',position:'relative',overflow:'hidden',transition:'transform .6s cubic-bezier(0.34,1.56,0.64,1)'}}>
                <div style={{position:'absolute',left:24,top:24,width:52,height:52,borderRadius:9999,background:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                </div>
                <div style={{position:'absolute',inset:'auto 24px 24px 24px'}}>
                  <div style={{display:'inline-flex',padding:'4px 10px',border:'1px solid #fff',borderRadius:9999,fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:11,color:'#fff',marginBottom:10}}>ロードマップ</div>
                  <h3 style={{margin:0,fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:22,lineHeight:1.37,color:'#fff'}}>{c.title}</h3>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function GoalNav({onPick}){
  const goals=[
    {img:'../../assets/goal-buttons/flying_saucer_3d.png',label:'UI/UXに転職'},
    {img:'../../assets/goal-buttons/joystick_3d.png',label:'副業をはじめる'},
    {img:'../../assets/goal-buttons/magic_wand_3d.png',label:'スキルアップ'},
    {img:'../../assets/goal-buttons/parachute_3d.png',label:'独立する'},
  ];
  const [active,setActive]=React.useState(0);
  return (
    <section style={{padding:'56px 24px',maxWidth:1200,margin:'0 auto'}}>
      <p style={{textAlign:'center',fontFamily:'var(--font-rounded)',fontWeight:800,fontSize:14,color:'#293525',margin:'0 0 20px'}}>なりたいゴールを選ぶ</p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
        {goals.map((g,i)=><GoalPill key={i} img={g.img} label={g.label} active={active===i} onClick={()=>{setActive(i);onPick&&onPick(i)}}/>)}
      </div>
    </section>
  );
}

Object.assign(window, { Hero, GoalNav });
