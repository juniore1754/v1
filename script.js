const STORAGE_KEY = "bccAppStateV1";

const adminAccounts = [
{
id:"ADM-PRINCIPAL",
role:"main_admin",
email:"admin@babycashcoin.com",
password:"Admin@2026",
name:"Admin Principal",
permissions:["all"]
},
{
id:"ADM-MISSIONS",
role:"admin_missions",
email:"admin.missions@babycashcoin.com",
password:"Missions@2026",
name:"Admin Missions",
permissions:["missions"]
},
{
id:"ADM-KYC",
role:"admin_kyc",
email:"admin.kyc@babycashcoin.com",
password:"Kyc@2026",
name:"Admin KYC",
permissions:["kyc"]
},
{
id:"ADM-REWARDS",
role:"admin_rewards",
email:"admin.rewards@babycashcoin.com",
password:"Rewards@2026",
name:"Admin Recompenses",
permissions:["rewards"]
},
{
id:"ADM-SUPPORT",
role:"admin_support",
email:"admin.support@babycashcoin.com",
password:"Support@2026",
name:"Admin Support",
permissions:["users"]
},
{
id:"ADM-FINANCE",
role:"admin_finance",
email:"admin.finance@babycashcoin.com",
password:"Finance@2026",
name:"Admin Finance",
permissions:["finance","transactions"]
}
];

const defaultMissions = [
{id:"MIS-CPALEAD",title:"CPALEAD Offerwall",link:"",gain:0,duration:"0 min",conditions:"Mission admin a remplir",status:"active"},
{id:"MIS-OFFERTORO",title:"OFFERTORO Sondages",link:"",gain:0,duration:"0 min",conditions:"Mission admin a remplir",status:"active"},
{id:"MIS-LOOTABLY",title:"LOOTABLY Videos",link:"",gain:0,duration:"0 min",conditions:"Mission admin a remplir",status:"active"},
{id:"MIS-SOCIAL",title:"Reseaux sociaux",link:"",gain:0,duration:"0 min",conditions:"Mission admin a remplir",status:"active"}
];

const supabaseReadySchema = {
users:"id,email,first_name,last_name,birth_date,role,pin_hash,created_at",
wallets:"user_id,main_balance,reward_balance,monthly_used,monthly_limit",
transactions:"id,user_id,type,amount,fees,status,created_at",
missions:"id,title,link,gain,duration,conditions,status",
mission_submissions:"id,user_id,mission_id,status,gain,created_at",
kyc:"id,user_id,status,files,created_at",
rewards:"id,user_id,gain,next_scratch_at",
admin_logs:"id,admin_id,action,target,created_at"
};

let state = loadState();
prepareState();
let session = JSON.parse(localStorage.getItem("bccSession") || "null");
let currentUser = null;
let visibleBalance = true;
let currentStream = null;
let pendingLocation = null;

const splashScreen = document.getElementById("splashScreen");
const authWall = document.getElementById("authWall");
const userDashboard = document.getElementById("userDashboard");
const adminDashboard = document.getElementById("adminDashboard");
const modal = document.getElementById("mainModal");
const modalContent = document.getElementById("modalContent");

function loadState(){
const saved = localStorage.getItem(STORAGE_KEY);
if(saved){
return JSON.parse(saved);
}

return {
users:[],
missions:defaultMissions,
transactions:[],
activities:[],
kycRequests:[],
missionProofs:[],
rewardSettings:{
gains:[10,25,50,100],
pool:5000,
dailyText:"Mission du jour bientot disponible",
dailyImage:""
},
settings:{
missionMaintenance:false,
feesBalance:0,
feeWithdrawals:[],
withdrawals:[],
schema:supabaseReadySchema
}
};
}

function createTestUser(){
return {
id:"BCCUSER-TEST-001",
role:"user",
firstName:"Test",
lastName:"User",
email:"user@testbcc.com",
password:"User@2026",
pin:"123456",
birthDate:"2000-01-01",
mobileMoney:"+000000000",
location:{lat:0,lng:0,accuracy:0},
acceptedRules:true,
banned:false,
kycStatus:"",
kycFiles:[],
kycImages:[],
mainBalance:1000,
rewardBalance:0,
monthlyUsed:0,
verified:false,
transactions:[],
missionStats:{validated:0,pending:0,rejected:0,earned:0},
missionSubmissions:[],
nextScratchAt:0,
createdAt:nowText()
};
}

function prepareState(){
let changed = false;

if(!Array.isArray(state.users)){
state.users = [];
changed = true;
}

if(!Array.isArray(state.missions)){
state.missions = defaultMissions;
changed = true;
}

if(!Array.isArray(state.transactions)){
state.transactions = [];
changed = true;
}

if(!Array.isArray(state.activities)){
state.activities = [];
changed = true;
}

if(!Array.isArray(state.kycRequests)){
state.kycRequests = [];
changed = true;
}

if(!Array.isArray(state.missionProofs)){
state.missionProofs = [];
changed = true;
}

if(!state.rewardSettings){
state.rewardSettings = {gains:[10,25,50,100],pool:5000,dailyText:"Mission du jour bientot disponible",dailyImage:""};
changed = true;
}

if(typeof state.rewardSettings.pool === "undefined"){
state.rewardSettings.pool = 5000;
changed = true;
}

if(!state.settings){
state.settings = {missionMaintenance:false,feesBalance:0,feeWithdrawals:[],withdrawals:[],schema:supabaseReadySchema};
changed = true;
}

if(typeof state.settings.feesBalance === "undefined"){ state.settings.feesBalance = 0; changed = true; }
if(!Array.isArray(state.settings.feeWithdrawals)){ state.settings.feeWithdrawals = []; changed = true; }
if(!Array.isArray(state.settings.withdrawals)){ state.settings.withdrawals = []; changed = true; }

state.users = state.users.map(user=>{
let nextUser = {...user};
if(!Array.isArray(nextUser.transactions)){ nextUser.transactions = []; changed = true; }
if(!Array.isArray(nextUser.missionSubmissions)){ nextUser.missionSubmissions = []; changed = true; }
if(!nextUser.missionStats){ nextUser.missionStats = {validated:0,pending:0,rejected:0,earned:0}; changed = true; }
if(typeof nextUser.mainBalance === "undefined"){ nextUser.mainBalance = 0; changed = true; }
if(typeof nextUser.rewardBalance === "undefined"){ nextUser.rewardBalance = 0; changed = true; }
if(typeof nextUser.monthlyUsed === "undefined"){ nextUser.monthlyUsed = 0; changed = true; }
if(typeof nextUser.nextScratchAt === "undefined"){ nextUser.nextScratchAt = 0; changed = true; }
if(typeof nextUser.kycStatus === "undefined"){ nextUser.kycStatus = ""; changed = true; }
if(!Array.isArray(nextUser.kycFiles)){ nextUser.kycFiles = []; changed = true; }
if(!Array.isArray(nextUser.kycImages)){ nextUser.kycImages = []; changed = true; }
if(typeof nextUser.mobileMoney === "undefined"){ nextUser.mobileMoney = ""; changed = true; }
if(typeof nextUser.banned === "undefined"){ nextUser.banned = false; changed = true; }
return nextUser;
});

state.missions = state.missions.map(mission=>{
let nextMission = {...mission};
if(typeof nextMission.link === "undefined"){
nextMission.link = "";
changed = true;
}
if(typeof nextMission.validation === "undefined"){ nextMission.validation = "manual"; changed = true; }
if(typeof nextMission.expiresAt === "undefined"){ nextMission.expiresAt = getMissionExpiry(nextMission.duration); changed = true; }
return nextMission;
});

if(!state.users.some(user=>user.email === "user@testbcc.com")){
state.users.push(createTestUser());
changed = true;
}

if(changed){
saveState();
}
}

function saveState(){
localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
}

function setSession(value){
session = value;
localStorage.setItem("bccSession",JSON.stringify(value));
}

function uid(prefix){
return `${prefix}-${Date.now()}-${Math.floor(Math.random()*9999)}`;
}

function nowText(){
return new Date().toLocaleString("fr-FR");
}

function normalizePhone(value){
return value.replace(/\s+/g,"").replace(/[^\d+]/g,"");
}

function getMissionExpiry(duration){
const text = String(duration || "").toLowerCase();
const number = parseFloat(text.replace(",","."));
if(!number || number <= 0){
return 0;
}
let multiplier = 60000;
if(text.includes("h") || text.includes("heure")){
multiplier = 3600000;
}
if(text.includes("jour") || text.includes("j")){
multiplier = 86400000;
}
return Date.now() + number * multiplier;
}

function recycleExpiredMissions(){
const now = Date.now();
let changed = false;
state.missions.forEach(mission=>{
if(mission.status === "active" && mission.expiresAt && mission.expiresAt <= now){
mission.status = "expired";
changed = true;
}
});

const activeCount = state.missions.filter(mission=>mission.status === "active").length;
if(activeCount === 0){
const nextMission = state.missions.find(mission=>mission.status === "queue");
if(nextMission){
nextMission.status = "active";
nextMission.expiresAt = getMissionExpiry(nextMission.duration);
changed = true;
addActivity("mission_queue",`Mission file d'attente publiee : ${nextMission.title}`);
}
}

if(changed){
saveState();
}
}

function addActivity(type,message,userId){
state.activities.unshift({
id:uid("ACT"),
type,
message,
userId:userId || (currentUser ? currentUser.id : ""),
date:nowText()
});
state.activities = state.activities.slice(0,80);
saveState();
}

function findCurrentUser(){
if(!session){
return null;
}

if(session.type === "admin"){
return adminAccounts.find(admin=>admin.id === session.id) || null;
}

return state.users.find(user=>user.id === session.id) || null;
}

function hasPermission(permission){
if(!currentUser || session.type !== "admin"){
return false;
}

return currentUser.permissions.includes("all") || currentUser.permissions.includes(permission);
}

function openModal(content){
modal.style.display = "flex";
modalContent.innerHTML = content;
}

function closeModal(){
modal.style.display = "none";
stopCamera();
}

window.closeModal = closeModal;

window.addEventListener("click",(event)=>{
if(event.target === modal){
closeModal();
}
});

function showOnly(view){
splashScreen.classList.add("hidden");
authWall.classList.add("hidden");
userDashboard.classList.add("hidden");
adminDashboard.classList.add("hidden");
view.classList.remove("hidden");
}

setTimeout(()=>{
currentUser = findCurrentUser();

if(currentUser && session.type === "admin"){
showAdmin();
return;
}

if(currentUser && session.type === "user"){
showUser();
return;
}

showOnly(authWall);
},2000);

document.getElementById("showLoginBtn").addEventListener("click",()=>{
document.getElementById("showLoginBtn").classList.add("active");
document.getElementById("showRegisterBtn").classList.remove("active");
document.getElementById("loginForm").classList.remove("hidden");
document.getElementById("registerForm").classList.add("hidden");
});

document.getElementById("showRegisterBtn").addEventListener("click",()=>{
document.getElementById("showRegisterBtn").classList.add("active");
document.getElementById("showLoginBtn").classList.remove("active");
document.getElementById("registerForm").classList.remove("hidden");
document.getElementById("loginForm").classList.add("hidden");
});

document.getElementById("requestLocationBtn").addEventListener("click",()=>{
if(!navigator.geolocation){
alert("Geolocalisation non disponible");
return;
}

navigator.geolocation.getCurrentPosition(position=>{
pendingLocation = {
lat:position.coords.latitude,
lng:position.coords.longitude,
accuracy:position.coords.accuracy
};
document.getElementById("locationStatus").innerText = "Position validee.";
},()=>{
pendingLocation = null;
document.getElementById("locationStatus").innerText = "Position refusee. Inscription annulee.";
alert("La position est obligatoire pour creer un compte.");
});
});

document.getElementById("registerForm").addEventListener("submit",(event)=>{
event.preventDefault();

const firstName = document.getElementById("regFirstName").value.trim();
const lastName = document.getElementById("regLastName").value.trim();
const email = document.getElementById("regEmail").value.trim().toLowerCase();
const emailConfirm = document.getElementById("regEmailConfirm").value.trim().toLowerCase();
const password = document.getElementById("regPassword").value;
const passwordConfirm = document.getElementById("regPasswordConfirm").value;
const pin = document.getElementById("regPin").value.trim();
const mobileMoney = normalizePhone(document.getElementById("regMobileMoney").value.trim());
const birthDate = document.getElementById("regBirthDate").value;
const acceptRules = document.getElementById("acceptRules").checked;

if(email !== emailConfirm){
alert("Les emails ne correspondent pas.");
return;
}

if(password !== passwordConfirm){
alert("Les mots de passe ne correspondent pas.");
return;
}

if(password.length < 6){
alert("Mot de passe trop court.");
return;
}

if(!/^\d{6}$/.test(pin)){
alert("Le PIN doit contenir exactement 6 chiffres.");
return;
}

if(mobileMoney.length < 8){
alert("Numero Mobile Money invalide.");
return;
}

if(!pendingLocation){
alert("La localisation est obligatoire.");
return;
}

if(!acceptRules){
alert("Vous devez accepter les regles et la confidentialite.");
return;
}

if(state.users.some(user=>user.email === email) || adminAccounts.some(admin=>admin.email === email)){
alert("Cet email existe deja.");
return;
}

if(state.users.some(user=>normalizePhone(user.mobileMoney || "") === mobileMoney)){
alert("Ce numero Mobile Money existe deja. Un meme numero ne peut creer qu'un compte.");
return;
}

const user = {
id:uid("BCCUSER"),
role:"user",
firstName,
lastName,
email,
password,
pin,
birthDate,
mobileMoney,
location:pendingLocation,
acceptedRules:true,
banned:false,
kycStatus:"",
kycFiles:[],
kycImages:[],
mainBalance:0,
rewardBalance:0,
monthlyUsed:0,
verified:false,
transactions:[],
missionStats:{validated:0,pending:0,rejected:0,earned:0},
missionSubmissions:[],
nextScratchAt:0,
createdAt:nowText()
};

state.users.push(user);
saveState();
addActivity("register",`${firstName} ${lastName} a cree un compte`,user.id);
setSession({type:"user",id:user.id});
currentUser = user;
showUser();
});

document.getElementById("loginForm").addEventListener("submit",(event)=>{
event.preventDefault();

const email = document.getElementById("loginEmail").value.trim().toLowerCase();
const password = document.getElementById("loginPassword").value;
const admin = adminAccounts.find(item=>item.email === email && item.password === password);

if(admin){
setSession({type:"admin",id:admin.id});
currentUser = admin;
showAdmin();
return;
}

const user = state.users.find(item=>item.email === email && item.password === password);

if(user){
if(user.banned){
alert("Compte banni. Contactez le support.");
return;
}
setSession({type:"user",id:user.id});
currentUser = user;
showUser();
return;
}

alert("Identifiants incorrects.");
});

document.getElementById("forgotPasswordBtn").addEventListener("click",()=>{
openModal(`
<h2>Mot de passe oublie</h2>
<input id="forgotEmail" type="email" placeholder="Votre adresse email">
<input id="forgotMobile" type="tel" placeholder="Numero Mobile Money du compte">
<input id="forgotNewPassword" type="password" placeholder="Nouveau mot de passe">
<button class="main-btn" id="confirmForgotBtn" style="width:100%;margin-top:16px">Reinitialiser</button>
<button class="close-btn" onclick="closeModal()">Fermer</button>
`);

setTimeout(()=>{
document.getElementById("confirmForgotBtn").addEventListener("click",()=>{
const email = document.getElementById("forgotEmail").value.trim().toLowerCase();
const mobile = normalizePhone(document.getElementById("forgotMobile").value.trim());
const newPassword = document.getElementById("forgotNewPassword").value;
const user = state.users.find(item=>item.email === email && normalizePhone(item.mobileMoney || "") === mobile);
if(!user){
alert("Aucun compte ne correspond a cet email et ce numero.");
return;
}
if(newPassword.length < 6){
alert("Mot de passe trop court.");
return;
}
user.password = newPassword;
saveState();
addActivity("support",`${email} a reinitialise son mot de passe`,user.id);
alert("Mot de passe mis a jour.");
closeModal();
});
},100);
});

function showUser(){
showOnly(userDashboard);
renderUserDashboard();
}

function getUserRef(){
return state.users.find(user=>user.id === currentUser.id);
}

function syncCurrentUser(){
if(session && session.type === "user"){
currentUser = getUserRef();
}
}

function renderUserDashboard(){
syncCurrentUser();
document.getElementById("userWelcome").innerText = `Bonjour ${currentUser.firstName}`;
document.getElementById("userUniqueId").innerText = currentUser.id;
document.getElementById("settingsEmail").innerText = currentUser.email;
updateBalance();
renderTransactions();
renderMissionStats();
renderMissions();
renderKyc();
updateRewardCountdown();
}

document.querySelectorAll(".nav-item").forEach(btn=>{
btn.addEventListener("click",()=>{
document.querySelectorAll(".page").forEach(page=>page.classList.remove("active-page"));
document.querySelectorAll(".nav-item").forEach(nav=>nav.classList.remove("active-nav"));
document.getElementById(btn.dataset.page).classList.add("active-page");
btn.classList.add("active-nav");
renderUserDashboard();
});
});
