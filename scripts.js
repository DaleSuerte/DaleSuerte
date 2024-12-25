const mandalasGrid = document.querySelector('.mandalas-grid');
const carritoItems = document.querySelector('#carrito-items');
const carritoTotal = document.querySelector('#carrito-total');
const horarioMensaje = document.querySelector('#horario-mensaje');

// Elementos para la paginación
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const paginaActualElem = document.getElementById('pagina-actual');
const totalPaginasElem = document.getElementById('total-paginas');

let currentPage = 1;
let itemsPerPage = 50;
let totalPages = 0;

let carrito = [];
let mandalas = [];

// Verificar autenticación (opcional)
function verificarAutenticacion() {
    const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
    if (!usuarioActual) {
        alert('Por favor, inicia sesión para continuar.');
        window.location.href = 'login.html';
    }
}

// Generar las mándalas (array)
function generarMandalas() {
    mandalas = Array.from({ length: 250 }, (_, i) => ({
        id: i + 1,
        img: `mandala${i + 1}.png`,
        disponible: true,
        compradoEnTurno: false
    }));

    // Calculamos cuántas páginas tendremos (250 / 50 = 5)
    totalPages = Math.ceil(mandalas.length / itemsPerPage);
    totalPaginasElem.textContent = totalPages;

    // Mostramos la primera página
    mostrarPagina(currentPage);
}

// Muestra las mándalas de la página actual
function mostrarPagina(pageNumber) {
    mandalasGrid.innerHTML = '';

    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = pageNumber * itemsPerPage;
    const mandalasPagina = mandalas.slice(startIndex, endIndex);

    mandalasPagina.forEach(mandala => {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('mandala-item');

        // Texto que indica el número de la mándala
        const numeroMandala = document.createElement('p');
        numeroMandala.textContent = `Mándala Nº: ${mandala.id}`;
        numeroMandala.style.fontWeight = 'bold';

        const img = document.createElement('img');
        img.src = mandala.img;
        img.alt = `Mándala ${mandala.id}`;

        const button = document.createElement('button');
        button.textContent = 'Añadir al Carrito';
        button.disabled = true; 

        button.addEventListener('click', () => {
            if (mandala.disponible) {
                addToCarrito(mandala.id, mandala.img);
                mandala.disponible = false;
                mandala.compradoEnTurno = true;
                button.disabled = true;
                button.textContent = 'Agotado';
            }
        });

        imgContainer.appendChild(numeroMandala);
        imgContainer.appendChild(img);
        imgContainer.appendChild(button);
        mandalasGrid.appendChild(imgContainer);

        mandala.button = button;
    });

    // Actualizamos la página actual en la interfaz
    paginaActualElem.textContent = pageNumber;
}

// Actualizar disponibilidad según horario
function actualizarDisponibilidad() {
    const now = new Date();
    const hour = now.getHours();

    let mensaje = '';

    if (hour >= 8 && hour < 10) {
        mensaje = 'Turno de compra activo: 08:00 - 10:00';
        desbloquearMandalas();
        activarMandalas();
    } else if (hour >= 10 && hour < 12) {
        mensaje = 'Turno de compra activo: 10:00 - 12:00';
        desbloquearMandalas();
        activarMandalas();
    } else if (hour >= 12 && hour < 14) {
        mensaje = 'Turno de compra activo: 12:00 - 14:00';
        desbloquearMandalas();
        activarMandalas();
    } else if (hour >= 14 && hour < 16) {
        mensaje = 'Turno de compra activo: 14:00 - 16:00';
        desbloquearMandalas();
        activarMandalas();
    } else {
        mensaje = 'Fuera de horario. Próximo turno a las 08:00.';
        desactivarMandalas();
    }

    horarioMensaje.textContent = mensaje;
}

// Desbloquear mándalas al iniciar un nuevo turno
function desbloquearMandalas() {
    mandalas.forEach(mandala => {
        if (mandala.compradoEnTurno) {
            mandala.disponible = true;
            mandala.compradoEnTurno = false;
        }
    });
}

// Activar mándalas para la compra
function activarMandalas() {
    // Solo activamos los botones que estén en la página actual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    const mandalasPagina = mandalas.slice(startIndex, endIndex);

    mandalasPagina.forEach(mandala => {
        if (mandala.disponible && mandala.button) {
            mandala.button.disabled = false;
            mandala.button.textContent = 'Añadir al Carrito';
        }
    });
}

// Desactivar mándalas fuera de horario
function desactivarMandalas() {
    // Solo desactivamos los botones de la página actual
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    const mandalasPagina = mandalas.slice(startIndex, endIndex);

    mandalasPagina.forEach(mandala => {
        if (mandala.button) {
            mandala.button.disabled = true;
            mandala.button.textContent = 'Fuera de horario';
        }
    });
}

// Añadir mándala al carrito
function addToCarrito(id, img) {
    carrito.push({ id, img, precio: 6.5 });
    actualizarCarrito();
}

// Actualizar el carrito
function actualizarCarrito() {
    carritoItems.innerHTML = '';

    if (carrito.length === 0) {
        carritoItems.innerHTML = '<p>Tu carrito está vacío.</p>';
    } else {
        carrito.forEach(item => {
            const itemContainer = document.createElement('div');
            const img = document.createElement('img');
            img.src = item.img;
            img.style.width = '50px';

            const precio = document.createElement('p');
            precio.textContent = `S/. ${item.precio.toFixed(2)}`;

            const numero = document.createElement('p');
            numero.textContent = `Número: ${item.id}`;

            itemContainer.appendChild(img);
            itemContainer.appendChild(precio);
            itemContainer.appendChild(numero);

            carritoItems.appendChild(itemContainer);
        });
    }

    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    carritoTotal.textContent = total.toFixed(2);
}

// Inicializar la página
function inicializarPagina() {
    verificarAutenticacion(); // si tu lógica de autenticación está activa
    generarMandalas();
    actualizarDisponibilidad();
    // Verificar horario cada minuto
    setInterval(actualizarDisponibilidad, 60000);
}

// Manejo del formulario de contacto
document.getElementById('formulario-contacto').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Gracias por tu mensaje. Nos pondremos en contacto contigo pronto.');
    e.target.reset();
});

// Controles de paginación
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        mostrarPagina(currentPage);
        actualizarDisponibilidad();
    }
});

nextPageBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        mostrarPagina(currentPage);
        actualizarDisponibilidad();
    }
});

// Llamar la función de inicialización
inicializarPagina();

// Al final de tu archivo scripts.js (o donde prefieras)
document.getElementById('comprar-btn').addEventListener('click', function() {
    // Aquí redirigimos al usuario a la página de pago
    window.location.href = 'pago.html';
});
