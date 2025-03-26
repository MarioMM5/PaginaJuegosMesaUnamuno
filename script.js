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

    // Obtener las capacidades seleccionadas
    const capacidades = [...document.querySelectorAll("fieldset input:checked")].map(el => el.value);

    // Obtener el valor del radio button seleccionado para numeración requerida
    const numeracionRequerida = document.querySelector('input[name="numeracion"]:checked')?.value || '';

    const nuevoJuego = {
        nombre: document.getElementById("nombre").value,
        foto: document.getElementById("foto").value,
        descripcion: document.getElementById("descripcion").value,
        video: document.getElementById("video").value,
        videoescritura: document.getElementById("videoescritura").checked,
        cantidad: document.getElementById("cantidad").value,
        jugadores_min: document.getElementById("jugadores_min").value,
        jugadores_max: document.getElementById("jugadores_max").value,
        capacidades: capacidades,
        numeracion_requerida: numeracionRequerida // Asignar el valor seleccionado
    };

    try {
        const respuesta = await fetch("http://localhost:3000/agregar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoJuego)
        });

        if (respuesta.ok) {
            alert("Juego agregado correctamente");
            mostrarJuegos();
            this.reset(); // Reinicia el formulario
        } else {
            alert(respuesta.statusText || "Hubo un error al intentar guardar el juego. Intenta nuevamente.");
        }
    } catch (error) {
        alert("Hubo un error al intentar guardar el juego. Intenta nuevamente.");
    }
});
function numeracionToNumber(numeracion) {
    switch (numeracion) {
        case "Hasta 5":
            return 5;
        case "Hasta 10":
            return 10;
        case "A partir de 10":
            return 15; // Asumimos que "A partir de 10" tiene un valor mayor
        default:
            return Infinity; // Si no hay numeración, asumimos que no tiene límite
    }
}
// Mostrar juegos en la lista
async function mostrarJuegos() {
    const filtro = document.getElementById("filtro").value.toLowerCase();
    const requiereLectoescritura = document.getElementById("filtro-lectoescritura").checked;
    const jugadoresFiltro = document.getElementById("filtro-jugadores").value;

    // Obtener el valor del radio button seleccionado para numeración requerida
    const numeracionFiltro = document.querySelector('input[name="filtro-numeracion"]:checked')?.value || '';

    // Obtener las capacidades seleccionadas
    const capacidadesSeleccionadas = [
        "memoria", "atencion", "visoespacial", "colores", "pensamiento-computacional", "circuitos"
    ].filter(id => document.getElementById(`filtro-${id}`).checked);

    try {
        const respuesta = await fetch("http://localhost:3000/juegos");
        const juegos = await respuesta.json();
        const lista = document.getElementById("lista-juegos");

        lista.innerHTML = ""; // Limpiar la lista antes de mostrar los juegos

        juegos
            .filter(j => j.nombre.toLowerCase().includes(filtro)) // Filtrar por nombre
            .filter(j => !requiereLectoescritura || j.videoescritura) // Filtrar por lectoescritura
            .filter(j => {
                if (!jugadoresFiltro) return true; // Si no hay filtro de jugadores, mostrar todos
                return j.jugadores_min <= jugadoresFiltro && j.jugadores_max >= jugadoresFiltro; // Filtrar por número de jugadores
            })
            .filter(j => {
                if (numeracionFiltro === '') return true; // Si no hay filtro de numeración, mostrar todos

                // Convertir los valores de numeración a números para comparar
                const numeracionJuego = numeracionToNumber(j.numeracion_requerida);
                const numeracionSeleccionada = numeracionToNumber(numeracionFiltro);

                // Mostrar juegos con numeración menor o igual al filtro seleccionado
                return numeracionJuego <= numeracionSeleccionada;
            })
            .filter(j => {
                if (capacidadesSeleccionadas.length === 0) return true; // Si no hay capacidades seleccionadas, mostrar todos
                // Normalizar las capacidades para comparar correctamente
                const capacidadesJuego = j.capacidades.map(c => c.toLowerCase());
                // Verificar que todas las capacidades seleccionadas estén presentes en el juego
                return capacidadesSeleccionadas.every(capacidad => capacidadesJuego.includes(capacidad.toLowerCase()));
            })
            .forEach(juego => {
                let li = document.createElement("li");
                li.innerHTML = `
                    <img src="${juego.foto}" width="100"><br>
                    <strong>${juego.nombre}</strong> (${juego.jugadores_min}-${juego.jugadores_max} jugadores)<br>
                    ${juego.descripcion} <br>
                    <a href="${juego.video}" target="_blank">Ver Tutorial</a> <br>
                    <em>Capacidades: ${juego.capacidades.join(", ")}</em><br>
                    <strong>${juego.videoescritura ? "📝 Requiere lectoescritura" : "✅ No requiere lectoescritura"}</strong><br>
                    <strong>Numeración requerida: ${juego.numeracion_requerida || "No especificada"}</strong>`;
                lista.appendChild(li);
            });
    } catch (error) {
        console.error("Error al obtener los juegos:", error);
        alert("Hubo un error al cargar los juegos. Intenta nuevamente.");
    }
}

// Añadir eventListeners para actualizar la lista al cambiar los filtros
document.querySelectorAll('input[type="checkbox"], input[type="radio"], input[type="text"], input[type="number"]').forEach(input => {
    input.addEventListener("input", mostrarJuegos);
});

// Inicializar la lista de juegos al cargar la página
mostrarJuegos();