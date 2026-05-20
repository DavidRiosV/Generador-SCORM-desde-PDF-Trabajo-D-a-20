(function () {
    "use strict";

    const APROBADO_MIN = 50;
    const actividades = window.ACTIVIDADES || [];
    const titulo = window.CURSO_TITULO || "Curso";

    document.getElementById("titulo").textContent = titulo;
    document.getElementById("pasoTotal").textContent = actividades.length;
    document.title = titulo;

    let indice = 0;
    let aciertos = 0;
    let estadoActual = { comprobado: false, acierto: false };

    const $cont = document.getElementById("actividad");
    const $comp = document.getElementById("comprobar");
    const $sig = document.getElementById("siguiente");
    const $resul = document.getElementById("resultado");
    const $main = document.getElementById("contenedor");
    const $paso = document.getElementById("pasoActual");

    if (window.SCORM) window.SCORM.init();

    function render() {
        estadoActual = { comprobado: false, acierto: false };
        $comp.disabled = false;
        $sig.disabled = true;

        if (indice >= actividades.length) return finalizar();

        $paso.textContent = indice + 1;
        const a = actividades[indice];
        $cont.innerHTML = "";

        if (a.tipo === "test") renderTest(a);
        else if (a.tipo === "vf") renderVF(a);
        else if (a.tipo === "matching") renderMatching(a);
        else if (a.tipo === "fill") renderFill(a);
    }

    // ---------------- TEST ----------------
    function renderTest(a) {
        const p = document.createElement("p");
        p.className = "pregunta";
        p.textContent = a.pregunta;
        $cont.appendChild(p);

        const ul = document.createElement("ul");
        ul.className = "opciones";

        a.opciones.forEach((op, i) => {
            const li = document.createElement("li");
            li.textContent = op;
            li.dataset.i = i;

            li.onclick = () => {
                if (estadoActual.comprobado) return;
                ul.querySelectorAll("li").forEach(x => x.classList.remove("seleccionada"));
                li.classList.add("seleccionada");
            };

            ul.appendChild(li);
        });

        $cont.appendChild(ul);

        $comp.onclick = () => {
            const sel = ul.querySelector(".seleccionada");
            if (!sel) return;

            const idx = Number(sel.dataset.i);
            const ok = idx === a.correcta;

            ul.querySelectorAll("li").forEach((li, i) => {
                if (i === a.correcta) li.classList.add("correcta");
                if (i === idx && !ok) li.classList.add("incorrecta");
            });

            terminarPaso(ok);
        };
    }

    // ---------------- VF ----------------
    function renderVF(a) {
        const p = document.createElement("p");
        p.className = "pregunta";
        p.textContent = a.afirmacion;
        $cont.appendChild(p);

        const ul = document.createElement("ul");
        ul.className = "opciones";

        a.opciones.forEach((op, i) => {
            const li = document.createElement("li");
            li.textContent = op;
            li.dataset.i = i;

            li.onclick = () => {
                if (estadoActual.comprobado) return;
                ul.querySelectorAll("li").forEach(x => x.classList.remove("seleccionada"));
                li.classList.add("seleccionada");
            };

            ul.appendChild(li);
        });

        $cont.appendChild(ul);

        $comp.onclick = () => {
            const sel = ul.querySelector(".seleccionada");
            if (!sel) return;

            const idx = Number(sel.dataset.i);
            const ok = idx === a.correcta;

            ul.querySelectorAll("li").forEach((li, i) => {
                if (i === a.correcta) li.classList.add("correcta");
                if (i === idx && !ok) li.classList.add("incorrecta");
            });

            terminarPaso(ok);
        };
    }

    // ---------------- MATCHING CON LÍNEAS ----------------
    function renderMatching(a) {
        const titulo = document.createElement("p");
        titulo.className = "pregunta";
        titulo.textContent = a.instruccion || "Une cada elemento con su pareja";
        $cont.appendChild(titulo);

        const container = document.createElement("div");
        container.className = "matching-container";

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.classList.add("matching-svg");

        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "10");
        marker.setAttribute("refX", "8");
        marker.setAttribute("refY", "3");
        marker.setAttribute("orient", "auto");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M0,0 L10,3 L0,6 Z");
        path.setAttribute("fill", "#2563eb");
        marker.appendChild(path);
        defs.appendChild(marker);
        svg.appendChild(defs);

        const content = document.createElement("div");
        content.className = "matching-content";

        const colI = document.createElement("div");
        const colD = document.createElement("div");
        colI.className = "matching-columna";
        colD.className = "matching-columna";

        content.appendChild(colI);
        content.appendChild(colD);
        container.appendChild(svg);
        container.appendChild(content);
        $cont.appendChild(container);

        const pares = a.pares || [];
        const derecha = pares
            .map((par, index) => ({ texto: par.derecha, id: index }))
            .sort(() => Math.random() - 0.5);

        let activoIzq = null;
        const conexiones = new Map();

        function limpiarLineas() {
            svg.querySelectorAll(".linea-conexion").forEach(line => line.remove());
        }

        function dibujarLinea(izqEl, derEl, color) {
            const contRect = container.getBoundingClientRect();
            const r1 = izqEl.getBoundingClientRect();
            const r2 = derEl.getBoundingClientRect();

            const x1 = r1.right - contRect.left;
            const y1 = r1.top + r1.height / 2 - contRect.top;
            const x2 = r2.left - contRect.left;
            const y2 = r2.top + r2.height / 2 - contRect.top;

            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1);
            line.setAttribute("y1", y1);
            line.setAttribute("x2", x2);
            line.setAttribute("y2", y2);
            line.setAttribute("stroke", color);
            line.setAttribute("stroke-width", "3");
            line.setAttribute("marker-end", "url(#arrowhead)");
            line.setAttribute("class", "linea-conexion");
            svg.appendChild(line);
        }

        function redibujarLineas() {
            limpiarLineas();
            conexiones.forEach((info, izqId) => {
                const izqEl = colI.querySelector(`[data-id="${izqId}"]`);
                const derEl = colD.querySelector(`[data-id="${info.derId}"]`);
                if (izqEl && derEl) {
                    dibujarLinea(izqEl, derEl, info.color);
                }
            });
        }

        function actualizarClases() {
            colI.querySelectorAll(".item").forEach(el => {
                el.classList.remove("unido", "error");
            });
            colD.querySelectorAll(".item").forEach(el => {
                el.classList.remove("unido", "error");
            });

            conexiones.forEach((info, izqId) => {
                const izqEl = colI.querySelector(`[data-id="${izqId}"]`);
                const derEl = colD.querySelector(`[data-id="${info.derId}"]`);
                if (!izqEl || !derEl) return;

                if (info.color === "#16a34a") {
                    izqEl.classList.add("unido");
                    derEl.classList.add("unido");
                } else {
                    izqEl.classList.add("error");
                    derEl.classList.add("error");
                }
            });
        }

        pares.forEach((par, index) => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "item";
            boton.textContent = par.izquierda;
            boton.dataset.id = index;

            boton.addEventListener("click", () => {
                if (estadoActual.comprobado) return;
                colI.querySelectorAll(".item").forEach(el => el.classList.remove("activo"));
                boton.classList.add("activo");
                activoIzq = index;
            });

            colI.appendChild(boton);
        });

        derecha.forEach(dato => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "item";
            boton.textContent = dato.texto;
            boton.dataset.id = dato.id;

            boton.addEventListener("click", () => {
                if (estadoActual.comprobado) return;
                if (activoIzq === null) return;

                const leftId = activoIzq;
                const izqEl = colI.querySelector(`[data-id="${leftId}"]`);
                const derEl = boton;
                const esCorrecta = leftId === dato.id;
                const color = esCorrecta ? "#16a34a" : "#dc2626";

                conexiones.set(leftId, { derId: dato.id, color });
                redibujarLineas();
                actualizarClases();

                activoIzq = null;
                colI.querySelectorAll(".item").forEach(el => el.classList.remove("activo"));
            });

            colD.appendChild(boton);
        });
    }

    // ---------------- FILL ----------------
    function renderFill(a) {
        const p = document.createElement("p");
        p.className = "pregunta";
        p.textContent = a.pregunta;
        $cont.appendChild(p);

        const div = document.createElement("div");
        div.className = "fill";

        const partes = a.enunciado.split("_____");

        partes.forEach((t, i) => {
            div.appendChild(document.createTextNode(t));

            if (i < partes.length - 1) {
                const inp = document.createElement("input");
                div.appendChild(inp);
            }
        });

        $cont.appendChild(div);

        $comp.onclick = () => {
            const inp = div.querySelector("input");
            const ok = inp.value.trim().toLowerCase() === String(a.correcta).toLowerCase();
            inp.style.borderColor = ok ? "var(--verde)" : "var(--rojo)";
            terminarPaso(ok);
        };
    }

    // ---------------- LOGICA ----------------
    function terminarPaso(ok) {
        estadoActual.comprobado = true;
        if (ok) aciertos++;

        $comp.disabled = true;
        $sig.disabled = false;
    }

    $sig.onclick = () => {
        indice++;
        render();
    };

    function finalizar() {
        $main.style.display = "none";
        $resul.classList.remove("oculto");

        const total = actividades.length;
        const pct = Math.round((aciertos / total) * 100);

        document.getElementById("aciertos").textContent = aciertos;
        document.getElementById("total").textContent = total;
        document.getElementById("porcentaje").textContent = pct;

        const estado = document.getElementById("estado");
        estado.textContent = pct >= APROBADO_MIN ? "Curso superado" : "No superado";
        estado.className = pct >= APROBADO_MIN ? "aprobado" : "suspenso";
    }

    if (actividades.length) render();
})();
