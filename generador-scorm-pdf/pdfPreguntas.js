function extraerPreguntas(data) {

    if (Array.isArray(data)) {
        return data.map(p => p.pregunta);
    }

    if (typeof data === "string") {
        return data.match(/¿[^?]+\?/g) || [];
    }

    return [];
}

module.exports = extraerPreguntas;