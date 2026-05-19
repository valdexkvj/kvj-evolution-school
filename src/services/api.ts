import { ROLES } from '@/utils/constants';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const getStore = (key: string, fallback: any[] = []) => { const d = localStorage.getItem(key); if (d) return JSON.parse(d); localStorage.setItem(key, JSON.stringify(fallback)); return fallback; };
const setStore = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

const seedUsers = () => { const u = getStore('kvj_users'); if (!u.length) setStore('kvj_users', [{ _id: 'u1', name: 'Étudiant Test', email: 'etudiant@test.com', password: '123', role: ROLES.STUDENT, niveau: 'L2' }, { _id: 'u2', name: 'Administrateur', email: 'valdexjoyeux@gmail.com', password: 'admi-2026', role: ROLES.ADMIN, niveau: 'L3' }]); };

export const uploadFile = (d: string) => { const id = `f_${Date.now()}_${Math.random().toString(36).slice(2,9)}`; const f = JSON.parse(localStorage.getItem('kvj_files')||'{}'); f[id]=d; try{localStorage.setItem('kvj_files',JSON.stringify(f))}catch{const k=Object.keys(f);if(k.length>3)delete f[k[0]];localStorage.setItem('kvj_files',JSON.stringify(f))} return id; };
export const resolveFile = (r: string) => { if(!r)return ''; if(r.startsWith('data:')||r.startsWith('http'))return r; return JSON.parse(localStorage.getItem('kvj_files')||'{}')[r]||''; };

// ─── API ─────────────────────────────────────────────────────────────
export const api = {
  async login(email:string,password:string){ await delay(500); seedUsers(); const u=getStore('kvj_users').find((x:any)=>x.email===email&&x.password===password); if(!u)throw new Error('Identifiants incorrects'); const t=btoa(JSON.stringify({id:u._id,role:u.role})); const{password:_,...s}=u; return{token:t,user:s}; },
  async register(d:any){ await delay(500); seedUsers(); const u=getStore('kvj_users'); if(u.find((x:any)=>x.email===d.email))throw new Error('Email utilise'); const n={_id:`u_${Date.now()}`,...d,role:ROLES.STUDENT}; u.push(n); setStore('kvj_users',u); const t=btoa(JSON.stringify({id:n._id,role:n.role})); const{password:_,...s}=n; return{token:t,user:s}; },
  async getProfile(id:string){ const u=getStore('kvj_users').find((x:any)=>x._id===id); if(!u)throw new Error('Non trouve'); const{password:_,...s}=u; return s; },
  async getAllUsers(){ seedUsers(); return getStore('kvj_users').map(({password:_,...u}:any)=>u); },
  async createUser(d:any){ const u=getStore('kvj_users'); if(u.find((x:any)=>x.email===d.email))throw new Error('Email utilise'); const n={_id:`u_${Date.now()}`,...d}; u.push(n); setStore('kvj_users',u); const{password:_,...s}=n; return s; },
  async deleteUser(id:string){ setStore('kvj_users',getStore('kvj_users').filter((u:any)=>u._id!==id)); },

  async getCourses(){ return getStore('kvj_courses'); },
  async getCourse(id:string){ const c=getStore('kvj_courses').find((x:any)=>x._id===id); if(!c)throw new Error('Non trouve'); return{...c,pdfUrl:resolveFile(c.pdfUrl),tpUrl:resolveFile(c.tpUrl),tdUrl:resolveFile(c.tdUrl)}; },
  async createCourse(d:any){ const c=getStore('kvj_courses'); const n={_id:`c_${Date.now()}`,...d,createdAt:new Date().toISOString(),modules:[]}; c.push(n); setStore('kvj_courses',c); return n; },
  async updateCourse(id:string,d:any){ const c=getStore('kvj_courses'); const i=c.findIndex((x:any)=>x._id===id); if(i===-1)throw new Error('Non trouve'); if(d.pdfUrl?.startsWith?.('data:'))d.pdfUrl=uploadFile(d.pdfUrl); if(d.tpUrl?.startsWith?.('data:'))d.tpUrl=uploadFile(d.tpUrl); if(d.tdUrl?.startsWith?.('data:'))d.tdUrl=uploadFile(d.tdUrl); c[i]={...c[i],...d}; setStore('kvj_courses',c); return c[i]; },
  async deleteCourse(id:string){ setStore('kvj_courses',getStore('kvj_courses').filter((c:any)=>c._id!==id)); },

  async getProgress(id:string){ return getStore('kvj_progress').filter((p:any)=>p.studentId===id); },
  async updateProgress(sid:string,cid:string,mid:string){ const p=getStore('kvj_progress'); let e=p.find((x:any)=>x.studentId===sid&&x.courseId===cid); const total=getStore('kvj_courses').find((c:any)=>c._id===cid)?.modules?.length||1; if(e){if(!e.completedModules.includes(mid))e.completedModules.push(mid);e.percentage=Math.round((e.completedModules.length/total)*100)}else{e={studentId:sid,courseId:cid,completedModules:[mid],percentage:Math.round((1/total)*100),startedAt:new Date().toISOString()};p.push(e)} setStore('kvj_progress',p); return e; },

  async saveResult(d:any){ const r=getStore('kvj_results'); const n={_id:`r_${Date.now()}`,...d,date:new Date().toISOString()}; r.push(n); setStore('kvj_results',r); return n; },
  async getResults(id:string){ return getStore('kvj_results').filter((r:any)=>r.studentId===id); },
  async getAllResults(){ return getStore('kvj_results'); },

  async getQuizzes(){ return getStore('kvj_quizzes'); },
  async createQuiz(d:any){ const q=getStore('kvj_quizzes'); const n={_id:`q_${Date.now()}`,...d,createdAt:new Date().toISOString(),type:'qcm'}; q.push(n); setStore('kvj_quizzes',q); return n; },
  async updateQuiz(id:string,d:any){ const q=getStore('kvj_quizzes'); const i=q.findIndex((x:any)=>x._id===id); if(i===-1)throw new Error('Non trouve'); q[i]={...q[i],...d}; setStore('kvj_quizzes',q); return q[i]; },
  async deleteQuiz(id:string){ setStore('kvj_quizzes',getStore('kvj_quizzes').filter((q:any)=>q._id!==id)); },

  async getHtmlQuizzes(){ return getStore('kvj_html_quizzes'); },
  async createHtmlQuiz(d:any){ const q=getStore('kvj_html_quizzes'); const n={_id:`hq_${Date.now()}`,...d,createdAt:new Date().toISOString(),type:'html'}; q.push(n); setStore('kvj_html_quizzes',q); return n; },
  async deleteHtmlQuiz(id:string){ setStore('kvj_html_quizzes',getStore('kvj_html_quizzes').filter((q:any)=>q._id!==id)); },

  async getLeaderboard(){ seedUsers(); const users=getStore('kvj_users').filter((u:any)=>u.role===ROLES.STUDENT); const results=getStore('kvj_results'); return users.map((s:any)=>{const n=results.filter((r:any)=>r.studentId===s._id);const a=n.length?Math.round(n.reduce((x:number,y:any)=>x+y.percentage,0)/n.length):0;return{studentId:s._id,name:s.name,email:s.email,niveau:s.niveau,totalQuizzes:n.length,passedQuizzes:n.filter((x:any)=>x.passed).length,avgPercentage:a,lastActivity:n.length?n.sort((a:any,b:any)=>new Date(b.date).getTime()-new Date(a.date).getTime())[0].date:null}}).sort((a:any,b:any)=>b.avgPercentage-a.avgPercentage); },

  async getPlatformStats(){ seedUsers(); const u=getStore('kvj_users'); const c=getStore('kvj_courses'); const r=getStore('kvj_results'); const s=u.filter((x:any)=>x.role===ROLES.STUDENT); const a=r.length?Math.round(r.reduce((x:number,y:any)=>x+y.percentage,0)/r.length):0; const p=r.length?Math.round((r.filter((x:any)=>x.passed).length/r.length)*100):0; return{totalStudents:s.length,totalCourses:c.length,totalQuizzes:r.length,avgScore:a,passRate:p}; },
};

// ─── Compat exports ──────────────────────────────────────────────────
export const authService = { login:(e:string,p:string)=>api.login(e,p), register:(d:any)=>api.register(d), getCurrentUser:(id:string)=>api.getProfile(id), getAllUsers:()=>api.getAllUsers(), createAdmin:(d:any)=>api.createUser({...d,role:ROLES.ADMIN,password:d.password||'admi-2026'}), deleteUser:(id:string)=>api.deleteUser(id) };

export const courseService = { getAll:()=>api.getCourses(), getById:(id:string)=>api.getCourse(id), create:(d:any)=>api.createCourse(d), update:(id:string,d:any)=>api.updateCourse(id,d), delete:(id:string)=>api.deleteCourse(id), uploadPdf:(file:File)=>new Promise<string>((ok,no)=>{if(file.size>5*1024*1024){no(new Error('Trop lourd'));return}const r=new FileReader();r.onload=()=>ok(uploadFile(r.result as string));r.onerror=()=>no(new Error('Erreur'));r.readAsDataURL(file)}), uploadHtmlQuiz:(file:File)=>new Promise<string>((ok,no)=>{if(file.size>10*1024*1024){no(new Error('Trop lourd'));return}const r=new FileReader();r.onload=()=>ok(uploadFile(r.result as string));r.onerror=()=>no(new Error('Erreur'));r.readAsDataURL(file)}) };

export const progressService = { getByStudent:(id:string)=>api.getProgress(id), updateModuleProgress:(s:string,c:string,m:string)=>api.updateProgress(s,c,m) };

export const quizService = { getStudentAttempts:(id:string)=>api.getResults(id), getAllAttempts:()=>api.getAllResults(), submitAttempt:async(sid:string,cid:string,_mid:string,qid:string,answers:number[])=>{const q=getStore('kvj_quizzes').find((x:any)=>x._id===qid);if(!q)throw new Error('Quiz non trouve');let c=0;q.questions.forEach((qq:any,i:number)=>{if(answers[i]===qq.correctAnswer)c++});const pct=Math.round((c/q.questions.length)*100);return api.saveResult({studentId:sid,courseId:cid,quizId:qid,quizTitle:q.title,score:c,totalQuestions:q.questions.length,percentage:pct,passed:pct>=q.passingScore})}, updateQuiz:(id:string,d:any)=>api.updateQuiz(id,d), deleteQuiz:(id:string)=>api.deleteQuiz(id), getQuizStats:async()=>{const r=getStore('kvj_results');const t=r.length,p=r.filter((x:any)=>x.passed).length;return{totalAttempts:t,passedAttempts:p,failedAttempts:t-p,passRate:t?Math.round((p/t)*100):0,quizStats:{}}} };
