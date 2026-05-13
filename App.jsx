  const Admin = ()=>{
    const [tab,setTab]=useState("upload");

    // ── Persist form across tab switches/background kills ──
    const savedForm = ()=>{
      try{ return JSON.parse(sessionStorage.getItem("adminForm")||"null"); }catch{ return null; }
    };
    const [form,setForm]=useState(savedForm()||{title:"",system:"CBC",level:"Grade 1",subject:"",type:"Notes"});
    const [file,setFile]=useState(null);
    const [uploading,setUploading]=useState(false);
    const [progress,setProgress]=useState("");

    // Save form to sessionStorage whenever it changes
    useEffect(()=>{
      sessionStorage.setItem("adminForm", JSON.stringify(form));
    },[form]);

    const aLvls=form.system==="CBC"?LEVELS_CBC:LEVELS_844;
    const aSubs=SUBS_CBC[form.level]||SUBS_844[form.level]||[];

    const upload=async()=>{
      if(!form.title||!form.subject){showToast("Fill all fields","err");return;}
      if(!file){showToast("Select a PDF","err");return;}
      setUploading(true);setProgress("Reading file…");
      try{
        const base64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=()=>rej(new Error("Read failed"));r.readAsDataURL(file);});
        setProgress("Compressing & watermarking…");
        const res=await fetch("/.netlify/functions/watermark-upload",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fileBase64:base64,fileName:file.name,metadata:{...form,pages:null}})});
        const data=await res.json();
        if(!res.ok||!data.success) throw new Error(data.error||"Upload failed");
        const saved=data.savedPercent>0?` Compressed ${data.savedPercent}%`:"";
        showToast("✅ Uploaded!"+saved);
        const cleared={title:"",system:"CBC",level:"Grade 1",subject:"",type:"Notes"};
        setForm(cleared);
        sessionStorage.removeItem("adminForm");
        setFile(null);
        await loadMats();
      }catch(err){
        showToast("Upload failed: "+err.message,"err");
      }finally{
        setUploading(false);
        setProgress("");
      }
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

            {/* Show saved form notice */}
            {(form.title||form.subject)&&(
              <div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.2)",borderRadius:8,padding:"9px 12px",marginBottom:12,fontSize:12,color:"#ffb400"}}>
                ✅ Form restored — now select your PDF file
              </div>
            )}

            <div style={{display:"grid",gap:12}}>
              <div><label style={lbl}>Title</label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} style={inp} placeholder="e.g. Mathematics Notes – Grade 9"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={lbl}>System</label><select value={form.system} onChange={e=>setForm(p=>({...p,system:e.target.value,level:e.target.value==="CBC"?"Grade 1":"Form 1",subject:""}))} style={{...inp,cursor:"pointer"}}><option>CBC</option><option>8-4-4</option></select></div>
                <div><label style={lbl}>Level</label><select value={form.level} onChange={e=>setForm(p=>({...p,level:e.target.value,subject:""}))} style={{...inp,cursor:"pointer"}}>{aLvls.map(l=><option key={l}>{l}</option>)}</select></div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label style={lbl}>Subject</label><select value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} style={{...inp,cursor:"pointer"}}><option value="">Select…</option>{aSubs.map(s=><option key={s}>{s}</option>)}</select></div>
                <div><label style={lbl}>Type</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={{...inp,cursor:"pointer"}}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              </div>
              <div>
                <label style={lbl}>PDF File</label>
                <div onClick={()=>document.getElementById("pdf-in").click()} style={{border:"2px dashed rgba(255,180,0,0.25)",borderRadius:10,padding:"20px",textAlign:"center",cursor:"pointer",background:file?"rgba(39,174,96,0.04)":"transparent"}}>
                  {file?(
                    <>
                      <div style={{fontSize:20,marginBottom:4}}>📄</div>
                      <div style={{color:"#27ae60",fontWeight:700,fontSize:13}}>{file.name}</div>
                      <div style={{color:"#666",fontSize:11,marginTop:2}}>{(file.size/1024/1024).toFixed(1)} MB</div>
                    </>
                  ):(
                    <>
                      <div style={{fontSize:22,marginBottom:4}}>📁</div>
                      <div style={{color:"#ffb400",fontWeight:700,fontSize:13}}>Tap to select PDF</div>
                      <div style={{color:"#555",fontSize:11,marginTop:4}}>Fill fields above first, then pick file</div>
                    </>
                  )}
                </div>
                <input id="pdf-in" type="file" accept="application/pdf" onChange={e=>{const f=e.target.files[0];if(f&&f.type==="application/pdf")setFile(f);else{showToast("Select a PDF","err");setFile(null);}}} style={{display:"none"}}/>
              </div>
              {progress&&<div style={{background:"rgba(255,180,0,0.06)",border:"1px solid rgba(255,180,0,0.18)",borderRadius:8,padding:"9px",fontSize:13,color:"#ffb400",textAlign:"center"}}>⏳ {progress}</div>}
              <button onClick={upload} disabled={uploading} style={{...btnPrimary,opacity:uploading?0.7:1}}>{uploading?`⏳ ${progress||"Uploading…"}`:"⬆ Upload PDF"}</button>
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
        {tab==="analytics"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {l:"Total Materials",v:mats.length,i:"📄"},
              {l:"Total Downloads",v:mats.reduce((s,m)=>s+(m.downloads||0),0).toLocaleString(),i:"⬇"},
              {l:"CBC",v:mats.filter(m=>m.system==="CBC").length,i:"📘"},
              {l:"8-4-4",v:mats.filter(m=>m.system==="8-4-4").length,i:"📗"},
              {l:"Notes",v:mats.filter(m=>m.type==="Notes").length,i:"📝"},
              {l:"Past Papers",v:mats.filter(m=>m.type==="Past Papers").length,i:"📄"},
            ].map(c=>(
              <div key={c.l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 12px"}}>
                <div style={{fontSize:18,marginBottom:5}}>{c.i}</div>
                <div style={{fontSize:10,color:"#666",textTransform:"uppercase",letterSpacing:0.5,marginBottom:2}}>{c.l}</div>
                <div style={{fontSize:18,fontWeight:900,color:"#ffb400",fontFamily:"'Playfair Display',serif"}}>{c.v}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
