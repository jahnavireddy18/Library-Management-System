function startProcess(type) {
  let loader = document.getElementById('loader-' + type);
  let msg = document.getElementById('msg-' + type);
  
  if(type === 'restore' && !confirm("WARNING: Overwrite current database?")) return;

  loader.style.display = 'flex';
  msg.style.display = 'none';

  setTimeout(() => {
    loader.style.display = 'none';
    msg.style.display = 'block';
    
    // Auto hide success msg
    setTimeout(() => { msg.style.display = 'none'; }, 4000);
  }, 2500);
}