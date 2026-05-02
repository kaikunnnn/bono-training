function TrainingGrid(){
  const cards=[
    {id:'uiux-career',cat:'UIUX転職',catColor:'#5E6871',big:'UIUX転職',bigColor:'#b7b7b9',bg:'linear-gradient(180deg,rgba(232,235,251,.5) 0%,rgba(214,189,213,.5) 47%,rgba(234,209,189,.5) 76%,rgba(248,245,245,.5) 100%)',desc:'情報設計でユーザー中心のUI設計をはじめるロードマップ'},
    {id:'ux-design',cat:'顧客の課題解決',catColor:'#525382',big:'ユーザー価値',bigColor:'#0015ff',bg:'#ffc8d8',desc:'ユーザー起点で課題解決をするロードマップ'},
    {id:'info-arch',cat:'情報設計',catColor:'#774000',big:'情報設計のきほん',bigColor:'#ff8800',bg:'#cbdcca',desc:'情報設計でユーザー中心のUI設計をはじめる'},
    {id:'ui-visual',cat:'UIデザイン',catColor:'#08381D',big:'UIビジュアル',bigColor:'#e2fc19',bg:'#c9d1ff',desc:'ユーザー起点で課題解決をするロードマップ'},
  ];
  return (
    <section style={{padding:'56px 24px',maxWidth:1280,margin:'0 auto'}}>
      <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:28}}>
        <h2 style={{margin:0,fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:32,color:'#021710'}}>トレーニングを探す</h2>
        <a href="#" style={{fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:13,color:'#021710',textDecoration:'underline'}}>すべて見る →</a>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:20}}>
        {cards.map(c=>(
          <a key={c.id} href="#" style={{position:'relative',display:'block',borderRadius:28,height:420,background:c.bg,boxShadow:'0 1px 12px rgba(0,0,0,.08)',overflow:'hidden',textDecoration:'none',transition:'all .6s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <div style={{position:'absolute',left:24,top:24,fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:14,color:c.catColor}}>{c.cat}</div>
            <div style={{position:'absolute',right:24,top:24,fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:13,color:c.catColor,opacity:.62}}>トレーニング</div>
            <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}>
              <h3 style={{margin:0,fontFamily:'var(--font-jp)',fontWeight:700,fontSize:'clamp(40px,6vw,72px)',fontStyle:'italic',color:c.bigColor,whiteSpace:'nowrap',transform:'skewX(-0.38deg)',lineHeight:1.5}}>{c.big}</h3>
            </div>
            <div style={{position:'absolute',left:0,right:0,bottom:20,textAlign:'center',fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:11,color:c.catColor,opacity:.64}}>{c.desc}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

function Footer(){
  return (
    <footer style={{background:'#0D221D',color:'#FAFBFB',padding:'48px 24px',marginTop:64}}>
      <div style={{maxWidth:1280,margin:'0 auto',display:'flex',gap:40,flexWrap:'wrap'}}>
        <div style={{flex:1,minWidth:240}}>
          <img src="../../assets/bono-logo.svg" style={{height:24,filter:'invert(1) brightness(2)'}}/>
          <p style={{fontFamily:'var(--font-sans)',fontSize:13,lineHeight:1.7,color:'rgba(250,251,251,.72)',marginTop:12,letterSpacing:'-0.02em'}}>デザインスキルを身につけたい人のためのトレーニングサービス。ワクワクするものをつくるためのスキルを体系的に。</p>
        </div>
        {[['学ぶ',['ロードマップ','コース','レッスン','お題']],['会社',['BONOについて','プラン','お問い合わせ']],['SNS',['X / Twitter','YouTube','note']]].map(([h,items])=>(
          <div key={h} style={{minWidth:140}}>
            <div style={{fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:13,marginBottom:12}}>{h}</div>
            {items.map(i=><a key={i} href="#" style={{display:'block',fontFamily:'var(--font-sans)',fontSize:13,color:'rgba(250,251,251,.72)',textDecoration:'none',padding:'4px 0'}}>{i}</a>)}
          </div>
        ))}
      </div>
      <div style={{maxWidth:1280,margin:'32px auto 0',fontFamily:'var(--font-sans)',fontSize:11,color:'rgba(250,251,251,.5)'}}>© 2026 BONO</div>
    </footer>
  );
}

Object.assign(window,{TrainingGrid,Footer});
