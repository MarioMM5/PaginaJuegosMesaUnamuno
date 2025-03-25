const usuarioValido = "TIC";
const contraseñaValida = "unamunoJuegos";

function togglePassword() {
    const contraseñaField = document.getElementById("contraseña");
    const eyeIcon = document.getElementById("toggle-contraseña");
    
    if (contraseñaField.type === "password") {
        contraseñaField.type = "text"; // Cambia a texto para mostrar la contraseña
        eyeIcon.textContent = "🙈"; // Cambia el ícono a un ícono de "ojo cerrado"
    } else {
        contraseñaField.type = "password"; // Vuelve a ser contraseña para ocultarla
        eyeIcon.textContent = "👁️"; // Vuelve el ícono a un "ojo abierto"
    }
}

// Manejo del formulario de login
document.getElementById("formulario-login").addEventListener("submit", function (e) {
    e.preventDefault();
    const usuario = document.getElementById("usuario").value;
    const contraseña = document.getElementById("contraseña").value;

    if (usuario === usuarioValido && contraseña === contraseñaValida) {
        alert("Autenticación exitosa. Ahora puedes agregar y eliminar juegos.");
        document.getElementById("formulario-login").style.display = "none";
        document.getElementById("formulario-juego").style.display = "block";
        document.getElementById("formulario-eliminar").style.display = "block"; // Mostrar el formulario de eliminación
    } else {
        alert("Usuario o contraseña incorrectos.");
    }
});

// Manejo del formulario de eliminación
document.getElementById("formulario-eliminar").addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombreJuego = document.getElementById("nombre-eliminar").value;

    if (!nombreJuego) {
        alert("Por favor, ingresa el nombre del juego.");
        return;
    }

    try {
        // Verificamos si el juego existe en la base de datos
        const respuesta = await fetch(`http://localhost:3000/juegos`);
        const juegos = await respuesta.json();
        const juegoExistente = juegos.find(juego => juego.nombre.toLowerCase() === nombreJuego.toLowerCase());

        if (!juegoExistente) {
            alert("No se encontró un juego con ese nombre.");
            return;
        }

        // Pedir confirmación al usuario antes de borrar
        const confirmacion = confirm(`¿Estás seguro de que quieres eliminar el juego "${nombreJuego}"? Esta acción no se puede deshacer.`);

        if (confirmacion) {
            // Procedemos a eliminar el juego
            const respuestaEliminar = await fetch(`http://localhost:3000/eliminar/${encodeURIComponent(nombreJuego)}`, {
                method: "DELETE",
            });

            if (respuestaEliminar.ok) {
                alert("Juego eliminado correctamente");
                mostrarJuegos(); // Refresca la lista de juegos
                document.getElementById("nombre-eliminar").value = ''; // Limpia el campo
            } else {
                const errorData = await respuestaEliminar.json();
                alert(errorData.error || "Error al eliminar el juego. Verifica que el nombre esté correcto.");
            }
        } else {
            alert("El juego no fue eliminado.");
        }
    } catch (error) {
        alert("Hubo un error al intentar eliminar el juego. Intenta nuevamente.");
    }
});

// Manejo del formulario de juegos
document.getElementById("formulario-juego").addEventListener("submit", async function (e) {
    e.preventDefault();

    const capacidades = [...document.querySelectorAll("fieldset input:checked")].map(el => el.value);

    const nuevoJuego = {
        nombre: document.getElementById("nombre").value,
        foto: document.getElementById("foto").value,
        descripcion: document.getElementById("descripcion").value,
        video: document.getElementById("video").value,
        videoescritura: document.getElementById("videoescritura").checked, // Ahora es true/false correctamente
        cantidad: document.getElementById("cantidad").value,
        jugadores_min: document.getElementById("jugadores_min").value,
        jugadores_max: document.getElementById("jugadores_max").value,
        capacidades: capacidades
    };

    const respuesta = await fetch("http://localhost:3000/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoJuego)
    });

    if (respuesta.ok) {
        alert("Juego agregado correctamente");
        mostrarJuegos();
        this.reset();
    } else {
        alert("Error al guardar el juego");
    }
});

// Mostrar juegos en la lista
async function mostrarJuegos() {
    const filtro = document.getElementById("filtro").value.toLowerCase();
    const requiereLectoescritura = document.getElementById("filtro-lectoescritura").checked;
    const jugadoresFiltro = document.getElementById("filtro-jugadores").value;

    // Obtener las capacidades seleccionadas
    const capacidadesSeleccionadas = [
        "memoria", "atencion", "visoespacial", "colores", "pensamiento-computacional", "circuitos"
    ]
    .filter(id => document.getElementById(`filtro-${id}`).checked);

    const respuesta = await fetch("http://localhost:3000/juegos");
    const juegos = await respuesta.json();
    const lista = document.getElementById("lista-juegos");

    lista.innerHTML = "";
    juegos
        .filter(j => {
            // Filtra por nombre o capacidad
            const juegoContieneFiltro = j.nombre.toLowerCase().includes(filtro) || j.capacidades.some(c => c.toLowerCase().includes(filtro));

            // Filtra por lectoescritura
            const juegoRequiereLectoescritura = !requiereLectoescritura || j.videoescritura;

            // Filtra por número de jugadores
            const juegoCumpleJugadores = !jugadoresFiltro || (j.jugadores_min <= jugadoresFiltro && j.jugadores_max >= jugadoresFiltro);

            // Filtra por capacidades seleccionadas
            const juegoContieneCapacidades = capacidadesSeleccionadas.length === 0 || capacidadesSeleccionadas.some(c => j.capacidades.map(cap => cap.toLowerCase()).includes(c));

            return juegoContieneFiltro && juegoRequiereLectoescritura && juegoCumpleJugadores && juegoContieneCapacidades;
        })
        .forEach(juego => {
            let li = document.createElement("li");
            li.innerHTML = `<img src="${juego.foto}" width="100"><br>
                <strong>${juego.nombre}</strong> (${juego.jugadores_min}-${juego.jugadores_max} jugadores)<br>
                ${juego.descripcion} <br>
                <a href="${juego.video}" target="_blank">Ver Tutorial</a> <br>
                <em>Capacidades: ${juego.capacidades.join(", ")}</em><br>
                <strong>${juego.videoescritura ? "📝 Requiere lectoescritura" : "✅ No requiere lectoescritura"}</strong>`;
            lista.appendChild(li);
        });
}

// Cargar juegos al inicio
document.getElementById("filtro").addEventListener("input", mostrarJuegos);
document.getElementById("filtro-lectoescritura").addEventListener("change", mostrarJuegos);
document.getElementById("filtro-jugadores").addEventListener("input", mostrarJuegos);

// Agregar evento de cambio para las capacidades
const capacidadesCheckboxes = document.querySelectorAll(".capacidades-filtro input[type='checkbox']");
capacidadesCheckboxes.forEach(checkbox => {
    checkbox.addEventListener("change", mostrarJuegos);
});

mostrarJuegos();
