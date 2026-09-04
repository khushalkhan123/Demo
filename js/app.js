// Sidebar toggle (mobile)
function initSidebar(){
  const sidebar=document.getElementById('sidebar');
  const overlay=document.getElementById('sidebarOverlay');
  const openBtn=document.getElementById('menuToggle');
  const closeBtn=document.getElementById('sidebarClose');
  const toggle=()=>{sidebar.classList.toggle('open');overlay.classList.toggle('open');};
  openBtn?.addEventListener('click',toggle);
  closeBtn?.addEventListener('click',toggle);
  overlay?.addEventListener('click',toggle);
}

// Highlight active nav link based on current page
function initActiveNav(){
  const page=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nav-link[data-page]').forEach(link=>{
    if(link.dataset.page===page) link.classList.add('active');
  });
}

// Profile / notification dropdowns
function initDropdowns(){
  document.querySelectorAll('[data-dropdown-toggle]').forEach(btn=>{
    const menu=document.getElementById(btn.dataset.dropdownToggle);
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      document.querySelectorAll('.dropdown-menu').forEach(m=>{if(m!==menu)m.classList.remove('open');});
      menu.classList.toggle('open');
    });
  });
  document.addEventListener('click',()=>document.querySelectorAll('.dropdown-menu').forEach(m=>m.classList.remove('open')));
}

// Generic modal open/close
function initModals(){
  document.querySelectorAll('[data-modal-open]').forEach(btn=>{
    btn.addEventListener('click',()=>document.getElementById(btn.dataset.modalOpen).classList.add('open'));
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn=>{
    btn.addEventListener('click',()=>btn.closest('.modal-overlay').classList.remove('open'));
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay=>{
    overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open');});
  });
}

// Demo search/filter: hides table rows that don't match query text
function initTableSearch(inputId,tableBodyId){
  const input=document.getElementById(inputId);
  const body=document.getElementById(tableBodyId);
  if(!input||!body)return;
  input.addEventListener('input',()=>{
    const q=input.value.trim().toLowerCase();
    body.querySelectorAll('tr').forEach(row=>{
      row.style.display=row.textContent.toLowerCase().includes(q)?'':'none';
    });
  });
}

// Dashboard charts
function initCharts(){
  const salesEl=document.getElementById('salesChart');
  if(salesEl){
    new Chart(salesEl,{
      type:'line',
      data:{
        labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets:[{
          label:'Sales (PKR)',
          data:[85000,112000,98000,134000,121000,156000,143000],
          borderColor:'#2563eb',
          backgroundColor:'rgba(37,99,235,0.08)',
          fill:true,tension:.4,pointRadius:3,pointBackgroundColor:'#2563eb'
        }]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{
          y:{ticks:{callback:v=>'₨'+(v/1000)+'k'},grid:{color:'#eef1f5'}},
          x:{grid:{display:false}}
        }
      }
    });
  }
  const catEl=document.getElementById('categoryChart');
  if(catEl){
    new Chart(catEl,{
      type:'doughnut',
      data:{
        labels:['Groceries','Electronics','Apparel','Pharmacy','Other'],
        datasets:[{
          data:[35,25,18,14,8],
          backgroundColor:['#2563eb','#0d9488','#f59e0b','#ec4899','#94a3b8'],
          borderWidth:0
        }]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}},
        cutout:'68%'
      }
    });
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  initSidebar();
  initActiveNav();
  initDropdowns();
  initModals();
  initCharts();
  initTableSearch('customerSearch','customerTableBody');
  initTableSearch('productSearch','productTableBody');
});
