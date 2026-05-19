const STOPWORDS = new Set([
    "que","como","para","los","las","una","unos","unas","este","esta","esto",
    "entre","otras","cosas","cuando","porque","sobre","desde","donde","cuya",
    "pero","mas","sino","aunque","todo","toda","todos","todas","tiene","tienen"
]);

function limpiarEnunciado(t) {
    return String(t || "").replace(/\s+/g, " ").trim();
}

function recortar(t, max = 220) {
    const s = limpiarEnunciado(t);
    if (s.length <= max) return s;
    return s.slice(0, max - 1).trimEnd() + "...";
}

function extraerRespuestaCorrecta(p) {
    if (typeof p.correcta === "number" && Array.isArray(p.opciones)) {
        return p.opciones[p.correcta];
    }
    return p.opciones?.[0] || "";
}

function quitarPreguntaDeRespuesta(pregunta, respuesta) {
    const limpia = String(respuesta || "")
        .replace(pregunta, "")
        .replace(/^[\s:¿?.-]+/, "")
        .trim();
    return limpia || respuesta;
}

function palabraClave(texto) {
    const palabras = String(texto || "")
        .toLowerCase()
        .replace(/[¿?.,;:()"]/g, " ")
        .split(/\s+/)
        .filter(p => p.length > 4 && !STOPWORDS.has(p));
    return palabras.sort((a, b) => b.length - a.length)[0] || null;
}

function generarTest(preguntas, n) {
    return preguntas.slice(0, n).map((p, i) => {
        const opciones = (p.opciones || []).map(o => recortar(quitarPreguntaDeRespuesta(p.pregunta, o), 200));
        return {
            id: `t${i + 1}`,
            tipo: "test",
            pregunta: limpiarEnunciado(p.pregunta),
            opciones,
            correcta: typeof p.correcta === "number" ? p.correcta : 0
        };
    });
}

function generarVF(preguntas, n) {
    return preguntas.slice(0, n).map((p, i) => {
        const respuestaReal = recortar(quitarPreguntaDeRespuesta(p.pregunta, extraerRespuestaCorrecta(p)), 220);
        const esVerdadero = Math.random() < 0.5;
        let afirmacion = respuestaReal;
        if (!esVerdadero) {
            const distractor = (p.opciones || []).find((_, idx) => idx !== p.correcta);
            afirmacion = distractor
                ? recortar(quitarPreguntaDeRespuesta(p.pregunta, distractor), 220)
                : respuestaReal.replace(/\bno\b/i, "") + " (falso)";
        }
        return {
            id: `vf${i + 1}`,
            tipo: "vf",
            pregunta: limpiarEnunciado(p.pregunta),
            afirmacion,
            correcta: esVerdadero ? 0 : 1,
            opciones: ["Verdadero", "Falso"]
        };
    });
}

function generarMatching(preguntas, n) {
    const pares = preguntas.slice(0, n).map(p => ({
        izquierda: limpiarEnunciado(p.pregunta).replace(/[¿?]/g, ""),
        derecha: recortar(quitarPreguntaDeRespuesta(p.pregunta, extraerRespuestaCorrecta(p)), 160)
    }));
    return [{
        id: "m1",
        tipo: "matching",
        instruccion: "Une cada pregunta con su respuesta correcta",
        pares
    }];
}

function generarFill(preguntas, n) {
    return preguntas.slice(0, n).map((p, i) => {
        const correcta = recortar(quitarPreguntaDeRespuesta(p.pregunta, extraerRespuestaCorrecta(p)), 220);
        const palabra = palabraClave(correcta);
        let conHueco = correcta;
        let respuesta = palabra || "";

        if (palabra) {
            const re = new RegExp(`\\b${palabra}\\b`, "i");
            conHueco = correcta.replace(re, "_____");
        } else {
            const tokens = correcta.split(" ");
            const mitad = Math.floor(tokens.length / 2);
            respuesta = tokens[mitad] || "";
            tokens[mitad] = "_____";
            conHueco = tokens.join(" ");
        }

        return {
            id: `f${i + 1}`,
            tipo: "fill",
            pregunta: limpiarEnunciado(p.pregunta),
            enunciado: conHueco,
            correcta: respuesta.toLowerCase()
        };
    });
}

function generarActividades(preguntas, config) {
    const out = [];
    const pool = [...preguntas].sort(() => Math.random() - 0.5);

    if (config.test > 0) out.push(...generarTest(pool, config.test));
    if (config.vf > 0) out.push(...generarVF(pool, config.vf));
    if (config.matching > 0) out.push(...generarMatching(pool, config.matching));
    if (config.fill > 0) out.push(...generarFill(pool, config.fill));

    return out;
}

module.exports = { generarActividades };
