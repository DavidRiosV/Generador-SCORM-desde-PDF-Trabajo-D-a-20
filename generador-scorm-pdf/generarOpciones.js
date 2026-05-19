function generarOpciones(texto, correcta) {

    if (!correcta || correcta === "undefined") {
        correcta = "No encontrada en el texto";
    }

    const frases = texto
        .split(".")
        .map(f => f.trim())
        .filter(f =>
            f.length > 30 &&
            f.length < 160 &&
            f !== correcta &&
            !f.includes("pdf") &&
            !f.includes("Índice") &&
            !f.includes("MANUAL") &&
            !f.includes("Boletín")
        );

    const distractores = [];

    for (const f of frases) {

        if (distractores.length >= 2) break;

        if (
            f !== correcta &&
            !f.toLowerCase().includes("consejería") &&
            !f.toLowerCase().includes("boletín")
        ) {
            distractores.push(f);
        }
    }

    while (distractores.length < 2) {
        distractores.push("No relacionada con el contenido");
    }

    return [correcta, ...distractores]
        .sort(() => Math.random() - 0.5);
}

module.exports = generarOpciones;