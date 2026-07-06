// --- 1. MODO NATIVO (PROTEGIDO) ---
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => {
        const swBlob = new Blob([`self.addEventListener('fetch', (event) => { event.respondWith(fetch(event.request)); });`], { type: 'application/javascript' });
        navigator.serviceWorker.register(URL.createObjectURL(swBlob)).catch(err => console.error('Error SW:', err));
    });
}

// --- 2. SINCRONIZACIÓN FIREBASE (PROTEGIDA) ---
// Usamos la instancia global 'db' definida en tu HTML
if (typeof db !== 'undefined') {
    db.collection("metricas").doc("usuarios").onSnapshot(doc => { 
        const el = document.getElementById("vecinos-activos-contador");
        if(el && doc.exists) el.innerText = doc.data().activos || "0"; 
    });
    db.collection("metricas").doc("visitas").onSnapshot(doc => { 
        const el = document.getElementById("visitas-hoy-contador");
        if(el && doc.exists) el.innerText = doc.data().hoy || "0"; 
    });
    db.collection("metricas").doc("alertas_vias").onSnapshot(doc => { 
        const el = document.getElementById("texto-alerta-superior");
        if(el && doc.exists) el.innerText = doc.data().mensaje || "Vías en estado normal."; 
    });
    
    db.collection("metricas").doc("clima").onSnapshot(doc => {
        const t = document.getElementById("clima-temperatura");
        const v = document.getElementById("clima-viento");
        if (doc.exists) {
            if(t) t.innerHTML = `<i class="fa-solid fa-cloud-sun text-amber-400 mr-1"></i> Calima: ${doc.data().temperatura}°C`;
            if(v) v.innerHTML = `<i class="fa-solid fa-wind text-sky-400 mr-1"></i> Viento: ${doc.data().viento} nudos`;
        }
    });
}

// --- 3. LÓGICA DE INTERFAZ (RESTAURADA) ---
function calificarEstrellas(num) {
    const contenedor = document.querySelector('.text-slate-300.text-base.flex');
    const texto = document.getElementById("rating-texto");
    if (contenedor) {
        contenedor.querySelectorAll('i').forEach((est, i) => {
            est.classList.toggle('text-amber-400', i < num);
            est.classList.toggle('text-slate-300', i >= num);
        });
    }
    if (texto) texto.innerText = `¡Calificaste con ${num} estrellas!`;
}

function publicarAlertaComunidad() {
    const zona = document.getElementById("alerta-entrada")?.value;
    const msg = document.getElementById("alerta-mensaje")?.value.trim();
    if (!msg) return alert("Describe el inconveniente.");
    
    db.collection("reportes_vecinos").add({ zona, mensaje: msg, fecha: new Date().toISOString() })
    .then(() => { alert("Reporte enviado"); cerrarModalAlertas(); });
}

function procesarGuardadoRecomendado() {
    const nombre = document.getElementById("admin-rec-nombre")?.value;
    const desc = document.getElementById("admin-rec-desc")?.value;
    const img = document.getElementById("admin-rec-imagen")?.value;
    
    const recTitulo = document.getElementById("rec-titulo");
    const recDesc = document.getElementById("rec-desc");
    const recImg = document.getElementById("rec-imagen");
    
    if(recTitulo) recTitulo.innerText = nombre;
    if(recDesc) recDesc.innerText = desc;
    if(img && recImg) recImg.style.backgroundImage = `url('${img}')`;
    
    cerrarModalAdminRec();
}

// --- 4. FUNCIONES DE CONTROL ---
function abrirModalRegistro() { document.getElementById("modal-registro")?.classList.remove("hidden"); }
function cerrarModal() { document.getElementById("modal-registro")?.classList.add("hidden"); }
function abrirModalAlerta() { document.getElementById("modal-alerta")?.classList.remove("hidden"); }
function cerrarModalAlertas() { document.getElementById("modal-alerta")?.classList.add("hidden"); }
function verificarAccesoAdmin() { 
    if(prompt("Clave:") === "1234") document.getElementById("modal-admin-recomendado")?.classList.remove("hidden"); 
}
function cerrarModalAdminRec() { document.getElementById("modal-admin-recomendado")?.classList.add("hidden"); }
