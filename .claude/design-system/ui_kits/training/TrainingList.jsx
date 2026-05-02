function TrainingHero(){
  return (
    <section style={{padding:'40px 0 32px',borderBottom:'1px solid #e2e8f0'}}>
      <h1 style={{margin:0,fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:36,lineHeight:1.2,color:'#1d382f'}}>トレーニング。それは"可能性"をひらく扉。</h1>
      <p style={{margin:'10px 0 0',fontFamily:'var(--font-sans)',fontSize:16,color:'#475569'}}>各コースで身につけたことをアウトプットするお題を並べています🙋</p>
    </section>
  );
}

function TrainingListCard({t,onOpen}){
  return (
    <a onClick={onOpen} style={{cursor:'pointer',display:'flex',flexDirection:'column',gap:20,textDecoration:'none'}}>
      <div style={{position:'relative',height:380,borderRadius:'320px 320px 24px 24px',border:'2px solid #374151',background:'#FAFBF8',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <img src={t.image} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(8.89px)',opacity:.6}}/>
        <img src={t.image} style={{position:'relative',maxWidth:'78%',maxHeight:'58%',objectFit:'contain'}}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        <span style={{fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:13,letterSpacing:'.05em',color:'#1D283D'}}>{t.type==='challenge'?'チャレンジ':'スキル'}</span>
        <h3 style={{margin:0,fontFamily:'var(--font-rounded)',fontWeight:700,fontSize:22,lineHeight:1.49,letterSpacing:'.02em',color:'#020617'}}>{t.title}</h3>
        <p style={{margin:0,fontFamily:'var(--font-sans)',fontSize:13,lineHeight:1.6,color:'#1D283D'}}>{t.desc}</p>
        <div style={{display:'flex',flexDirection:'column',gap:4,marginTop:4}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{width:64,padding:'3px 6px',background:'#F1F5F9',borderRadius:6,fontFamily:'var(--font-rounded)',fontSize:10,textAlign:'center',color:'#1D283D'}}>筋トレ部位</span><span style={{fontFamily:'var(--font-sans)',fontWeight:600,fontSize:13,color:'#1D283D'}}>{t.part}</span></div>
          <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{width:64,padding:'3px 6px',background:'#F1F5F9',borderRadius:6,fontFamily:'var(--font-rounded)',fontSize:10,textAlign:'center',color:'#1D283D'}}>難易度</span><span style={{fontFamily:'var(--font-sans)',fontWeight:600,fontSize:13,color:'#1D283D'}}>{t.difficulty}</span></div>
        </div>
        <button style={{marginTop:8,background:'transparent',border:'1px solid #020617',borderRadius:9999,padding:'10px 20px',fontFamily:'var(--font-rounded)',fontWeight:800,fontSize:13,letterSpacing:'.04em',color:'#020617',cursor:'pointer'}}>トレーニングを見る</button>
      </div>
    </a>
  );
}

function TrainingGrid({items,onOpen}){
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:28,marginTop:24}}>
      {items.map(t=><TrainingListCard key={t.id} t={t} onOpen={()=>onOpen(t)}/>)}
    </div>
  );
}

Object.assign(window,{TrainingHero,TrainingListCard,TrainingGrid});
