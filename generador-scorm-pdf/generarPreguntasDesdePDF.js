const fs = require("fs");
const path = require("path");
const leerPDF = require("./pdfLeer");
const limpiarTexto = require("./limpiartexto");
const extraerPreguntas = require("./pdfPreguntas");
const buscarRespuesta = require("./buscarRespuesta");
const generarOpciones = require("./generarOpciones");

async function generarPreguntasDesdePDF(rutaPDF, salidaJSON) {
    if (!fs.existsSync(rutaPDF)) throw new Error(`No existe el PDF: ${rutaPDF}`);

    console.log(`Leyendo ${rutaPDF}...`);
    const textoCrudo = await leerPDF(rutaPDF);

    console.log("Limpiando texto...");
    const textoLimpio = limpiarTexto(textoCrudo);

    console.log("Buscando preguntas...");
    const enunciados = extraerPreguntas(textoCrudo);
    if (enunciados.length === 0) {
        throw new Error("No se han detectado preguntas (el PDF debe tener frases con '¿...?').");
    }
    console.log(`   ${enunciados.length} preguntas detectadas.`);

    const preguntas = enunciados.map((pregunta, i) => {
        const correcta = buscarRespuesta(textoLimpio, pregunta);
        const opciones = generarOpciones(textoLimpio, correcta);
        const correctaIndex = opciones.indexOf(correcta);
        return {
            id: i + 1,
            pregunta,
            tipo: "test",
            opciones,
            correcta: correctaIndex >= 0 ? correctaIndex : 0
        };
    });

    fs.mkdirSync(path.dirname(salidaJSON), { recursive: true });
    fs.writeFileSync(salidaJSON, JSON.stringify(preguntas, null, 2), "utf-8");
    console.log(`Guardado: ${salidaJSON}`);
    return preguntas;
}

module.exports = generarPreguntasDesdePDF;

if (require.main === module) {
    const ruta = process.argv[2] || path.join(__dirname, "pdf", "documento.pdf");
    const salida = process.argv[3] || path.join(__dirname, "output", "preguntas.json");
    generarPreguntasDesdePDF(ruta, salida).catch(e => {
        console.error("Error:", e.message);
        process.exit(1);
    });
}
