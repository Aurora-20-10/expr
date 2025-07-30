const { ipcRenderer } = require('electron');
let profiles = {};
let currentProfile = null;
let zoneCount = 0;

function addProfile(){
  const name=document.getElementById('profileName').value.trim();
  const color=document.getElementById('profileColor').value;
  if(!name) return alert('Nhập tên profile!');
  profiles[name]={color,layouts:[]};
  updateProfileDropdown();
}
function updateProfileDropdown(){
  const sel=document.getElementById('profileList');
  sel.innerHTML='';
  Object.keys(profiles).forEach(n=>{
    const opt=document.createElement('option');
    opt.value=n; opt.textContent=n;
    sel.appendChild(opt);
  });
}
function switchProfile(){
  currentProfile=document.getElementById('profileList').value;
  updateLayoutDropdown();
}
function updateLayoutDropdown(){
  const sel=document.getElementById('layoutList');
  sel.innerHTML='';
  if(currentProfile && profiles[currentProfile]){
    profiles[currentProfile].layouts.forEach(l=>{
      const opt=document.createElement('option');
      opt.value=l.name; opt.textContent=l.name;
      sel.appendChild(opt);
    });
  }
}
function addZone(){ /* thêm zone drag-drop như mô tả */ }
function saveLayout(){ /* lưu layout vào profiles */ }
function applyLayoutElectron(){ /* gửi IPC để chạy layout */ }
function applyProfile(){ /* apply toàn bộ profile */ }
function openOverlay(){ ipcRenderer.send('open-overlay'); }
function openSettings(){ ipcRenderer.send('open-settings'); }

// nhận hotkey từ main
ipcRenderer.on('hotkey-apply-layout',(e,name)=>{
  const layoutData=JSON.stringify(/* tìm layout theo name */);
  ipcRenderer.send('apply-layout',layoutData);
});
ipcRenderer.on('apply-mythic-mode',(e,mode)=>{
  document.body.classList.toggle('mythic-mode', mode==='on');
});
