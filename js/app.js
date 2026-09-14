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

function getProducts(){
  const tableProducts=[...document.querySelectorAll('#productTableBody tr')].map(row=>{
    const cells=row.querySelectorAll('td');
    const name=cells[0]?.querySelector('span')?.textContent.trim();
    const price=Number(cells[3]?.textContent.replace(/[^0-9]/g,''));
    const stock=Number(cells[4]?.textContent.replace(/[^0-9.]/g,''));
    const unit=cells[0]?.dataset.unit||'pcs';
    return name?{name,price,stock,unit}:null;
  }).filter(Boolean);
  return tableProducts.length?tableProducts:[
    {name:'Rice',price:290,stock:25,unit:'kg'},
    {name:'Cooking Oil',price:560,stock:18,unit:'L'},
    {name:'Biscuits',price:80,stock:120,unit:'pcs'},
    {name:'Ketchup',price:320,stock:24,unit:'pcs'},
    {name:'Tea Pack',price:890,stock:27,unit:'pack'}
  ];
}

function formatPKR(amount){
  return `₨${Number(amount).toLocaleString('en-PK')}`;
}

function downloadTransactionPDF(transaction){
  const jsPDF=window.jspdf?.jsPDF;
  if(!jsPDF)return false;
  const doc=new jsPDF({unit:'mm',format:'a4'});
  const pageWidth=doc.internal.pageSize.getWidth();
  const money=amount=>`PKR ${Number(amount).toLocaleString('en-PK')}`;
  doc.setFillColor(15,23,42);
  doc.rect(0,0,pageWidth,34,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(22);
  doc.setFont(undefined,'bold');
  doc.text('ZamZam Store',20,17);
  doc.setFontSize(10);
  doc.setFont(undefined,'normal');
  doc.text('General Store Transaction Receipt',20,25);
  doc.setTextColor(51,65,85);
  doc.setFontSize(10);
  doc.text(`Invoice: ${transaction.id}`,20,48);
  doc.text(`Date: ${transaction.date}`,pageWidth-20,48,{align:'right'});
  doc.setFont(undefined,'bold');
  doc.text(`Customer: ${transaction.customer}`,20,56);
  doc.setFont(undefined,'normal');
  doc.setDrawColor(226,232,240);
  doc.line(20,64,pageWidth-20,64);
  doc.setFont(undefined,'bold');
  doc.text('Item',20,73);
  doc.text('Quantity',105,73,{align:'right'});
  doc.text('Rate',145,73,{align:'right'});
  doc.text('Amount',190,73,{align:'right'});
  doc.setFont(undefined,'normal');
  let y=82;
  transaction.items.forEach(item=>{
    const quantity=`${item.quantity} ${item.unit}`;
    doc.text(item.name,20,y);
    doc.text(quantity,105,y,{align:'right'});
    doc.text(`${money(item.price)} / ${item.unit}`,145,y,{align:'right'});
    doc.text(money(item.price*item.quantity),190,y,{align:'right'});
    y+=9;
  });
  doc.line(20,y+2,pageWidth-20,y+2);
  doc.setFont(undefined,'bold');
  doc.setFontSize(13);
  doc.text('Total',145,y+13);
  doc.text(money(transaction.amount),190,y+13,{align:'right'});
  doc.setFont(undefined,'normal');
  doc.setFontSize(9);
  doc.setTextColor(100,116,139);
  doc.text('Thank you for shopping at ZamZam Store.',20,y+29);
  const fileName=`${transaction.id}-${transaction.customer.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')||'customer'}.pdf`;
  doc.save(fileName);
  return true;
}

function initTransactions(){
  const modal=document.getElementById('transactionModal');
  if(!modal)return;
  const products=getProducts();
  const productSelect=document.getElementById('transactionProduct');
  const quantityInput=document.getElementById('transactionQuantity');
  const stockHint=document.getElementById('transactionStockHint');
  const linesEl=document.getElementById('transactionLines');
  const totalEl=document.getElementById('transactionTotal');
  const messageEl=document.getElementById('transactionMessage');
  const form=document.getElementById('transactionForm');
  const items=[];

  products.forEach((product,index)=>{
    const option=document.createElement('option');
    option.value=index;
    option.textContent=`${product.name} - ${formatPKR(product.price)} / ${product.unit}`;
    option.disabled=product.stock===0;
    productSelect.appendChild(option);
  });

  const render=()=>{
    linesEl.innerHTML=items.length?items.map((item,index)=>`<div class="transaction-line"><span class="font-medium text-slate-700">${item.name}</span><span>${item.quantity} ${item.unit}</span><span>${formatPKR(item.price*item.quantity)}</span><button type="button" class="remove-transaction-item" data-index="${index}" aria-label="Remove ${item.name}"><i class="fa-solid fa-trash-can"></i></button></div>`).join(''):'<p class="empty-transaction">No items added yet</p>';
    totalEl.textContent=formatPKR(items.reduce((sum,item)=>sum+item.price*item.quantity,0));
  };

  productSelect.addEventListener('change',()=>{
    const product=products[Number(productSelect.value)];
    quantityInput.step=product&&['kg','L'].includes(product.unit)?'0.001':'1';
    quantityInput.min=product&&['kg','L'].includes(product.unit)?'0.001':'1';
    quantityInput.value=1;
    stockHint.textContent=product?`${product.stock} ${product.unit} available in stock`:' ';
  });
  document.getElementById('addTransactionItem').addEventListener('click',()=>{
    const product=products[Number(productSelect.value)];
    const quantity=Number(quantityInput.value);
    if(!product||!quantity||quantity<0.01||(!['kg','L'].includes(product.unit)&&!Number.isInteger(quantity)))return;
    const existing=items.find(item=>item.name===product.name);
    const nextQuantity=(existing?.quantity||0)+quantity;
    if(nextQuantity>product.stock){
      stockHint.textContent=`Only ${product.stock} ${product.unit} available in stock`;
      stockHint.className='text-xs text-red-500 mt-2';
      return;
    }
    if(existing)existing.quantity=nextQuantity;
    else items.push({...product,quantity});
    productSelect.value=''; quantityInput.value=1; stockHint.textContent=''; stockHint.className='text-xs text-slate-400 mt-2'; render();
  });
  linesEl.addEventListener('click',event=>{
    const button=event.target.closest('.remove-transaction-item');
    if(button){items.splice(Number(button.dataset.index),1);render();}
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!items.length){messageEl.textContent='Add at least one item to save the transaction.';messageEl.className='text-sm text-red-600';return;}
    const transaction={id:`INV-${1043+Number(localStorage.getItem('transactionCount')||0)}`,customer:document.getElementById('transactionCustomer').value.trim(),date:new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}),amount:items.reduce((sum,item)=>sum+item.price*item.quantity,0),items:items.map(item=>({name:item.name,quantity:item.quantity,unit:item.unit,price:item.price}))};
    const transactions=JSON.parse(localStorage.getItem('transactions')||'[]');
    transactions.unshift(transaction); localStorage.setItem('transactions',JSON.stringify(transactions)); localStorage.setItem('transactionCount',transactions.length);
    const pdfDownloaded=downloadTransactionPDF(transaction);
    messageEl.textContent=pdfDownloaded?'Transaction added and PDF downloaded.':'Transaction added successfully.'; messageEl.className='text-sm text-emerald-600';
    setTimeout(()=>{modal.classList.remove('open');form.reset();items.length=0;messageEl.className='text-sm hidden';render();},700);
  });
}

function initTransactionPage(){
  const body=document.getElementById('transactionTableBody');
  if(!body)return;
  const transactions=JSON.parse(localStorage.getItem('transactions')||'[]');
  body.innerHTML=transactions.length?transactions.map(transaction=>`<tr><td class="py-3 pr-4 font-medium text-slate-700">${transaction.id}</td><td class="py-3 pr-4">${transaction.customer}</td><td class="py-3 pr-4 text-slate-500">${transaction.date}</td><td class="py-3 pr-4 font-medium">${formatPKR(transaction.amount)}</td><td class="py-3"><span class="badge badge-green"><span class="badge-dot"></span>Added</span></td></tr>`).join(''):'<tr><td colspan="5" class="py-10 text-center text-slate-400">No transactions added yet. Add one from the dashboard.</td></tr>';
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
  initTransactions();
  initTransactionPage();
  initCharts();
  initTableSearch('customerSearch','customerTableBody');
  initTableSearch('productSearch','productTableBody');
});
