import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const GUEST_LIMIT = 1;
const getGD = () => parseInt(localStorage.getItem("tr_gd") || "0");
const incGD = () => localStorage.setItem("tr_gd", getGD() + 1);

const COLORS = ["#e74c3c","#e67e22","#f39c12","#2ecc71","#1abc9c","#3498db","#9b59b6","#e91e63","#00b894","#0984e3"];
const TYPES = ["Notes", "Past Papers", "Marking Schemes"];
const LEVELS_CBC = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const LEVELS_844 = ["Form 1","Form 2","Form 3","Form 4"];
const SUBS_CBC = {
  "Grade 1":["Math","English","Kiswahili","Environmental Activities"],
  "Grade 2":["Math","English","Kiswahili","Environmental Activities"],
  "Grade 3":["Math","English","Kiswahili","Science","Social Studies"],
  "Grade 4":["Math","English","Kiswahili","Science","Social Studies","CRE"],
  "Grade 5":["Math","English","Kiswahili","Science","Social Studies","CRE"],
  "Grade 6":["Math","English","Kiswahili","Science","Social Studies","CRE"],
  "Grade 7":["Math","English","Kiswahili","Integrated Science","Social Studies","CRE","Health Ed"],
  "Grade 8":["Math","English","Kiswahili","Integrated Science","Social Studies","CRE","Health Ed"],
  "Grade 9":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE"],
  "Grade 10":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE"],
  "Grade 11":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE"],
  "Grade 12":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE"],
};
const SUBS_844 = {
  "Form 1":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE","Business"],
  "Form 2":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE","Business"],
  "Form 3":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE","Business"],
  "Form 4":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE","Business"],
};

const toApiPhone = (p) => p.startsWith("07") ? "254" + p.slice(1) : p.startsWith("+254") ? p.slice(1) : p;
const isValidPhone = (p) => /^07\d{8}$/.test(p);

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  inp: {
    background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.13)",
    borderRadius:10,padding:"12px 14px",color:"#fff",fontSize:14,
    width:"100%",boxSizing:"border-box",outline:"none",WebkitAppearance:"none",
  },
  lbl: {
    fontSize:11,color:"#aaa",marginBottom:6,display:"block",
    fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,
  },
  btn: {
    background:"linear-gradient(135deg,#ffb400,#ff7b00)",color:"#000",
    border:"none",borderRadius:12,padding:"14px 0",fontWeight:800,
    fontSize:15,cursor:"pointer",width:"100%",
  },
  card: {
    background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:16,overflow:"hidden",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed",bottom:90,left:16,right:16,
      background:type==="err"?"#c0392b":"#27ae60",
      color:"#fff",padding:"13px 20px",borderRadius:14,
      fontWeight:700,fontSize:14,zIndex:9999,textAlign:"center",
      boxShadow:"0 4px 24px rgba(0,0,0,0.4)",
    }}>{msg}</div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",
      zIndex:1000,padding:"0",
    }}>
      <div style={{
        background:"#0d1929",borderRadius:"20px 20px 0 0",
        padding:"24px 20px 36px",width:"100%",maxWidth:520,
        maxHeight:"90vh",overflowY:"auto",position:"relative",
        border:"1px solid rgba(255,180,0,0.15)",
      }}>
        <div style={{
          width:40,height:4,background:"rgba(255,255,255,0.15)",
          borderRadius:2,margin:"0 auto 20px",
        }}/>
        <button onClick={onClose} style={{
          position:"absolute",top:16,right:16,
          background:"rgba(255,255,255,0.08)",border:"none",
          color:"#aaa",cursor:"pointer",borderRadius:8,
          padding:"4px 10px",fontSize:18,lineHeight:1,
        }}>✕</button>
        {children}
      </div>
    </div>
  );
}

function Cover({ m, big }) {
  const icons = { Notes:"📝","Past Papers":"📄","Marking Schemes":"✅" };
  return (
    <div style={{
      height:big?140:64,
      background:`linear-gradient(135deg,${m.color}cc,${m.color}44)`,
      display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",position:"relative",overflow:"hidden",
      borderRadius:big?"14px 14px 0 0":10,flexShrink:0,
    }}>
      <div style={{fontSize:big?32:18}}>{icons[m.type]}</div>
      <div style={{fontSize:8,color:"#fff",fontWeight:700,opacity:0.6,textTransform:"uppercase",letterSpacing:1,marginTop:2}}>{m.system}</div>
      <div style={{position:"absolute",bottom:4,right:6,fontSize:7,color:"#fff",opacity:0.25,fontStyle:"italic"}}>topplussrevisions.top</div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [modal, setModal] = useState(null);
  const [mats, setMats] = useState([]);
  const [matsLoading, setMatsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filt, setFilt] = useState({ system:"",level:"",subject:"",type:"" });
  const [prevMat, setPrevMat] = useState(null);
  const [toast, setToast] = useState({ msg:"",type:"ok" });
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = (msg, type="ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"",type:"ok" }), 3500);
  };

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); checkSub(session.user.id); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); checkSub(session.user.id); }
      else { setUser(null); setProfile(null); setSubscription(null); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { loadMats(); }, []);

  const loadMats = async () => {
    setMatsLoading(true);
    const { data, error } = await supabase.from("materials").select("*").order("created_at",{ascending:false});
    if (!error) setMats((data||[]).map((m,i)=>({...m,color:COLORS[i%COLORS.length]})));
    else showToast("Could not load materials","err");
    setMatsLoading(false);
  };

  const loadProfile = async (id) => {
    const { data } = await supabase.from("profiles").select("*").eq("id",id).single();
    if (data) setProfile(data);
  };

  const checkSub = async (id) => {
    try {
      const res = await fetch("/.netlify/functions/check-subscription",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({userId:id}),
      });
      const data = await res.json();
      setSubscription(data);
      if (data.reason==="expired") showToast("⚠️ Subscription expired. Please renew.","err");
    } catch(e) { console.error(e); }
  };

  const isSubscribed = subscription?.active===true;
  const isAdmin = profile?.role==="admin";
  const userName = profile?.full_name||user?.email?.split("@")[0]||"Student";

  const filtMats = mats.filter(m => {
    if (profile?.system&&!isAdmin&&m.system!==profile.system) return false;
    if (filt.system&&m.system!==filt.system) return false;
    if (filt.level&&m.level!==filt.level) return false;
    if (filt.subject&&m.subject!==filt.subject) return false;
    if (filt.type&&m.type!==filt.type) return false;
    if (search&&!m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const topDL = [...mats].sort((a,b)=>b.downloads-a.downloads).slice(0,6);
  const latest = [...mats].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,6);
  const fSubs = filt.level
    ? [...(SUBS_CBC[filt.level]||[]),...(SUBS_844[filt.level]||[])]
    : [...new Set(Object.values({...SUBS_CBC,...SUBS_844}).flat())].sort();

  const doDownload = async (mat) => {
    await supabase.from("materials").update({downloads:(mat.downloads||0)+1}).eq("id",mat.id);
    setMats(p=>p.map(m=>m.id===mat.id?{...m,downloads:(m.downloads||0)+1}:m));
    if (user) await supabase.from("download_logs").insert([{user_id:user.id,material_id:mat.id}]);
    if (mat.file_url) {
      const a=document.createElement("a"); a.href=mat.file_url;
      a.download=mat.title+".pdf"; a.target="_blank";
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      showToast(`⬇ Downloading: ${mat.title}`);
    } else showToast("File not available yet","err");
  };

  const handleDL = (mat) => {
    if (isAdmin||isSubscribed) { doDownload(mat); return; }
    if (user) { setModal("subscribe"); return; }
    const g=getGD();
    if (g<GUEST_LIMIT) { incGD(); doDownload(mat); if(g+1>=GUEST_LIMIT) showToast("Free download used! Register to continue","err"); }
    else setModal("gate");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setSubscription(null);
    setPage("home"); showToast("Logged out");
  };

  // ── Card ──────────────────────────────────────────────────────────────────
  const Card = ({ m }) => (
    <div style={S.card}>
      <Cover m={m} big />
      <div style={{padding:"12px 13px 14px"}}>
        <div style={{fontSize:9,color:"#ffb400",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>{m.system} · {m.level}</div>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:2,lineHeight:1.3,minHeight:34}}>{m.title}</div>
        <div style={{fontSize:11,color:"#666",marginBottom:10}}>{m.subject} · {m.type}</div>
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          <button onClick={()=>{setPrevMat(m);setModal("preview");}} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"none",color:"#ccc",borderRadius:9,padding:"8px 0",cursor:"pointer",fontWeight:600,fontSize:12}}>👁 Preview</button>
          <button onClick={()=>handleDL(m)} style={{flex:1,background:"linear-gradient(135deg,#ffb400,#ff7b00)",border:"none",color:"#000",borderRadius:9,padding:"8px 0",cursor:"pointer",fontWeight:800,fontSize:12}}>⬇ Download</button>
        </div>
        <div style={{fontSize:10,color:"#444",display:"flex",justifyContent:"space-between"}}>
          <span>⬇ {(m.downloads||0).toLocaleString()}</span>
          <span>{m.pages?`${m.pages}p`:""}</span>
        </div>
      </div>
    </div>
  );

  // ── Nav ───────────────────────────────────────────────────────────────────
  const Nav = () => (
    <nav style={{
      position:"sticky",top:0,zIndex:200,
      background:"rgba(8,14,28,0.98)",backdropFilter:"blur(16px)",
      borderBottom:"1px solid rgba(255,180,0,0.1)",
      padding:"0 16px",height:58,
      display:"flex",alignItems:"center",justifyContent:"space-between",
    }}>
      {/* Logo */}
      <div onClick={()=>{setPage("home");setMenuOpen(false);}} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
        <div style={{width:30,height:30,background:"linear-gradient(135deg,#ffb400,#ff7b00)",borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:12,color:"#000",flexShrink:0}}>T+</div>
        <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:15,color:"#fff",whiteSpace:"nowrap"}}>Toppluss <span style={{color:"#ffb400"}}>Revisions</span></span>
      </div>

      {/* Desktop nav */}
      <div style={{display:"flex",gap:4,alignItems:"center"}}>
        {/* Mobile menu button */}
        <button onClick={()=>setMenuOpen(!menuOpen)} style={{
          background:"none",border:"none",color:"#fff",fontSize:22,
          cursor:"pointer",padding:"4px 8px",lineHeight:1,
          display:"block",
        }}>☰</button>
      </div>

      {/* Slide-down menu */}
      {menuOpen && (
        <div style={{
          position:"fixed",top:58,left:0,right:0,
          background:"#0d1929",borderBottom:"1px solid rgba(255,180,0,0.15)",
          padding:"12px 16px 20px",zIndex:199,
          display:"flex",flexDirection:"column",gap:8,
        }}>
          {[
            {l:"🏠 Home",p:"home"},
            {l:"📚 Browse",p:"browse"},
            ...(isAdmin?[{l:"🛠 Admin",p:"admin"}]:[]),
          ].map(({l,p})=>(
            <button key={p} onClick={()=>{setPage(p);setMenuOpen(false);}} style={{
              background:page===p?"rgba(255,180,0,0.12)":"rgba(255,255,255,0.04)",
              border:`1px solid ${page===p?"rgba(255,180,0,0.3)":"rgba(255,255,255,0.07)"}`,
              color:page===p?"#ffb400":"#ddd",padding:"12px 16px",borderRadius:10,
              cursor:"pointer",fontWeight:700,fontSize:14,textAlign:"left",
            }}>{l}</button>
          ))}
          <div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"4px 0"}}/>
          {user ? (
            <>
              <button onClick={()=>{setPage("dash");setMenuOpen(false);}} style={{
                background:"rgba(255,180,0,0.1)",border:"1px solid rgba(255,180,0,0.25)",
                color:"#ffb400",padding:"12px 16px",borderRadius:10,
                cursor:"pointer",fontWeight:700,fontSize:14,textAlign:"left",
              }}>
                👤 {userName.split(" ")[0]}
                {isSubscribed&&<span style={{marginLeft:8,fontSize:10,background:"#27ae60",color:"#fff",borderRadius:10,padding:"2px 8px"}}>{subscription.plan}</span>}
                {subscription?.reason==="expired"&&<span style={{marginLeft:8,fontSize:10,background:"#c0392b",color:"#fff",borderRadius:10,padding:"2px 8px"}}>Expired</span>}
              </button>
              <button onClick={()=>{logout();setMenuOpen(false);}} style={{
                background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",
                color:"#888",padding:"12px 16px",borderRadius:10,
                cursor:"pointer",fontWeight:700,fontSize:14,textAlign:"left",
              }}>🚪 Logout</button>
            </>
          ) : (
            <>
              <button onClick={()=>{setModal("login");setMenuOpen(false);}} style={{
                background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.13)",
                color:"#fff",padding:"12px 16px",borderRadius:10,
                cursor:"pointer",fontWeight:700,fontSize:14,
              }}>Login</button>
              <button onClick={()=>{setModal("register");setMenuOpen(false);}} style={{
                ...S.btn,borderRadius:10,padding:"12px 16px",textAlign:"left",
              }}>Register Free</button>
            </>
          )}
        </div>
      )}
    </nav>
  );

  // ── Home ──────────────────────────────────────────────────────────────────
  const Home = () => (
    <div>
      {/* Hero */}
      <div style={{position:"relative",padding:"52px 20px 56px",textAlign:"center",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 90% 60% at 50% 0%,rgba(255,180,0,0.1),transparent)",pointerEvents:"none"}}/>
        <div style={{display:"inline-block",background:"rgba(255,180,0,0.1)",border:"1px solid rgba(255,180,0,0.3)",borderRadius:50,padding:"5px 16px",fontSize:11,color:"#ffb400",fontWeight:700,marginBottom:16,textTransform:"uppercase",letterSpacing:1.2}}>Kenya's #1 Revision Platform</div>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,7vw,48px)",fontWeight:900,color:"#fff",lineHeight:1.15,margin:"0 0 14px"}}>
          Ace Every Exam with<br/><span style={{color:"#ffb400"}}>Toppluss Revisions</span>
        </h1>
        <p style={{color:"#aaa",fontSize:"clamp(13px,3.5vw,16px)",maxWidth:400,margin:"0 auto 28px",lineHeight:1.7}}>
          Notes, Past Papers & Marking Schemes for CBC & 8-4-4 students across Kenya.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:12,maxWidth:320,margin:"0 auto 40px"}}>
          <button onClick={()=>setPage("browse")} style={S.btn}>Browse Materials →</button>
          {!user&&<button onClick={()=>setModal("register")} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",padding:"14px 0",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer"}}>Register Free</button>}
        </div>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,maxWidth:320,margin:"0 auto"}}>
          {[["2,000+","Materials"],["CBC + 8-4-4","Systems"],["1 Free","Download"],["KSh 50","From /week"]].map(([n,l])=>(
            <div key={l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 10px",textAlign:"center"}}>
              <div style={{fontSize:18,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{n}</div>
              <div style={{fontSize:11,color:"#666",marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{padding:"0 16px 20px"}}>
        <div style={{position:"relative"}}>
          <input placeholder="Search notes, past papers, subjects…" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&search)setPage("browse");}} style={{...S.inp,paddingLeft:42,fontSize:14}} />
          <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#555"}}>🔍</span>
        </div>
      </div>

      {/* Materials sections */}
      {matsLoading ? (
        <div style={{textAlign:"center",padding:"60px 0",color:"#555"}}>⏳ Loading materials…</div>
      ) : (
        <>
          {topDL.length>0&&(
            <div style={{padding:"0 16px 40px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <span style={{fontSize:18}}>🔥</span>
                <h2 style={{margin:0,fontSize:18,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Most Downloaded</h2>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                {topDL.map(m=><Card key={m.id} m={m}/>)}
              </div>
            </div>
          )}
          {latest.length>0&&(
            <div style={{padding:"0 16px 40px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <span style={{fontSize:18}}>🆕</span>
                <h2 style={{margin:0,fontSize:18,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Latest Uploads</h2>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                {latest.map(m=><Card key={m.id} m={m}/>)}
              </div>
              <button onClick={()=>setPage("browse")} style={{display:"block",width:"100%",marginTop:16,background:"none",border:"1px solid rgba(255,180,0,0.3)",color:"#ffb400",padding:"13px 0",borderRadius:12,cursor:"pointer",fontWeight:700,fontSize:14}}>View All Materials →</button>
            </div>
          )}
          {mats.length===0&&(
            <div style={{textAlign:"center",padding:"40px 20px",color:"#555"}}>
              <div style={{fontSize:40,marginBottom:12}}>📚</div>
              <div style={{fontSize:15,fontWeight:600,color:"#666"}}>No materials yet</div>
              <div style={{fontSize:12,color:"#444",marginTop:6}}>Check back soon!</div>
            </div>
          )}
        </>
      )}

      {/* Plans */}
      <div style={{padding:"32px 16px 60px",background:"rgba(255,180,0,0.02)",borderTop:"1px solid rgba(255,180,0,0.07)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
          <span style={{fontSize:18}}>💳</span>
          <h2 style={{margin:0,fontSize:18,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Subscription Plans</h2>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {[
            {name:"Weekly",price:"KSh 50",period:"per week",feats:["All Materials","CBC + 8-4-4","Unlimited Downloads"]},
            {name:"Monthly",price:"KSh 150",period:"per month",feats:["Everything in Weekly","Best Value","Priority Support"],hot:true},
          ].map(plan=>(
            <div key={plan.name} style={{background:plan.hot?"rgba(255,180,0,0.08)":"rgba(255,255,255,0.04)",border:`1px solid ${plan.hot?"rgba(255,180,0,0.3)":"rgba(255,255,255,0.08)"}`,borderRadius:16,padding:"20px 18px",position:"relative"}}>
              {plan.hot&&<div style={{position:"absolute",top:-11,right:16,background:"linear-gradient(135deg,#ffb400,#ff7b00)",color:"#000",fontSize:10,fontWeight:800,padding:"3px 12px",borderRadius:50,textTransform:"uppercase",letterSpacing:1}}>Best Value</div>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>{plan.name}</div>
                  <div style={{fontSize:11,color:"#888"}}>{plan.period}</div>
                </div>
                <div style={{fontSize:28,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{plan.price}</div>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                {plan.feats.map(f=><span key={f} style={{fontSize:12,color:"#bbb"}}>✅ {f}</span>)}
              </div>
              <button onClick={()=>setModal(user?"subscribe":"register")} style={S.btn}>
                {user?"Pay via M-Pesa":"Get Started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Browse ─────────────────────────────────────────────────────────────────
  const Browse = () => {
    const lvls = filt.system==="CBC"?LEVELS_CBC:filt.system==="8-4-4"?LEVELS_844:[...LEVELS_CBC,...LEVELS_844];
    return (
      <div style={{padding:"20px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <span style={{fontSize:18}}>📚</span>
          <h2 style={{margin:0,fontSize:18,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Browse Materials</h2>
          <span style={{fontSize:12,color:"#666",marginLeft:"auto"}}>{filtMats.length} results</span>
        </div>

        {/* Search */}
        <div style={{position:"relative",marginBottom:10}}>
          <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{...S.inp,paddingLeft:38,fontSize:13}}/>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#555"}}>🔍</span>
        </div>

        {/* Filters — 2 column grid */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
          {[
            {k:"system",opts:["CBC","8-4-4"],lbl:"System"},
            {k:"level",opts:lvls,lbl:"Level"},
            {k:"subject",opts:fSubs.slice(0,14),lbl:"Subject"},
            {k:"type",opts:TYPES,lbl:"Type"},
          ].map(f=>(
            <select key={f.k} value={filt[f.k]} onChange={e=>setFilt(p=>({...p,[f.k]:e.target.value,...(f.k==="system"?{level:"",subject:""}:{}),...(f.k==="level"?{subject:""}:{})}))} style={{...S.inp,cursor:"pointer",fontSize:13}}>
              <option value="">All {f.lbl}s</option>
              {f.opts.map(o=><option key={o}>{o}</option>)}
            </select>
          ))}
        </div>
        <button onClick={()=>{setFilt({system:"",level:"",subject:"",type:""});setSearch("");}} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",color:"#aaa",borderRadius:10,padding:"10px 0",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:18}}>Clear Filters</button>

        {matsLoading?(
          <div style={{textAlign:"center",padding:"60px 0",color:"#555"}}>⏳ Loading…</div>
        ):filtMats.length===0?(
          <div style={{textAlign:"center",padding:"60px 0",color:"#666"}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <div style={{fontSize:15,fontWeight:600}}>No results found</div>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
            {filtMats.map(m=><Card key={m.id} m={m}/>)}
          </div>
        )}
      </div>
    );
  };

  // ── Dashboard ──────────────────────────────────────────────────────────────
  const Dash = () => {
    if (!user||!profile) return <div style={{textAlign:"center",padding:60,color:"#555"}}>Loading profile…</div>;
    const expired = subscription?.reason==="expired";
    return (
      <div style={{padding:"20px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
          <span style={{fontSize:18}}>👤</span>
          <h2 style={{margin:0,fontSize:18,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Welcome, {userName.split(" ")[0]}!</h2>
        </div>

        {expired&&(
          <div style={{background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.3)",borderRadius:14,padding:"16px",marginBottom:16}}>
            <div style={{fontWeight:700,color:"#e74c3c",marginBottom:6}}>⚠️ Subscription Expired</div>
            <p style={{color:"#aaa",fontSize:13,margin:"0 0 12px"}}>Your {subscription.plan} plan expired. Renew to restore access.</p>
            <button onClick={()=>setModal("subscribe")} style={{...S.btn,padding:"11px 0"}}>Renew Now</button>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
          {[
            {l:"System",v:profile.system,i:"📘"},
            {l:"Level",v:profile.level,i:"🎓"},
            {l:"Phone",v:profile.phone||"—",i:"📱"},
            {l:"Status",v:isSubscribed?`${subscription.plan} Plan`:expired?"Expired":"No Plan",i:"💳",c:isSubscribed?"#27ae60":"#e74c3c"},
            {l:"Days Left",v:isSubscribed?`${subscription.daysLeft} days`:"—",i:"📅"},
          ].map(c=>(
            <div key={c.l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:13,padding:"14px 12px"}}>
              <div style={{fontSize:18,marginBottom:6}}>{c.i}</div>
              <div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{c.l}</div>
              <div style={{fontSize:13,fontWeight:700,color:c.c||"#fff"}}>{c.v}</div>
            </div>
          ))}
        </div>

        {!isSubscribed&&!expired&&(
          <div style={{background:"rgba(255,180,0,0.07)",border:"1px solid rgba(255,180,0,0.2)",borderRadius:14,padding:"16px",marginBottom:20}}>
            <div style={{fontWeight:700,color:"#ffb400",marginBottom:6}}>🚀 Unlock Full Access</div>
            <p style={{color:"#aaa",fontSize:13,margin:"0 0 12px"}}>Subscribe via M-Pesa for unlimited downloads.</p>
            <button onClick={()=>setModal("subscribe")} style={{...S.btn,padding:"11px 0"}}>Subscribe Now</button>
          </div>
        )}

        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
          <span style={{fontSize:16}}>📚</span>
          <h3 style={{margin:0,fontSize:16,color:"#fff",fontWeight:700}}>Your Materials — {profile.level}</h3>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
          {mats.filter(m=>m.level===profile.level).slice(0,6).map(m=><Card key={m.id} m={m}/>)}
        </div>
      </div>
    );
  };

  // ── Admin ──────────────────────────────────────────────────────────────────
  const Admin = () => {
    const [tab, setTab] = useState("upload");
    const [form, setForm] = useState({title:"",system:"CBC",level:"Grade 1",subject:"",type:"Notes"});
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState("");
    const aLvls = form.system==="CBC"?LEVELS_CBC:LEVELS_844;
    const aSubs = SUBS_CBC[form.level]||SUBS_844[form.level]||[];

    const handleFile = e => {
      const f=e.target.files[0];
      if(f&&f.type==="application/pdf") setFile(f);
      else { showToast("Select a PDF file","err"); setFile(null); }
    };

    const upload = async () => {
      if(!form.title||!form.subject){showToast("Fill all fields","err");return;}
      if(!file){showToast("Select a PDF file","err");return;}
      setUploading(true); setProgress("Reading file…");
      try {
        const base64 = await new Promise((res,rej)=>{
          const r=new FileReader();
          r.onload=()=>res(r.result.split(",")[1]);
          r.onerror=()=>rej(new Error("Read failed"));
          r.readAsDataURL(file);
        });
        setProgress("Compressing & watermarking PDF…");
        const res = await fetch("/.netlify/functions/watermark-upload",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({fileBase64:base64,fileName:file.name,metadata:{...form,pages:null}}),
        });
        const data = await res.json();
        if(!res.ok||!data.success) throw new Error(data.error||"Upload failed");
        setProgress("Done!");
        const saved = data.savedPercent>0?` Compressed ${data.savedPercent}% (${data.originalSizeKB}KB → ${data.processedSizeKB}KB)`:"";
        showToast(`✅ Uploaded & watermarked!${saved}`);
        setForm({title:"",system:"CBC",level:"Grade 1",subject:"",type:"Notes"});
        setFile(null);
        await loadMats();
      } catch(err) {
        showToast("Upload failed: "+err.message,"err");
      }
      setUploading(false); setProgress("");
    };

    return (
      <div style={{padding:"20px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
          <span style={{fontSize:18}}>🛠</span>
          <h2 style={{margin:0,fontSize:18,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Admin Dashboard</h2>
        </div>

        <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto"}}>
          {["upload","materials","analytics"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              background:tab===t?"rgba(255,180,0,0.12)":"rgba(255,255,255,0.04)",
              border:`1px solid ${tab===t?"rgba(255,180,0,0.35)":"rgba(255,255,255,0.08)"}`,
              color:tab===t?"#ffb400":"#aaa",padding:"9px 16px",borderRadius:9,
              cursor:"pointer",fontWeight:700,fontSize:12,whiteSpace:"nowrap",
            }}>
              {t==="upload"?"⬆ Upload":t==="materials"?"📋 Materials":"📊 Analytics"}
            </button>
          ))}
        </div>

        {tab==="upload"&&(
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:18}}>
            <h3 style={{color:"#fff",margin:"0 0 16px",fontSize:16}}>Upload New Material</h3>
            <div style={{display:"grid",gap:12}}>
              <div>
                <label style={S.lbl}>Title</label>
                <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} style={S.inp} placeholder="e.g. Mathematics Notes – Grade 9"/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={S.lbl}>System</label>
                  <select value={form.system} onChange={e=>setForm(p=>({...p,system:e.target.value,level:e.target.value==="CBC"?"Grade 1":"Form 1",subject:""}))} style={{...S.inp,cursor:"pointer"}}>
                    <option>CBC</option><option>8-4-4</option>
                  </select>
                </div>
                <div>
                  <label style={S.lbl}>Level</label>
                  <select value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value,subject:""}))} style={{...S.inp,cursor:"pointer"}}>
                    {aLvls.map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={S.lbl}>Subject</label>
                  <select value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} style={{...S.inp,cursor:"pointer"}}>
                    <option value="">Select…</option>
                    {aSubs.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.lbl}>Type</label>
                  <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{...S.inp,cursor:"pointer"}}>
                    {TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={S.lbl}>PDF File</label>
                <div onClick={()=>document.getElementById("pdf-in").click()} style={{border:"2px dashed rgba(255,180,0,0.3)",borderRadius:12,padding:"22px 16px",textAlign:"center",cursor:"pointer",background:file?"rgba(39,174,96,0.05)":"rgba(255,180,0,0.02)"}}>
                  {file?(
                    <>
                      <div style={{fontSize:22,marginBottom:5}}>📄</div>
                      <div style={{color:"#27ae60",fontWeight:700,fontSize:13}}>{file.name}</div>
                      <div style={{color:"#888",fontSize:11,marginTop:2}}>{(file.size/1024/1024).toFixed(1)} MB</div>
                    </>
                  ):(
                    <>
                      <div style={{fontSize:26,marginBottom:5}}>📁</div>
                      <div style={{color:"#888",fontSize:13}}>Tap to select PDF</div>
                      <div style={{color:"#555",fontSize:11,marginTop:2}}>Will be compressed & watermarked</div>
                    </>
                  )}
                </div>
                <input id="pdf-in" type="file" accept="application/pdf" onChange={handleFile} style={{display:"none"}}/>
              </div>
              {progress&&(
                <div style={{background:"rgba(255,180,0,0.07)",border:"1px solid rgba(255,180,0,0.2)",borderRadius:9,padding:"10px 14px",fontSize:13,color:"#ffb400",textAlign:"center"}}>⏳ {progress}</div>
              )}
              <button onClick={upload} disabled={uploading} style={{...S.btn,opacity:uploading?0.7:1}}>
                {uploading?`⏳ ${progress||"Uploading…"}`:"⬆ Upload, Compress & Watermark PDF"}
              </button>
            </div>
          </div>
        )}

        {tab==="materials"&&(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:500}}>
              <thead><tr style={{background:"rgba(255,180,0,0.05)"}}>
                {["Title","System","Level","DLs","File","Del"].map(h=>(
                  <th key={h} style={{padding:"10px 10px",textAlign:"left",color:"#ffb400",fontWeight:700,fontSize:10,textTransform:"uppercase"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {mats.slice(0,50).map((m,i)=>(
                  <tr key={m.id} style={{borderTop:"1px solid rgba(255,255,255,0.04)",background:i%2?"rgba(255,255,255,0.01)":"transparent"}}>
                    <td style={{padding:"9px 10px",color:"#fff",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</td>
                    <td style={{padding:"9px 10px",color:"#aaa"}}>{m.system}</td>
                    <td style={{padding:"9px 10px",color:"#aaa"}}>{m.level}</td>
                    <td style={{padding:"9px 10px",color:"#ffb400",fontWeight:700}}>{m.downloads||0}</td>
                    <td style={{padding:"9px 10px"}}>
                      {m.file_url?<a href={m.file_url} target="_blank" rel="noopener noreferrer" style={{color:"#3498db",fontSize:11}}>🔗</a>:<span style={{color:"#555"}}>—</span>}
                    </td>
                    <td style={{padding:"9px 10px"}}>
                      <button onClick={async()=>{await supabase.from("materials").delete().eq("id",m.id);setMats(p=>p.filter(x=>x.id!==m.id));showToast("Deleted");}} style={{background:"rgba(231,76,60,0.14)",border:"1px solid rgba(231,76,60,0.25)",color:"#e74c3c",borderRadius:5,padding:"4px 8px",cursor:"pointer",fontSize:11}}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==="analytics"&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
            {[
              {l:"Total Materials",v:mats.length,i:"📄"},
              {l:"Total Downloads",v:mats.reduce((s,m)=>s+(m.downloads||0),0).toLocaleString(),i:"⬇"},
              {l:"CBC Materials",v:mats.filter(m=>m.system==="CBC").length,i:"📘"},
              {l:"8-4-4 Materials",v:mats.filter(m=>m.system==="8-4-4").length,i:"📗"},
              {l:"Notes",v:mats.filter(m=>m.type==="Notes").length,i:"📝"},
              {l:"Past Papers",v:mats.filter(m=>m.type==="Past Papers").length,i:"📄"},
            ].map(c=>(
              <div key={c.l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:13,padding:"16px 13px"}}>
                <div style={{fontSize:20,marginBottom:7}}>{c.i}</div>
                <div style={{fontSize:10,color:"#888",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{c.l}</div>
                <div style={{fontSize:20,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{c.v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ── Modals ────────────────────────────────────────────────────────────────
  const LoginM = () => {
    const [f,setF]=useState({email:"",password:""});
    const [ld,setLd]=useState(false);
    const go=async()=>{
      if(!f.email||!f.password){showToast("Fill all fields","err");return;}
      setLd(true);
      const{error}=await supabase.auth.signInWithPassword({email:f.email,password:f.password});
      if(error) showToast("Login failed: "+error.message,"err");
      else{showToast("Welcome back! 👋");setModal(null);setPage("dash");}
      setLd(false);
    };
    return(
      <div>
        <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Welcome Back</h2>
        <p style={{color:"#888",fontSize:13,margin:"0 0 20px"}}>Login to your Toppluss account</p>
        <div style={{display:"grid",gap:12}}>
          <div><label style={S.lbl}>Email</label><input type="email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} style={S.inp} placeholder="you@example.com"/></div>
          <div><label style={S.lbl}>Password</label><input type="password" value={f.password} onChange={e=>setF(p=>({...p,password:e.target.value}))} style={S.inp} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <button onClick={go} disabled={ld} style={{...S.btn,opacity:ld?0.7:1}}>{ld?"Logging in…":"Login"}</button>
          <p style={{textAlign:"center",fontSize:12,color:"#888",margin:0}}>No account? <button onClick={()=>setModal("register")} style={{background:"none",border:"none",color:"#ffb400",cursor:"pointer",fontWeight:700,fontSize:12}}>Register free</button></p>
        </div>
      </div>
    );
  };

  const RegisterM = () => {
    const [f,setF]=useState({name:"",email:"",phone:"",password:"",system:"CBC",level:"Grade 1"});
    const [ld,setLd]=useState(false);
    const rLvls=f.system==="CBC"?LEVELS_CBC:LEVELS_844;
    const go=async()=>{
      if(!f.name||!f.email||!f.phone||!f.password){showToast("Fill all fields","err");return;}
      if(!isValidPhone(f.phone)){showToast("Phone must start with 07","err");return;}
      if(f.password.length<6){showToast("Password min 6 characters","err");return;}
      setLd(true);
      const{error}=await supabase.auth.signUp({email:f.email,password:f.password,options:{data:{full_name:f.name,phone:f.phone,system:f.system,level:f.level}}});
      if(error) showToast("Registration failed: "+error.message,"err");
      else{showToast("🎉 Registered successfully!");setModal(null);setPage("dash");}
      setLd(false);
    };
    return(
      <div>
        <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Create Account</h2>
        <p style={{color:"#888",fontSize:12,margin:"0 0 18px"}}>Free trial included — no card needed</p>
        <div style={{display:"grid",gap:11}}>
          <div><label style={S.lbl}>Full Name</label><input value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} style={S.inp} placeholder="Jane Mwangi"/></div>
          <div><label style={S.lbl}>Email</label><input type="email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} style={S.inp} placeholder="jane@example.com"/></div>
          <div><label style={S.lbl}>Phone (07…)</label><input value={f.phone} onChange={e=>setF(p=>({...p,phone:e.target.value}))} style={S.inp} placeholder="0712345678" maxLength={10}/></div>
          <div><label style={S.lbl}>Password</label><input type="password" value={f.password} onChange={e=>setF(p=>({...p,password:e.target.value}))} style={S.inp} placeholder="Min 6 characters"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={S.lbl}>System</label>
              <select value={f.system} onChange={e=>setF(p=>({...p,system:e.target.value,level:e.target.value==="CBC"?"Grade 1":"Form 1"}))} style={{...S.inp,cursor:"pointer"}}>
                <option>CBC</option><option>8-4-4</option>
              </select>
            </div>
            <div><label style={S.lbl}>Level</label>
              <select value={f.level} onChange={e=>setF(p=>({...p,level:e.target.value}))} style={{...S.inp,cursor:"pointer"}}>
                {rLvls.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <button onClick={go} disabled={ld} style={{...S.btn,opacity:ld?0.7:1,marginTop:4}}>{ld?"Creating account…":"Register & Start Free Trial"}</button>
          <p style={{textAlign:"center",fontSize:12,color:"#888",margin:0}}>Have account? <button onClick={()=>setModal("login")} style={{background:"none",border:"none",color:"#ffb400",cursor:"pointer",fontWeight:700,fontSize:12}}>Login</button></p>
        </div>
      </div>
    );
  };

  const SubscribeM = () => {
    const [plan,setPlan]=useState("monthly");
    const [phone,setPhone]=useState(profile?.phone||"");
    const [ld,setLd]=useState(false);
    const [step,setStep]=useState("choose");
    const pay=async()=>{
      if(!isValidPhone(phone)){showToast("Enter valid 07 number","err");return;}
      setLd(true); setStep("mpesa");
      try{
        const res=await fetch("/.netlify/functions/mpesa",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:toApiPhone(phone),amount:plan==="weekly"?50:150})});
        const data=await res.json();
        if(data.success||res.ok){
          const subRes=await fetch("/.netlify/functions/save-subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:user.id,plan,phone})});
          const subData=await subRes.json();
          if(subData.success){setSubscription({active:true,plan,daysLeft:plan==="weekly"?7:30,expiresAt:subData.expiresAt});setStep("done");}
          else throw new Error(subData.error||"Save failed");
        } else{showToast("Payment failed: "+(data.message||"Try again"),"err");setStep("choose");}
      }catch(e){showToast("Error: "+e.message,"err");setStep("choose");}
      setLd(false);
    };
    return(
      <div>
        {step==="done"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:56,marginBottom:12}}>🎉</div>
            <h2 style={{color:"#ffb400",fontFamily:"'Playfair Display',serif",margin:"0 0 8px"}}>Subscribed!</h2>
            <p style={{color:"#aaa",marginBottom:20,fontSize:14}}>Your {plan} plan is active!</p>
            <button onClick={()=>{setModal(null);setPage("browse");}} style={S.btn}>Browse Materials</button>
          </div>
        ):step==="mpesa"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>📱</div>
            <h3 style={{color:"#fff",margin:"0 0 8px"}}>Check Your Phone</h3>
            <p style={{color:"#aaa",fontSize:13}}>STK Push sent to <strong style={{color:"#ffb400"}}>{phone}</strong></p>
            <p style={{color:"#777",fontSize:12,marginTop:8}}>Enter M-Pesa PIN to complete…</p>
          </div>
        ):(
          <div>
            <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Subscribe via M-Pesa</h2>
            <p style={{color:"#888",fontSize:12,margin:"0 0 18px"}}>Instant activation after payment</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[{k:"weekly",l:"Weekly",p:"KSh 50",d:"7 days"},{k:"monthly",l:"Monthly",p:"KSh 150",d:"30 days"}].map(pl=>(
                <div key={pl.k} onClick={()=>setPlan(pl.k)} style={{border:`2px solid ${plan===pl.k?"#ffb400":"rgba(255,255,255,0.09)"}`,borderRadius:12,padding:"14px 10px",cursor:"pointer",textAlign:"center",background:plan===pl.k?"rgba(255,180,0,0.07)":"transparent"}}>
                  <div style={{fontWeight:700,color:"#fff",marginBottom:2,fontSize:14}}>{pl.l}</div>
                  <div style={{fontSize:22,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{pl.p}</div>
                  <div style={{fontSize:10,color:"#888",marginTop:2}}>{pl.d}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:14}}>
              <label style={S.lbl}>M-Pesa Phone (07…)</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} style={S.inp} placeholder="0712345678" maxLength={10}/>
            </div>
            <button onClick={pay} disabled={ld} style={{...S.btn,opacity:ld?0.7:1}}>
              {ld?"Sending STK Push…":`Pay ${plan==="weekly"?"KSh 50":"KSh 150"} via M-Pesa`}
            </button>
          </div>
        )}
      </div>
    );
  };

  const GateM = () => (
    <div style={{textAlign:"center",padding:"12px 0"}}>
      <div style={{fontSize:50,marginBottom:12}}>🔒</div>
      <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 8px",fontSize:20}}>Download Limit Reached</h2>
      <p style={{color:"#aaa",fontSize:13,margin:"0 0 20px",lineHeight:1.65}}>
        You've used your <strong style={{color:"#ffb400"}}>1 free download</strong>.<br/>Register or subscribe to continue.
      </p>
      <div style={{display:"grid",gap:10}}>
        <button onClick={()=>setModal("register")} style={S.btn}>Register Free</button>
        <button onClick={()=>setModal("login")} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.13)",color:"#fff",padding:"13px 0",borderRadius:12,fontWeight:700,cursor:"pointer",fontSize:14}}>Login</button>
      </div>
    </div>
  );

  const PreviewM = () => {
    if(!prevMat) return null;
    return(
      <div>
        <div style={{display:"flex",gap:12,marginBottom:16,alignItems:"center"}}>
          <Cover m={prevMat}/>
          <div>
            <div style={{fontSize:9,color:"#ffb400",fontWeight:700,textTransform:"uppercase"}}>{prevMat.system} · {prevMat.level}</div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",margin:"3px 0"}}>{prevMat.title}</div>
            <div style={{fontSize:12,color:"#888"}}>{prevMat.subject} · {prevMat.type}</div>
          </div>
        </div>
        <div style={{background:"#fff",borderRadius:12,padding:18,marginBottom:14,minHeight:220,position:"relative",overflow:"hidden"}}>
          <div style={{fontFamily:"Georgia,serif",fontSize:15,fontWeight:700,textAlign:"center",marginBottom:12,color:"#111"}}>{prevMat.title}</div>
          <div style={{fontSize:12,color:"#333",lineHeight:1.8}}>
            <p><strong>1. Introduction</strong></p>
            <p>This material covers essential concepts for <strong>{prevMat.subject}</strong> at <strong>{prevMat.level}</strong>.</p>
            <p><strong>2. Learning Outcomes</strong></p>
            <p>By the end of this unit, learners will be able to apply core principles…</p>
          </div>
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-28deg)",opacity:0.14,fontSize:14,fontWeight:900,color:"#000",whiteSpace:"nowrap",pointerEvents:"none",letterSpacing:1}}>
            www.topplussrevisions.top
          </div>
          <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:"linear-gradient(transparent,rgba(255,255,255,0.97))",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:8}}>
            <span style={{fontSize:11,color:"#888",fontStyle:"italic"}}>…preview ends here. Download to read full document.</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setModal(null)} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#ccc",padding:"12px 0",borderRadius:10,cursor:"pointer",fontWeight:600}}>Close</button>
          <button onClick={()=>{setModal(null);handleDL(prevMat);}} style={{flex:2,...S.btn,padding:"12px 0",borderRadius:10}}>⬇ Download Full</button>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:"#080e1c",color:"#fff",fontFamily:"'DM Sans',sans-serif",overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"/>
      <Nav/>
      {/* Tap outside menu to close */}
      {menuOpen&&<div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:198}}/>}
      <main style={{paddingBottom:80}}>
        {page==="home"&&<Home/>}
        {page==="browse"&&<Browse/>}
        {page==="dash"&&<Dash/>}
        {page==="admin"&&isAdmin&&<Admin/>}
      </main>

      {/* Bottom nav bar */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(8,14,28,0.98)",borderTop:"1px solid rgba(255,255,255,0.07)",display:"flex",height:60,zIndex:150}}>
        {[
          {p:"home",i:"🏠",l:"Home"},
          {p:"browse",i:"📚",l:"Browse"},
          ...(user?[{p:"dash",i:"👤",l:"Account"}]:[{p:"__login",i:"🔑",l:"Login"}]),
          ...(isAdmin?[{p:"admin",i:"🛠",l:"Admin"}]:[]),
        ].map(({p,i,l})=>(
          <button key={p} onClick={()=>{if(p==="__login")setModal("login");else setPage(p);setMenuOpen(false);}} style={{
            flex:1,background:"none",border:"none",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",
            justifyContent:"center",gap:2,
            color:page===p?"#ffb400":"#666",
          }}>
            <span style={{fontSize:18}}>{i}</span>
            <span style={{fontSize:10,fontWeight:700}}>{l}</span>
          </button>
        ))}
      </div>

      {/* WhatsApp */}
      <a href="https://wa.me/254755803149?text=Hello%2C%20I%20need%20help%20with%20Toppluss%20Revisions" target="_blank" rel="noopener noreferrer"
        style={{position:"fixed",bottom:72,right:16,width:48,height:48,background:"#25D366",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 18px rgba(37,211,102,0.45)",zIndex:140,textDecoration:"none",fontSize:24}}>
        💬
      </a>

      <Toast {...toast}/>
      {modal==="login"&&<Modal onClose={()=>setModal(null)}><LoginM/></Modal>}
      {modal==="register"&&<Modal onClose={()=>setModal(null)}><RegisterM/></Modal>}
      {modal==="subscribe"&&<Modal onClose={()=>setModal(null)}><SubscribeM/></Modal>}
      {modal==="gate"&&<Modal onClose={()=>setModal(null)}><GateM/></Modal>}
      {modal==="preview"&&<Modal onClose={()=>setModal(null)}><PreviewM/></Modal>}
    </div>
  );
}
