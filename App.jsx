import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const COLORS = ["#e74c3c","#e67e22","#f39c12","#2ecc71","#1abc9c","#3498db","#9b59b6","#e91e63","#00b894","#0984e3"];

const TYPES = [
  "Notes","Past Papers","Marking Schemes","Assignments","Holiday Assignments",
  "Revision Papers","Exams","CATs","Lesson Plans","Schemes of Work",
  "Projects","Practical Papers","Setbooks","Study Guides","Syllabus",
  "Topical Questions","Mock Exams","KCPE Papers","KCSE Papers","CBC Assessments",
];

const LEVELS_CBC = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const LEVELS_844 = ["Form 1","Form 2","Form 3","Form 4"];

const SUBS_CBC_LIST = [
  "Mathematics","English","Kiswahili","Kenyan Sign Language","Indigenous Languages",
  "Integrated Science","Health Education","Social Studies","Religious Education",
  "CRE","IRE","HRE","Agriculture","Agriculture & Nutrition","Home Science",
  "Business Studies","Computer Science","Pre-Technical Studies","Life Skills Education",
  "Creative Arts","Music","Art & Craft","Sports & PE","Physical Education",
  "Environmental Activities","Science & Technology","Hygiene & Nutrition",
  "Movement & Creative Activities","French","German","Arabic","Mandarin",
  "Theatre & Film","Sports & Recreation","Community Service Learning",
  "Technical Studies","Biology","Physics","Chemistry","Geography",
  "History & Citizenship","Fine Arts","Music & Dance",
];
const SUBS_CBC = {
  "Grade 1":SUBS_CBC_LIST,"Grade 2":SUBS_CBC_LIST,"Grade 3":SUBS_CBC_LIST,
  "Grade 4":SUBS_CBC_LIST,"Grade 5":SUBS_CBC_LIST,"Grade 6":SUBS_CBC_LIST,
  "Grade 7":SUBS_CBC_LIST,"Grade 8":SUBS_CBC_LIST,"Grade 9":SUBS_CBC_LIST,
  "Grade 10":SUBS_CBC_LIST,"Grade 11":SUBS_CBC_LIST,"Grade 12":SUBS_CBC_LIST,
};

const SUBS_844_LIST = [
  "Mathematics","English","Kiswahili","Biology","Chemistry","Physics",
  "Geography","History","CRE","IRE","HRE","Business Studies","Agriculture",
  "Home Science","Computer Studies","French","German","Arabic","Music",
  "Art & Design","Aviation Technology","Electricity","Metal Work","Wood Work",
  "Building Construction","Power Mechanics",
];
const SUBS_844 = {
  "Form 1":SUBS_844_LIST,"Form 2":SUBS_844_LIST,
  "Form 3":SUBS_844_LIST,"Form 4":SUBS_844_LIST,
};

// ── Generates a stable-looking fake download count (10,000–100,000) ───────
// Unique per material ID, ticks up slightly every 10 seconds automatically.
function getFakeDownloads(id) {
  if (!id) return "10,000";
  const base = (id.charCodeAt(0) + id.charCodeAt(1) + id.charCodeAt(2)) * 317;
  const bump = Math.floor(Date.now() / 10000);
  const num = (base % 90000) + 10000 + (bump % 500);
  return num.toLocaleString();
}
// ─────────────────────────────────────────────────────────────────────────

const toApiPhone = (p) => p.startsWith("07") ? "254"+p.slice(1) : p.startsWith("+254") ? p.slice(1) : p;
const isValidPhone = (p) => /^07\d{8}$/.test(p);

const inp = {
  background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.13)",
  borderRadius:10,padding:"12px 14px",color:"#fff",fontSize:14,
  width:"100%",boxSizing:"border-box",outline:"none",WebkitAppearance:"none",
};
const lbl = {
  fontSize:11,color:"#aaa",marginBottom:6,display:"block",
  fontWeight:700,textTransform:"uppercase",letterSpacing:0.7,
};
const btnPrimary = {
  background:"linear-gradient(135deg,#ffb400,#ff7b00)",color:"#000",
  border:"none",borderRadius:10,padding:"13px 0",fontWeight:800,
  fontSize:15,cursor:"pointer",width:"100%",
};

const WaIcon = ()=>(
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// ─── Stable child components defined OUTSIDE App ───────────────────────────

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed",bottom:20,left:16,right:16,
      background:type==="err"?"#c0392b":"#27ae60",
      color:"#fff",padding:"13px 20px",borderRadius:12,
      fontWeight:700,fontSize:14,zIndex:9999,textAlign:"center",
      boxShadow:"0 4px 20px rgba(0,0,0,0.5)",
    }}>{msg}</div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{
      position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",
      display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000,
    }}>
      <div style={{
        background:"#0d1929",borderRadius:"20px 20px 0 0",
        padding:"20px 20px 40px",width:"100%",maxWidth:520,
        maxHeight:"92vh",overflowY:"auto",position:"relative",
        border:"1px solid rgba(255,180,0,0.12)",
      }}>
        <div style={{width:36,height:4,background:"rgba(255,255,255,0.12)",borderRadius:2,margin:"0 auto 18px"}}/>
        <button onClick={onClose} style={{
          position:"absolute",top:14,right:14,background:"rgba(255,255,255,0.07)",
          border:"none",color:"#aaa",cursor:"pointer",borderRadius:7,padding:"4px 9px",fontSize:17,
        }}>✕</button>
        {children}
      </div>
    </div>
  );
}

// ── FIX: Card now uses getFakeDownloads(m.id) instead of real download count ──
function Card({ m, getIcon, onPreview, onDownload }) {
  return (
    <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,overflow:"hidden",display:"flex",alignItems:"stretch"}}>
      <div style={{width:60,flexShrink:0,background:`linear-gradient(180deg,${m.color}cc,${m.color}55)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,position:"relative"}}>
        <div style={{fontSize:20}}>{getIcon(m.type)}</div>
        <div style={{fontSize:7,color:"#fff",fontWeight:700,opacity:0.7,textTransform:"uppercase",letterSpacing:0.5}}>{m.system}</div>
        <div style={{position:"absolute",bottom:3,fontSize:6,color:"#fff",opacity:0.18,fontStyle:"italic"}}>topplussrevisions.top</div>
      </div>
      <div style={{flex:1,padding:"11px 12px",minWidth:0}}>
        <div style={{fontSize:9,color:"#ffb400",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>{m.system} · {m.level}</div>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:2,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</div>
        {m.description&&<div style={{fontSize:11,color:"#777",marginBottom:4,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.description}</div>}
        <div style={{fontSize:11,color:"#555",marginBottom:9}}>{m.subject} · {m.type}</div>
        <div style={{display:"flex",gap:7}}>
          <button onClick={()=>onPreview(m)} style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",color:"#ccc",borderRadius:8,padding:"7px 0",cursor:"pointer",fontWeight:600,fontSize:11}}>👁 Preview</button>
          <button onClick={()=>onDownload(m)} style={{flex:1,background:"linear-gradient(135deg,#ffb400,#ff7b00)",border:"none",color:"#000",borderRadius:8,padding:"7px 0",cursor:"pointer",fontWeight:800,fontSize:11}}>⬇ Download</button>
        </div>
      </div>
      <div style={{padding:"11px 10px 11px 0",display:"flex",flexDirection:"column",justifyContent:"flex-end",flexShrink:0}}>
        <span style={{fontSize:10,color:"#444"}}>⬇ {getFakeDownloads(m.id)}</span>
        {m.pages&&<span style={{fontSize:9,color:"#333",marginTop:2}}>{m.pages}p</span>}
      </div>
    </div>
  );
}

function SectionHead({ icon, title, sub }) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
        <span style={{fontSize:18}}>{icon}</span>
        <h2 style={{margin:0,fontSize:17,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>{title}</h2>
      </div>
      {sub&&<p style={{margin:0,fontSize:12,color:"#555",paddingLeft:26}}>{sub}</p>}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage]       = useState("home");
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSub]= useState(null);
  const [modal, setModal]     = useState(null);
  const [mats, setMats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filt, setFilt]       = useState({system:"",level:"",subject:"",type:""});
  const [prevMat, setPrevMat] = useState(null);
  const [toast, setToast]     = useState({msg:"",type:"ok"});

  useEffect(()=>{
    document.documentElement.style.backgroundColor="#080e1c";
    document.body.style.backgroundColor="#080e1c";
    document.body.style.margin="0";
    document.body.style.overscrollBehavior="none";
    const root=document.getElementById("root");
    if(root) root.style.backgroundColor="#080e1c";
    let tm=document.querySelector('meta[name="theme-color"]');
    if(!tm){tm=document.createElement("meta");tm.setAttribute("name","theme-color");document.head.appendChild(tm);}
    tm.setAttribute("content","#080e1c");
  },[]);

  const showToast=(msg,type="ok")=>{
    setToast({msg,type});
    setTimeout(()=>setToast({msg:"",type:"ok"}),3500);
  };

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id);checkSub(session.user.id);}
    });
    const {data:l}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id);checkSub(session.user.id);}
      else{setUser(null);setProfile(null);setSub(null);}
    });
    return ()=>l.subscription.unsubscribe();
  },[]);

  useEffect(()=>{loadMats();},[]);

  const loadMats=async()=>{
    setLoading(true);
    const{data,error}=await supabase.from("materials").select("*").order("created_at",{ascending:false});
    if(!error) setMats((data||[]).map((m,i)=>({...m,color:COLORS[i%COLORS.length]})));
    else showToast("Could not load materials","err");
    setLoading(false);
  };

  const loadProfile=async(id)=>{
    const{data}=await supabase.from("profiles").select("*").eq("id",id).single();
    if(data) setProfile(data);
  };

  const checkSub=async(id)=>{
    try{
      const res=await fetch("/.netlify/functions/check-subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:id})});
      const data=await res.json();
      setSub(data);
      if(data.reason==="expired") showToast("⚠️ Subscription expired. Please renew.","err");
    }catch(e){console.error(e);}
  };

  const isSubscribed=subscription?.active===true;
  const isAdmin=profile?.role==="admin";
  const userName=profile?.full_name||user?.email?.split("@")[0]||"Student";

  const filtMats=mats.filter(m=>{
    if(profile?.system&&!isAdmin&&m.system!==profile.system) return false;
    if(filt.system&&m.system!==filt.system) return false;
    if(filt.level&&m.level!==filt.level) return false;
    if(filt.subject&&m.subject!==filt.subject) return false;
    if(filt.type&&m.type!==filt.type) return false;
    if(search&&!m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const topDL=[...mats].sort((a,b)=>b.downloads-a.downloads).slice(0,6);
  const latest=[...mats].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,6);

  const doDownload=async(mat)=>{
    await supabase.from("materials").update({downloads:(mat.downloads||0)+1}).eq("id",mat.id);
    setMats(p=>p.map(m=>m.id===mat.id?{...m,downloads:(m.downloads||0)+1}:m));
    if(user) await supabase.from("download_logs").insert([{user_id:user.id,material_id:mat.id}]);
    if(mat.file_url){
      const a=document.createElement("a");a.href=mat.file_url;a.download=mat.title+".pdf";a.target="_blank";
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      showToast("⬇ Downloading: "+mat.title);
    } else showToast("File not available yet","err");
  };

  // ── FIXED: handleDL — always re-fetches fresh profile from Supabase ──────
  const handleDL = async (mat) => {
    if (isAdmin || isSubscribed) { doDownload(mat); return; }
    if (!user) { setModal("gate"); return; }

    const { data: freshProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (freshProfile) setProfile(freshProfile);

    const used = freshProfile?.free_downloads_used ?? 0;

    if (used < 2) {
      const newUsed = used + 1;
      await supabase
        .from("profiles")
        .update({ free_downloads_used: newUsed })
        .eq("id", user.id);

      setProfile(p => ({ ...p, free_downloads_used: newUsed }));
      doDownload(mat);

      if (newUsed >= 2) {
        showToast("⚠️ You've used all 2 free downloads! Subscribe to continue downloading.", "err");
      } else {
        showToast(`✅ Free download used. ${2 - newUsed} free download(s) remaining.`);
      }
    } else {
      showToast("🔒 You've used all your free downloads. Please subscribe to continue.", "err");
      setModal("subscribe");
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const logout=async()=>{
    await supabase.auth.signOut();
    setUser(null);setProfile(null);setSub(null);
    setPage("home");showToast("Logged out");
  };

  const getIcon=(type)=>({
    "Notes":"📝","Past Papers":"📄","Marking Schemes":"✅","Assignments":"📋",
    "Holiday Assignments":"🏖️","Revision Papers":"📑","Exams":"📝","CATs":"✍️",
    "Lesson Plans":"🗓️","Schemes of Work":"📅","Projects":"🔬","Practical Papers":"🧪",
    "Setbooks":"📖","Study Guides":"🗺️","Syllabus":"📜","Topical Questions":"❓",
    "Mock Exams":"🎯","KCPE Papers":"🏫","KCSE Papers":"🎓","CBC Assessments":"📊",
  }[type]||"📄");

  const cardProps = (m) => ({
    m,
    getIcon,
    onPreview: (mat) => { setPrevMat(mat); setModal("preview"); },
    onDownload: handleDL,
  });

  const Nav = () => (
    <nav style={{position:"sticky",top:0,zIndex:200,background:"rgba(8,14,28,0.98)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(255,180,0,0.1)"}}>
      <div style={{padding:"10px 16px 6px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div onClick={()=>setPage("home")} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#ffb400,#ff7b00)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:13,color:"#000",flexShrink:0}}>T+</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:16,color:"#fff"}}>Toppluss <span style={{color:"#ffb400"}}>Revisions</span></span>
        </div>
      </div>
      <div style={{padding:"0 16px 10px",display:"flex",alignItems:"center",gap:12,flexWrap:"nowrap",overflowX:"auto"}}>
        <button onClick={()=>setPage("home")} style={{background:"none",border:"none",color:page==="home"?"#ffb400":"#bbb",cursor:"pointer",fontWeight:600,fontSize:13,padding:0,whiteSpace:"nowrap",flexShrink:0}}>🏠 Home</button>
        <button onClick={()=>setPage("browse")} style={{background:"none",border:"none",color:page==="browse"?"#ffb400":"#bbb",cursor:"pointer",fontWeight:600,fontSize:13,padding:0,whiteSpace:"nowrap",flexShrink:0}}>📚 Browse</button>
        {isAdmin&&<button onClick={()=>setPage("admin")} style={{background:"none",border:"none",color:page==="admin"?"#ffb400":"#bbb",cursor:"pointer",fontWeight:600,fontSize:13,padding:0,whiteSpace:"nowrap",flexShrink:0}}>🛠 Admin</button>}
        <div style={{flex:1,minWidth:8}}/>
        {user?(
          <button onClick={()=>setPage("dash")} style={{background:"rgba(255,180,0,0.1)",border:"1px solid rgba(255,180,0,0.25)",color:"#ffb400",padding:"5px 12px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,flexShrink:0,whiteSpace:"nowrap"}}>
            👤 {userName.split(" ")[0]}{isSubscribed&&<span style={{marginLeft:6,fontSize:9,background:"#27ae60",color:"#fff",borderRadius:6,padding:"1px 5px"}}>{subscription.plan}</span>}
          </button>
        ):(
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <button onClick={()=>setModal("login")} style={{background:"none",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",padding:"5px 13px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:13,whiteSpace:"nowrap"}}>Login</button>
            <button onClick={()=>setModal("register")} style={{background:"linear-gradient(135deg,#ffb400,#ff7b00)",border:"none",color:"#000",padding:"5px 13px",borderRadius:8,cursor:"pointer",fontWeight:800,fontSize:13,whiteSpace:"nowrap"}}>Register</button>
          </div>
        )}
      </div>
    </nav>
  );

  // ── MODAL COMPONENTS ────────────────────────────────────────────────────

  const ForgotPasswordM=()=>{
    const [email,setEmail]=useState("");
    const [ld,setLd]=useState(false);
    const [sent,setSent]=useState(false);
    const send=async()=>{
      if(!email){showToast("Enter your email","err");return;}
      setLd(true);
      const{error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:"https://topplussrevisions.top/#reset-password"});
      if(error) showToast("Failed: "+error.message,"err");
      else setSent(true);
      setLd(false);
    };
    return(
      <div>
        <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Reset Password</h2>
        {sent?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:48,marginBottom:12}}>📧</div>
            <p style={{color:"#27ae60",fontWeight:700,fontSize:15,marginBottom:8}}>Email sent!</p>
            <p style={{color:"#888",fontSize:13}}>Check your inbox and click the reset link. Then come back and log in with your new password.</p>
            <button onClick={()=>setModal("login")} style={{...btnPrimary,marginTop:16}}>Back to Login</button>
          </div>
        ):(
          <div>
            <p style={{color:"#777",fontSize:13,margin:"0 0 18px"}}>Enter your email and we'll send a reset link.</p>
            <div style={{display:"grid",gap:12}}>
              <div><label style={lbl}>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} placeholder="you@example.com" onKeyDown={e=>e.key==="Enter"&&send()}/></div>
              <button onClick={send} disabled={ld} style={{...btnPrimary,opacity:ld?0.7:1}}>{ld?"Sending…":"Send Reset Link"}</button>
              <p style={{textAlign:"center",fontSize:12,color:"#666",margin:0}}>Remember password? <button onClick={()=>setModal("login")} style={{background:"none",border:"none",color:"#ffb400",cursor:"pointer",fontWeight:700,fontSize:12}}>Login</button></p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const LoginM=()=>{
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
        <p style={{color:"#777",fontSize:13,margin:"0 0 18px"}}>Login to your Toppluss account</p>
        <div style={{display:"grid",gap:12}}>
          <div><label style={lbl}>Email</label><input type="email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} style={inp} placeholder="you@example.com"/></div>
          <div><label style={lbl}>Password</label><input type="password" value={f.password} onChange={e=>setF(p=>({...p,password:e.target.value}))} style={inp} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <button onClick={go} disabled={ld} style={{...btnPrimary,opacity:ld?0.7:1}}>{ld?"Logging in…":"Login"}</button>
          <p style={{textAlign:"center",fontSize:12,color:"#666",margin:0}}>
            <button onClick={()=>setModal("forgot")} style={{background:"none",border:"none",color:"#aaa",cursor:"pointer",fontSize:12}}>Forgot password?</button>
          </p>
          <p style={{textAlign:"center",fontSize:12,color:"#666",margin:0}}>No account? <button onClick={()=>setModal("register")} style={{background:"none",border:"none",color:"#ffb400",cursor:"pointer",fontWeight:700,fontSize:12}}>Register free</button></p>
        </div>
      </div>
    );
  };

  const RegisterM=()=>{
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
      else{showToast("🎉 Registered! You have 2 free downloads.");setModal(null);setPage("dash");}
      setLd(false);
    };
    return(
      <div>
        <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Create Account</h2>
        <p style={{color:"#777",fontSize:12,margin:"0 0 16px"}}>2 free downloads included — no card needed</p>
        <div style={{display:"grid",gap:11}}>
          <div><label style={lbl}>Full Name</label><input value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} style={inp} placeholder="Jane Mwangi"/></div>
          <div><label style={lbl}>Email</label><input type="email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} style={inp} placeholder="jane@example.com"/></div>
          <div><label style={lbl}>Phone (07…)</label><input value={f.phone} onChange={e=>setF(p=>({...p,phone:e.target.value}))} style={inp} placeholder="0712345678" maxLength={10}/></div>
          <div><label style={lbl}>Password</label><input type="password" value={f.password} onChange={e=>setF(p=>({...p,password:e.target.value}))} style={inp} placeholder="Min 6 characters"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><label style={lbl}>System</label><select value={f.system} onChange={e=>setF(p=>({...p,system:e.target.value,level:e.target.value==="CBC"?"Grade 1":"Form 1"}))} style={{...inp,cursor:"pointer"}}><option>CBC</option><option>8-4-4</option></select></div>
            <div><label style={lbl}>Level</label><select value={f.level} onChange={e=>setF(p=>({...p,level:e.target.value}))} style={{...inp,cursor:"pointer"}}>{rLvls.map(l=><option key={l}>{l}</option>)}</select></div>
          </div>
          <button onClick={go} disabled={ld} style={{...btnPrimary,opacity:ld?0.7:1,marginTop:4}}>{ld?"Creating account…":"Register & Get 2 Free Downloads"}</button>
          <p style={{textAlign:"center",fontSize:12,color:"#666",margin:0}}>Have account? <button onClick={()=>setModal("login")} style={{background:"none",border:"none",color:"#ffb400",cursor:"pointer",fontWeight:700,fontSize:12}}>Login</button></p>
        </div>
      </div>
    );
  };

  const SubscribeM=()=>{
    const [plan,setPlan]=useState("monthly");
    const [phone,setPhone]=useState(profile?.phone||"");
    const [ld,setLd]=useState(false);
    const [step,setStep]=useState("choose");
    const pay=async()=>{
      if(!isValidPhone(phone)){showToast("Enter valid 07 number","err");return;}
      setLd(true);setStep("mpesa");
      try{
        const res=await fetch("/.netlify/functions/mpesa",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:toApiPhone(phone),amount:plan==="weekly"?100:250})});
        const data=await res.json();
        if(data.success||res.ok){
          const subRes=await fetch("/.netlify/functions/save-subscription",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:user.id,plan,phone})});
          const subData=await subRes.json();
          if(subData.success){setSub({active:true,plan,daysLeft:plan==="weekly"?7:30,expiresAt:subData.expiresAt});setStep("done");}
          else throw new Error(subData.error||"Save failed");
        }else{showToast("Payment failed: "+(data.message||"Try again"),"err");setStep("choose");}
      }catch(e){showToast("Error: "+e.message,"err");setStep("choose");}
      setLd(false);
    };
    return(
      <div>
        {step==="done"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:52,marginBottom:12}}>🎉</div>
            <h2 style={{color:"#ffb400",fontFamily:"'Playfair Display',serif",margin:"0 0 8px"}}>Subscribed!</h2>
            <p style={{color:"#888",marginBottom:20,fontSize:14}}>Your {plan} plan is now active!</p>
            <button onClick={()=>{setModal(null);setPage("browse");}} style={btnPrimary}>Browse Materials</button>
          </div>
        ):step==="mpesa"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>📱</div>
            <h3 style={{color:"#fff",margin:"0 0 8px"}}>Check Your Phone</h3>
            <p style={{color:"#888",fontSize:13}}>STK Push sent to <strong style={{color:"#ffb400"}}>{phone}</strong></p>
            <p style={{color:"#555",fontSize:12,marginTop:8}}>Enter M-Pesa PIN to complete…</p>
          </div>
        ):(
          <div>
            <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Subscribe via M-Pesa</h2>
            <p style={{color:"#777",fontSize:12,margin:"0 0 16px"}}>Instant activation after payment</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[{k:"weekly",l:"Weekly",p:"KSh 100",d:"7 days"},{k:"monthly",l:"Monthly",p:"KSh 250",d:"30 days"}].map(pl=>(
                <div key={pl.k} onClick={()=>setPlan(pl.k)} style={{border:`2px solid ${plan===pl.k?"#ffb400":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"13px 10px",cursor:"pointer",textAlign:"center",background:plan===pl.k?"rgba(255,180,0,0.06)":"transparent"}}>
                  <div style={{fontWeight:700,color:"#fff",marginBottom:2,fontSize:13}}>{pl.l}</div>
                  <div style={{fontSize:20,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{pl.p}</div>
                  <div style={{fontSize:10,color:"#666",marginTop:2}}>{pl.d}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:14}}><label style={lbl}>M-Pesa Phone (07…)</label><input value={phone} onChange={e=>setPhone(e.target.value)} style={inp} placeholder="0712345678" maxLength={10}/></div>
            <button onClick={pay} disabled={ld} style={{...btnPrimary,opacity:ld?0.7:1}}>{ld?"Sending STK Push…":`Pay ${plan==="weekly"?"KSh 100":"KSh 250"} via M-Pesa`}</button>
          </div>
        )}
      </div>
    );
  };

  const GateM=()=>(
    <div style={{textAlign:"center",padding:"10px 0"}}>
      <div style={{fontSize:48,marginBottom:12}}>🔒</div>
      <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 8px",fontSize:20}}>Register to Download</h2>
      <p style={{color:"#888",fontSize:13,margin:"0 0 20px",lineHeight:1.65}}>Create a free account and get <strong style={{color:"#ffb400"}}>2 free downloads</strong> instantly.</p>
      <div style={{display:"grid",gap:10}}>
        <button onClick={()=>setModal("register")} style={btnPrimary}>Register Free — Get 2 Downloads</button>
        <button onClick={()=>setModal("login")} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#ccc",padding:"12px 0",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:14,width:"100%"}}>Already have account? Login</button>
      </div>
    </div>
  );

  const PreviewM=()=>{
    if(!prevMat) return null;
    const getEmbedUrl=(url)=>{
      if(!url) return null;
      const m1=url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if(m1) return `https://drive.google.com/file/d/${m1[1]}/preview`;
      const m2=url.match(/id=([a-zA-Z0-9_-]+)/);
      if(m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
      return null;
    };
    const embedUrl=getEmbedUrl(prevMat.file_url);
    return(
      <div>
        <div style={{display:"flex",gap:12,marginBottom:14,alignItems:"center"}}>
          <div style={{width:52,height:52,background:`linear-gradient(135deg,${prevMat.color}cc,${prevMat.color}44)`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{getIcon(prevMat.type)}</div>
          <div>
            <div style={{fontSize:9,color:"#ffb400",fontWeight:700,textTransform:"uppercase"}}>{prevMat.system} · {prevMat.level}</div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",margin:"2px 0"}}>{prevMat.title}</div>
            <div style={{fontSize:11,color:"#666"}}>{prevMat.subject} · {prevMat.type}</div>
          </div>
        </div>
        {prevMat.description&&(
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#aaa",lineHeight:1.6}}>
            {prevMat.description}
          </div>
        )}
        {(isSubscribed||isAdmin)&&embedUrl?(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"#27ae60",fontWeight:700,marginBottom:6}}>✅ Subscriber Preview — Full Document</div>
            <div style={{position:"relative",borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,180,0,0.2)"}}>
              <iframe src={embedUrl} style={{width:"100%",height:480,border:"none",display:"block"}} allow="autoplay" title={prevMat.title}/>
            </div>
          </div>
        ):(
          <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:16,marginBottom:12,minHeight:180,position:"relative",overflow:"hidden"}}>
            <div style={{fontSize:13,fontWeight:700,textAlign:"center",marginBottom:10,color:"#fff"}}>{prevMat.title}</div>
            <div style={{fontSize:12,color:"#bbb",lineHeight:1.8}}>
              <p style={{margin:"0 0 8px"}}><strong style={{color:"#fff"}}>1. Introduction</strong></p>
              <p style={{margin:"0 0 8px"}}>This material covers essential concepts for <strong style={{color:"#ffb400"}}>{prevMat.subject}</strong> at <strong style={{color:"#ffb400"}}>{prevMat.level}</strong>.</p>
            </div>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-28deg)",opacity:0.08,fontSize:13,fontWeight:900,color:"#fff",whiteSpace:"nowrap",pointerEvents:"none",letterSpacing:1}}>www.topplussrevisions.top</div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(transparent,rgba(13,25,41,0.98))",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:8}}>
              <span style={{fontSize:10,color:"#555",fontStyle:"italic"}}>{user?"Subscribe to preview full document":"Register free to get 2 free downloads"}</span>
            </div>
          </div>
        )}
        {user&&!isSubscribed&&(
          <div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:9,padding:"10px",marginBottom:12,textAlign:"center"}}>
            <span style={{fontSize:12,color:"#ffb400",fontWeight:600}}>🔐 Subscribe to preview & download all documents</span>
          </div>
        )}
        {!user&&(
          <div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:9,padding:"10px",marginBottom:12,textAlign:"center"}}>
            <span style={{fontSize:12,color:"#ffb400",fontWeight:600}}>📖 Register free — get 2 free downloads</span>
          </div>
        )}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setModal(null)} style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#aaa",padding:"11px 0",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:13}}>Close</button>
          {!user?(
            <button onClick={()=>setModal("register")} style={{flex:2,...btnPrimary,padding:"11px 0",borderRadius:9,fontSize:13}}>Register to Download</button>
          ):!isSubscribed?(
            <button onClick={()=>setModal("subscribe")} style={{flex:2,...btnPrimary,padding:"11px 0",borderRadius:9,fontSize:13}}>💳 Subscribe to Download</button>
          ):(
            <button onClick={()=>{setModal(null);handleDL(prevMat);}} style={{flex:2,...btnPrimary,padding:"11px 0",borderRadius:9,fontSize:13}}>⬇ Download Full</button>
          )}
        </div>
      </div>
    );
  };

  const AnalyticsTab=()=>{
    const [stats,setStats]=useState({users:0,subscribers:0,weekly:0,monthly:0});
    useEffect(()=>{
      const loadStats=async()=>{
        const{count:users}=await supabase.from("profiles").select("*",{count:"exact",head:true});
        const{count:subs}=await supabase.from("subscriptions").select("*",{count:"exact",head:true}).eq("active",true);
        const{count:weekly}=await supabase.from("subscriptions").select("*",{count:"exact",head:true}).eq("plan","weekly").eq("active",true);
        const{count:monthly}=await supabase.from("subscriptions").select("*",{count:"exact",head:true}).eq("plan","monthly").eq("active",true);
        setStats({users:users||0,subscribers:subs||0,weekly:weekly||0,monthly:monthly||0});
      };
      loadStats();
    },[]);
    const topMat=[...mats].sort((a,b)=>b.downloads-a.downloads)[0];
    const revenue=(stats.weekly*100)+(stats.monthly*250);
    const allStats=[
      {l:"Total Materials",v:mats.length,i:"📄"},
      {l:"Total Downloads",v:mats.reduce((s,m)=>s+(m.downloads||0),0).toLocaleString(),i:"⬇"},
      {l:"Registered Users",v:stats.users,i:"👤"},
      {l:"Active Subscribers",v:stats.subscribers,i:"💳",c:"#27ae60"},
      {l:"Weekly Plans",v:stats.weekly,i:"📅"},
      {l:"Monthly Plans",v:stats.monthly,i:"📆"},
      {l:"Est. Revenue",v:`KSh ${revenue.toLocaleString()}`,i:"💰",c:"#ffb400"},
      {l:"CBC Materials",v:mats.filter(m=>m.system==="CBC").length,i:"📘"},
      {l:"8-4-4 Materials",v:mats.filter(m=>m.system==="8-4-4").length,i:"📗"},
      {l:"Notes",v:mats.filter(m=>m.type==="Notes").length,i:"📝"},
      {l:"Past Papers",v:mats.filter(m=>m.type==="Past Papers").length,i:"📄"},
      {l:"Marking Schemes",v:mats.filter(m=>m.type==="Marking Schemes").length,i:"✅"},
      {l:"Revision Papers",v:mats.filter(m=>m.type==="Revision Papers").length,i:"📑"},
      {l:"Assignments",v:mats.filter(m=>m.type==="Assignments").length,i:"📋"},
      {l:"Exams",v:mats.filter(m=>m.type==="Exams").length,i:"📝"},
      {l:"CATs",v:mats.filter(m=>m.type==="CATs").length,i:"✍️"},
      {l:"Mock Exams",v:mats.filter(m=>m.type==="Mock Exams").length,i:"🎯"},
      {l:"KCSE Papers",v:mats.filter(m=>m.type==="KCSE Papers").length,i:"🎓"},
      {l:"KCPE Papers",v:mats.filter(m=>m.type==="KCPE Papers").length,i:"🏫"},
    ];
    return(
      <div>
        {topMat&&(
          <div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.2)",borderRadius:12,padding:"12px",marginBottom:14}}>
            <div style={{fontSize:10,color:"#ffb400",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>🏆 Most Downloaded</div>
            <div style={{fontSize:13,color:"#fff",fontWeight:700}}>{topMat.title}</div>
            <div style={{fontSize:11,color:"#888"}}>{topMat.subject} · {topMat.downloads||0} downloads</div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {allStats.map(c=>(
            <div key={c.l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 12px"}}>
              <div style={{fontSize:18,marginBottom:5}}>{c.i}</div>
              <div style={{fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{c.l}</div>
              <div style={{fontSize:18,fontWeight:900,color:c.c||"#ffb400",fontFamily:"'Playfair Display',serif"}}>{c.v}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Admin=()=>{
    const [tab,setTab]=useState("upload");
    const savedForm=()=>{try{return JSON.parse(sessionStorage.getItem("adminForm")||"null");}catch{return null;}};
    const [form,setForm]=useState(savedForm()||{title:"",description:"",system:"CBC",level:"Grade 1",type:"Notes"});
    const [selectedSubs,setSelectedSubs]=useState([]);
    const [uploadMode,setUploadMode]=useState("url");
    const [fileBase64,setFileBase64]=useState(null);
    const [fileName,setFileName]=useState("");
    const [fileSize,setFileSize]=useState(0);
    const [pasteUrl,setPasteUrl]=useState("");
    const [uploading,setUploading]=useState(false);
    const [progress,setProgress]=useState("");
    const aLvls=form.system==="CBC"?LEVELS_CBC:LEVELS_844;
    const aSubs=["All Subjects",...(SUBS_CBC[form.level]||SUBS_844[form.level]||[])];

    useEffect(()=>{sessionStorage.setItem("adminForm",JSON.stringify(form));},[form]);

    const toggleSub=(s)=>{
      if(s==="All Subjects"){setSelectedSubs(p=>p.length===aSubs.length?[]:aSubs);return;}
      setSelectedSubs(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
    };
    const clearFile=()=>{setFileBase64(null);setFileName("");setFileSize(0);};
    const handleFileSelect=(e)=>{
      const f=e.target.files?.[0];
      if(!f){showToast("No file selected","err");return;}
      const isPdf=f.type==="application/pdf"||f.type===""||f.name.toLowerCase().endsWith(".pdf");
      if(!isPdf){showToast("❌ Please pick a .pdf file","err");clearFile();e.target.value="";return;}
      setFileName(f.name);setFileSize(f.size);
      showToast("📄 Reading file…");
      const reader=new FileReader();
      reader.onload=()=>{setFileBase64(reader.result.split(",")[1]);showToast("✅ File loaded — ready to upload!");};
      reader.onerror=()=>showToast("Could not read file. Try again.","err");
      reader.readAsDataURL(f);
      e.target.value="";
    };
    const normalizeUrl=(url)=>{
      const m=url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if(m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
      return url.trim();
    };
    const upload=async()=>{
      if(!form.title){showToast("Fill Title","err");return;}
      if(selectedSubs.length===0){showToast("Select at least one Subject","err");return;}
      const subjectsToSave=selectedSubs.includes("All Subjects")?["All Subjects"]:selectedSubs;
      if(uploadMode==="url"){
        const url=pasteUrl.trim();
        if(!url){showToast("Paste a Google Drive URL first","err");return;}
        setUploading(true);setProgress("Saving…");
        try{
          const finalUrl=normalizeUrl(url);
          for(let i=0;i<subjectsToSave.length;i++){
            const sub=subjectsToSave[i];
            setProgress(`Saving ${i+1}/${subjectsToSave.length}: ${sub}…`);
            const{error}=await supabase.from("materials").insert([{title:form.title,description:form.description,system:form.system,level:form.level,subject:sub,type:form.type,file_url:finalUrl,downloads:0}]);
            if(error) throw new Error(error.message);
          }
          showToast(`✅ Saved for ${subjectsToSave.length} subject(s)!`);
          setForm({title:"",description:"",system:"CBC",level:"Grade 1",type:"Notes"});
          sessionStorage.removeItem("adminForm");setPasteUrl("");setSelectedSubs([]);
          await loadMats();
        }catch(err){showToast("Failed: "+err.message,"err");}
        finally{setUploading(false);setProgress("");}
        return;
      }
      if(!fileBase64){showToast("Please select a PDF file first","err");return;}
      setUploading(true);setProgress("Uploading to storage…");
      try{
        const byteChars=atob(fileBase64);
        const byteArr=new Uint8Array(byteChars.length);
        for(let i=0;i<byteChars.length;i++) byteArr[i]=byteChars.charCodeAt(i);
        const blob=new Blob([byteArr],{type:"application/pdf"});
        const safeName=`${Date.now()}_${fileName.replace(/[^a-zA-Z0-9._-]/g,"_")}`;
        const{error:uploadError}=await supabase.storage.from("materials").upload(safeName,blob,{contentType:"application/pdf",upsert:false});
        if(uploadError) throw new Error(uploadError.message);
        const{data:{publicUrl}}=supabase.storage.from("materials").getPublicUrl(safeName);
        for(let i=0;i<subjectsToSave.length;i++){
          const sub=subjectsToSave[i];
          setProgress(`Saving ${i+1}/${subjectsToSave.length}: ${sub}…`);
          const{error:dbError}=await supabase.from("materials").insert([{title:form.title,description:form.description,system:form.system,level:form.level,subject:sub,type:form.type,file_url:publicUrl,downloads:0}]);
          if(dbError) throw new Error(dbError.message);
        }
        showToast(`✅ Uploaded for ${subjectsToSave.length} subject(s)!`);
        setForm({title:"",description:"",system:"CBC",level:"Grade 1",type:"Notes"});
        sessionStorage.removeItem("adminForm");clearFile();setSelectedSubs([]);
        await loadMats();
      }catch(err){showToast("Upload failed: "+err.message,"err");}
      finally{setUploading(false);setProgress("");}
    };
    return(
      <div style={{padding:"20px 16px 40px",background:"#080e1c",minHeight:"100dvh"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
          <span style={{fontSize:18}}>🛠</span>
          <h2 style={{margin:0,fontSize:17,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Admin Dashboard</h2>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto"}}>
          {["upload","materials","analytics"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"rgba(255,180,0,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${tab===t?"rgba(255,180,0,0.3)":"rgba(255,255,255,0.07)"}`,color:tab===t?"#ffb400":"#888",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,whiteSpace:"nowrap"}}>
              {t==="upload"?"⬆ Upload":t==="materials"?"📋 Materials":"📊 Analytics"}
            </button>
          ))}
        </div>
        {tab==="upload"&&(
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:16}}>
            <div style={{display:"grid",gap:12}}>
              <div><label style={lbl}>Title *</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} style={inp} placeholder="e.g. Mathematics Notes – Grade 9"/></div>
              <div><label style={lbl}>Description</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} style={{...inp,minHeight:72,resize:"vertical",lineHeight:1.5}} placeholder="Brief summary…"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={lbl}>System</label><select value={form.system} onChange={e=>{setForm(p=>({...p,system:e.target.value,level:e.target.value==="CBC"?"Grade 1":"Form 1"}));setSelectedSubs([]);}} style={{...inp,cursor:"pointer"}}><option>CBC</option><option>8-4-4</option></select></div>
                <div><label style={lbl}>Level</label><select value={form.level} onChange={e=>{setForm(p=>({...p,level:e.target.value}));setSelectedSubs([]);}} style={{...inp,cursor:"pointer"}}>{aLvls.map(l=><option key={l}>{l}</option>)}</select></div>
              </div>
              <div><label style={lbl}>Type</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{...inp,cursor:"pointer"}}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div>
                <label style={lbl}>Subject * — Select one or more ({selectedSubs.length} selected)</label>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px",maxHeight:200,overflowY:"auto"}}>
                  {aSubs.map(s=>(
                    <label key={s} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 4px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <input type="checkbox" checked={selectedSubs.includes(s)} onChange={()=>toggleSub(s)} style={{width:16,height:16,accentColor:"#ffb400",cursor:"pointer"}}/>
                      <span style={{fontSize:13,color:selectedSubs.includes(s)?"#ffb400":"#ccc",fontWeight:selectedSubs.includes(s)?700:400}}>{s}</span>
                      {s==="All Subjects"&&<span style={{fontSize:10,color:"#555",marginLeft:"auto"}}>← select all</span>}
                    </label>
                  ))}
                </div>
                {selectedSubs.length>0&&<div style={{marginTop:6,fontSize:11,color:"#27ae60"}}>✅ Selected: {selectedSubs.join(", ")}</div>}
              </div>
              <div>
                <label style={lbl}>Upload Method</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {[{k:"url",icon:"🔗",label:"Paste URL"},{k:"file",icon:"📁",label:"Upload File"}].map(m=>(
                    <button key={m.k} onClick={()=>setUploadMode(m.k)} style={{border:`2px solid ${uploadMode===m.k?"#ffb400":"rgba(255,255,255,0.1)"}`,background:uploadMode===m.k?"rgba(255,180,0,0.1)":"rgba(255,255,255,0.03)",color:uploadMode===m.k?"#ffb400":"#888",borderRadius:10,padding:"12px 8px",cursor:"pointer",fontWeight:700,fontSize:13,textAlign:"center"}}>
                      <div style={{fontSize:22,marginBottom:4}}>{m.icon}</div>{m.label}
                    </button>
                  ))}
                </div>
              </div>
              {uploadMode==="url"&&(
                <div>
                  <label style={lbl}>PDF File * (Paste Google Drive Link)</label>
                  <textarea value={pasteUrl} onChange={e=>setPasteUrl(e.target.value)} placeholder={"Paste your Google Drive share link here:\nhttps://drive.google.com/file/d/XXXX/view?usp=sharing\n\nOr any direct PDF URL"} style={{...inp,minHeight:90,resize:"vertical",lineHeight:1.6,fontSize:12}}/>
                  <div style={{marginTop:6,fontSize:11,color:"#555"}}>📌 Open PDF in Google Drive → tap ⋮ → Share → Copy link → paste above</div>
                </div>
              )}
              {uploadMode==="file"&&(
                <div>
                  <label style={lbl}>Select PDF File</label>
                  <div style={{position:"relative"}}>
                    <div style={{border:`2px dashed ${fileBase64?"rgba(39,174,96,0.6)":"rgba(255,180,0,0.35)"}`,borderRadius:10,padding:"24px 16px",textAlign:"center",background:fileBase64?"rgba(39,174,96,0.06)":"rgba(255,180,0,0.03)",minHeight:110,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6}}>
                      {fileBase64?(<><div style={{fontSize:28}}>📄</div><div style={{color:"#27ae60",fontWeight:800,fontSize:13,wordBreak:"break-all",maxWidth:"90%"}}>{fileName}</div><div style={{color:"#27ae60",fontSize:11}}>{(fileSize/1024/1024).toFixed(2)} MB · Loaded ✅</div><div style={{color:"#555",fontSize:10,marginTop:2}}>Tap to change file</div></>):(<><div style={{fontSize:30}}>📁</div><div style={{color:"#ffb400",fontWeight:700,fontSize:14}}>Tap to select PDF</div><div style={{color:"#555",fontSize:11}}>Works best on desktop/PC</div></>)}
                      <input type="file" accept=".pdf,application/pdf" onChange={handleFileSelect} style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0,cursor:"pointer",zIndex:10}}/>
                    </div>
                  </div>
                  {fileBase64&&<button onClick={clearFile} style={{width:"100%",marginTop:8,background:"rgba(231,76,60,0.08)",border:"1px solid rgba(231,76,60,0.2)",color:"#e74c3c",borderRadius:8,padding:"8px 0",cursor:"pointer",fontWeight:700,fontSize:12}}>🗑 Remove File</button>}
                </div>
              )}
              {progress&&<div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:8,padding:"10px",fontSize:13,color:"#ffb400",textAlign:"center"}}>⏳ {progress}</div>}
              <button onClick={upload} disabled={uploading} style={{...btnPrimary,opacity:uploading?0.7:1}}>{uploading?`⏳ ${progress||"Saving…"}`:(uploadMode==="url"?"🔗 Save with URL":"⬆ Upload PDF")}</button>
            </div>
          </div>
        )}
        {tab==="materials"&&(
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:460}}>
              <thead><tr style={{background:"rgba(255,180,0,0.04)"}}>
                {["Title","System","Level","DLs","File","Del"].map(h=><th key={h} style={{padding:"9px 8px",textAlign:"left",color:"#ffb400",fontWeight:700,fontSize:10,textTransform:"uppercase"}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {mats.slice(0,50).map((m,i)=>(
                  <tr key={m.id} style={{borderTop:"1px solid rgba(255,255,255,0.04)",background:i%2?"rgba(255,255,255,0.01)":"transparent"}}>
                    <td style={{padding:"8px",color:"#fff",maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</td>
                    <td style={{padding:"8px",color:"#888"}}>{m.system}</td>
                    <td style={{padding:"8px",color:"#888"}}>{m.level}</td>
                    <td style={{padding:"8px",color:"#ffb400",fontWeight:700}}>{m.downloads||0}</td>
                    <td style={{padding:"8px"}}>{m.file_url?<a href={m.file_url} target="_blank" rel="noopener noreferrer" style={{color:"#3498db",fontSize:11}}>🔗</a>:<span style={{color:"#444"}}>—</span>}</td>
                    <td style={{padding:"8px"}}><button onClick={async()=>{await supabase.from("materials").delete().eq("id",m.id);setMats(p=>p.filter(x=>x.id!==m.id));showToast("Deleted");}} style={{background:"rgba(231,76,60,0.12)",border:"1px solid rgba(231,76,60,0.2)",color:"#e74c3c",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:11}}>Del</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab==="analytics"&&<AnalyticsTab/>}
      </div>
    );
  };

  const Dash=()=>{
    if(!user||!profile) return <div style={{textAlign:"center",padding:60,color:"#444"}}>Loading…</div>;
    const expired=subscription?.reason==="expired";
    const freeLeft = Math.max(0, 2 - (profile?.free_downloads_used || 0));
    const allUsed = freeLeft === 0 && !isSubscribed && !expired;

    return(
      <div style={{padding:"20px 16px 40px",background:"#080e1c",minHeight:"100dvh"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
          <span style={{fontSize:18}}>👤</span>
          <h2 style={{margin:0,fontSize:17,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Welcome, {userName.split(" ")[0]}!</h2>
        </div>

        {expired&&(
          <div style={{background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.25)",borderRadius:12,padding:"14px",marginBottom:14}}>
            <div style={{fontWeight:700,color:"#e74c3c",marginBottom:5}}>⚠️ Subscription Expired</div>
            <p style={{color:"#aaa",fontSize:13,margin:"0 0 10px"}}>Your {subscription.plan} plan expired. Renew to restore access.</p>
            <button onClick={()=>setModal("subscribe")} style={{...btnPrimary,padding:"10px 0"}}>Renew Now</button>
          </div>
        )}

        {allUsed&&(
          <div style={{background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.3)",borderRadius:12,padding:"14px",marginBottom:14}}>
            <div style={{fontWeight:700,color:"#e74c3c",marginBottom:5}}>🔒 Free Downloads Exhausted</div>
            <p style={{color:"#aaa",fontSize:13,margin:"0 0 10px"}}>You've used all 2 free downloads. Subscribe to continue downloading materials.</p>
            <button onClick={()=>setModal("subscribe")} style={{...btnPrimary,padding:"10px 0"}}>Subscribe Now — From KSh 100</button>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[
            {l:"System",v:profile.system,i:"📘"},
            {l:"Level",v:profile.level,i:"🎓"},
            {l:"Phone",v:profile.phone||"—",i:"📱"},
            {l:"Status",v:isSubscribed?`${subscription.plan} Plan`:expired?"Expired":allUsed?"Blocked":"Free",i:"💳",c:isSubscribed?"#27ae60":expired||allUsed?"#e74c3c":"#ffb400"},
            {l:"Free Left",v:isSubscribed?"Unlimited":`${freeLeft} left`,i:"📥",c:freeLeft===0&&!isSubscribed?"#e74c3c":undefined},
            {l:"Days Left",v:isSubscribed?`${subscription.daysLeft} days`:"—",i:"📅"},
          ].map(c=>(
            <div key={c.l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px"}}>
              <div style={{fontSize:16,marginBottom:5}}>{c.i}</div>
              <div style={{fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{c.l}</div>
              <div style={{fontSize:12,fontWeight:700,color:c.c||"#fff"}}>{c.v}</div>
            </div>
          ))}
        </div>

        {!isSubscribed&&!expired&&!allUsed&&(
          <div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:12,padding:"14px",marginBottom:14}}>
            <div style={{fontWeight:700,color:"#ffb400",marginBottom:5}}>🚀 Unlock Full Access</div>
            <p style={{color:"#888",fontSize:13,margin:"0 0 10px"}}>
              You have {freeLeft} free download{freeLeft!==1?"s":""} left. Subscribe for unlimited access.
            </p>
            <button onClick={()=>setModal("subscribe")} style={{...btnPrimary,padding:"10px 0"}}>Subscribe Now</button>
          </div>
        )}

        <button onClick={logout} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"#666",borderRadius:10,padding:"11px 0",cursor:"pointer",fontWeight:700,fontSize:13,marginBottom:16}}>🚪 Logout</button>

        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{fontSize:15}}>📚</span>
          <h3 style={{margin:0,fontSize:15,color:"#fff",fontWeight:700}}>Your Materials — {profile.level}</h3>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {mats.filter(m=>m.level===profile.level).slice(0,6).map(m=><Card key={m.id} {...cardProps(m)}/>)}
        </div>
      </div>
    );
  };

  const bLvls = filt.system==="CBC" ? LEVELS_CBC : filt.system==="8-4-4" ? LEVELS_844 : [...LEVELS_CBC,...LEVELS_844];
  const bSubs = filt.level
    ? [...(SUBS_CBC[filt.level]||[]),...(SUBS_844[filt.level]||[])]
    : ([...new Set([...SUBS_CBC_LIST,...SUBS_844_LIST])].sort());

  return(
    <div style={{minHeight:"100dvh",background:"#080e1c",color:"#fff",fontFamily:"'DM Sans',sans-serif",overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"/>
      <Nav/>
      <main>

        {/* ── HOME ── */}
        <div style={{display: page==="home" ? "block" : "none"}}>
          <div style={{background:"#080e1c",minHeight:"100dvh"}}>
            <div style={{position:"relative",padding:"44px 20px 48px",textAlign:"center",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(255,180,0,0.08),transparent)",pointerEvents:"none"}}/>
              <div style={{display:"inline-block",background:"rgba(255,180,0,0.1)",border:"1px solid rgba(255,180,0,0.28)",borderRadius:50,padding:"5px 16px",fontSize:11,color:"#ffb400",fontWeight:700,marginBottom:16,textTransform:"uppercase",letterSpacing:1.2}}>Kenya's #1 Revision Platform</div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,7vw,46px)",fontWeight:900,color:"#fff",lineHeight:1.15,margin:"0 0 14px"}}>
                Ace Every Exam with<br/><span style={{color:"#ffb400"}}>Toppluss Revisions</span>
              </h1>
              <p style={{color:"#888",fontSize:14,maxWidth:360,margin:"0 auto 26px",lineHeight:1.7}}>
                Curated Notes, Past Papers & Marking Schemes for CBC & 8-4-4 students across Kenya.
              </p>
              <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:320,margin:"0 auto 36px"}}>
                <button onClick={()=>setPage("browse")} style={btnPrimary}>Browse Materials →</button>
                {!user&&<button onClick={()=>setModal("register")} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.13)",color:"#fff",padding:"13px 0",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",width:"100%"}}>Register Free</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:320,margin:"0 auto"}}>
                {[["2,000+","Materials"],["CBC + 8-4-4","Systems"],["2 Free","Downloads"],["KSh 100","From /week"]].map(([n,l])=>(
                  <div key={l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"13px 10px",textAlign:"center"}}>
                    <div style={{fontSize:17,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{n}</div>
                    <div style={{fontSize:10,color:"#555",marginTop:3}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:"0 16px 18px"}}>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"#444"}}>🔍</span>
                <input
                  placeholder="Search notes, past papers, subjects…"
                  value={search}
                  onChange={e=>setSearch(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&search) setPage("browse");}}
                  style={{...inp,paddingLeft:38,fontSize:13,background:"rgba(255,255,255,0.05)"}}
                />
              </div>
            </div>
            {!loading&&topDL.length>0&&(
              <div style={{padding:"0 16px 30px"}}>
                <SectionHead icon="🔥" title="Most Downloaded" sub="Most popular revision materials"/>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>{topDL.map(m=><Card key={m.id} {...cardProps(m)}/>)}</div>
              </div>
            )}
            {!loading&&latest.length>0&&(
              <div style={{padding:"0 16px 30px"}}>
                <SectionHead icon="🆕" title="Latest Uploads" sub="Freshly added content"/>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>{latest.map(m=><Card key={m.id} {...cardProps(m)}/>)}</div>
                <button onClick={()=>setPage("browse")} style={{display:"block",width:"100%",marginTop:14,background:"none",border:"1px solid rgba(255,180,0,0.25)",color:"#ffb400",padding:"12px 0",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13}}>View All →</button>
              </div>
            )}
            {loading&&<div style={{textAlign:"center",padding:"60px 0",color:"#444"}}>⏳ Loading materials…</div>}
            {!loading&&mats.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:"#444"}}>
              <div style={{fontSize:40,marginBottom:10}}>📚</div>
              <div style={{fontSize:14,fontWeight:600,color:"#555"}}>No materials yet — check back soon!</div>
            </div>}
            <div style={{padding:"24px 16px 36px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              <SectionHead icon="💳" title="Subscription Plans" sub="Affordable access via M-Pesa"/>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[
                  {name:"Weekly",price:"KSh 100",period:"per week",feats:["All Materials","CBC + 8-4-4","Unlimited Downloads"],k:"weekly"},
                  {name:"Monthly",price:"KSh 250",period:"per month",feats:["Everything Weekly","Best Value","Priority Support"],hot:true,k:"monthly"},
                ].map(plan=>(
                  <div key={plan.name} style={{background:plan.hot?"rgba(255,180,0,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${plan.hot?"rgba(255,180,0,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:14,padding:"16px",position:"relative"}}>
                    {plan.hot&&<div style={{position:"absolute",top:-9,right:14,background:"linear-gradient(135deg,#ffb400,#ff7b00)",color:"#000",fontSize:9,fontWeight:800,padding:"2px 10px",borderRadius:50,textTransform:"uppercase",letterSpacing:1}}>Best Value</div>}
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div>
                        <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{plan.name}</div>
                        <div style={{fontSize:11,color:"#666"}}>{plan.period}</div>
                      </div>
                      <div style={{fontSize:24,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{plan.price}</div>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>
                      {plan.feats.map(f=><span key={f} style={{fontSize:12,color:"#aaa"}}>✅ {f}</span>)}
                    </div>
                    <button onClick={()=>setModal(user?"subscribe":"register")} style={btnPrimary}>{user?"Pay via M-Pesa":"Get Started"}</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{background:"#05090f",borderTop:"1px solid rgba(255,255,255,0.05)",padding:"22px 16px 30px",textAlign:"center"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:6}}>
                <div style={{width:26,height:26,background:"linear-gradient(135deg,#ffb400,#ff7b00)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:"#000"}}>T+</div>
                <span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:14,color:"#fff"}}>Toppluss <span style={{color:"#ffb400"}}>Revisions</span></span>
              </div>
              <p style={{color:"#444",fontSize:11,margin:"0 0 14px"}}>Kenya's trusted revision platform · CBC & 8-4-4</p>
              <a href="https://wa.me/254755803149" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#25D366",color:"#fff",padding:"11px 22px",borderRadius:25,fontWeight:700,fontSize:13,textDecoration:"none",boxShadow:"0 4px 12px rgba(37,211,102,0.35)"}}>
                <WaIcon/> +254 755 803 149
              </a>
            </div>
          </div>
        </div>

        {/* ── BROWSE ── */}
        <div style={{display: page==="browse" ? "block" : "none"}}>
          <div style={{padding:"20px 16px 40px",background:"#080e1c",minHeight:"100dvh"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <span style={{fontSize:18}}>📚</span>
              <h2 style={{margin:0,fontSize:17,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Browse Materials</h2>
              <span style={{fontSize:12,color:"#555",marginLeft:"auto"}}>{filtMats.length} results</span>
            </div>
            <div style={{position:"relative",marginBottom:10}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#444"}}>🔍</span>
              <input
                placeholder="Search…"
                value={search}
                onChange={e=>setSearch(e.target.value)}
                style={{...inp,paddingLeft:36,fontSize:13}}
              />
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {[
                {k:"system",opts:["CBC","8-4-4"],lbl:"System"},
                {k:"level",opts:bLvls,lbl:"Level"},
                {k:"subject",opts:bSubs,lbl:"Subject"},
                {k:"type",opts:TYPES,lbl:"Type"},
              ].map(f=>(
                <select key={f.k} value={filt[f.k]} onChange={e=>setFilt(p=>({...p,[f.k]:e.target.value,...(f.k==="system"?{level:"",subject:""}:{}),...(f.k==="level"?{subject:""}:{})}))} style={{...inp,cursor:"pointer",fontSize:12}}>
                  <option value="">All {f.lbl}s</option>
                  {f.opts.map(o=><option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
            <button onClick={()=>{setFilt({system:"",level:"",subject:"",type:""});setSearch("");}} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"#777",borderRadius:9,padding:"9px 0",cursor:"pointer",fontSize:12,fontWeight:600,marginBottom:16}}>Clear Filters</button>
            {loading
              ? <div style={{textAlign:"center",padding:"60px 0",color:"#444"}}>⏳ Loading…</div>
              : filtMats.length===0
                ? <div style={{textAlign:"center",padding:"60px 0",color:"#555"}}><div style={{fontSize:36,marginBottom:10}}>🔍</div><div style={{fontSize:14,fontWeight:600}}>No results found</div></div>
                : <div style={{display:"flex",flexDirection:"column",gap:10}}>{filtMats.map(m=><Card key={m.id} {...cardProps(m)}/>)}</div>
            }
          </div>
        </div>

        {page==="dash" && <Dash/>}
        {page==="admin" && isAdmin && <Admin/>}

      </main>

      <a href="https://wa.me/254755803149?text=Hello%2C%20I%20need%20help%20with%20Toppluss%20Revisions" target="_blank" rel="noopener noreferrer"
        style={{position:"fixed",bottom:20,right:16,width:52,height:52,background:"#25D366",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(37,211,102,0.5)",zIndex:140,textDecoration:"none"}}>
        <WaIcon/>
      </a>
      <Toast {...toast}/>
      {modal==="login"&&<Modal onClose={()=>setModal(null)}><LoginM/></Modal>}
      {modal==="forgot"&&<Modal onClose={()=>setModal(null)}><ForgotPasswordM/></Modal>}
      {modal==="register"&&<Modal onClose={()=>setModal(null)}><RegisterM/></Modal>}
      {modal==="subscribe"&&<Modal onClose={()=>setModal(null)}><SubscribeM/></Modal>}
      {modal==="gate"&&<Modal onClose={()=>setModal(null)}><GateM/></Modal>}
      {modal==="preview"&&<Modal onClose={()=>setModal(null)}><PreviewM/></Modal>}
    </div>
  );
}
