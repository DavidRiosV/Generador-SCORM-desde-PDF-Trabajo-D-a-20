const readline = require("readline");
const path = require("path");
const fs = require("fs");

const { generarActividades } = require("./generarActividades");
const { empaquetarSCORM, generarVistaPreviaLocal } = require("./scormGenerator");
const generarPreguntasDesdePDF = require("./generarPreguntasDesdePDF");

const PREGUNTAS_PATH = path.join(__dirname, "output", "preguntas.json");
const PDF_DEFAULT = path.join(__dirname, "pdf", "documento.pdf");

function pregunta(rl, txt) {
    return new Promise(resolve => rl.question(txt, r => resolve(r.trim())));
}

function leerPreguntas() {
    if (!fs.existsSync(PREGUNTAS_PATH)) {
        throw new Error("No existe preguntas.json. Genera preguntas primero.");
    }
    return JSON.parse(fs.readFileSync(PREGUNTAS_PATH, "utf-8"));
}

/* =========================
   GENERADOR AUTOMATICO
========================= */
function generarConfigAleatoria(total) {
    function rand(max) {
        return Math.floor(Math.random() * (max + 1));
    }

    if (total < 4) {
        return {
            test: total,
            vf: 0,
            matching: 0,
            fill: 0
        };
    }

    let restantes = total - 4;

    let test = 1;
    let vf = 1;
    let matching = 1;
    let fill = 1;

    const a = rand(restantes); test += a; restantes -= a;
    const b = rand(restantes); vf += b; restantes -= b;
    const c = rand(restantes); matching += c; restantes -= c;

    fill += restantes;

    return { test, vf, matching, fill };
}

/* =========================
   EXAMEN HTML
========================= */
async function flujoExamenHTML(rl) {
    const preguntas = leerPreguntas();

    const config = generarConfigAleatoria(preguntas.length);
    console.log("\nDistribucion automatica:", config);

    const actividades = generarActividades(preguntas, config);

    const tituloInput = await pregunta(rl, "\nTitulo del curso (Enter = 'Curso'): ");
    const titulo = tituloInput || "Curso";

    const id = titulo.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "curso";

    const carpeta = path.join(__dirname, "output", `${id}-preview`);

    const indexPath = await generarVistaPreviaLocal({
        actividades,
        titulo,
        carpeta
    });

    console.log(`\nExamen HTML listo:\n${indexPath}`);
}

/* =========================
   SCORM
========================= */
async function flujoSCORM(rl) {
    const preguntas = leerPreguntas();

    const config = generarConfigAleatoria(preguntas.length);
    console.log("\nDistribucion automatica:", config);

    const actividades = generarActividades(preguntas, config);

    const tituloInput = await pregunta(rl, "\nTitulo del curso (Enter = 'Curso SCORM'): ");
    const titulo = tituloInput || "Curso SCORM";

    const id = titulo.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "curso";

    const salida = path.join(__dirname, "output", `${id}-scorm.zip`);

    console.log(`\nGenerando ${actividades.length} actividades...`);

    const res = await empaquetarSCORM({
        actividades,
        titulo,
        id,
        salida
    });

    console.log(`Paquete SCORM creado: ${res.ruta} (${(res.bytes / 1024).toFixed(1)} KB)`);

    const verLocal = (await pregunta(rl, "\nVista previa local? (s/N): ")).toLowerCase();

    if (verLocal === "s" || verLocal === "si") {
        const carpeta = path.join(__dirname, "output", `${id}-preview`);
        const indexPath = await generarVistaPreviaLocal({
            actividades,
            titulo,
            carpeta
        });

        console.log(`Vista previa: ${indexPath}`);
    }

    console.log("\nSube el ZIP al LMS.");
}

/* =========================
   MENU
========================= */
async function pedirOpcionValida(rl) {
    while (true) {
        const op = await pregunta(rl, "\nElige opcion (1-3): ");
        const n = parseInt(op, 10);

        if (n >= 1 && n <= 3) return op;

        console.log("Opcion invalida");
    }
}

async function iniciarMenu() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("\n===== GENERADOR SCORM / EXAMEN =====");
    console.log("1) Examen HTML local");
    console.log("2) Generar SCORM (.zip)");
    console.log("3) Regenerar preguntas desde PDF");

    try {
        const op = await pedirOpcionValida(rl);

        if (op === "1") {
            await flujoExamenHTML(rl);
        }

        else if (op === "2") {
            await flujoSCORM(rl);
        }

        else if (op === "3") {
            const ruta = await pregunta(
                rl,
                `Ruta del PDF (Enter = ${PDF_DEFAULT}): `
            );

            await generarPreguntasDesdePDF(
                ruta || PDF_DEFAULT,
                PREGUNTAS_PATH
            );

            console.log("Preguntas regeneradas.");
        }

    } catch (err) {
        console.error("Error:", err.message);
    }

    rl.close();
}

module.exports = iniciarMenu;