function limpiarTexto(texto) {

    return texto

        .replace(/pdf\s*\d+\/\d+\/\d+/gi, "")
        .replace(/\d{1,4}:\d{2}/g, "")
        .replace(/Índice[\s\S]*?(?=¿)/gi, "")
        .replace(/Módulo\s*\d+/gi, "")
        .replace(/Manual manipulador alimentos/gi, "")
        .replace(/Firma:.*\n/g, "")

        .replace(/Agencia.*?/gi, "")
        .replace(/InclusionEurope.*?/gi, "")
        .replace(/logo europeo.*?/gi, "")
        .replace(/lectura fácil.*?/gi, "")
        .replace(/©.*?/gi, "")
        .replace(/\borg\b/gi, "")
        .replace(/Consejería.*?/gi, "")
        .replace(/Junta de Andalucía.*?/gi, "")

        .replace(/Entre otras cosas.*?\./gi, "")
        .replace(/Está escrito.*?\./gi, "")
        .replace(/Te enseñamos.*?\./gi, "")
        .replace(/Este manual.*?\./gi, "")
        .replace(/Además, te explicamos.*?\./gi, "")

        .replace(/►/g, "")
        .replace(/\s{2,}/g, " ")

        .split("\n")

        .map(l => l.trim())

        .filter(l => {

            return (
                l.length > 40 &&
                l.length < 250 &&

                !/^\d+$/.test(l) &&

                !l.toLowerCase().includes("agencia") &&
                !l.toLowerCase().includes("inclusion") &&
                !l.toLowerCase().includes("logo") &&
                !l.toLowerCase().includes("lectura fácil") &&
                !l.toLowerCase().includes("consejería") &&
                !l.toLowerCase().includes("junta de andalucía") &&
                !l.toLowerCase().includes("manual") &&
                !l.toLowerCase().includes("boletín") &&
                !l.toLowerCase().includes("copyright")
            );
        })

        .join(" ")

        .replace(/\s+/g, " ")
        .trim();
}

module.exports = limpiarTexto;