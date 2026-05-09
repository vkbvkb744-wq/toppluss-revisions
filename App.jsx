import { useState, useEffect } from "react";

const GUEST_LIMIT = 1;
const getGD = () => parseInt(localStorage.getItem("tr_gd") || "0");
const incGD = () => localStorage.setItem("tr_gd", getGD() + 1);
const delay = (ms = 700) => new Promise(r => setTimeout(r, ms));

const COLORS = ["#e74c3c","#e67e22","#f39c12","#2ecc71","#1abc9c","#3498db","#9b59b6","#e91e63","#00b894","#0984e3"];
const TYPES = ["Notes","Past Papers","Marking Schemes"];
const LEVELS_CBC = ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
const LEVELS_844 = ["Form 1","Form 2","Form 3","Form 4"];
const SUBS_CBC = { "Grade 1":["Math","English","Kiswahili","Environmental Activities"],"Grade 2":["Math","English","Kiswahili","Environmental Activities"],"Grade 3":["Math","English","Kiswahili","Science","Social Studies"],"Grade 4":["Math","English","Kiswahili","Science","Social Studies","CRE"],"Grade 5":["Math","English","Kiswahili","Science","Social Studies","CRE"],"Grade 6":["Math","English","Kiswahili","Science","Social Studies","CRE"],"Grade 7":["Math","English","Kiswahili","Integrated Science","Social Studies","CRE","Health Ed"],"Grade 8":["Math","English","Kiswahili","Integrated Science","Social Studies","CRE","Health Ed"],"Grade 9":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE"],"Grade 10":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE"],"Grade 11":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE"],"Grade 12":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE"] };
const SUBS_844 = { "Form 1":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE","Business"],"Form 2":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE","Business"],"Form 3":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE","Business"],"Form 4":["Math","English","Kiswahili","Biology","Chemistry","Physics","History","Geography","CRE","Business"] };

function genMaterials() {
  const m = []; let id = 1;
  const add = (sys, levels, subs) => levels.forEach(lv => (subs[lv]||[]).slice(0,5).forEach(sub => TYPES.forEach(t => {
    m.push({ id: id++, title: `${sub} ${t} – ${lv}`, system: sys, level: lv, subject: sub, type: t,
      downloads: Math.floor(Math.random()*900)+10, uploadedAt: new Date(Date.now()-Math.random()*30*86400000).toISOString(),
      color: COLORS[id % COLORS.length], pages: Math.floor(Math.random()*40)+6 });
  })));
  add("CBC", LEVELS_CBC, SUBS_CBC);
  add("8-4-4", LEVELS_844, SUBS_844);
  return m;
}
const ALL = genMaterials();

const inp = { background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:10, padding:"11px 14px", color:"#fff", fontSize:14, width:"100%", boxSizing:"border-box", outline:"none" };
const lbl = { fontSize:11, color:"#aaa", marginBottom:5, display:"block", fontWeight:700, textTransform:"uppercase", letterSpacing:0.6 };
const btnG = { background:"linear-gradient(135deg,#ffb400,#ff7b00)", color:"#000", border:"none", borderRadius:10, padding:"13px 0", fontWeight:800, fontSize:15, cursor:"pointer", width:"100%" };

function Cover({ m, big }) {
  const e = { Notes:"📝","Past Papers":"📄","Marking Schemes":"✅" };
  return (
    <div style={{ height:big?160:72, background:`linear-gradient(135deg,${m.color}cc,${m.color}44)`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", borderRadius:big?"12px 12px 0 0":8, position:"relative", overflow:"hidden", flexShrink:0 }}>
      <div style={{ fontSize:big?36:20 }}>{e[m.type]}</div>
      <div style={{ fontSize:9, color:"#fff", fontWeight:700, opacity:0.7, textTransform:"uppercase", letterSpacing:1, marginTop:2 }}>{m.system}</div>
      <div style={{ position:"absolute", bottom:5, right:8, fontSize:8, color:"#fff", opacity:0.3, fontStyle:"italic" }}>topplussrevisions.com</div>
    </div>
  );
}

function Modal({ children, onClose, w=480 }) {
  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:"#0d1929", border:"1px solid rgba(255,180,0,0.2)", borderRadius:20, padding:28, width:"100%", maxWidth:w, maxHeight:"92vh", overflowY:"auto", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:14, right:14, background:"rgba(255,255,255,0.08)", border:"none", color:"#aaa", cursor:"pointer", borderRadius:6, padding:"4px 8px", fontSize:16 }}>✕</button>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg, type }) {
  return msg ? <div style={{ position:"fixed", bottom:76, left:"50%", transform:"translateX(-50%)", background:type==="err"?"#c0392b":"#27ae60", color:"#fff", padding:"11px 22px", borderRadius:50, fontWeight:700, fontSize:13, zIndex:9999, whiteSpace:"nowrap", boxShadow:"0 4px 20px rgba(0,0,0,0.4)" }}>{msg}</div> : null;
}

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [modal, setModal] = useState(null);
  const [mats, setMats] = useState(ALL);
  const [search, setSearch] = useState("");
  const [filt, setFilt] = useState({ system:"", level:"", subject:"", type:"" });
  const [prevMat, setPrevMat] = useState(null);
  const [toast, setToast] = useState({ msg:"", type:"ok" });

  const toast_ = (msg, type="ok") => { setToast({ msg, type }); setTimeout(()=>setToast({ msg:"", type:"ok" }),3000); };
  const isSubscribed = user && (user.plan || user.trial);
  const isAdmin = user?.role === "admin";

  const userMats = mats.filter(m => !user?.system || m.system === user.system);
  const filtMats = userMats.filter(m => {
    if (filt.system && m.system !== filt.system) return false;
    if (filt.level && m.level !== filt.level) return false;
    if (filt.subject && m.subject !== filt.subject) return false;
    if (filt.type && m.type !== filt.type) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const topDL = [...userMats].sort((a,b)=>b.downloads-a.downloads).slice(0,6);
  const latest = [...userMats].sort((a,b)=>new Date(b.uploadedAt)-new Date(a.uploadedAt)).slice(0,6);

  const doDownload = mat => { setMats(p=>p.map(m=>m.id===mat.id?{...m,downloads:m.downloads+1}:m)); toast_(`⬇ Downloading: ${mat.title}`); };
  const handleDL = mat => {
    if (isAdmin || isSubscribed) { doDownload(mat); return; }
    if (user) { setModal("subscribe"); return; }
    const g = getGD();
    if (g < GUEST_LIMIT) { incGD(); doDownload(mat); if (g+1>=GUEST_LIMIT) toast_("Free download used! Register to continue","err"); }
    else setModal("gate");
  };
  const handlePrev = mat => { setPrevMat(mat); setModal("preview"); };
  const logout = () => { setUser(null); setPage("home"); toast_("Logged out"); };

  const fLevels = filt.system==="CBC"?LEVELS_CBC:filt.system==="8-4-4"?LEVELS_844:[...LEVELS_CBC,...LEVELS_844];
  const fSubjects = filt.level ? [...(SUBS_CBC[filt.level]||[]),...(SUBS_844[filt.level]||[])] : [...new Set(Object.values({...SUBS_CBC,...SUBS_844}).flat())].sort();

  const Card = ({ m }) => (
    <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, overflow:"hidden", transition:"transform .2s,box-shadow .2s" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 10px 36px rgba(255,180,0,0.13)"}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=""}}>
      <Cover m={m} big />
      <div style={{ padding:"13px 14px 15px" }}>
        <div style={{ fontSize:10, color:"#ffb400", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5, marginBottom:4 }}>{m.system} · {m.level}</div>
        <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:3, lineHeight:1.3, minHeight:36 }}>{m.title}</div>
        <div style={{ fontSize:11, color:"#777", marginBottom:11 }}>{m.subject} · {m.type}</div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={()=>handlePrev(m)} style={{ flex:1, background:"rgba(255,255,255,0.07)", border:"none", color:"#ccc", borderRadius:8, padding:"8px 0", cursor:"pointer", fontWeight:600, fontSize:12 }}>👁 Preview</button>
          <button onClick={()=>handleDL(m)} style={{ flex:1, background:"linear-gradient(135deg,#ffb400,#ff7b00)", border:"none", color:"#000", borderRadius:8, padding:"8px 0", cursor:"pointer", fontWeight:800, fontSize:12 }}>⬇ Download</button>
        </div>
        <div style={{ marginTop:9, fontSize:11, color:"#555", display:"flex", justifyContent:"space-between" }}>
          <span>⬇ {m.downloads.toLocaleString()}</span><span>{m.pages}p</span>
        </div>
      </div>
    </div>
  );

  const Sec = ({ icon, title, sub }) => (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <h2 style={{ margin:0, fontSize:20, fontFamily:"'Playfair Display',serif", color:"#fff", fontWeight:700 }}>{title}</h2>
      </div>
      {sub && <p style={{ margin:"3px 0 0 28px", fontSize:12, color:"#777" }}>{sub}</p>}
    </div>
  );

  const Nav = () => (
    <nav style={{ position:"sticky", top:0, zIndex:100, background:"rgba(8,14,28,0.97)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,180,0,0.1)", padding:"0 16px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div onClick={()=>setPage("home")} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
        <div style={{ width:32, height:32, background:"linear-gradient(135deg,#ffb400,#ff7b00)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:13, color:"#000" }}>T+</div>
        <span style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:17, color:"#fff" }}>Toppluss <span style={{ color:"#ffb400" }}>Revisions</span></span>
      </div>
      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
        {["home","browse"].map(p=>(
          <button key={p} onClick={()=>setPage(p)} style={{ background:page===p?"rgba(255,180,0,0.13)":"none", border:"none", color:page===p?"#ffb400":"#bbb", padding:"7px 12px", borderRadius:7, cursor:"pointer", fontWeight:600, fontSize:13, textTransform:"capitalize" }}>
            {p==="home"?"🏠":"📚"} {p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
        {isAdmin && <button onClick={()=>setPage("admin")} style={{ background:page==="admin"?"rgba(255,180,0,0.13)":"none", border:"none", color:page==="admin"?"#ffb400":"#bbb", padding:"7px 12px", borderRadius:7, cursor:"pointer", fontWeight:600, fontSize:13 }}>🛠 Admin</button>}
        {user ? (
          <div style={{ display:"flex", gap:5 }}>
            <button onClick={()=>setPage("dash")} style={{ background:"rgba(255,180,0,0.1)", border:"1px solid rgba(255,180,0,0.25)", color:"#ffb400", padding:"7px 12px", borderRadius:7, cursor:"pointer", fontWeight:700, fontSize:12 }}>👤 {user.name.split(" ")[0]}</button>
            <button onClick={logout} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#888", padding:"7px 9px", borderRadius:7, cursor:"pointer", fontSize:13 }}>⬅</button>
          </div>
        ) : (
          <div style={{ display:"flex", gap:5 }}>
            <button onClick={()=>setModal("login")} style={{ background:"none", border:"1px solid rgba(255,255,255,0.13)", color:"#ddd", padding:"7px 12px", borderRadius:7, cursor:"pointer", fontWeight:600, fontSize:13 }}>Login</button>
            <button onClick={()=>setModal("register")} style={{ background:"linear-gradient(135deg,#ffb400,#ff7b00)", border:"none", color:"#000", padding:"7px 14px", borderRadius:7, cursor:"pointer", fontWeight:800, fontSize:13 }}>Register</button>
          </div>
        )}
      </div>
    </nav>
  );

  const Home = () => (
    <div>
      <div style={{ position:"relative", padding:"64px 16px 72px", textAlign:"center", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% 0%,rgba(255,180,0,0.1),transparent)", pointerEvents:"none" }} />
        <div style={{ display:"inline-block", background:"rgba(255,180,0,0.1)", border:"1px solid rgba(255,180,0,0.28)", borderRadius:50, padding:"5px 14px", fontSize:11, color:"#ffb400", fontWeight:700, marginBottom:18, textTransform:"uppercase", letterSpacing:1.2 }}>Kenya's #1 Revision Platform</div>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,6vw,56px)", fontWeight:900, color:"#fff", lineHeight:1.15, margin:"0 0 14px" }}>
          Ace Every Exam with<br /><span style={{ color:"#ffb400" }}>Toppluss Revisions</span>
        </h1>
        <p style={{ color:"#aaa", fontSize:"clamp(13px,2.5vw,17px)", maxWidth:500, margin:"0 auto 28px", lineHeight:1.65 }}>
          Curated Notes, Past Papers & Marking Schemes for CBC & 8-4-4 students across Kenya.
        </p>
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", marginBottom:44 }}>
          <button onClick={()=>setPage("browse")} style={{ background:"linear-gradient(135deg,#ffb400,#ff7b00)", border:"none", color:"#000", padding:"13px 28px", borderRadius:50, fontWeight:800, fontSize:15, cursor:"pointer" }}>Browse Materials →</button>
          {!user && <button onClick={()=>setModal("register")} style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.14)", color:"#fff", padding:"13px 24px", borderRadius:50, fontWeight:700, fontSize:15, cursor:"pointer" }}>Register Free</button>}
        </div>
        <div style={{ display:"flex", gap:28, justifyContent:"center", flexWrap:"wrap" }}>
          {[["2,000+","Materials"],["CBC + 8-4-4","Systems"],["1 Free","Download"],["KSh 50","From /week"]].map(([n,l])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:22, fontWeight:900, color:"#ffb400", fontFamily:"'Playfair Display',serif" }}>{n}</div>
              <div style={{ fontSize:11, color:"#777", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding:"0 16px 20px", maxWidth:660, margin:"0 auto" }}>
        <div style={{ position:"relative" }}>
          <input placeholder="Search notes, past papers, subjects…" value={search} onChange={e=>setSearch(e.target.value)}
            onKeyDown={e=>{ if(e.key==="Enter"&&search) setPage("browse"); }}
            style={{ ...inp, paddingLeft:40, fontSize:14 }} />
          <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"#555" }}>🔍</span>
        </div>
      </div>
      <div style={{ padding:"0 16px 52px", maxWidth:1100, margin:"0 auto" }}>
        <Sec icon="🔥" title="Most Downloaded" sub="Most popular revision materials" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14 }}>
          {topDL.map(m=><Card key={m.id} m={m} />)}
        </div>
      </div>
      <div style={{ padding:"0 16px 52px", maxWidth:1100, margin:"0 auto" }}>
        <Sec icon="🆕" title="Latest Uploads" sub="Freshly added content" />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14 }}>
          {latest.map(m=><Card key={m.id} m={m} />)}
        </div>
        <div style={{ textAlign:"center", marginTop:24 }}>
          <button onClick={()=>setPage("browse")} style={{ background:"none", border:"1px solid rgba(255,180,0,0.35)", color:"#ffb400", padding:"11px 28px", borderRadius:50, cursor:"pointer", fontWeight:700, fontSize:13 }}>View All →</button>
        </div>
      </div>
      <div style={{ padding:"44px 16px 64px", background:"rgba(255,180,0,0.02)", borderTop:"1px solid rgba(255,180,0,0.07)" }}>
        <div style={{ maxWidth:680, margin:"0 auto", textAlign:"center" }}>
          <Sec icon="💳" title="Subscription Plans" sub="Affordable access via M-Pesa" />
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", marginTop:4 }}>
            {[{ name:"Weekly", price:"KSh 50", period:"per week", feats:["All Materials","CBC + 8-4-4","Unlimited Downloads"] },
              { name:"Monthly", price:"KSh 150", period:"per month", feats:["Everything Weekly","Best Value","Priority Support"], hot:true }].map(plan=>(
              <div key={plan.name} style={{ flex:"1 1 240px", maxWidth:280, background:plan.hot?"rgba(255,180,0,0.1)":"rgba(255,255,255,0.04)", border:`1px solid ${plan.hot?"rgba(255,180,0,0.35)":"rgba(255,255,255,0.08)"}`, borderRadius:18, padding:"24px 20px", position:"relative" }}>
                {plan.hot && <div style={{ position:"absolute", top:-11, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(135deg,#ffb400,#ff7b00)", color:"#000", fontSize:10, fontWeight:800, padding:"3px 12px", borderRadius:50, textTransform:"uppercase", letterSpacing:1, whiteSpace:"nowrap" }}>Best Value</div>}
                <div style={{ fontSize:17, fontWeight:700, color:"#fff", marginBottom:3 }}>{plan.name}</div>
                <div style={{ fontSize:32, fontWeight:900, color:"#ffb400", fontFamily:"'Playfair Display',serif" }}>{plan.price}</div>
                <div style={{ fontSize:11, color:"#888", marginBottom:16 }}>{plan.period}</div>
                {plan.feats.map(f=><div key={f} style={{ fontSize:12, color:"#bbb", marginBottom:7 }}>✅ {f}</div>)}
                <button onClick={()=>setModal(user?"subscribe":"register")} style={{ ...btnG, marginTop:16 }}>
                  {user?"Pay via M-Pesa":"Get Started"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const Browse = () => {
    const lvls = filt.system==="CBC"?LEVELS_CBC:filt.system==="8-4-4"?LEVELS_844:[...LEVELS_CBC,...LEVELS_844];
    return (
      <div style={{ maxWidth:1180, margin:"0 auto", padding:"22px 14px" }}>
        <Sec icon="📚" title="Browse Materials" sub={`${filtMats.length} results`} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:8, marginBottom:18 }}>
          <div style={{ position:"relative" }}>
            <input placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{ ...inp, paddingLeft:34, fontSize:13 }} />
            <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"#555" }}>🔍</span>
          </div>
          {[
            { k:"system", opts:["CBC","8-4-4"], lbl:"System" },
            { k:"level", opts:lvls, lbl:"Level" },
            { k:"subject", opts:fSubjects.slice(0,14), lbl:"Subject" },
            { k:"type", opts:TYPES, lbl:"Type" },
          ].map(f=>(
            <select key={f.k} value={filt[f.k]} onChange={e=>setFilt(p=>({ ...p,[f.k]:e.target.value,...(f.k==="system"?{level:"",subject:""}:{}),...(f.k==="level"?{subject:""}:{}) }))} style={{ ...inp, cursor:"pointer", fontSize:13 }}>
              <option value="">All {f.lbl}s</option>
              {f.opts.map(o=><option key={o}>{o}</option>)}
            </select>
          ))}
          <button onClick={()=>{setFilt({system:"",level:"",subject:"",type:""});setSearch("");}} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#ccc", borderRadius:10, cursor:"pointer", fontSize:12, fontWeight:600 }}>Clear</button>
        </div>
        {filtMats.length===0 ? (
          <div style={{ textAlign:"center", padding:"70px 0", color:"#666" }}>
            <div style={{ fontSize:44, marginBottom:14 }}>🔍</div>
            <div style={{ fontSize:16, fontWeight:600, color:"#888" }}>No results found</div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14 }}>
            {filtMats.map(m=><Card key={m.id} m={m} />)}
          </div>
        )}
      </div>
    );
  };

  const Dash = () => {
    if (!user) return null;
    return (
      <div style={{ maxWidth:880, margin:"0 auto", padding:"24px 14px" }}>
        <Sec icon="👤" title={`Welcome, ${user.name.split(" ")[0]}!`} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:12, marginBottom:28 }}>
          {[
            { l:"System", v:user.system, i:"📘" },
            { l:"Level", v:user.level, i:"🎓" },
            { l:"Status", v:isSubscribed?(user.trial?"Trial Active":`${user.plan} Plan`):"No Plan", i:"💳", c:isSubscribed?"#27ae60":"#e74c3c" },
            { l:"Expiry", v:isSubscribed?user.expiry||"2 days":"—", i:"📅" },
          ].map(c=>(
            <div key={c.l} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:13, padding:"16px 14px" }}>
              <div style={{ fontSize:20, marginBottom:8 }}>{c.i}</div>
              <div style={{ fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>{c.l}</div>
              <div style={{ fontSize:14, fontWeight:700, color:c.c||"#fff" }}>{c.v}</div>
            </div>
          ))}
        </div>
        {!isSubscribed && (
          <div style={{ background:"rgba(255,180,0,0.07)", border:"1px solid rgba(255,180,0,0.2)", borderRadius:13, padding:"18px 20px", marginBottom:24 }}>
            <div style={{ fontWeight:700, color:"#ffb400", marginBottom:8 }}>🚀 Unlock Full Access</div>
            <p style={{ color:"#aaa", fontSize:13, margin:"0 0 12px" }}>Subscribe via M-Pesa to download unlimited materials.</p>
            <button onClick={()=>setModal("subscribe")} style={{ ...btnG, width:"auto", padding:"10px 24px" }}>Subscribe Now</button>
          </div>
        )}
        <Sec icon="📚" title="Your Materials" sub={`${user.system} – ${user.level}`} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14 }}>
          {userMats.filter(m=>m.level===user.level).slice(0,6).map(m=><Card key={m.id} m={m} />)}
        </div>
      </div>
    );
  };

  const Admin = () => {
    const [tab, setTab] = useState("upload");
    const [form, setForm] = useState({ title:"", system:"CBC", level:"Grade 1", subject:"", type:"Notes" });
    const [uploading, setUploading] = useState(false);
    const aLvls = form.system==="CBC"?LEVELS_CBC:LEVELS_844;
    const aSubs = SUBS_CBC[form.level] || SUBS_844[form.level] || [];
    const upload = async () => {
      if (!form.title||!form.subject) { toast_("Fill all fields","err"); return; }
      setUploading(true); await delay(1800);
      setMats(p=>[{ id:Date.now(), ...form, downloads:0, uploadedAt:new Date().toISOString(), color:COLORS[Math.floor(Math.random()*COLORS.length)], pages:Math.floor(Math.random()*30)+5 },...p]);
      setForm({ title:"", system:"CBC", level:"Grade 1", subject:"", type:"Notes" });
      setUploading(false); toast_("✅ Material uploaded & processed!");
    };
    return (
      <div style={{ maxWidth:1080, margin:"0 auto", padding:"24px 14px" }}>
        <Sec icon="🛠" title="Admin Dashboard" />
        <div style={{ display:"flex", gap:6, marginBottom:22 }}>
          {["upload","materials","analytics"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ background:tab===t?"rgba(255,180,0,0.12)":"rgba(255,255,255,0.04)", border:`1px solid ${tab===t?"rgba(255,180,0,0.35)":"rgba(255,255,255,0.08)"}`, color:tab===t?"#ffb400":"#aaa", padding:"8px 16px", borderRadius:7, cursor:"pointer", fontWeight:700, fontSize:12, textTransform:"capitalize" }}>
              {t==="upload"?"⬆ Upload":t==="materials"?"📋 Materials":"📊 Analytics"}
            </button>
          ))}
        </div>
        {tab==="upload" && (
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:24, maxWidth:540 }}>
            <h3 style={{ color:"#fff", margin:"0 0 18px", fontSize:17 }}>Upload New Material</h3>
            <div style={{ display:"grid", gap:12 }}>
              <div><label style={lbl}>Title</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} style={inp} placeholder="e.g. Mathematics Notes – Grade 9" /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div><label style={lbl}>System</label>
                  <select value={form.system} onChange={e=>setForm(p=>({...p,system:e.target.value,level:e.target.value==="CBC"?"Grade 1":"Form 1",subject:""}))} style={{ ...inp, cursor:"pointer" }}>
                    <option>CBC</option><option>8-4-4</option>
                  </select>
                </div>
                <div><label style={lbl}>Level</label>
                  <select value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value,subject:""}))} style={{ ...inp, cursor:"pointer" }}>
                    {aLvls.map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div><label style={lbl}>Subject</label>
                  <select value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} style={{ ...inp, cursor:"pointer" }}>
                    <option value="">Select…</option>
                    {aSubs.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Type</label>
                  <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{ ...inp, cursor:"pointer" }}>
                    {TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ background:"rgba(255,180,0,0.05)", border:"1px solid rgba(255,180,0,0.12)", borderRadius:9, padding:"11px 13px", fontSize:12, color:"#888" }}>
                <strong style={{ color:"#ffb400" }}>Auto Pipeline:</strong> Compress → Watermark → Cover → Preview → Store securely
              </div>
              <button onClick={upload} disabled={uploading} style={{ ...btnG, opacity:uploading?0.7:1 }}>
                {uploading?"⏳ Processing…":"⬆ Upload & Process"}
              </button>
            </div>
          </div>
        )}
        {tab==="materials" && (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead><tr style={{ background:"rgba(255,180,0,0.05)" }}>
                {["Title","System","Level","Subject","Type","DLs","Del"].map(h=>(
                  <th key={h} style={{ padding:"10px 12px", textAlign:"left", color:"#ffb400", fontWeight:700, fontSize:10, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {mats.slice(0,25).map((m,i)=>(
                  <tr key={m.id} style={{ borderTop:"1px solid rgba(255,255,255,0.04)", background:i%2?"rgba(255,255,255,0.01)":"transparent" }}>
                    <td style={{ padding:"10px 12px", color:"#fff", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.title}</td>
                    <td style={{ padding:"10px 12px", color:"#aaa" }}>{m.system}</td>
                    <td style={{ padding:"10px 12px", color:"#aaa" }}>{m.level}</td>
                    <td style={{ padding:"10px 12px", color:"#aaa" }}>{m.subject}</td>
                    <td style={{ padding:"10px 12px", color:"#aaa" }}>{m.type}</td>
                    <td style={{ padding:"10px 12px", color:"#ffb400", fontWeight:700 }}>{m.downloads}</td>
                    <td style={{ padding:"10px 12px" }}>
                      <button onClick={()=>setMats(p=>p.filter(x=>x.id!==m.id))} style={{ background:"rgba(231,76,60,0.14)", border:"1px solid rgba(231,76,60,0.25)", color:"#e74c3c", borderRadius:5, padding:"4px 9px", cursor:"pointer", fontSize:11, fontWeight:600 }}>Del</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab==="analytics" && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:12 }}>
            {[
              { l:"Total Materials", v:mats.length, i:"📄" },
              { l:"Total Downloads", v:mats.reduce((s,m)=>s+m.downloads,0).toLocaleString(), i:"⬇" },
              { l:"CBC Materials", v:mats.filter(m=>m.system==="CBC").length, i:"📘" },
              { l:"8-4-4 Materials", v:mats.filter(m=>m.system==="8-4-4").length, i:"📗" },
              { l:"Top Subject", v:"Mathematics", i:"🏆" },
              { l:"Top Type", v:"Past Papers", i:"🔥" },
            ].map(c=>(
              <div key={c.l} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:13, padding:"18px 15px" }}>
                <div style={{ fontSize:22, marginBottom:9 }}>{c.i}</div>
                <div style={{ fontSize:10, color:"#888", textTransform:"uppercase", letterSpacing:0.5, marginBottom:3 }}>{c.l}</div>
                <div style={{ fontSize:22, fontWeight:900, color:"#ffb400", fontFamily:"'Playfair Display',serif" }}>{c.v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const LoginM = () => {
    const [f, setF] = useState({ email:"", password:"" });
    const [ld, setLd] = useState(false);
    const go = async () => {
      setLd(true); await delay();
      if (f.email==="admin@topplussrevisions.com") {
        setUser({ name:"Admin User", email:f.email, system:"CBC", level:"Grade 10", role:"admin", trial:true });
        toast_("Welcome, Admin! 🛠"); setPage("admin");
      } else {
        setUser({ name:"Demo Student", email:f.email, system:"CBC", level:"Grade 9", trial:true, expiry:"2 days" });
        toast_("Welcome back! 👋"); setPage("dash");
      }
      setModal(null); setLd(false);
    };
    return (
      <div>
        <h2 style={{ color:"#fff", fontFamily:"'Playfair Display',serif", margin:"0 0 5px", fontSize:24 }}>Welcome Back</h2>
        <p style={{ color:"#888", fontSize:13, margin:"0 0 20px" }}>Login to your Toppluss account</p>
        <div style={{ display:"grid", gap:12 }}>
          <div><label style={lbl}>Email</label><input type="email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} style={inp} placeholder="you@example.com" /></div>
          <div><label style={lbl}>Password</label><input type="password" value={f.password} onChange={e=>setF(p=>({...p,password:e.target.value}))} style={inp} placeholder="••••••••" /></div>
          <button onClick={go} disabled={ld} style={{ ...btnG, opacity:ld?0.7:1 }}>{ld?"Logging in…":"Login"}</button>
          <p style={{ textAlign:"center", fontSize:12, color:"#888" }}>No account? <button onClick={()=>setModal("register")} style={{ background:"none", border:"none", color:"#ffb400", cursor:"pointer", fontWeight:700, fontSize:12 }}>Register free</button></p>
          <p style={{ textAlign:"center", fontSize:10, color:"#555" }}>💡 admin@topplussrevisions.com → Admin panel</p>
        </div>
      </div>
    );
  };

  const RegisterM = () => {
    const [f, setF] = useState({ name:"", email:"", phone:"", password:"", system:"CBC", level:"Grade 1" });
    const [ld, setLd] = useState(false);
    const rLvls = f.system==="CBC"?LEVELS_CBC:LEVELS_844;
    const go = async () => {
      if (!f.name||!f.email||!f.phone||!f.password) { toast_("Fill all fields","err"); return; }
      if (!f.phone.startsWith("254")) { toast_("Phone must start with 254","err"); return; }
      setLd(true); await delay(1200);
      setUser({ name:f.name, email:f.email, phone:f.phone, system:f.system, level:f.level, trial:true, expiry:"2 days" });
      toast_("🎉 Registered! Trial active."); setModal(null); setPage("dash"); setLd(false);
    };
    return (
      <div>
        <h2 style={{ color:"#fff", fontFamily:"'Playfair Display',serif", margin:"0 0 5px", fontSize:22 }}>Create Account</h2>
        <p style={{ color:"#888", fontSize:12, margin:"0 0 20px" }}>Free 2-day trial included — no card needed</p>
        <div style={{ display:"grid", gap:11 }}>
          <div><label style={lbl}>Full Name</label><input value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))} style={inp} placeholder="Jane Mwangi" /></div>
          <div><label style={lbl}>Email</label><input type="email" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))} style={inp} placeholder="jane@example.com" /></div>
          <div><label style={lbl}>Phone (254…)</label><input value={f.phone} onChange={e=>setF(p=>({...p,phone:e.target.value}))} style={inp} placeholder="254712345678" /></div>
          <div><label style={lbl}>Password</label><input type="password" value={f.password} onChange={e=>setF(p=>({...p,password:e.target.value}))} style={inp} placeholder="Min 6 characters" /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <div><label style={lbl}>System</label>
              <select value={f.system} onChange={e=>setF(p=>({...p,system:e.target.value,level:e.target.value==="CBC"?"Grade 1":"Form 1"}))} style={{ ...inp, cursor:"pointer" }}>
                <option>CBC</option><option>8-4-4</option>
              </select>
            </div>
            <div><label style={lbl}>Level</label>
              <select value={f.level} onChange={e=>setF(p=>({...p,level:e.target.value}))} style={{ ...inp, cursor:"pointer" }}>
                {rLvls.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <button onClick={go} disabled={ld} style={{ ...btnG, opacity:ld?0.7:1, marginTop:4 }}>{ld?"Creating account…":"Register & Start Free Trial"}</button>
          <p style={{ textAlign:"center", fontSize:12, color:"#888" }}>Have account? <button onClick={()=>setModal("login")} style={{ background:"none", border:"none", color:"#ffb400", cursor:"pointer", fontWeight:700, fontSize:12 }}>Login</button></p>
        </div>
      </div>
    );
  };

  const SubscribeM = () => {
    const [plan, setPlan] = useState("monthly");
    const [phone, setPhone] = useState(user?.phone||"");
    const [ld, setLd] = useState(false);
    const [step, setStep] = useState("choose");
    const pay = async () => {
      if (!phone.startsWith("254")) { toast_("Enter valid 254 number","err"); return; }
    setLd(true); setStep("mpesa");
try {
  const res = await fetch("/.netlify/functions/mpesa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, amount: plan==="weekly" ? 50 : 150 })
  });
  const data = await res.json();
  if (data.success || res.ok) {
    setUser(u=>({...u,plan,trial:false,expiry:plan==="weekly"?"7 days":"30 days"}));
    setStep("done");
  } else {
    toast_("Payment failed: " + (data.message||"Try again"), "err");
    setStep("choose");
  }
} catch(e) {
  toast_("Network error. Try again.", "err");
  setStep("choose");
}
setLd(false);
    };
    return (
      <div>
        {step==="done"?(
          <div style={{ textAlign:"center", padding:"18px 0" }}>
            <div style={{ fontSize:60, marginBottom:14 }}>🎉</div>
            <h2 style={{ color:"#ffb400", fontFamily:"'Playfair Display',serif", margin:"0 0 8px" }}>Subscribed!</h2>
            <p style={{ color:"#aaa", marginBottom:22, fontSize:14 }}>Your {plan} plan is active. Enjoy unlimited downloads!</p>
            <button onClick={()=>{ setModal(null); setPage("browse"); }} style={btnG}>Browse Materials</button>
          </div>
        ):step==="mpesa"?(
          <div style={{ textAlign:"center", padding:"18px 0" }}>
            <div style={{ fontSize:46, marginBottom:14 }}>📱</div>
            <h3 style={{ color:"#fff", margin:"0 0 8px" }}>Check Your Phone</h3>
            <p style={{ color:"#aaa", fontSize:13 }}>M-Pesa STK Push sent to <strong style={{ color:"#ffb400" }}>{phone}</strong></p>
            <p style={{ color:"#777", fontSize:12, marginTop:8 }}>Enter your M-Pesa PIN to complete…</p>
            <div style={{ marginTop:18, fontSize:12, color:"#555" }}>⏳ Waiting for confirmation…</div>
          </div>
        ):(
          <div>
            <h2 style={{ color:"#fff", fontFamily:"'Playfair Display',serif", margin:"0 0 5px", fontSize:22 }}>Subscribe via M-Pesa</h2>
            <p style={{ color:"#888", fontSize:12, margin:"0 0 20px" }}>Instant activation after payment</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[{ k:"weekly",l:"Weekly",p:"KSh 50" },{ k:"monthly",l:"Monthly",p:"KSh 150" }].map(pl=>(
                <div key={pl.k} onClick={()=>setPlan(pl.k)} style={{ border:`2px solid ${plan===pl.k?"#ffb400":"rgba(255,255,255,0.09)"}`, borderRadius:11, padding:"16px 12px", cursor:"pointer", textAlign:"center", background:plan===pl.k?"rgba(255,180,0,0.07)":"transparent", transition:"all .2s" }}>
                  <div style={{ fontWeight:700, color:"#fff", marginBottom:3, fontSize:14 }}>{pl.l}</div>
                  <div style={{ fontSize:24, fontWeight:900, color:"#ffb400", fontFamily:"'Playfair Display',serif" }}>{pl.p}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={lbl}>M-Pesa Phone</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} style={inp} placeholder="254712345678" />
            </div>
            <button onClick={pay} disabled={ld} style={{ ...btnG, opacity:ld?0.7:1 }}>
              {ld?"Sending STK Push…":`Pay ${plan==="weekly"?"KSh 50":"KSh 150"} via M-Pesa`}
            </button>
          </div>
        )}
      </div>
    );
  };

  const GateM = () => (
    <div style={{ textAlign:"center", padding:"12px 0" }}>
      <div style={{ fontSize:54, marginBottom:14 }}>🔒</div>
      <h2 style={{ color:"#fff", fontFamily:"'Playfair Display',serif", margin:"0 0 8px", fontSize:22 }}>Download Limit Reached</h2>
      <p style={{ color:"#aaa", fontSize:13, margin:"0 0 22px", lineHeight:1.65 }}>
        You've used your <strong style={{ color:"#ffb400" }}>1 free download</strong>.<br />Register for a trial or subscribe to continue.
      </p>
      <div style={{ display:"grid", gap:9 }}>
        <button onClick={()=>setModal("register")} style={btnG}>Register Free (+ 2-Day Trial)</button>
        <button onClick={()=>setModal("login")} style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.13)", color:"#fff", padding:"12px 0", borderRadius:10, fontWeight:700, cursor:"pointer" }}>Already have account? Login</button>
      </div>
    </div>
  );

  const PreviewM = () => {
    if (!prevMat) return null;
    return (
      <div>
        <div style={{ display:"flex", gap:12, marginBottom:18, alignItems:"center" }}>
          <Cover m={prevMat} />
          <div>
            <div style={{ fontSize:10, color:"#ffb400", fontWeight:700, textTransform:"uppercase", letterSpacing:0.5 }}>{prevMat.system} · {prevMat.level}</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#fff", margin:"3px 0" }}>{prevMat.title}</div>
            <div style={{ fontSize:12, color:"#888" }}>{prevMat.subject} · {prevMat.type}</div>
          </div>
        </div>
        <div style={{ background:"#fff", borderRadius:10, padding:20, marginBottom:14, minHeight:260, position:"relative" }}>
          <div style={{ fontFamily:"Georgia,serif", fontSize:16, fontWeight:700, textAlign:"center", marginBottom:14, color:"#111" }}>{prevMat.title}</div>
          <div style={{ fontSize:12, color:"#333", lineHeight:1.8 }}>
            <p><strong>1. Introduction</strong></p>
            <p>This material covers essential concepts for <strong>{prevMat.subject}</strong> at <strong>{prevMat.level}</strong>. Students are expected to review all sections carefully before the examination.</p>
            <p><strong>2. Learning Outcomes</strong></p>
            <p>By the end of this revision unit, learners will be able to apply core principles through worked examples and practice questions...</p>
          </div>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", transform:"rotate(-28deg)", opacity:0.1, fontSize:18, fontWeight:900, color:"#000", whiteSpace:"nowrap" }}>www.topplussrevisions.com</div>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:90, background:"linear-gradient(transparent,rgba(255,255,255,0.97))", display:"flex", alignItems:"flex-end", justifyContent:"center", paddingBottom:10, borderRadius:"0 0 10px 10px" }}>
            <span style={{ fontSize:11, color:"#888", fontStyle:"italic" }}>…preview ends here. Download to read full document.</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={()=>setModal(null)} style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"#ccc", padding:"11px 0", borderRadius:9, cursor:"pointer", fontWeight:600 }}>Close</button>
          <button onClick={()=>{ setModal(null); handleDL(prevMat); }} style={{ flex:2, ...btnG, padding:"11px 0" }}>⬇ Download Full Document</button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight:"100vh", background:"#080e1c", color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <Nav />
      <main>
        {page==="home" && <Home />}
        {page==="browse" && <Browse />}
        {page==="dash" && <Dash />}
        {page==="admin" && isAdmin && <Admin />}
      </main>
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.06)", padding:"28px 16px 80px", textAlign:"center" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:"#fff", marginBottom:5 }}>Toppluss <span style={{ color:"#ffb400" }}>Revisions</span></div>
        <p style={{ color:"#555", fontSize:12, margin:0 }}>Kenya's trusted revision platform · CBC & 8-4-4</p>
        <p style={{ color:"#444", fontSize:11, marginTop:8 }}>📞 <a href="https://wa.me/254755803149" style={{ color:"#25D366", textDecoration:"none" }}>+254 755 803 149</a> · © 2025</p>
      </footer>
      <a href="https://wa.me/254755803149?text=Hello%2C%20I%20need%20help%20with%20Toppluss%20Revisions" target="_blank" rel="noopener noreferrer"
        style={{ position:"fixed", bottom:22, right:18, width:52, height:52, background:"#25D366", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 18px rgba(37,211,102,0.45)", zIndex:500, textDecoration:"none", fontSize:26, transition:"transform .2s" }}
        onMouseEnter={e=>e.currentTarget.style.transform="scale(1.1)"}
        onMouseLeave={e=>e.currentTarget.style.transform=""}>
        💬
      </a>
      <Toast {...toast} />
      {modal==="login" && <Modal onClose={()=>setModal(null)}><LoginM /></Modal>}
      {modal==="register" && <Modal onClose={()=>setModal(null)}><RegisterM /></Modal>}
      {modal==="subscribe" && <Modal onClose={()=>setModal(null)}><SubscribeM /></Modal>}
      {modal==="gate" && <Modal onClose={()=>setModal(null)}><GateM /></Modal>}
      {modal==="preview" && <Modal onClose={()=>setModal(null)} w={560}><PreviewM /></Modal>}
    </div>
  );
}
