(() => {
const ALLOWED_KEYS = [
"escalona.pablo@gmail.com",
"pastor.sequera@gmail.com",
"Jesuthbelisario@gmail.com",
"Yamileta@gmail.com",
"rosatorealba@gmail.com",
"rosatorrealba316@gmail.com"
];

const $ = (id) => document.getElementById(id);

const state = {
user: localStorage.getItem("vida_user") || "",
font: parseInt(localStorage.getItem("vida_font") || "16", 10)
};

function setFont(px){
const v = Math.max(14, Math.min(22, px));
document.documentElement.style.setProperty("--fs", v + "px");
localStorage.setItem("vida_font", String(v));
state.font = v;
$("fontRange").value = String(v);
$("fontLabel").textContent = v + " px";
}

function show(id){
$("screenLogin").classList.add("hidden");
$("screenApp").classList.add("hidden");
$(id).classList.remove("hidden");
$("bottomBar").classList.toggle("hidden", id !== "screenApp");
}

function setUserUI(){
$("userPill").textContent = state.user || "";
$("drawerUser").textContent = state.user ? ("Sesión: " + state.user) : "Sin sesión";
}

function login(userKey){
const key = (userKey || "").trim();
const ok = ALLOWED_KEYS.includes(key);
if(!ok){
$("loginMsg").textContent = "Clave inválida. Revisa mayúsculas y espacios.";
return;
}
state.user = key;
localStorage.setItem("vida_user", key);
$("loginMsg").textContent = "";
setUserUI();
show("screenApp");
}

function logout(){
localStorage.removeItem("vida_user");
state.user = "";
$("accessKey").value = "";
setUserUI();
closeMenu();
show("screenLogin");
}

function switchTab(name){
document.querySelectorAll(".tab").forEach(b => {
b.classList.toggle("active", b.dataset.tab === name);
});
["lessons","music","devos","alarms","log"].forEach(t => {
$("tab-" + t).classList.toggle("hidden", t !== name);
});
}

function speak(text){
if(!("speechSynthesis" in window)) return;
const u = new SpeechSynthesisUtterance(text);
u.lang = "es-VE";
u.rate = 1;
u.pitch = 1;
window.speechSynthesis.cancel();
window.speechSynthesis.speak(u);
}

function stopSpeak(){
if(!("speechSynthesis" in window)) return;
window.speechSynthesis.cancel();
}

function initTabs(){
document.querySelectorAll(".tab").forEach(b => {
b.addEventListener("click", () => switchTab(b.dataset.tab));
});
}

function initMusic(){
$("btnLoadAudio").addEventListener("click", () => {
const url = $("audioUrl").value.trim();
if(!url) return;
$("audioPlayer").src = url;
$("audioPlayer").play().catch(() => {});
});
$("btnStopAudio").addEventListener("click", () => {
$("audioPlayer").pause();
$("audioPlayer").currentTime = 0;
});
}

function initLog(){
const key = () => "vida_log_" + (state.user || "anon");
const load = () => {
const raw = localStorage.getItem(key()) || "[]";
let items = [];
try{ items = JSON.parse(raw); }catch{ items = []; }
const wrap = $("logList");
wrap.innerHTML = "";
items.slice().reverse().forEach(it => {
const d = document.createElement("div");
d.className = "logitem";
d.innerHTML = `<div class="t">${it.t}</div><div>${escapeHtml(it.m)}</div>`;
wrap.appendChild(d);
});
};
const save = () => {
const msg = ($("logText").value || "").trim();
if(!msg) return;
const raw = localStorage.getItem(key()) || "[]";
let items = [];
try{ items = JSON.parse(raw); }catch{ items = []; }
items.push({ t:new Date().toLocaleString("es-VE"), m:msg });
localStorage.setItem(key(), JSON.stringify(items));
$("logText").value = "";
load();
};
$("btnSaveLog").addEventListener("click", save);
$("btnClearLog").addEventListener("click", () => {
$("logText").value = "";
});
document.querySelector('[data-tab="log"]').addEventListener("click", load);
load();
}

function escapeHtml(s){
return String(s)
.replaceAll("&","&amp;")
.replaceAll("<","&lt;")
.replaceAll(">","&gt;");
}

function initAlarms(){
$("btnSetAlarm").addEventListener("click", async () => {
const mins = parseInt(($("alarmMinutes").value || "0").trim(), 10);
if(!mins || mins < 1){
$("alarmMsg").textContent = "Coloca un número válido de minutos.";
return;
}
if("Notification" in window){
const p = await Notification.requestPermission();
if(p !== "granted"){
$("alarmMsg").textContent = "Sin permiso de notificaciones. Haré un aviso en pantalla.";
}
}
$("alarmMsg").textContent = "Listo. Te aviso en " + mins + " min.";
setTimeout(() => {
notify("VIDA", "Recordatorio: respira, revisa tu enfoque, y sigue.");
}, mins * 60 * 1000);
});
}

function notify(title, body){
try{
if("Notification" in window && Notification.permission === "granted"){
new Notification(title, { body });
return;
}
}catch{}
alert(title + "\n\n" + body);
}

function initTextSize(){
$("btnText").addEventListener("click", () => {
$("textSheet").classList.remove("hidden");
});
$("btnCloseSheet").addEventListener("click", () => {
$("textSheet").classList.add("hidden");
});
$("textSheet").addEventListener("click", (e) => {
if(e.target.id === "textSheet") $("textSheet").classList.add("hidden");
});
$("fontRange").addEventListener("input", (e) => {
setFont(parseInt(e.target.value, 10));
});
setFont(state.font);
}

/* Menu / Drawer */
function openMenu(){
$("drawer").classList.remove("hidden");
$("drawer").setAttribute("aria-hidden","false");
}
function closeMenu(){
$("drawer").classList.add("hidden");
$("drawer").setAttribute("aria-hidden","true");
}
function initMenu(){
$("btnMenu").addEventListener("click", openMenu);
$("btnCloseMenu").addEventListener("click", closeMenu);
$("drawer").addEventListener("click", (e) => {
if(e.target.id === "drawer") closeMenu();
});
document.querySelectorAll(".navitem").forEach(b => {
b.addEventListener("click", () => {
const go = b.dataset.go;
switchTab(go);
closeMenu();
});
});
window.addEventListener("keydown", (e) => {
if(e.key === "Escape") closeMenu();
});
}

function initSpeech(){
$("btnReadLesson").addEventListener("click", () => {
speak("Semana uno. La compasión que mueve al equipo. En esta semana, despierta sensibilidad espiritual y amor práctico dentro del equipo.");
});
$("btnReadDevo").addEventListener("click", () => {
speak("Devocional. Cristo en ti, esperanza viva. Respira. No estás sosteniendo tu vida con tus fuerzas. Estás siendo sostenido.");
});
window.addEventListener("beforeunload", stopSpeak);
}

function initAuth(){
$("btnEnter").addEventListener("click", () => login($("accessKey").value));
$("accessKey").addEventListener("keydown", (e) => {
if(e.key === "Enter") login($("accessKey").value);
});
$("btnLogout").addEventListener("click", logout);
}

function initSW(){
if("serviceWorker" in navigator){
navigator.serviceWorker.register("./sw.js").catch(() => {});
}
}

initAuth();
initTabs();
initMusic();
initAlarms();
initTextSize();
initMenu();
initSpeech();
initSW();

setUserUI();

if(state.user){
show("screenApp");
}else{
show("screenLogin");
}
switchTab("lessons");
})();