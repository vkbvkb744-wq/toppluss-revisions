import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const WORKER_URL = import.meta.env.VITE_WORKER_URL || "https://toppluss-migrate-r2.YOUR_SUBDOMAIN.workers.dev";
const DIRECT_UPLOAD_URL = import.meta.env.VITE_WORKER_UPLOAD_URL || WORKER_URL.replace("migrate-r2","upload-r2");

const COLORS = ["#e74c3c","#e67e22","#f39c12","#2ecc71","#1abc9c","#3498db","#9b59b6","#e91e63","#00b894","#0984e3"];

const TYPES = [
  "Notes","Past Papers","Marking Schemes","Assignments","Holiday Assignments",
  "Revision Papers","Exams","CATs","Lesson Plans","Schemes of Work",
  "Projects","Practical Papers","Setbooks","Study Guides","Syllabus",
  "Topical Questions","Mock Exams","KCPE Papers","KCSE Papers","CBC Assessments",
  "Videos",
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

function getFakeDownloads(id) {
  if (!id) return "10,000";
  const base = (id.charCodeAt(0) + id.charCodeAt(1) + id.charCodeAt(2)) * 317;
  const bump = Math.floor(Date.now() / 10000);
  const num = (base % 90000) + 10000 + (bump % 500);
  return num.toLocaleString();
}

const toApiPhone = (p) => p.startsWith("07") ? "254"+p.slice(1) : p.startsWith("+254") ? p.slice(1) : p;
const isValidPhone = (p) => /^07\d{8}$/.test(p);

const isR2Url = (url) => url && (url.includes("r2.dev") || url.includes("cloudflarestorage.com"));
const isDriveUrl = (url) => url && (url.includes("drive.google.com") || url.includes("docs.google.com"));

const getEmbedUrl = (url) => {
  if (!url) return null;
  if (isR2Url(url)) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }
  const m1 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m1) return `https://drive.google.com/file/d/${m1[1]}/preview`;
  const m2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/file/d/${m2[1]}/preview`;
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
};

const normalizeDriveUrl = (url) => {
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
  const m2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (m2) return `https://drive.google.com/uc?export=download&id=${m2[1]}`;
  return url.trim();
};

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

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position:"fixed",bottom:20,left:16,right:16,
      background:type==="err"?"#c0392b":type==="info"?"#2980b9":"#27ae60",
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

function StorageBadge({ url }) {
  if (!url) return <span style={{fontSize:10,color:"#444"}}>— No file</span>;
  if (isR2Url(url)) return <span style={{fontSize:10,color:"#27ae60",fontWeight:700}}>☁ R2 ✅</span>;
  if (isDriveUrl(url)) return <span style={{fontSize:10,color:"#f39c12",fontWeight:700}}>🔄 Drive</span>;
  return <span style={{fontSize:10,color:"#3498db",fontWeight:700}}>🔗 URL</span>;
}

function Card({ m, getIcon, onPreview, onDownload }) {
  return (
    <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,overflow:"hidden",display:"flex",alignItems:"stretch"}}>
      <div style={{width:60,flexShrink:0,background:`linear-gradient(180deg,${m.color}cc,${m.color}55)`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,position:"relative"}}>
        <div style={{fontSize:20}}>{getIcon(m.type)}</div>
        {m.type==="Videos"&&<div style={{fontSize:6,color:"#fff",fontWeight:900,letterSpacing:0.5,background:"rgba(0,0,0,0.35)",padding:"1px 5px",borderRadius:20}}>▶ VIDEO</div>}
        <div style={{fontSize:7,color:"#fff",fontWeight:700,opacity:0.7,textTransform:"uppercase",letterSpacing:0.5}}>{m.system}</div>
        <div style={{position:"absolute",bottom:3,fontSize:6,color:"#fff",opacity:0.18,fontStyle:"italic"}}>topplussrevisions.top</div>
      </div>
      <div style={{flex:1,padding:"11px 12px",minWidth:0}}>
        <div style={{fontSize:9,color:"#ffb400",fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>{m.system} · {m.level}</div>
        <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:2,lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</div>
        {m.description&&<div style={{fontSize:11,color:"#777",marginBottom:4,lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.description}</div>}
        <div style={{fontSize:11,color:"#555",marginBottom:9}}>{(m.subjects&&m.subjects.length>0)?m.subjects.join(", "):m.subject} · {m.type}</div>
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

const SCHOOL_PLANS = [
  {k:"monthly",l:"Monthly",p:"KSh 5,000",amount:5000,d:"30 days"},
  {k:"sixmonth",l:"6 Months",p:"KSh 50,000",amount:50000,d:"180 days"},
  {k:"annual",l:"12 Months",p:"KSh 120,000",amount:120000,d:"365 days",hot:true},
];

// Small gold checkmark shown next to a verified (paid, active) school's name
function GoldBadge() {
  return (
    <span title="Gold Verified School" style={{
      display:"inline-flex",alignItems:"center",justifyContent:"center",
      width:14,height:14,borderRadius:"50%",
      background:"linear-gradient(135deg,#ffd700,#b8860b)",
      color:"#000",fontSize:9,fontWeight:900,marginLeft:5,flexShrink:0,
    }}>✓</span>
  );
}

// Small Facebook-blue verified checkmark, sits in the corner of the school icon
// to make the School Portal instantly recognizable — always shown, not tied to gold_verified
function FacebookBadge() {
  return (
    <span title="School Portal" style={{
      position:"absolute",bottom:-2,right:-2,
      display:"inline-flex",alignItems:"center",justifyContent:"center",
      width:15,height:15,borderRadius:"50%",
      background:"#1877F2",border:"2px solid #080e1c",
      color:"#fff",fontSize:9,fontWeight:900,
    }}>✓</span>
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

  // ── School portal state ──
  const [school, setSchool]           = useState(null);   // the school row the user belongs to (student or staff)
  const [schoolRole, setSchoolRole]   = useState(null);    // "admin" | "teacher" | "student" | null
  const [schoolMats, setSchoolMats]   = useState([]);      // materials scoped to schools (own + shared)
  const [portalView, setPortalView]   = useState("mine");  // "mine" | "shared" toggle on the student school portal

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
    let title="Toppluss Revisions — Kenya's #1 Revision Platform";
    let desc="Download KCSE & CBC notes, past papers and marking schemes. From KSh 100/2 weeks unlimited access via M-Pesa.";
    if(page==="browse"){
      title="Browse Revision Materials | Toppluss Revisions";
      desc="Browse thousands of CBC and 8-4-4 notes, past papers, marking schemes for Kenyan students.";
    } else if(page==="dash"){
      title="My Dashboard | Toppluss Revisions";
      desc="Manage your Toppluss subscription and downloads.";
    } else if(page==="admin"){
      title="Admin | Toppluss Revisions";
      desc="Admin dashboard for Toppluss Revisions.";
    } else if(modal==="preview"&&prevMat){
      title=`${prevMat.title} — ${prevMat.subject} ${prevMat.level} | Toppluss Revisions`;
      desc=`Download ${prevMat.title} for ${prevMat.level} ${prevMat.subject}. ${prevMat.description||"Kenya CBC & 8-4-4 revision material."}`;
    }
    document.title=title;
    let m=document.querySelector('meta[name="description"]');
    if(!m){m=document.createElement("meta");m.setAttribute("name","description");document.head.appendChild(m);}
    m.setAttribute("content",desc);
    // Open Graph tags for WhatsApp/Facebook sharing
    const setOg=(prop,val)=>{
      let og=document.querySelector(`meta[property="${prop}"]`);
      if(!og){og=document.createElement("meta");og.setAttribute("property",prop);document.head.appendChild(og);}
      og.setAttribute("content",val);
    };
    setOg("og:title",title);
    setOg("og:description",desc);
    setOg("og:url",window.location.href);
    setOg("og:type","website");
    setOg("og:site_name","Toppluss Revisions");
  },[page,modal,prevMat]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id);checkSub(session.user.id);checkSchoolMembership(session.user.id);}
    });
    const {data:l}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){setUser(session.user);loadProfile(session.user.id);checkSub(session.user.id);checkSchoolMembership(session.user.id);}
      else{setUser(null);setProfile(null);setSub(null);setSchool(null);setSchoolRole(null);setSchoolMats([]);}
    });
    return ()=>l.subscription.unsubscribe();
  },[]);

  useEffect(()=>{loadMats();},[]);

  useEffect(()=>{
    const pendingCheckout = localStorage.getItem("pending_mpesa_checkout");
    if(!pendingCheckout || !user) return;
    const recover = async () => {
      try {
        const { data } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("checkout_request_id", pendingCheckout)
          .eq("status", "active")
          .single();
        if (data) {
          localStorage.removeItem("pending_mpesa_checkout");
          localStorage.removeItem("pending_mpesa_plan");
          localStorage.removeItem("pending_mpesa_phone");
          await checkSub(user.id);
          showToast("✅ Payment confirmed! Access restored.");
        }
      } catch(e) { console.log("No pending payment found"); }
    };
    recover();
  },[user]);

  const loadMats=async()=>{
    setLoading(true);
    const{data,error}=await supabase.from("materials").select("*").is("school_id",null).order("created_at",{ascending:false});
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

  // Figures out if this user is tied to a school — as the school admin (schools.admin_id),
  // an added teacher (school_teachers), or a joined student (school_students) — and whether
  // that school's own subscription is currently active.
  const checkSchoolMembership = async (id) => {
    try {
      const { data: asAdmin } = await supabase.from("schools").select("*").eq("admin_id", id).maybeSingle();
      if (asAdmin) { setSchool(asAdmin); setSchoolRole("admin"); return; }

      const { data: asTeacher } = await supabase.from("school_teachers").select("*, schools(*)").eq("user_id", id).eq("status","active").maybeSingle();
      if (asTeacher?.schools) { setSchool(asTeacher.schools); setSchoolRole("teacher"); return; }

      const { data: asStudent } = await supabase.from("school_students").select("*, schools(*)").eq("user_id", id).maybeSingle();
      if (asStudent?.schools) { setSchool(asStudent.schools); setSchoolRole("student"); return; }

      setSchool(null); setSchoolRole(null);
    } catch (e) { console.error(e); }
  };

  const schoolActive = (s) => !!s && s.status === "approved" && s.subscription_expiry && new Date(s.subscription_expiry) > new Date();

  // Own-school materials + shared materials from other (still-active) schools
  const loadSchoolMats = async () => {
    if (!school) return;
    const { data: mine } = await supabase.from("materials").select("*").eq("school_id", school.id).order("created_at",{ascending:false});
    const { data: shared } = await supabase.from("materials").select("*, schools!inner(status,subscription_expiry,name,gold_verified)").eq("visibility","shared").neq("school_id", school.id).order("created_at",{ascending:false});
    const activeShared = (shared||[]).filter(m => m.schools && m.schools.status==="approved" && m.schools.subscription_expiry && new Date(m.schools.subscription_expiry) > new Date());
    setSchoolMats([
      ...(mine||[]).map((m,i)=>({...m,color:COLORS[i%COLORS.length],scope:"mine"})),
      ...activeShared.map((m,i)=>({...m,color:COLORS[i%COLORS.length],scope:"shared",schoolName:m.schools.name,schoolGold:m.schools.gold_verified})),
    ]);
  };

  useEffect(()=>{ if(school) loadSchoolMats(); },[school]);

  const migrateToR2 = async (materialId, driveUrl, fileName) => {
    try {
      const res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materialId,
          driveUrl: normalizeDriveUrl(driveUrl),
          fileName: fileName || `material_${materialId}.pdf`,
        }),
      });
      const data = await res.json();
      if (data.success && data.r2Url) {
        setMats(prev => prev.map(m =>
          m.id === materialId ? { ...m, file_url: data.r2Url } : m
        ));
        return { success: true, r2Url: data.r2Url };
      }
      return { success: false, error: data.error || "Migration failed" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Direct-upload path for school admins/teachers: sends the raw file straight to the
  // Cloudflare Worker, which streams it into R2 and patches the materials row itself.
  const uploadFileToR2 = async (file, materialId, fileName) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("materialId", materialId);
      formData.append("fileName", fileName || file.name);
      const res = await fetch(DIRECT_UPLOAD_URL, { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.r2Url) return { success: true, r2Url: data.r2Url };
      return { success: false, error: data.error || "Upload failed" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const isSubscribed=subscription?.active===true;
  const isAdmin=profile?.role==="admin";
  const userName=profile?.full_name||user?.email?.split("@")[0]||"Student";

  const filtMats=mats.filter(m=>{
    if(profile?.system&&!isAdmin&&profile.role!=="teacher"&&m.system!==profile.system) return false;
    if(filt.system&&m.system!==filt.system) return false;
    if(filt.level&&m.level!==filt.level) return false;
    if(filt.subject){const subs=(m.subjects&&m.subjects.length>0)?m.subjects:[m.subject];if(!subs.includes(filt.subject)) return false;}
    if(filt.type&&m.type!==filt.type) return false;
    if(search){const words=search.toLowerCase().trim().split(/\s+/);const subsStr=(m.subjects&&m.subjects.length>0)?m.subjects.join(" "):m.subject;const haystack=[m.title,subsStr,m.type,m.description,m.level,m.system].filter(Boolean).join(" ").toLowerCase();if(!words.every(w=>haystack.includes(w))) return false;}
    return true;
  });

  const topDL=[...mats].sort((a,b)=>b.downloads-a.downloads).slice(0,6);
  const latest=[...mats].sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,6);

  const doDownload=async(mat)=>{
    await supabase.from("materials").update({downloads:(mat.downloads||0)+1}).eq("id",mat.id);
    setMats(p=>p.map(m=>m.id===mat.id?{...m,downloads:(m.downloads||0)+1}:m));
    if(user) await supabase.from("download_logs").insert([{user_id:user.id,material_id:mat.id}]);
    if(mat.file_url){
      const dlUrl = isDriveUrl(mat.file_url) ? normalizeDriveUrl(mat.file_url) : mat.file_url;
      const a=document.createElement("a");
      a.href=dlUrl;
      a.download=mat.title+(mat.type==="Videos"?".mp4":".pdf");
      a.target="_blank";
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      showToast("⬇ Downloading: "+mat.title);
    } else showToast("File not available yet","err");
  };

  const handleDL=async(mat)=>{
    if(isAdmin||isSubscribed){doDownload(mat);return;}
    if(!user){setModal("gate");return;}
    showToast("🔒 Subscribe to download materials.","err");
    setModal("subscribe");
  };

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
    "Videos":"🎬",
  }[type]||"📄");

  const cardProps=(m)=>({
    m,getIcon,
    onPreview:(mat)=>{setPrevMat(mat);setModal("preview");},
    onDownload:handleDL,
  });

  const Nav=()=>(
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
        <button onClick={()=>{
          if(schoolRole==="admin"||schoolRole==="teacher") setPage("school-admin");
          else if(schoolRole==="student") setPage("school-portal");
          else setPage("school");
        }} style={{background:"none",border:"none",color:["school","school-admin","school-portal"].includes(page)?"#ffb400":"#bbb",cursor:"pointer",fontWeight:600,fontSize:13,padding:0,whiteSpace:"nowrap",flexShrink:0}}>🏫 School</button>
        {isAdmin&&<button onClick={()=>setPage("admin")} style={{background:"none",border:"none",color:page==="admin"?"#ffb400":"#bbb",cursor:"pointer",fontWeight:600,fontSize:13,padding:0,whiteSpace:"nowrap",flexShrink:0}}>🛠 Admin</button>}
        <div style={{flex:1,minWidth:8}}/>
        {user?(
          <button onClick={()=>setPage("dash")} style={{background:"rgba(255,180,0,0.1)",border:"1px solid rgba(255,180,0,0.25)",color:"#ffb400",padding:"5px 12px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,flexShrink:0,whiteSpace:"nowrap"}}>
            👤 {userName.split(" ")[0]}{profile?.role==="teacher"&&<span style={{marginLeft:6,fontSize:9,background:"rgba(255,180,0,0.2)",color:"#ffb400",borderRadius:6,padding:"1px 5px"}}>Teacher</span>}{isSubscribed&&<span style={{marginLeft:6,fontSize:9,background:"#27ae60",color:"#fff",borderRadius:6,padding:"1px 5px"}}>{subscription.plan}</span>}
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
            <p style={{color:"#888",fontSize:13}}>Check your inbox and click the reset link.</p>
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
    const [f,setF]=useState({name:"",email:"",phone:"",password:"",accountType:"student",system:"CBC",level:"Grade 1"});
    const [ld,setLd]=useState(false);
    const rLvls=f.system==="CBC"?LEVELS_CBC:LEVELS_844;
    const isTeacher=f.accountType==="teacher";
    const go=async()=>{
      if(!f.name||!f.email||!f.phone||!f.password){showToast("Fill all fields","err");return;}
      if(!isValidPhone(f.phone)){showToast("Phone must start with 07","err");return;}
      if(f.password.length<6){showToast("Password min 6 characters","err");return;}
      setLd(true);
      const meta=isTeacher
        ?{full_name:f.name,phone:f.phone,role:"teacher",system:"Teacher",level:"N/A"}
        :{full_name:f.name,phone:f.phone,system:f.system,level:f.level};
      const{error}=await supabase.auth.signUp({email:f.email,password:f.password,options:{data:meta}});
      if(error) showToast("Registration failed: "+error.message,"err");
      else{showToast(isTeacher?"🎉 Welcome, Teacher! Registration complete.":"🎉 Registered! Subscribe to start downloading.");setModal(null);setPage("dash");}
      setLd(false);
    };
    return(
      <div>
        <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Create Account</h2>
        <p style={{color:"#777",fontSize:12,margin:"0 0 16px"}}>Register free, then subscribe to download materials</p>
        <div style={{display:"grid",gap:11}}>
          <div>
            <label style={lbl}>I am a…</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[{k:"student",l:"🎓 Student"},{k:"teacher",l:"👩‍🏫 Teacher"}].map(o=>(
                <div key={o.k} onClick={()=>setF(p=>({...p,accountType:o.k}))} style={{border:`2px solid ${f.accountType===o.k?"#ffb400":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"11px 0",textAlign:"center",cursor:"pointer",background:f.accountType===o.k?"rgba(255,180,0,0.06)":"transparent",fontWeight:700,fontSize:13,color:f.accountType===o.k?"#ffb400":"#ccc"}}>{o.l}</div>
              ))}
            </div>
          </div>
          <div><label style={lbl}>Full Name</label><input value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} style={inp} placeholder="Jane Mwangi"/></div>
          <div><label style={lbl}>Email</label><input type="email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} style={inp} placeholder="jane@example.com"/></div>
          <div><label style={lbl}>Phone (07…)</label><input value={f.phone} onChange={e=>setF(p=>({...p,phone:e.target.value}))} style={inp} placeholder="0712345678" maxLength={10}/></div>
          <div><label style={lbl}>Password</label><input type="password" value={f.password} onChange={e=>setF(p=>({...p,password:e.target.value}))} style={inp} placeholder="Min 6 characters"/></div>
          {!isTeacher&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div><label style={lbl}>System</label><select value={f.system} onChange={e=>setF(p=>({...p,system:e.target.value,level:e.target.value==="CBC"?"Grade 1":"Form 1"}))} style={{...inp,cursor:"pointer"}}><option>CBC</option><option>8-4-4</option></select></div>
              <div><label style={lbl}>Level</label><select value={f.level} onChange={e=>setF(p=>({...p,level:e.target.value}))} style={{...inp,cursor:"pointer"}}>{rLvls.map(l=><option key={l}>{l}</option>)}</select></div>
            </div>
          )}
          <button onClick={go} disabled={ld} style={{...btnPrimary,opacity:ld?0.7:1,marginTop:4}}>{ld?"Creating account…":"Register"}</button>
          <p style={{textAlign:"center",fontSize:12,color:"#666",margin:0}}>Have account? <button onClick={()=>setModal("login")} style={{background:"none",border:"none",color:"#ffb400",cursor:"pointer",fontWeight:700,fontSize:12}}>Login</button></p>
        </div>
      </div>
    );
  };

  const JoinSchoolM=()=>{
    const [code,setCode]=useState("");
    const [ld,setLd]=useState(false);
    const go=async()=>{
      if(!code.trim()){showToast("Enter your school code","err");return;}
      if(!isSubscribed){showToast("Subscribe to the platform first, then join your school","err");setModal("subscribe");return;}
      setLd(true);
      const{data:sch,error:e1}=await supabase.from("schools").select("*").eq("code",code.trim().toUpperCase()).maybeSingle();
      if(e1||!sch){showToast("School code not found","err");setLd(false);return;}
      if(sch.status!=="approved"){showToast("This school is still pending approval","err");setLd(false);return;}
      const{error:e2}=await supabase.from("school_students").insert([{school_id:sch.id,user_id:user.id}]);
      if(e2){showToast("Could not join: "+e2.message,"err");setLd(false);return;}
      await checkSchoolMembership(user.id);
      showToast(`🎉 Joined ${sch.name}!`);
      setModal(null);setPage("school-portal");
      setLd(false);
    };
    return(
      <div>
        <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Join Your School</h2>
        <p style={{color:"#777",fontSize:12,margin:"0 0 18px"}}>Enter the code your school gave you to unlock their materials and videos.</p>
        <div style={{display:"grid",gap:12}}>
          <div><label style={lbl}>School Code</label><input value={code} onChange={e=>setCode(e.target.value)} style={{...inp,textTransform:"uppercase",letterSpacing:2,fontWeight:800}} placeholder="E.G. STAREHE01" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <button onClick={go} disabled={ld} style={{...btnPrimary,opacity:ld?0.7:1}}>{ld?"Joining…":"Join School"}</button>
          <p style={{textAlign:"center",fontSize:11,color:"#555",margin:0}}>Don't have a code? Your school hasn't registered yet — ask them to register below.</p>
          <button onClick={()=>setModal("school-register")} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#ccc",padding:"11px 0",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:13,width:"100%"}}>Register My School Instead</button>
        </div>
      </div>
    );
  };

  const RegisterSchoolM=()=>{
    const [f,setF]=useState({name:"",code:"",contactPhone:""});
    const [ld,setLd]=useState(false);
    const go=async()=>{
      if(!user){showToast("Login or register a free account first","err");setModal("register");return;}
      if(!f.name||!f.code){showToast("Fill in school name and a unique code","err");return;}
      setLd(true);
      const{error}=await supabase.from("schools").insert([{
        name:f.name,code:f.code.trim().toUpperCase(),contact_phone:f.contactPhone,
        admin_id:user.id,status:"pending",gold_verified:false,
      }]);
      if(error){showToast("Registration failed: "+error.message,"err");setLd(false);return;}
      await checkSchoolMembership(user.id);
      showToast("🏫 School submitted! We'll approve it shortly.");
      setModal(null);setPage("school");
      setLd(false);
    };
    return(
      <div>
        <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Register Your School</h2>
        <p style={{color:"#777",fontSize:12,margin:"0 0 18px"}}>Get your school its own portal — add teachers, upload materials, and give students a code to log in with.</p>
        <div style={{display:"grid",gap:12}}>
          <div><label style={lbl}>School Name</label><input value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} style={inp} placeholder="e.g. Starehe Girls Centre"/></div>
          <div><label style={lbl}>Choose a School Code</label><input value={f.code} onChange={e=>setF(p=>({...p,code:e.target.value}))} style={{...inp,textTransform:"uppercase"}} placeholder="e.g. STAREHE01"/></div>
          <div><label style={lbl}>Contact Phone</label><input value={f.contactPhone} onChange={e=>setF(p=>({...p,contactPhone:e.target.value}))} style={inp} placeholder="0712345678" maxLength={10}/></div>
          <div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:9,padding:"10px",fontSize:12,color:"#ffb400",lineHeight:1.6}}>
            Pricing: KSh 5,000/month · KSh 30,000/6 months · KSh 6,000/12 months. Your school gets a <strong>Gold ✓</strong> badge once subscribed and approved.
          </div>
          <div style={{fontSize:11,color:"#888",textAlign:"center",lineHeight:1.6}}>
            Contact <strong style={{color:"#ffb400"}}>Topplussrevisions@gmail.com</strong> for approval
          </div>
          <button onClick={go} disabled={ld} style={{...btnPrimary,opacity:ld?0.7:1}}>{ld?"Submitting…":"Submit for Approval"}</button>
        </div>
      </div>
    );
  };

  const PLANS=[
    {k:"biweekly",l:"2 Weeks",p:"KSh 100",amount:100,d:"14 days"},
    {k:"monthly",l:"Monthly",p:"KSh 200",amount:200,d:"30 days"},
    {k:"sixmonth",l:"6 Months",p:"KSh 800",amount:800,d:"180 days"},
    {k:"annual",l:"12 Months",p:"KSh 1,200",amount:1200,d:"365 days",hot:true},
  ];

  const SubscribeM=()=>{
    const [plan,setPlan]=useState("monthly");
    const [phone,setPhone]=useState(profile?.phone||"");
    const [ld,setLd]=useState(false);
    const [step,setStep]=useState("choose");
    const selectedPlan=PLANS.find(pl=>pl.k===plan);

    const pay=async()=>{
      if(!isValidPhone(phone)){showToast("Enter valid 07 number","err");return;}
      setLd(true);
      setStep("mpesa");
      try{
        const res=await fetch("/.netlify/functions/mpesa",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({phone:toApiPhone(phone),amount:selectedPlan.amount,plan,userId:user.id})
        });
        const data=await res.json();
        if(!data.success&&!res.ok){
          showToast("Payment failed: "+(data.message||"Try again"),"err");
          setStep("choose");setLd(false);return;
        }
        const checkoutId=data.id||data.checkout_request_id||data.invoice_id||("pending_"+Date.now());
        localStorage.setItem("pending_mpesa_checkout", checkoutId);
        localStorage.setItem("pending_mpesa_plan", plan);
        localStorage.setItem("pending_mpesa_phone", phone);
        localStorage.setItem("pending_mpesa_user", user.id);
        setStep("waiting");setLd(false);
        const channel=supabase
          .channel("payment-"+checkoutId)
          .on("postgres_changes",{event:"INSERT",schema:"public",table:"subscriptions",filter:`user_id=eq.${user.id}`},
            async(payload)=>{
              const row=payload.new;
              if(row&&row.status==="active"){
                channel.unsubscribe();
                localStorage.removeItem("pending_mpesa_checkout");
                localStorage.removeItem("pending_mpesa_plan");
                localStorage.removeItem("pending_mpesa_phone");
                localStorage.removeItem("pending_mpesa_user");
                await checkSub(user.id);
                setStep("done");
              }
            }
          ).subscribe();
        setTimeout(()=>{
          try{ channel.unsubscribe(); }catch(e){}
          setStep(prev=>prev==="waiting"?"timeout":prev);
        },180000);
      }catch(e){
        showToast("Error: "+e.message,"err");
        setStep("choose");setLd(false);
      }
    };

    return(
      <div>
        {step==="done"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:52,marginBottom:12}}>🎉</div>
            <h2 style={{color:"#ffb400",fontFamily:"'Playfair Display',serif",margin:"0 0 8px"}}>Subscribed!</h2>
            <p style={{color:"#888",marginBottom:20,fontSize:14}}>Your {selectedPlan.l} plan is now active!</p>
            <button onClick={()=>{setModal(null);setPage("browse");}} style={btnPrimary}>Browse Materials</button>
          </div>
        ):step==="timeout"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>⚠️</div>
            <h3 style={{color:"#fff",margin:"0 0 8px"}}>Payment Not Confirmed</h3>
            <p style={{color:"#888",fontSize:13,marginBottom:16}}>If you paid, check your dashboard — it may still activate.</p>
            <button onClick={()=>setStep("choose")} style={{...btnPrimary,marginBottom:10}}>Try Again</button>
            <button onClick={()=>{setModal(null);setPage("dash");checkSub(user.id);}} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#ccc",padding:"12px 0",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:14}}>Check Dashboard</button>
          </div>
        ):step==="waiting"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>📱</div>
            <h3 style={{color:"#fff",margin:"0 0 8px"}}>Check Your Phone</h3>
            <p style={{color:"#888",fontSize:13}}>STK Push sent to <strong style={{color:"#ffb400"}}>{phone}</strong></p>
            <p style={{color:"#555",fontSize:12,marginTop:8}}>Enter your M-Pesa PIN to complete payment.</p>
            <p style={{color:"#444",fontSize:11,marginTop:12}}>⏳ Waiting for confirmation…</p>
          </div>
        ):step==="mpesa"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>📱</div>
            <h3 style={{color:"#fff",margin:"0 0 8px"}}>Sending STK Push...</h3>
            <p style={{color:"#888",fontSize:13}}>Please wait…</p>
          </div>
        ):(
          <div>
            <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Subscribe via M-Pesa</h2>
            <p style={{color:"#777",fontSize:12,margin:"0 0 16px"}}>Instant activation after payment</p>
            <div style={{display:"grid",gap:10,marginBottom:14}}>
              {PLANS.map(pl=>(
                <div key={pl.k} onClick={()=>setPlan(pl.k)} style={{border:`2px solid ${plan===pl.k?"#ffb400":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"13px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",background:plan===pl.k?"rgba(255,180,0,0.06)":"transparent",position:"relative"}}>
                  {pl.hot&&<div style={{position:"absolute",top:-9,right:14,background:"linear-gradient(135deg,#ffb400,#ff7b00)",color:"#000",fontSize:9,fontWeight:800,padding:"2px 10px",borderRadius:50,textTransform:"uppercase",letterSpacing:1}}>Best Value</div>}
                  <div>
                    <div style={{fontWeight:700,color:"#fff",fontSize:13}}>{pl.l}</div>
                    <div style={{fontSize:10,color:"#666",marginTop:2}}>{pl.d}</div>
                  </div>
                  <div style={{fontSize:20,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{pl.p}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:14}}><label style={lbl}>M-Pesa Phone (07…)</label><input value={phone} onChange={e=>setPhone(e.target.value)} style={inp} placeholder="0712345678" maxLength={10}/></div>
            <button onClick={pay} disabled={ld} style={{...btnPrimary,opacity:ld?0.7:1}}>{ld?"Sending STK Push…":`Pay ${selectedPlan.p} via M-Pesa`}</button>
          </div>
        )}
      </div>
    );
  };

  const SchoolSubscribeM=()=>{
    const [plan,setPlan]=useState("monthly");
    const [phone,setPhone]=useState(profile?.phone||"");
    const [ld,setLd]=useState(false);
    const [step,setStep]=useState("choose");
    const selectedPlan=SCHOOL_PLANS.find(pl=>pl.k===plan);

    const pay=async()=>{
      if(!isValidPhone(phone)){showToast("Enter valid 07 number","err");return;}
      setLd(true);setStep("mpesa");
      try{
        const res=await fetch("/.netlify/functions/mpesa",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({phone:toApiPhone(phone),amount:selectedPlan.amount,plan,userId:user.id,schoolId:school?.id})
        });
        const data=await res.json();
        if(!data.success&&!res.ok){showToast("Payment failed: "+(data.message||"Try again"),"err");setStep("choose");setLd(false);return;}
        setStep("waiting");setLd(false);
        const channel=supabase
          .channel("school-payment-"+school.id)
          .on("postgres_changes",{event:"UPDATE",schema:"public",table:"schools",filter:`id=eq.${school.id}`},
            async(payload)=>{
              const row=payload.new;
              if(row&&row.subscription_expiry&&new Date(row.subscription_expiry)>new Date()){
                channel.unsubscribe();
                await checkSchoolMembership(user.id);
                setStep("done");
              }
            }
          ).subscribe();
        setTimeout(()=>{try{channel.unsubscribe();}catch(e){} setStep(prev=>prev==="waiting"?"timeout":prev);},180000);
      }catch(e){showToast("Error: "+e.message,"err");setStep("choose");setLd(false);}
    };

    return(
      <div>
        {step==="done"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:52,marginBottom:12}}>🎉</div>
            <h2 style={{color:"#ffb400",fontFamily:"'Playfair Display',serif",margin:"0 0 8px"}}>School Subscribed!</h2>
            <p style={{color:"#888",marginBottom:20,fontSize:14}}>{school?.name} is now active on the {selectedPlan.l} plan.</p>
            <button onClick={()=>{setModal(null);setPage("school-admin");}} style={btnPrimary}>Go to School Dashboard</button>
          </div>
        ):step==="waiting"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>📱</div>
            <h3 style={{color:"#fff",margin:"0 0 8px"}}>Check Your Phone</h3>
            <p style={{color:"#888",fontSize:13}}>STK Push sent to <strong style={{color:"#ffb400"}}>{phone}</strong></p>
            <p style={{color:"#444",fontSize:11,marginTop:12}}>⏳ Waiting for confirmation…</p>
          </div>
        ):step==="mpesa"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>📱</div>
            <h3 style={{color:"#fff",margin:"0 0 8px"}}>Sending STK Push...</h3>
          </div>
        ):step==="timeout"?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{fontSize:44,marginBottom:12}}>⚠️</div>
            <h3 style={{color:"#fff",margin:"0 0 8px"}}>Payment Not Confirmed</h3>
            <button onClick={()=>setStep("choose")} style={btnPrimary}>Try Again</button>
          </div>
        ):(
          <div>
            <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Subscribe {school?.name}</h2>
            <p style={{color:"#777",fontSize:12,margin:"0 0 16px"}}>Keeps your school's portal, teachers, and students active</p>
            <div style={{display:"grid",gap:10,marginBottom:14}}>
              {SCHOOL_PLANS.map(pl=>(
                <div key={pl.k} onClick={()=>setPlan(pl.k)} style={{border:`2px solid ${plan===pl.k?"#ffb400":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"13px 14px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",background:plan===pl.k?"rgba(255,180,0,0.06)":"transparent",position:"relative"}}>
                  {pl.hot&&<div style={{position:"absolute",top:-9,right:14,background:"linear-gradient(135deg,#ffb400,#ff7b00)",color:"#000",fontSize:9,fontWeight:800,padding:"2px 10px",borderRadius:50,textTransform:"uppercase",letterSpacing:1}}>Best Value</div>}
                  <div><div style={{fontWeight:700,color:"#fff",fontSize:13}}>{pl.l}</div><div style={{fontSize:10,color:"#666",marginTop:2}}>{pl.d}</div></div>
                  <div style={{fontSize:20,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{pl.p}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:14}}><label style={lbl}>M-Pesa Phone (07…)</label><input value={phone} onChange={e=>setPhone(e.target.value)} style={inp} placeholder="0712345678" maxLength={10}/></div>
            <button onClick={pay} disabled={ld} style={{...btnPrimary,opacity:ld?0.7:1}}>{ld?"Sending STK Push…":`Pay ${selectedPlan.p} via M-Pesa`}</button>
          </div>
        )}
      </div>
    );
  };

  const InviteTeacherM=()=>{
    const [email,setEmail]=useState("");
    const [ld,setLd]=useState(false);
    const go=async()=>{
      if(!email.includes("@")){showToast("Enter a valid Gmail address","err");return;}
      setLd(true);
      const{error}=await supabase.from("school_teachers").insert([{school_id:school.id,email:email.trim().toLowerCase(),invited_by:user.id,status:"invited"}]);
      if(error){showToast("Failed: "+error.message,"err");}
      else{showToast("✅ Teacher invited — they'll get access once they register with that email.");setModal(null);}
      setLd(false);
    };
    return(
      <div>
        <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 4px",fontSize:22}}>Add a Teacher</h2>
        <p style={{color:"#777",fontSize:12,margin:"0 0 16px"}}>Only teachers you add here can log in and upload for {school?.name}.</p>
        <div style={{display:"grid",gap:12}}>
          <div><label style={lbl}>Teacher's Gmail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} placeholder="teacher@gmail.com" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <button onClick={go} disabled={ld} style={{...btnPrimary,opacity:ld?0.7:1}}>{ld?"Inviting…":"Invite Teacher"}</button>
        </div>
      </div>
    );
  };

  const GateM=()=>(
    <div style={{textAlign:"center",padding:"10px 0"}}>
      <div style={{fontSize:48,marginBottom:12}}>🔒</div>
      <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 8px",fontSize:20}}>Register to Continue</h2>
      <p style={{color:"#888",fontSize:13,margin:"0 0 20px",lineHeight:1.65}}>Create a free account, then subscribe from <strong style={{color:"#ffb400"}}>KSh 100/2 weeks</strong> to download materials.</p>
      <div style={{display:"grid",gap:10}}>
        <button onClick={()=>setModal("register")} style={btnPrimary}>Register Free</button>
        <button onClick={()=>setModal("login")} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#ccc",padding:"12px 0",borderRadius:10,fontWeight:700,cursor:"pointer",fontSize:14,width:"100%"}}>Already have account? Login</button>
      </div>
    </div>
  );

  const PreviewM=()=>{
    if(!prevMat) return null;
    const embedUrl = getEmbedUrl(prevMat.file_url);
    const fileIsR2 = isR2Url(prevMat.file_url);
    return(
      <div>
        <div style={{display:"flex",gap:12,marginBottom:14,alignItems:"center"}}>
          <div style={{width:52,height:52,background:`linear-gradient(135deg,${prevMat.color}cc,${prevMat.color}44)`,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{getIcon(prevMat.type)}</div>
          <div>
            <div style={{fontSize:9,color:"#ffb400",fontWeight:700,textTransform:"uppercase"}}>{prevMat.system} · {prevMat.level}</div>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",margin:"2px 0"}}>{prevMat.title}</div>
            <div style={{fontSize:11,color:"#666"}}>{(prevMat.subjects&&prevMat.subjects.length>0)?prevMat.subjects.join(", "):prevMat.subject} · {prevMat.type}</div>
            <div style={{marginTop:3}}><StorageBadge url={prevMat.file_url}/></div>
          </div>
        </div>
        {prevMat.description&&(
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:9,padding:"10px 12px",marginBottom:12,fontSize:12,color:"#aaa",lineHeight:1.6}}>
            {prevMat.description}
          </div>
        )}
        {prevMat.type==="Videos"?(
          (isSubscribed||isAdmin)&&fileIsR2?(
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"#27ae60",fontWeight:700,marginBottom:6}}>✅ ☁ Streaming from R2 — Fast & Unlimited</div>
              <div style={{position:"relative",borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,180,0,0.2)",background:"#000"}}>
                <video src={prevMat.file_url} controls preload="metadata" style={{width:"100%",maxHeight:420,display:"block"}}>
                  Your browser doesn't support inline video playback.
                </video>
              </div>
            </div>
          ):(isSubscribed||isAdmin)?(
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,180,0,0.15)",borderRadius:12,padding:24,marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:8}}>🎬</div>
              <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>Streaming not available for this video yet</div>
              <div style={{fontSize:11,color:"#888",lineHeight:1.6}}>This one's still on Drive — tap Download below to save it to your phone.</div>
            </div>
          ):(
            <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,180,0,0.15)",borderRadius:12,padding:24,marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:8}}>🎬</div>
              <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>Subscribe to Watch</div>
              <div style={{fontSize:11,color:"#888",lineHeight:1.6}}>Subscribe to stream this video instantly, or download it to your phone.</div>
            </div>
          )
        ):(isSubscribed||isAdmin)&&embedUrl?(
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"#27ae60",fontWeight:700,marginBottom:6}}>
              ✅ {fileIsR2 ? "☁ R2 Preview — Fast & Unlimited" : "Subscriber Preview — Full Document"}
            </div>
            <div style={{position:"relative",borderRadius:12,overflow:"hidden",border:"1px solid rgba(255,180,0,0.2)"}}>
              <iframe src={embedUrl} style={{width:"100%",height:480,border:"none",display:"block"}} allow="autoplay" title={prevMat.title}/>
            </div>
          </div>
        ):(
          <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:16,marginBottom:12,minHeight:180,position:"relative",overflow:"hidden"}}>
            <div style={{fontSize:13,fontWeight:700,textAlign:"center",marginBottom:10,color:"#fff"}}>{prevMat.title}</div>
            <div style={{fontSize:12,color:"#bbb",lineHeight:1.8}}>
              <p style={{margin:"0 0 8px"}}><strong style={{color:"#fff"}}>1. Introduction</strong></p>
              <p style={{margin:"0 0 8px"}}>This material covers essential concepts for <strong style={{color:"#ffb400"}}>{(prevMat.subjects&&prevMat.subjects.length>0)?prevMat.subjects.join(", "):prevMat.subject}</strong> at <strong style={{color:"#ffb400"}}>{prevMat.level}</strong>.</p>
            </div>
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%) rotate(-28deg)",opacity:0.08,fontSize:13,fontWeight:900,color:"#fff",whiteSpace:"nowrap",pointerEvents:"none",letterSpacing:1}}>www.topplussrevisions.top</div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:60,background:"linear-gradient(transparent,rgba(13,25,41,0.98))",display:"flex",alignItems:"flex-end",justifyContent:"center",paddingBottom:8}}>
              <span style={{fontSize:10,color:"#555",fontStyle:"italic"}}>{user?"Subscribe to preview full document":"Register free, then subscribe to unlock"}</span>
            </div>
          </div>
        )}
        {user&&!isSubscribed&&(<div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:9,padding:"10px",marginBottom:12,textAlign:"center"}}><span style={{fontSize:12,color:"#ffb400",fontWeight:600}}>🔐 Subscribe to preview & download all documents</span></div>)}
        {!user&&(<div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:9,padding:"10px",marginBottom:12,textAlign:"center"}}><span style={{fontSize:12,color:"#ffb400",fontWeight:600}}>📖 Register free, then subscribe from KSh 100/2 weeks</span></div>)}
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setModal(null)} style={{flex:1,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"#aaa",padding:"11px 0",borderRadius:9,cursor:"pointer",fontWeight:600,fontSize:13}}>Close</button>
          {!user?(<button onClick={()=>setModal("register")} style={{flex:2,...btnPrimary,padding:"11px 0",borderRadius:9,fontSize:13}}>Register to Continue</button>
          ):!isSubscribed?(<button onClick={()=>setModal("subscribe")} style={{flex:2,...btnPrimary,padding:"11px 0",borderRadius:9,fontSize:13}}>💳 Subscribe to Download</button>
          ):(<button onClick={()=>{setModal(null);handleDL(prevMat);}} style={{flex:2,...btnPrimary,padding:"11px 0",borderRadius:9,fontSize:13}}>⬇ Download Full</button>)}
        </div>
      </div>
    );
  };

  const AnalyticsTab=()=>{
    const [stats,setStats]=useState({users:0,subscribers:0,monthly:0,sixmonth:0,annual:0});
    const [r2Stats,setR2Stats]=useState({total:0,migrated:0,pending:0});
    useEffect(()=>{
      const loadStats=async()=>{
        const{count:users}=await supabase.from("profiles").select("*",{count:"exact",head:true});
        const{count:subs}=await supabase.from("subscriptions").select("*",{count:"exact",head:true}).eq("active",true);
        const{count:monthly}=await supabase.from("subscriptions").select("*",{count:"exact",head:true}).eq("plan","monthly").eq("active",true);
        const{count:sixmonth}=await supabase.from("subscriptions").select("*",{count:"exact",head:true}).eq("plan","sixmonth").eq("active",true);
        const{count:annual}=await supabase.from("subscriptions").select("*",{count:"exact",head:true}).eq("plan","annual").eq("active",true);
        setStats({users:users||0,subscribers:subs||0,monthly:monthly||0,sixmonth:sixmonth||0,annual:annual||0});
      };
      loadStats();
      const total = mats.length;
      const migrated = mats.filter(m => isR2Url(m.file_url)).length;
      const pending = mats.filter(m => isDriveUrl(m.file_url)).length;
      setR2Stats({ total, migrated, pending });
    },[]);
    const topMat=[...mats].sort((a,b)=>b.downloads-a.downloads)[0];
    const revenue=(stats.monthly*200)+(stats.sixmonth*800)+(stats.annual*1200);
    const allStats=[
      {l:"Total Materials",v:mats.length,i:"📄"},{l:"Total Downloads",v:mats.reduce((s,m)=>s+(m.downloads||0),0).toLocaleString(),i:"⬇"},
      {l:"Registered Users",v:stats.users,i:"👤"},{l:"Active Subscribers",v:stats.subscribers,i:"💳",c:"#27ae60"},
      {l:"Monthly Plans",v:stats.monthly,i:"📆"},{l:"6-Month Plans",v:stats.sixmonth,i:"🗓️"},
      {l:"Annual Plans",v:stats.annual,i:"📅"},
      {l:"Est. Revenue",v:`KSh ${revenue.toLocaleString()}`,i:"💰",c:"#ffb400"},
      {l:"CBC Materials",v:mats.filter(m=>m.system==="CBC").length,i:"📘"},{l:"8-4-4 Materials",v:mats.filter(m=>m.system==="8-4-4").length,i:"📗"},
      {l:"On R2 ✅",v:r2Stats.migrated,i:"☁",c:"#27ae60"},{l:"On Drive ⏳",v:r2Stats.pending,i:"🔄",c:"#f39c12"},
      {l:"Notes",v:mats.filter(m=>m.type==="Notes").length,i:"📝"},{l:"Past Papers",v:mats.filter(m=>m.type==="Past Papers").length,i:"📄"},
      {l:"Marking Schemes",v:mats.filter(m=>m.type==="Marking Schemes").length,i:"✅"},{l:"Revision Papers",v:mats.filter(m=>m.type==="Revision Papers").length,i:"📑"},
      {l:"Assignments",v:mats.filter(m=>m.type==="Assignments").length,i:"📋"},{l:"Exams",v:mats.filter(m=>m.type==="Exams").length,i:"📝"},
      {l:"CATs",v:mats.filter(m=>m.type==="CATs").length,i:"✍️"},{l:"Mock Exams",v:mats.filter(m=>m.type==="Mock Exams").length,i:"🎯"},
      {l:"KCSE Papers",v:mats.filter(m=>m.type==="KCSE Papers").length,i:"🎓"},{l:"KCPE Papers",v:mats.filter(m=>m.type==="KCPE Papers").length,i:"🏫"},
    ];
    return(
      <div>
        {topMat&&(<div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.2)",borderRadius:12,padding:"12px",marginBottom:14}}><div style={{fontSize:10,color:"#ffb400",fontWeight:700,textTransform:"uppercase",marginBottom:4}}>🏆 Most Downloaded</div><div style={{fontSize:13,color:"#fff",fontWeight:700}}>{topMat.title}</div><div style={{fontSize:11,color:"#888"}}>{topMat.subject} · {topMat.downloads||0} downloads</div></div>)}
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px",marginBottom:14}}>
          <div style={{fontSize:11,color:"#aaa",fontWeight:700,marginBottom:8,textTransform:"uppercase"}}>☁ R2 Migration Status</div>
          <div style={{background:"rgba(255,255,255,0.05)",borderRadius:8,height:10,marginBottom:8,overflow:"hidden"}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,#27ae60,#2ecc71)",width:`${r2Stats.total>0?(r2Stats.migrated/r2Stats.total)*100:0}%`,borderRadius:8,transition:"width 0.5s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
            <span style={{color:"#27ae60"}}>☁ {r2Stats.migrated} on R2</span>
            <span style={{color:"#f39c12"}}>🔄 {r2Stats.pending} on Drive</span>
            <span style={{color:"#555"}}>{r2Stats.total} total</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {allStats.map(c=>(<div key={c.l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 12px"}}><div style={{fontSize:18,marginBottom:5}}>{c.i}</div><div style={{fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{c.l}</div><div style={{fontSize:18,fontWeight:900,color:c.c||"#ffb400",fontFamily:"'Playfair Display',serif"}}>{c.v}</div></div>))}
        </div>
      </div>
    );
  };

  const Admin=()=>{
    const [tab,setTab]=useState("materials");
    const savedForm=()=>{try{return JSON.parse(sessionStorage.getItem("adminForm")||"null");}catch{return null;}};
    const [form,setForm]=useState(savedForm()||{title:"",description:"",system:"CBC",level:"Grade 1",type:"Notes"});
    const [selectedSubs,setSelectedSubs]=useState([]);
    const [pasteUrl,setPasteUrl]=useState("");
    const [uploading,setUploading]=useState(false);
    const [progress,setProgress]=useState("");
    const [migratingIds,setMigratingIds]=useState(new Set());
    const [migrateAllRunning,setMigrateAllRunning]=useState(false);
    const [migrateProgress,setMigrateProgress]=useState("");
    const aLvls=form.system==="CBC"?LEVELS_CBC:LEVELS_844;
    const subjectList=SUBS_CBC[form.level]||SUBS_844[form.level]||[];
    useEffect(()=>{sessionStorage.setItem("adminForm",JSON.stringify(form));},[form]);
    const toggleSub=(s)=>{setSelectedSubs(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);};
    const selectAllSubs=()=>setSelectedSubs(subjectList);
    const clearAllSubs=()=>setSelectedSubs([]);

    const upload=async()=>{
      if(!form.title){showToast("Fill Title","err");return;}
      if(selectedSubs.length===0){showToast("Select at least one Subject","err");return;}
      const url=pasteUrl.trim();
      if(!url){showToast("Paste a Google Drive URL first","err");return;}
      const subjectsToSave=selectedSubs;
      setUploading(true);
      setProgress("Saving to database…");
      try{
        const{data,error}=await supabase.from("materials").insert([{
          title:form.title,description:form.description,
          system:form.system,level:form.level,
          subject:subjectsToSave[0],subjects:subjectsToSave,type:form.type,
          file_url:url,
          downloads:0
        }]).select();
        if(error) throw new Error(error.message);
        const savedId = data?.[0]?.id;
        const isVideo = form.type==="Videos";
        showToast(isVideo?`✅ Video saved with ${subjectsToSave.length} subject(s)! Kept on Drive (no R2 migration for videos).`:`✅ Saved with ${subjectsToSave.length} subject(s)! Now migrating to R2…`,"info");
        setForm({title:"",description:"",system:"CBC",level:"Grade 1",type:"Notes"});
        sessionStorage.removeItem("adminForm");setPasteUrl("");setSelectedSubs([]);
        await loadMats();
        setUploading(false);setProgress("");
        if(savedId&&!isVideo){
          setMigratingIds(prev=>new Set([...prev,savedId]));
          const result = await migrateToR2(savedId, url, `${form.title.replace(/\s+/g,"_")}.pdf`);
          setMigratingIds(prev=>{const s=new Set(prev);s.delete(savedId);return s;});
          if(result.success) showToast(`☁ Migrated to R2 successfully!`);
          else showToast(`⚠️ R2 migration failed: ${result.error}. File still available via Drive.`,"err");
        }
      }catch(err){
        showToast("Failed: "+err.message,"err");
        setUploading(false);setProgress("");
      }
    };

    const manualMigrate = async (mat) => {
      if(mat.type==="Videos"){showToast("Videos stay on Drive — not migrated to R2","err");return;}
      if(!isDriveUrl(mat.file_url)){showToast("Already on R2 or not a Drive URL","err");return;}
      setMigratingIds(prev=>new Set([...prev,mat.id]));
      const result = await migrateToR2(mat.id, mat.file_url, `${mat.title.replace(/\s+/g,"_")}.pdf`);
      setMigratingIds(prev=>{const s=new Set(prev);s.delete(mat.id);return s;});
      if(result.success) showToast("☁ Moved to R2! ✅");
      else showToast("Migration failed: "+result.error,"err");
    };

    const migrateAll = async () => {
      const driveMats = mats.filter(m=>isDriveUrl(m.file_url)&&m.type!=="Videos");
      if(driveMats.length===0){showToast("No Drive files to migrate","err");return;}
      setMigrateAllRunning(true);
      for(let i=0;i<driveMats.length;i++){
        const mat=driveMats[i];
        setMigrateProgress(`Migrating ${i+1}/${driveMats.length}: ${mat.title.slice(0,30)}…`);
        await manualMigrate(mat);
      }
      setMigrateAllRunning(false);
      setMigrateProgress("");
      showToast("✅ All files migrated to R2!");
    };

    const driveCount = mats.filter(m=>isDriveUrl(m.file_url)&&m.type!=="Videos").length;
    const r2Count = mats.filter(m=>isR2Url(m.file_url)).length;

    return(
      <div style={{padding:"20px 16px 40px",background:"#080e1c",minHeight:"100dvh"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}><span style={{fontSize:18}}>🛠</span><h2 style={{margin:0,fontSize:17,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Admin Dashboard</h2></div>
        <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto"}}>
          {["materials","upload","analytics"].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"rgba(255,180,0,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${tab===t?"rgba(255,180,0,0.3)":"rgba(255,255,255,0.07)"}`,color:tab===t?"#ffb400":"#888",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,whiteSpace:"nowrap"}}>{t==="upload"?"⬆ Upload":t==="materials"?"📋 Materials":"📊 Analytics"}</button>))}
        </div>

        {tab==="materials"&&(
          <div>
            {/* Migration summary banner */}
            <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px",marginBottom:12}}>
              <div style={{fontSize:11,color:"#aaa",fontWeight:700,marginBottom:8,textTransform:"uppercase"}}>☁ Storage Status</div>
              <div style={{background:"rgba(255,255,255,0.05)",borderRadius:8,height:8,marginBottom:8,overflow:"hidden"}}>
                <div style={{height:"100%",background:"linear-gradient(90deg,#27ae60,#2ecc71)",width:`${mats.length>0?(r2Count/mats.length)*100:0}%`,borderRadius:8,transition:"width 0.5s"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:10}}>
                <span style={{color:"#27ae60",fontWeight:700}}>☁ {r2Count} on R2</span>
                <span style={{color:"#f39c12",fontWeight:700}}>🔄 {driveCount} on Drive</span>
                <span style={{color:"#555"}}>{mats.length} total</span>
              </div>
              {driveCount>0&&(
                <button
                  onClick={migrateAll}
                  disabled={migrateAllRunning}
                  style={{background:"linear-gradient(135deg,#f39c12,#e67e22)",border:"none",color:"#000",borderRadius:8,padding:"10px 0",cursor:migrateAllRunning?"not-allowed":"pointer",fontWeight:800,fontSize:13,width:"100%",opacity:migrateAllRunning?0.7:1}}
                >
                  {migrateAllRunning?`⏳ ${migrateProgress||"Migrating…"}`:`☁ Migrate All ${driveCount} Drive Files → R2`}
                </button>
              )}
              {driveCount===0&&r2Count>0&&(
                <div style={{textAlign:"center",fontSize:12,color:"#27ae60",fontWeight:700}}>✅ All files are on R2!</div>
              )}
            </div>

            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:400}}>
                <thead>
                  <tr style={{background:"rgba(255,180,0,0.04)"}}>
                    {["Title","Level","Storage","DLs","Del"].map(h=><th key={h} style={{padding:"9px 8px",textAlign:"left",color:"#ffb400",fontWeight:700,fontSize:10,textTransform:"uppercase"}}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {mats.map((m,i)=>(
                    <tr key={m.id} style={{borderTop:"1px solid rgba(255,255,255,0.04)",background:i%2?"rgba(255,255,255,0.01)":"transparent"}}>
                      <td style={{padding:"8px",color:"#fff",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.title}</td>
                      <td style={{padding:"8px",color:"#888",whiteSpace:"nowrap"}}>{m.level}</td>
                      <td style={{padding:"8px"}}>
                        {migratingIds.has(m.id)?(
                          <span style={{fontSize:10,color:"#f39c12",fontWeight:700}}>⏳…</span>
                        ):(
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            <StorageBadge url={m.file_url}/>
                            {isDriveUrl(m.file_url)&&m.type!=="Videos"&&(
                              <button onClick={()=>manualMigrate(m)} style={{background:"rgba(243,156,18,0.15)",border:"1px solid rgba(243,156,18,0.3)",color:"#f39c12",borderRadius:4,padding:"2px 6px",cursor:"pointer",fontSize:9,fontWeight:700,whiteSpace:"nowrap"}}>→R2</button>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={{padding:"8px",color:"#ffb400",fontWeight:700}}>{m.downloads||0}</td>
                      <td style={{padding:"8px"}}>
                        <button onClick={async()=>{await supabase.from("materials").delete().eq("id",m.id);setMats(p=>p.filter(x=>x.id!==m.id));showToast("Deleted");}} style={{background:"rgba(231,76,60,0.12)",border:"1px solid rgba(231,76,60,0.2)",color:"#e74c3c",borderRadius:5,padding:"3px 7px",cursor:"pointer",fontSize:11}}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==="upload"&&(
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:16}}>
            <div style={{background:"rgba(39,174,96,0.08)",border:"1px solid rgba(39,174,96,0.2)",borderRadius:10,padding:"10px 12px",marginBottom:14,display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:18}}>☁</span>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#27ae60"}}>Auto R2 Migration Active</div>
                <div style={{fontSize:11,color:"#555"}}>Files are automatically moved from Drive to R2 after saving</div>
              </div>
            </div>
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
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <button type="button" onClick={selectAllSubs} style={{flex:1,background:"rgba(39,174,96,0.12)",border:"1px solid rgba(39,174,96,0.3)",color:"#27ae60",borderRadius:8,padding:"9px 0",cursor:"pointer",fontWeight:700,fontSize:12}}>✅ Select All</button>
                  <button type="button" onClick={clearAllSubs} style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",color:"#888",borderRadius:8,padding:"9px 0",cursor:"pointer",fontWeight:700,fontSize:12}}>✕ Clear All</button>
                </div>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px",maxHeight:200,overflowY:"auto"}}>
                  {subjectList.map(s=>(<label key={s} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 4px",cursor:"pointer",borderBottom:"1px solid rgba(255,255,255,0.04)"}}><input type="checkbox" checked={selectedSubs.includes(s)} onChange={()=>toggleSub(s)} style={{width:16,height:16,accentColor:"#ffb400",cursor:"pointer"}}/><span style={{fontSize:13,color:selectedSubs.includes(s)?"#ffb400":"#ccc",fontWeight:selectedSubs.includes(s)?700:400}}>{s}</span></label>))}
                </div>
                {selectedSubs.length>0&&<div style={{marginTop:6,fontSize:11,color:"#27ae60"}}>✅ Selected: {selectedSubs.join(", ")}</div>}
              </div>
              <div>
                <label style={lbl}>📎 Paste Google Drive Link *</label>
                <textarea value={pasteUrl} onChange={e=>setPasteUrl(e.target.value)} placeholder={"Paste your Google Drive share link:\nhttps://drive.google.com/file/d/XXXX/view"} style={{...inp,minHeight:90,resize:"vertical",lineHeight:1.6,fontSize:12}}/>
                <div style={{marginTop:6,fontSize:11,color:"#555"}}>📌 Open PDF in Google Drive → tap ⋮ → Share → Copy link → paste above</div>
              </div>
              {progress&&<div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:8,padding:"10px",fontSize:13,color:"#ffb400",textAlign:"center"}}>⏳ {progress}</div>}
              <button onClick={upload} disabled={uploading} style={{...btnPrimary,opacity:uploading?0.7:1}}>{uploading?`⏳ ${progress||"Saving…"}`:"💾 Save & Auto-Migrate to R2 ☁"}</button>
            </div>
          </div>
        )}

        {tab==="analytics"&&<AnalyticsTab/>}
      </div>
    );
  };

  // Landing page for users with no school membership yet — join with a code or register a school
  const SchoolLanding=()=>(
    <div style={{padding:"20px 16px 40px",background:"#080e1c",minHeight:"100dvh"}}>
      <SectionHead icon="🏫" title="School Portal" sub="Access your school's materials, or get your school set up"/>
      <div style={{display:"grid",gap:12,marginTop:6}}>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:16}}>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:6}}>🎓 I'm a Student</div>
          <p style={{color:"#888",fontSize:12,margin:"0 0 12px",lineHeight:1.6}}>Subscribe to Toppluss, then enter your school's code to unlock their materials and videos — plus what other schools choose to share.</p>
          <button onClick={()=>{ if(!user){setModal("register");return;} setModal("school-join"); }} style={btnPrimary}>Enter School Code</button>
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:14,padding:16}}>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:6}}>🏫 I'm a School</div>
          <p style={{color:"#888",fontSize:12,margin:"0 0 12px",lineHeight:1.6}}>Register your school, add your teachers, and give students a code to access your notes and videos. From KSh 5,000/month.</p>
          <button onClick={()=>{ if(!user){setModal("register");return;} setModal("school-register"); }} style={{...btnPrimary,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.13)",color:"#fff"}}>Register My School</button>
        </div>
      </div>
    </div>
  );

  // Dashboard for a school admin (owner) or an invited teacher — manage teachers, upload/share materials
  const SchoolAdmin=()=>{
    // Restore tab/form/subjects from sessionStorage — Android can kill this WebView in the
    // background while the native file picker is open, which wipes React state on return.
    // This lets the admin land back on Upload with everything still filled in.
    const savedState=()=>{try{return JSON.parse(sessionStorage.getItem("schoolAdminUpload")||"null");}catch{return null;}};
    const restored=savedState();
    const [tab,setTab]=useState(restored?.tab||"materials");
    const [teachers,setTeachers]=useState([]);
    const [form,setForm]=useState(restored?.form||{title:"",description:"",system:"CBC",level:"Grade 1",type:"Notes"});
    const [selectedSubs,setSelectedSubs]=useState(restored?.selectedSubs||[]);
    const [uploadMethod,setUploadMethod]=useState(restored?.uploadMethod||"file"); // "file" | "drive"
    const [pasteUrl,setPasteUrl]=useState(restored?.pasteUrl||"");
    const [file,setFile]=useState(null);
    const [uploading,setUploading]=useState(false);
    const [uploadProgress,setUploadProgress]=useState("");
    const aLvls=form.system==="CBC"?LEVELS_CBC:LEVELS_844;
    const subjectList=SUBS_CBC[form.level]||SUBS_844[form.level]||[];
    const isSchoolAdmin=schoolRole==="admin";
    const active=schoolActive(school);

    useEffect(()=>{
      sessionStorage.setItem("schoolAdminUpload",JSON.stringify({tab,form,selectedSubs,uploadMethod,pasteUrl}));
    },[tab,form,selectedSubs,uploadMethod,pasteUrl]);

    useEffect(()=>{
      if(tab==="teachers"&&isSchoolAdmin&&school){
        supabase.from("school_teachers").select("*").eq("school_id",school.id).order("created_at",{ascending:false})
          .then(({data})=>setTeachers(data||[]));
      }
    },[tab,school]);

    const toggleSub=(s)=>setSelectedSubs(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);

    const upload=async()=>{
      if(!active){showToast("School subscription is inactive — renew to upload","err");return;}
      if(!form.title){showToast("Fill Title","err");return;}
      if(selectedSubs.length===0){showToast("Select at least one Subject","err");return;}
      if(uploadMethod==="file"&&!file){showToast("Choose a file to upload","err");return;}
      if(uploadMethod==="drive"&&!pasteUrl.trim()){showToast("Paste a Google Drive URL first","err");return;}
      setUploading(true);
      setUploadProgress("Saving…");
      try{
        const{data,error}=await supabase.from("materials").insert([{
          title:form.title,description:form.description,system:form.system,level:form.level,
          subject:selectedSubs[0],subjects:selectedSubs,type:form.type,
          file_url:uploadMethod==="drive"?pasteUrl.trim():null,downloads:0,
          school_id:school.id,visibility:"shared",uploaded_by:user.id,
        }]).select();
        if(error) throw new Error(error.message);
        const savedId=data?.[0]?.id;

        if(uploadMethod==="file"){
          setUploadProgress("Uploading to R2…");
          const result=await uploadFileToR2(file,savedId,`${form.title.replace(/\s+/g,"_")}.${file.name.split(".").pop()}`);
          if(!result.success) throw new Error(result.error);
          showToast("✅ Uploaded to R2 — shared with all schools");
        }else{
          setUploadProgress("Migrating Drive link to R2…");
          const ext=form.type==="Videos"?"mp4":"pdf";
          const result=await migrateToR2(savedId, pasteUrl.trim(), `${form.title.replace(/\s+/g,"_")}.${ext}`);
          if(result.success) showToast("✅ Saved & migrated to R2 — shared with all schools");
          else showToast(`✅ Saved — but R2 migration failed (${result.error}). Still available via Drive.`,"info");
        }

        setForm({title:"",description:"",system:"CBC",level:"Grade 1",type:"Notes"});
        setSelectedSubs([]);setFile(null);setPasteUrl("");
        sessionStorage.removeItem("schoolAdminUpload");
        await loadSchoolMats();
      }catch(err){
        showToast("Failed: "+err.message,"err");
      }
      setUploading(false);setUploadProgress("");
    };

    const removeTeacher=async(t)=>{
      await supabase.from("school_teachers").delete().eq("id",t.id);
      setTeachers(p=>p.filter(x=>x.id!==t.id));
      showToast("Teacher removed");
    };

    const removeMaterial=async(m)=>{
      const{error}=await supabase.from("materials").delete().eq("id",m.id);
      if(error){showToast("Failed to delete: "+error.message,"err");return;}
      showToast("🗑 Deleted "+m.title);
      await loadSchoolMats();
    };

    const mine=schoolMats.filter(m=>m.scope==="mine");
    const shared=schoolMats.filter(m=>m.scope==="shared");

    return(
      <div style={{padding:"20px 16px 40px",background:"#080e1c",minHeight:"100dvh"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <span style={{position:"relative",fontSize:18,display:"inline-block"}}>
            🏫
            <FacebookBadge/>
          </span>
          <h2 style={{margin:0,fontSize:17,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>{school?.name}</h2>
          {school?.gold_verified&&<GoldBadge/>}
        </div>
        <p style={{color:"#666",fontSize:12,margin:"0 0 14px"}}>Code: <strong style={{color:"#ffb400"}}>{school?.code}</strong> · {isSchoolAdmin?"Admin":"Teacher"}</p>

        {!active&&(
          <div style={{background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.3)",borderRadius:12,padding:"14px",marginBottom:14}}>
            <div style={{fontWeight:700,color:"#e74c3c",marginBottom:5}}>🔒 {school?.status==="pending"?"Awaiting Approval":"Subscription Inactive"}</div>
            <p style={{color:"#aaa",fontSize:13,margin:"0 0 10px"}}>{school?.status==="pending"?"We'll notify you once your school is approved.":"Materials stay saved, but teachers and students lose access until you renew."}</p>
            {school?.status==="approved"&&isSchoolAdmin&&<button onClick={()=>setModal("school-subscribe")} style={{...btnPrimary,padding:"10px 0"}}>Subscribe Now</button>}
          </div>
        )}

        <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto"}}>
          {["materials","upload",...(isSchoolAdmin?["teachers"]:[]),"shared"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"rgba(255,180,0,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${tab===t?"rgba(255,180,0,0.3)":"rgba(255,255,255,0.07)"}`,color:tab===t?"#ffb400":"#888",padding:"8px 14px",borderRadius:8,cursor:"pointer",fontWeight:700,fontSize:12,whiteSpace:"nowrap"}}>
              {t==="upload"?"⬆ Upload":t==="materials"?"📋 Materials":t==="teachers"?"👩‍🏫 Teachers":"🌍 Other Schools"}
            </button>
          ))}
        </div>

        {tab==="materials"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {mine.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#555"}}>No materials uploaded yet.</div>}
            {mine.map(m=>(
              <div key={m.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{m.title}</div>
                  <div style={{fontSize:11,color:"#666"}}>{m.level} · {m.type}</div>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <span style={{background:"rgba(39,174,96,0.15)",border:"1px solid rgba(39,174,96,0.35)",color:"#27ae60",borderRadius:8,padding:"7px 12px",fontWeight:700,fontSize:11,whiteSpace:"nowrap"}}>🌍 Shared</span>
                  <button
                    onClick={()=>{ if(window.confirm(`Delete "${m.title}"? This can't be undone.`)) removeMaterial(m); }}
                    style={{background:"rgba(231,76,60,0.12)",border:"1px solid rgba(231,76,60,0.25)",color:"#e74c3c",borderRadius:8,padding:"7px 10px",cursor:"pointer",fontWeight:700,fontSize:11}}
                  >🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="upload"&&(
          <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:16}}>
            <div style={{display:"grid",gap:12}}>
              <div><label style={lbl}>Title *</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} style={inp} placeholder="e.g. Form 3 Chemistry Notes"/></div>
              <div><label style={lbl}>Description</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} style={{...inp,minHeight:64,resize:"vertical"}} placeholder="Brief summary…"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={lbl}>System</label><select value={form.system} onChange={e=>{setForm(p=>({...p,system:e.target.value,level:e.target.value==="CBC"?"Grade 1":"Form 1"}));setSelectedSubs([]);}} style={{...inp,cursor:"pointer"}}><option>CBC</option><option>8-4-4</option></select></div>
                <div><label style={lbl}>Level</label><select value={form.level} onChange={e=>{setForm(p=>({...p,level:e.target.value}));setSelectedSubs([]);}} style={{...inp,cursor:"pointer"}}>{aLvls.map(l=><option key={l}>{l}</option>)}</select></div>
              </div>
              <div><label style={lbl}>Type</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{...inp,cursor:"pointer"}}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div>
                <label style={lbl}>Subject ({selectedSubs.length} selected)</label>
                <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"10px",maxHeight:160,overflowY:"auto"}}>
                  {subjectList.map(s=>(<label key={s} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 4px",cursor:"pointer"}}><input type="checkbox" checked={selectedSubs.includes(s)} onChange={()=>toggleSub(s)} style={{accentColor:"#ffb400"}}/><span style={{fontSize:13,color:selectedSubs.includes(s)?"#ffb400":"#ccc"}}>{s}</span></label>))}
                </div>
              </div>
              <div style={{background:"rgba(39,174,96,0.06)",border:"1px solid rgba(39,174,96,0.18)",borderRadius:9,padding:"10px 12px",fontSize:11,color:"#27ae60"}}>
                🌍 This material will be shared with every school on Toppluss automatically.
              </div>
              <div>
                <label style={lbl}>Upload Method</label>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                  {[{k:"file",l:"📎 Upload File"},{k:"drive",l:"🔗 Drive Link"}].map(o=>(
                    <div key={o.k} onClick={()=>setUploadMethod(o.k)} style={{border:`2px solid ${uploadMethod===o.k?"#ffb400":"rgba(255,255,255,0.08)"}`,borderRadius:10,padding:"11px 0",textAlign:"center",cursor:"pointer",background:uploadMethod===o.k?"rgba(255,180,0,0.06)":"transparent",fontWeight:700,fontSize:13,color:uploadMethod===o.k?"#ffb400":"#ccc"}}>{o.l}</div>
                  ))}
                </div>
              </div>
              {uploadMethod==="file"?(
                <div>
                  <label style={lbl}>📎 Upload File *</label>
                  <input
                    type="file"
                    accept={form.type==="Videos"?"video/*":".pdf,.doc,.docx"}
                    onChange={e=>setFile(e.target.files[0]||null)}
                    style={{...inp,padding:"10px 14px"}}
                  />
                  {file&&<div style={{marginTop:6,fontSize:11,color:"#27ae60"}}>📄 {file.name}</div>}
                  <div style={{marginTop:6,fontSize:11,color:"#666"}}>💡 Large videos can fail to attach on some phones — if that happens, switch to Drive Link instead.</div>
                </div>
              ):(
                <div>
                  <label style={lbl}>🔗 Paste Google Drive Link *</label>
                  <textarea value={pasteUrl} onChange={e=>setPasteUrl(e.target.value)} placeholder={"https://drive.google.com/file/d/XXXX/view"} style={{...inp,minHeight:80,resize:"vertical",lineHeight:1.6,fontSize:12}}/>
                  <div style={{marginTop:6,fontSize:11,color:"#555"}}>📌 Open the file in Google Drive → tap ⋮ → Share → Copy link → paste above. We'll move it to R2 automatically.</div>
                </div>
              )}
              <button onClick={upload} disabled={uploading||!active} style={{...btnPrimary,opacity:(uploading||!active)?0.6:1}}>{uploading?(uploadProgress||"Uploading…"):!active?"School Subscription Inactive":uploadMethod==="file"?"☁ Save & Upload to R2":"☁ Save & Migrate to R2"}</button>
            </div>
          </div>
        )}

        {tab==="teachers"&&isSchoolAdmin&&(
          <div>
            <button onClick={()=>setModal("invite-teacher")} style={{...btnPrimary,marginBottom:14}}>+ Add Teacher by Gmail</button>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {teachers.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:"#555"}}>No teachers added yet.</div>}
              {teachers.map(t=>(
                <div key={t.id} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"11px 13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:13,color:"#fff",fontWeight:600}}>{t.email}</div>
                    <div style={{fontSize:10,color:t.status==="active"?"#27ae60":"#f39c12",fontWeight:700,textTransform:"uppercase"}}>{t.status}</div>
                  </div>
                  <button onClick={()=>removeTeacher(t)} style={{background:"rgba(231,76,60,0.12)",border:"1px solid rgba(231,76,60,0.2)",color:"#e74c3c",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:11,fontWeight:700}}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==="shared"&&(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {shared.length===0?(
              <div style={{textAlign:"center",padding:"40px 0",color:"#555"}}>
                <div style={{fontSize:36,marginBottom:10}}>🌍</div>
                <div style={{fontSize:13,fontWeight:600}}>No other schools are sharing materials yet.</div>
              </div>
            ):shared.map(m=>(
              <div key={m.id}>
                <div style={{fontSize:10,color:"#666",marginBottom:4,paddingLeft:2,display:"flex",alignItems:"center"}}>
                  From {m.schoolName}{m.schoolGold&&<GoldBadge/>}
                </div>
                <Card {...cardProps(m)}/>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Student-facing school portal — toggle between own school's materials and other schools' shared materials
  const SchoolPortal=()=>{
    const active=schoolActive(school);
    const mine=schoolMats.filter(m=>m.scope==="mine");
    const shared=schoolMats.filter(m=>m.scope==="shared");
    const shown=portalView==="mine"?mine:shared;
    return(
      <div style={{padding:"20px 16px 40px",background:"#080e1c",minHeight:"100dvh"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <span style={{position:"relative",fontSize:18,display:"inline-block"}}>
            🏫
            <FacebookBadge/>
          </span>
          <h2 style={{margin:0,fontSize:17,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>{school?.name}</h2>
          {school?.gold_verified&&<GoldBadge/>}
        </div>
        <p style={{color:"#666",fontSize:12,margin:"0 0 16px"}}>Code: <strong style={{color:"#ffb400"}}>{school?.code}</strong></p>

        {!active&&(
          <div style={{background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.3)",borderRadius:12,padding:"14px",marginBottom:16,textAlign:"center"}}>
            <div style={{fontWeight:700,color:"#e74c3c",marginBottom:5}}>🔒 School Access Paused</div>
            <p style={{color:"#aaa",fontSize:13,margin:0}}>{school?.name} needs to renew its subscription before you can view materials again. Your materials are safe and will return once they resubscribe.</p>
          </div>
        )}

        {active&&(<>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <button onClick={()=>setPortalView("mine")} style={{flex:1,background:portalView==="mine"?"rgba(255,180,0,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${portalView==="mine"?"rgba(255,180,0,0.3)":"rgba(255,255,255,0.07)"}`,color:portalView==="mine"?"#ffb400":"#888",padding:"10px 0",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12}}>🏫 My School ({mine.length})</button>
            <button onClick={()=>setPortalView("shared")} style={{flex:1,background:portalView==="shared"?"rgba(255,180,0,0.1)":"rgba(255,255,255,0.04)",border:`1px solid ${portalView==="shared"?"rgba(255,180,0,0.3)":"rgba(255,255,255,0.07)"}`,color:portalView==="shared"?"#ffb400":"#888",padding:"10px 0",borderRadius:9,cursor:"pointer",fontWeight:700,fontSize:12}}>🌍 Other Schools ({shared.length})</button>
          </div>
          {shown.length===0?(
            <div style={{textAlign:"center",padding:"50px 0",color:"#555"}}>
              <div style={{fontSize:36,marginBottom:10}}>📚</div>
              <div style={{fontSize:13,fontWeight:600}}>{portalView==="mine"?"Your school hasn't uploaded anything yet.":"No other schools are sharing materials yet."}</div>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {shown.map(m=>(
                <div key={m.id}>
                  {m.scope==="shared"&&(
                    <div style={{fontSize:10,color:"#666",marginBottom:4,paddingLeft:2,display:"flex",alignItems:"center"}}>
                      From {m.schoolName}{m.schoolGold&&<GoldBadge/>}
                    </div>
                  )}
                  <Card {...cardProps(m)}/>
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>
    );
  };

  const Dash=()=>{
    if(!user||!profile) return <div style={{textAlign:"center",padding:60,color:"#444"}}>Loading…</div>;
    const expired=subscription?.reason==="expired";
    const isTeacherAcct=profile.role==="teacher";
    return(
      <div style={{padding:"20px 16px 40px",background:"#080e1c",minHeight:"100dvh"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}><span style={{fontSize:18}}>{isTeacherAcct?"👩‍🏫":"👤"}</span><h2 style={{margin:0,fontSize:17,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Welcome, {userName.split(" ")[0]}!</h2>{isTeacherAcct&&<span style={{fontSize:9,background:"rgba(255,180,0,0.15)",color:"#ffb400",borderRadius:6,padding:"2px 8px",fontWeight:700,textTransform:"uppercase"}}>Teacher</span>}</div>
        {expired&&(<div style={{background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.25)",borderRadius:12,padding:"14px",marginBottom:14}}><div style={{fontWeight:700,color:"#e74c3c",marginBottom:5}}>⚠️ Subscription Expired</div><p style={{color:"#aaa",fontSize:13,margin:"0 0 10px"}}>Your {subscription.plan} plan expired. Renew to restore access.</p><button onClick={()=>setModal("subscribe")} style={{...btnPrimary,padding:"10px 0"}}>Renew Now</button></div>)}
        {!isSubscribed&&!expired&&(<div style={{background:"rgba(192,57,43,0.1)",border:"1px solid rgba(192,57,43,0.3)",borderRadius:12,padding:"14px",marginBottom:14}}><div style={{fontWeight:700,color:"#e74c3c",marginBottom:5}}>🔒 No Active Subscription</div><p style={{color:"#aaa",fontSize:13,margin:"0 0 10px"}}>Subscribe to preview and download materials.</p><button onClick={()=>setModal("subscribe")} style={{...btnPrimary,padding:"10px 0"}}>Subscribe Now — From KSh 100/2 weeks</button></div>)}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {(isTeacherAcct?[
            {l:"Account Type",v:"Teacher",i:"👩‍🏫"},
            {l:"Phone",v:profile.phone||"—",i:"📱"},
            {l:"Status",v:isSubscribed?`${subscription.plan} Plan`:expired?"Expired":"Not Subscribed",i:"💳",c:isSubscribed?"#27ae60":"#e74c3c"},
            {l:"Days Left",v:isSubscribed?`${subscription.daysLeft} days`:"—",i:"📅"},
          ]:[
            {l:"System",v:profile.system,i:"📘"},{l:"Level",v:profile.level,i:"🎓"},
            {l:"Phone",v:profile.phone||"—",i:"📱"},
            {l:"Status",v:isSubscribed?`${subscription.plan} Plan`:expired?"Expired":"Not Subscribed",i:"💳",c:isSubscribed?"#27ae60":"#e74c3c"},
            {l:"Days Left",v:isSubscribed?`${subscription.daysLeft} days`:"—",i:"📅"},
          ]).map(c=>(<div key={c.l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px"}}><div style={{fontSize:16,marginBottom:5}}>{c.i}</div><div style={{fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{c.l}</div><div style={{fontSize:12,fontWeight:700,color:c.c||"#fff"}}>{c.v}</div></div>))}
        </div>
        {!isSubscribed&&!expired&&(<div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:12,padding:"14px",marginBottom:14}}><div style={{fontWeight:700,color:"#ffb400",marginBottom:5}}>🚀 Unlock Full Access</div><p style={{color:"#888",fontSize:13,margin:"0 0 10px"}}>Subscribe for unlimited downloads — from KSh 100/2 weeks.</p><button onClick={()=>setModal("subscribe")} style={{...btnPrimary,padding:"10px 0"}}>Subscribe Now</button></div>)}
        <button onClick={logout} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"#666",borderRadius:10,padding:"11px 0",cursor:"pointer",fontWeight:700,fontSize:13,marginBottom:16}}>🚪 Logout</button>
        {!isTeacherAcct&&(<>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><span style={{fontSize:15}}>📚</span><h3 style={{margin:0,fontSize:15,color:"#fff",fontWeight:700}}>Your Materials</h3></div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>{mats.slice(0,6).map(m=><Card key={m.id} {...cardProps(m)}/>)}</div>
        </>)}
      </div>
    );
  };

  const bLvls=filt.system==="CBC"?LEVELS_CBC:filt.system==="8-4-4"?LEVELS_844:[...LEVELS_CBC,...LEVELS_844];
  const bSubs=filt.level?[...(SUBS_CBC[filt.level]||[]),...(SUBS_844[filt.level]||[])]:([...new Set([...SUBS_CBC_LIST,...SUBS_844_LIST])].sort());

  return(
    <div style={{minHeight:"100dvh",background:"#080e1c",color:"#fff",fontFamily:"'DM Sans',sans-serif",overflowX:"hidden"}}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"/>
      <Nav/>
      <main>
        <div style={{display:page==="home"?"block":"none"}}>
          <div style={{background:"#080e1c",minHeight:"100dvh"}}>
            <div style={{position:"relative",padding:"44px 20px 48px",textAlign:"center",overflow:"hidden"}}>
              <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse 80% 50% at 50% 0%,rgba(255,180,0,0.08),transparent)",pointerEvents:"none"}}/>
              <div style={{display:"inline-block",background:"rgba(255,180,0,0.1)",border:"1px solid rgba(255,180,0,0.28)",borderRadius:50,padding:"5px 16px",fontSize:11,color:"#ffb400",fontWeight:700,marginBottom:16,textTransform:"uppercase",letterSpacing:1.2}}>Kenya's #1 Revision Platform</div>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(26px,7vw,46px)",fontWeight:900,color:"#fff",lineHeight:1.15,margin:"0 0 14px"}}>Ace Every Exam with<br/><span style={{color:"#ffb400"}}>Toppluss Revisions</span></h1>
              <p style={{color:"#888",fontSize:14,maxWidth:360,margin:"0 auto 26px",lineHeight:1.7}}>Curated Notes, Past Papers & Marking Schemes for CBC & 8-4-4 students across Kenya.</p>
              <div style={{display:"flex",flexDirection:"column",gap:10,maxWidth:320,margin:"0 auto 36px"}}>
                <button onClick={()=>setPage("browse")} style={btnPrimary}>Browse Materials →</button>
                {!user&&<button onClick={()=>setModal("register")} style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.13)",color:"#fff",padding:"13px 0",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer",width:"100%"}}>Register Free</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,maxWidth:320,margin:"0 auto"}}>
                {[["2,000+","Materials"],["CBC + 8-4-4","Systems"],["4 Plans","Flexible"],["KSh 100","From /2 weeks"]].map(([n,l])=>(<div key={l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"13px 10px",textAlign:"center"}}><div style={{fontSize:17,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{n}</div><div style={{fontSize:10,color:"#555",marginTop:3}}>{l}</div></div>))}
              </div>
            </div>
            <div style={{padding:"0 16px 18px"}}>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"#444"}}>🔍</span>
                <input placeholder="Search notes, past papers, subjects…" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&search) setPage("browse");}} style={{...inp,paddingLeft:38,fontSize:13,background:"rgba(255,255,255,0.05)"}}/>
              </div>
            </div>
            {!loading&&topDL.length>0&&(<div style={{padding:"0 16px 30px"}}><SectionHead icon="🔥" title="Most Downloaded" sub="Most popular revision materials"/><div style={{display:"flex",flexDirection:"column",gap:10}}>{topDL.map(m=><Card key={m.id} {...cardProps(m)}/>)}</div></div>)}
            {!loading&&latest.length>0&&(<div style={{padding:"0 16px 30px"}}><SectionHead icon="🆕" title="Latest Uploads" sub="Freshly added content"/><div style={{display:"flex",flexDirection:"column",gap:10}}>{latest.map(m=><Card key={m.id} {...cardProps(m)}/>)}</div><button onClick={()=>setPage("browse")} style={{display:"block",width:"100%",marginTop:14,background:"none",border:"1px solid rgba(255,180,0,0.25)",color:"#ffb400",padding:"12px 0",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13}}>View All →</button></div>)}
            {loading&&<div style={{textAlign:"center",padding:"60px 0",color:"#444"}}>⏳ Loading materials…</div>}
            {!loading&&mats.length===0&&<div style={{textAlign:"center",padding:"40px 20px",color:"#444"}}><div style={{fontSize:40,marginBottom:10}}>📚</div><div style={{fontSize:14,fontWeight:600,color:"#555"}}>No materials yet — check back soon!</div></div>}
            <div style={{padding:"24px 16px 36px",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              <SectionHead icon="💳" title="Subscription Plans" sub="Affordable access via M-Pesa"/>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {[
                  {name:"2 Weeks",price:"KSh 100",period:"per 2 weeks",feats:["All Materials","CBC + 8-4-4","Unlimited Downloads"],k:"biweekly"},
                  {name:"Monthly",price:"KSh 200",period:"per month",feats:["All Materials","CBC + 8-4-4","Unlimited Downloads"],k:"monthly"},
                  {name:"6 Months",price:"KSh 800",period:"per 6 months",feats:["Everything Monthly","Save vs monthly","Priority Support"],k:"sixmonth"},
                  {name:"12 Months",price:"KSh 1,200",period:"per year",feats:["Everything 6-Month","Best Value","Priority Support"],hot:true,k:"annual"},
                ].map(plan=>(<div key={plan.name} style={{background:plan.hot?"rgba(255,180,0,0.07)":"rgba(255,255,255,0.03)",border:`1px solid ${plan.hot?"rgba(255,180,0,0.25)":"rgba(255,255,255,0.07)"}`,borderRadius:14,padding:"16px",position:"relative"}}>{plan.hot&&<div style={{position:"absolute",top:-9,right:14,background:"linear-gradient(135deg,#ffb400,#ff7b00)",color:"#000",fontSize:9,fontWeight:800,padding:"2px 10px",borderRadius:50,textTransform:"uppercase",letterSpacing:1}}>Best Value</div>}<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div><div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{plan.name}</div><div style={{fontSize:11,color:"#666"}}>{plan.period}</div></div><div style={{fontSize:24,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{plan.price}</div></div><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:12}}>{plan.feats.map(f=><span key={f} style={{fontSize:12,color:"#aaa"}}>✅ {f}</span>)}</div><button onClick={()=>setModal(user?"subscribe":"register")} style={btnPrimary}>{user?"Pay via M-Pesa":"Get Started"}</button></div>))}
              </div>
            </div>
            <div style={{background:"#05090f",borderTop:"1px solid rgba(255,255,255,0.05)",padding:"22px 16px 30px",textAlign:"center"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:6}}><div style={{width:26,height:26,background:"linear-gradient(135deg,#ffb400,#ff7b00)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:11,color:"#000"}}>T+</div><span style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:14,color:"#fff"}}>Toppluss <span style={{color:"#ffb400"}}>Revisions</span></span></div>
              <p style={{color:"#444",fontSize:11,margin:"0 0 14px"}}>Kenya's trusted revision platform · CBC & 8-4-4</p>
              <a href="https://wa.me/254755803149" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:8,background:"#25D366",color:"#fff",padding:"11px 22px",borderRadius:25,fontWeight:700,fontSize:13,textDecoration:"none",boxShadow:"0 4px 12px rgba(37,211,102,0.35)"}}><WaIcon/> +254 755 803 149</a>
            </div>
          </div>
        </div>
        <div style={{display:page==="browse"?"block":"none"}}>
          <div style={{padding:"20px 16px 40px",background:"#080e1c",minHeight:"100dvh"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}><span style={{fontSize:18}}>📚</span><h2 style={{margin:0,fontSize:17,fontFamily:"'Playfair Display',serif",color:"#fff",fontWeight:700}}>Browse Materials</h2><span style={{fontSize:12,color:"#555",marginLeft:"auto"}}>{filtMats.length} results</span></div>
            <div style={{position:"relative",marginBottom:10}}><span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,color:"#444"}}>🔍</span><input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{...inp,paddingLeft:36,fontSize:13}}/></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              {[{k:"system",opts:["CBC","8-4-4"],lbl:"System"},{k:"level",opts:bLvls,lbl:"Level"},{k:"subject",opts:bSubs,lbl:"Subject"},{k:"type",opts:TYPES,lbl:"Type"}].map(f=>(<select key={f.k} value={filt[f.k]} onChange={e=>setFilt(p=>({...p,[f.k]:e.target.value,...(f.k==="system"?{level:"",subject:""}:{}),...(f.k==="level"?{subject:""}:{})}))} style={{...inp,cursor:"pointer",fontSize:12}}><option value="">All {f.lbl}s</option>{f.opts.map(o=><option key={o}>{o}</option>)}</select>))}
            </div>
            <button onClick={()=>{setFilt({system:"",level:"",subject:"",type:""});setSearch("");}} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",color:"#777",borderRadius:9,padding:"9px 0",cursor:"pointer",fontSize:12,fontWeight:600,marginBottom:16}}>Clear Filters</button>
            {loading?<div style={{textAlign:"center",padding:"60px 0",color:"#444"}}>⏳ Loading…</div>:filtMats.length===0?<div style={{textAlign:"center",padding:"60px 0",color:"#555"}}><div style={{fontSize:36,marginBottom:10}}>🔍</div><div style={{fontSize:14,fontWeight:600}}>No results found</div></div>:<div style={{display:"flex",flexDirection:"column",gap:10}}>{filtMats.map(m=><Card key={m.id} {...cardProps(m)}/>)}</div>}
          </div>
        </div>
        {page==="dash"&&<Dash/>}
        {page==="admin"&&isAdmin&&<Admin/>}
        {page==="school"&&<SchoolLanding/>}
        {page==="school-admin"&&(schoolRole==="admin"||schoolRole==="teacher")&&<SchoolAdmin/>}
        {page==="school-portal"&&schoolRole==="student"&&<SchoolPortal/>}
      </main>
      <a href="https://wa.me/254755803149?text=Hello%2C%20I%20need%20help%20with%20Toppluss%20Revisions" target="_blank" rel="noopener noreferrer" style={{position:"fixed",bottom:20,right:16,width:52,height:52,background:"#25D366",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(37,211,102,0.5)",zIndex:140,textDecoration:"none"}}><WaIcon/></a>
      <Toast {...toast}/>
      {modal==="login"&&<Modal onClose={()=>setModal(null)}><LoginM/></Modal>}
      {modal==="forgot"&&<Modal onClose={()=>setModal(null)}><ForgotPasswordM/></Modal>}
      {modal==="register"&&<Modal onClose={()=>setModal(null)}><RegisterM/></Modal>}
      {modal==="subscribe"&&<Modal onClose={()=>setModal(null)}><SubscribeM/></Modal>}
      {modal==="school-join"&&<Modal onClose={()=>setModal(null)}><JoinSchoolM/></Modal>}
      {modal==="school-register"&&<Modal onClose={()=>setModal(null)}><RegisterSchoolM/></Modal>}
      {modal==="school-subscribe"&&<Modal onClose={()=>setModal(null)}><SchoolSubscribeM/></Modal>}
      {modal==="invite-teacher"&&<Modal onClose={()=>setModal(null)}><InviteTeacherM/></Modal>}
      {modal==="gate"&&<Modal onClose={()=>setModal(null)}><GateM/></Modal>}
      {modal==="preview"&&<Modal onClose={()=>setModal(null)}><PreviewM/></Modal>}
    </div>
  );
}
