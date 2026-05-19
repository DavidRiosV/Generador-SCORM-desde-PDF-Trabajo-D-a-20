function buscarRespuesta(texto, pregunta) {

    const frases = texto
        .split(".")
        .map(f => f.trim())
        .filter(f =>
            f.length > 30 &&
            f.length < 250 &&
            !f.match(/^\d+$/)
        );

    const stopWords = ["que", "como", "para", "los", "las", "una", "unos", "unas", "este", "esta", "esto", "entre", "otras", "cosas"];

    const palabrasClave = pregunta
        .replace(/[¿?]/g, "")
        .toLowerCase()
        .split(" ")
        .filter(p => p.length > 3 && !stopWords.includes(p));

    let mejor = "";
    let maxScore = 0;

    for (const frase of frases) {

        const f = frase.toLowerCase();

        let score = 0;

        for (const p of palabrasClave) {

            if (f.includes(p)) {
                score += 2;
            }

            if (f.includes(p.slice(0, 4))) {
                score += 1;
            }
        }

        if (f.includes("es") || f.includes("consiste") || f.includes("permite")) {
            score += 1;
        }

        if (
            f.includes("entre otras cosas") ||
            f.includes("te enseñamos") ||
            f.includes("está escrito") ||
            f.includes("logo") ||
            f.includes("eu diseño")
        ) {
            score -= 5;
        }

        if (score > maxScore) {
            maxScore = score;
            mejor = frase;
        }
    }

    return mejor.trim();
}

module.exports = buscarRespuesta;