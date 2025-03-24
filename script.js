const usuarioValido = "TIC";
const contraseñaValida = "unamunoJuegos";

// Manejo del formulario de login
document.getElementById("formulario-login").addEventListener("submit", function (e) {
    e.preventDefault();
    const usuario = document.getElementById("usuario").value;
    const contraseña = document.getElementById("contraseña").value;

    if (usuario === usuarioValido && contraseña === contraseñaValida) {
        alert("Autenticación exitosa. Ahora puedes agregar juegos.");
        document.getElementById("formulario-login").style.display = "none";
        document.getElementById("formulario-juego").style.display = "block";
    } else {
        alert("Usuario o contraseña incorrectos.");
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
        videoescritura: document.getElementById("videoescritura").checked,
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
    const respuesta = await fetch("http://localhost:3000/juegos");
    const juegos = await respuesta.json();
    const lista = document.getElementById("lista-juegos");

    lista.innerHTML = "";
    juegos
        .filter(j => j.nombre.toLowerCase().includes(filtro) || j.capacidades.some(c => c.toLowerCase().includes(filtro)))
        .forEach(juego => {
            let li = document.createElement("li");
            li.innerHTML = `<img src="${juego.foto}" width="100"><br>
                <strong>${juego.nombre}</strong> (${juego.jugadores_min}-${juego.jugadores_max} jugadores) <br>
                ${juego.descripcion} <br>
                <a href="${juego.video}" target="_blank">Ver Tutorial</a> <br>
                <em>Capacidades: ${juego.capacidades.join(", ")}</em>`;
            lista.appendChild(li);
        });
}

// Cargar juegos al inicio
document.getElementById("filtro").addEventListener("input", mostrarJuegos);
mostrarJuegos();
