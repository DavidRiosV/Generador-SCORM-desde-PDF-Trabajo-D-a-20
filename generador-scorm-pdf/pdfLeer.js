const fs = require("fs");
const pdf = require("pdf-parse");

async function leerPDF(ruta) {
    const dataBuffer = fs.readFileSync(ruta);
    const data = await pdf(dataBuffer);
    return data.text;
}

module.exports = leerPDF;