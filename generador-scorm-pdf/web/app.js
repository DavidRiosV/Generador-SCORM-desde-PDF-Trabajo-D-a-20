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

    function renderTest(a) {
        const h = document.createElement("p");
        h.className = "pregunta";
        h.textContent = a.pregunta;
        $cont.appendChild(h);

        const ul = document.createElement("ul");
        ul.className = "opciones";
        a.opciones.forEach((op, i) => {
            const li = document.createElement("li");
            li.textContent = op;
            li.dataset.idx = String(i);
            li.addEventListener("click", () => {
                if (estadoActual.comprobado) return;
                ul.querySelectorAll("li").forEach(x => x.classList.remove("seleccionada"));
                li.classList.add("seleccionada");
            });
            ul.appendChild(li);
        });
        $cont.appendChild(ul);

        $comp.onclick = () => {
            const sel = ul.querySelector("li.seleccionada");
            if (!sel) return;
            const idx = Number(sel.dataset.idx);
            const ok = idx === a.correcta;
            ul.querySelectorAll("li").forEach((li, i) => {
                li.style.cursor = "default";
                if (i === a.correcta) li.classList.add("correcta");
                if (i === idx && !ok) li.classList.add("incorrecta");
            });
            terminarPaso(ok);
        };
    }

    function renderVF(a) {
        const h = document.createElement("p");
        h.className = "pregunta";
        h.textContent = a.afirmacion;
        $cont.appendChild(h);

        const ul = document.createElement("ul");
        ul.className = "opciones";
        a.opciones.forEach((op, i) => {
            const li = document.createElement("li");
            li.textContent = op;
            li.dataset.idx = String(i);
            li.addEventListener("click", () => {
                if (estadoActual.comprobado) return;
                ul.querySelectorAll("li").forEach(x => x.classList.remove("seleccionada"));
                li.classList.add("seleccionada");
            });
            ul.appendChild(li);
        });
        $cont.appendChild(ul);

        $comp.onclick = () => {
            const sel = ul.querySelector("li.seleccionada");
            if (!sel) return;
            const idx = Number(sel.dataset.idx);
            const ok = idx === a.correcta;
            ul.querySelectorAll("li").forEach((li, i) => {
                if (i === a.correcta) li.classList.add("correcta");
                if (i === idx && !ok) li.classList.add("incorrecta");
            });
            terminarPaso(ok);
        };
    }

    function renderMatching(a) {
        const h = document.createElement("p");
        h.className = "pregunta";
        h.textContent = a.instruccion || "Une cada elemento con su pareja";
        $cont.appendChild(h);

        const pares = a.pares;
        const derecha = pares.map((p, i) => ({ texto: p.derecha, original: i }))
            .sort(() => Math.random() - 0.5);

        const cont = document.createElement("div");
        cont.className = "matching";
        const colI = document.createElement("div");
        colI.className = "columna";
        const colD = document.createElement("div");
        colD.className = "columna";

        pares.forEach((p, i) => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "item";
            b.dataset.idx = String(i);
            b.dataset.lado = "izq";
            b.textContent = p.izquierda;
            colI.appendChild(b);
        });

        derecha.forEach(d => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "item";
            b.dataset.idx = String(d.original);
            b.dataset.lado = "der";
            b.textContent = d.texto;
            colD.appendChild(b);
        });

        cont.appendChild(colI);
        cont.appendChild(colD);
        $cont.appendChild(cont);

        let activoIzq = null;
        let activoDer = null;
        const unidos = new Set();
        const aciertosLocal = { ok: 0, total: pares.length };

        function intentarUnir() {
            if (activoIzq == null || activoDer == null) return;
            const $i = colI.querySelector(`[data-idx="${activoIzq}"]`);
            const $d = colD.querySelector(`[data-idx="${activoDer}"]`);
            if (activoIzq === activoDer) {
                $i.classList.add("unido");
                $d.classList.add("unido");
                $i.classList.remove("activo");
                $d.classList.remove("activo");
                $i.disabled = true;
                $d.disabled = true;
                unidos.add(activoIzq);
                aciertosLocal.ok++;
                if (unidos.size === pares.length) terminarPaso(true);
            } else {
                $i.classList.add("error");
                $d.classList.add("error");
                setTimeout(() => {
                    $i.classList.remove("error", "activo");
                    $d.classList.remove("error", "activo");
                }, 600);
            }
            activoIzq = null;
            activoDer = null;
        }

        colI.addEventListener("click", e => {
            const b = e.target.closest(".item");
            if (!b || b.disabled || estadoActual.comprobado) return;
            colI.querySelectorAll(".item.activo").forEach(x => x.classList.remove("activo"));
            b.classList.add("activo");
            activoIzq = Number(b.dataset.idx);
            intentarUnir();
        });

        colD.addEventListener("click", e => {
            const b = e.target.closest(".item");
            if (!b || b.disabled || estadoActual.comprobado) return;
            colD.querySelectorAll(".item.activo").forEach(x => x.classList.remove("activo"));
            b.classList.add("activo");
            activoDer = Number(b.dataset.idx);
            intentarUnir();
        });

        $comp.onclick = () => {
            terminarPaso(aciertosLocal.ok === aciertosLocal.total);
        };
    }

    function renderFill(a) {
        const h = document.createElement("p");
        h.className = "pregunta";
        h.textContent = a.pregunta;
        $cont.appendChild(h);

        const div = document.createElement("div");
        div.className = "fill";
        const partes = a.enunciado.split("_____");
        partes.forEach((parte, i) => {
            const span = document.createElement("span");
            span.textContent = parte + " ";
            div.appendChild(span);
            if (i < partes.length - 1) {
                const inp = document.createElement("input");
                inp.type = "text";
                inp.dataset.role = "respuesta";
                div.appendChild(inp);
            }
        });
        $cont.appendChild(div);

        $comp.onclick = () => {
            const inp = div.querySelector("input");
            if (!inp || !inp.value.trim()) return;
            const ok = inp.value.trim().toLowerCase() === String(a.correcta).toLowerCase();
            inp.style.borderColor = ok ? "var(--verde)" : "var(--rojo)";
            if (!ok) {
                const fb = document.createElement("p");
                fb.className = "feedback ko";
                fb.textContent = "Respuesta correcta: " + a.correcta;
                $cont.appendChild(fb);
            }
            terminarPaso(ok);
        };
    }

    function terminarPaso(ok) {
        estadoActual.comprobado = true;
        estadoActual.acierto = ok;
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
        const pct = total > 0 ? Math.round((aciertos / total) * 100) : 0;
        document.getElementById("aciertos").textContent = aciertos;
        document.getElementById("total").textContent = total;
        document.getElementById("porcentaje").textContent = pct;
        const estado = document.getElementById("estado");
        const aprobado = pct >= APROBADO_MIN;
        estado.textContent = aprobado ? "Curso superado" : "No superado";
        estado.className = aprobado ? "aprobado" : "suspenso";

        if (window.SCORM) {
            window.SCORM.guardarNota(pct, aprobado);
            window.SCORM.finish();
        }
    }

    document.getElementById("reiniciar").onclick = () => {
        indice = 0;
        aciertos = 0;
        $resul.classList.add("oculto");
        $main.style.display = "";
        if (window.SCORM) window.SCORM.init();
        render();
    };

    window.addEventListener("beforeunload", () => {
        if (window.SCORM) window.SCORM.finish();
    });

    if (actividades.length === 0) {
        $cont.innerHTML = "<p>No hay actividades cargadas.</p>";
        $comp.disabled = true;
    } else {
        render();
    }
})();
