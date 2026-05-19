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
        throw new Error(`No se encontro ${PREGUNTAS_PATH}. Genera primero las preguntas desde un PDF.`);
    }
    return JSON.parse(fs.readFileSync(PREGUNTAS_PATH, "utf-8"));
}

async function pedirNumeroValido(rl, texto, maximo) {
    let respuesta = "";
    let valida = false;
    let numero = 0;

    while (valida === false) {
        respuesta = await pregunta(rl, texto);

        if (respuesta === "") {
            console.log("No has escrito nada. Tienes que escribir un numero (0 para omitir).");
            continue;
        }

        let soloNumeros = true;
        for (let i = 0; i < respuesta.length; i++) {
            const caracter = respuesta[i];
            if (caracter < "0" || caracter > "9") {
                soloNumeros = false;
            }
        }

        if (soloNumeros === false) {
            console.log("No se permiten letras ni simbolos. Escribe solo numeros.");
            continue;
        }

        numero = parseInt(respuesta, 10);
        if (numero < 0) {
            console.log("El numero no puede ser negativo.");
            continue;
        }

        if (numero > maximo) {
            console.log(`No puedes pedir mas de ${maximo}. Vuelve a intentarlo.`);
            continue;
        }

        valida = true;
    }

    return numero;
}

async function preguntarConfigActividades(rl, totalDisponible) {
    console.log(`\nTienes ${totalDisponible} preguntas disponibles en preguntas.json.`);
    console.log("\n¿Que tipos de actividad quieres incluir? (indica cuantas de cada una; 0 para omitir)");

    const test = await pedirNumeroValido(rl, "  - Tipo test (opcion multiple): ", totalDisponible);
    const vf = await pedirNumeroValido(rl, "  - Verdadero / Falso: ", totalDisponible);
    const matching = await pedirNumeroValido(rl, "  - Unir con flechas (matching) [pares]: ", totalDisponible);
    const fill = await pedirNumeroValido(rl, "  - Rellenar huecos: ", totalDisponible);

    return { test, vf, matching, fill };
}

async function flujoSCORM(rl) {
    const preguntas = leerPreguntas();
    const config = await preguntarConfigActividades(rl, preguntas.length);

    const total = config.test + config.vf + config.matching + config.fill;
    if (total === 0) {
        console.log("\nNo se ha elegido ninguna actividad. Cancelado.");
        return;
    }

    const tituloInput = await pregunta(rl, "\nTitulo del curso (Enter = 'Curso SCORM'): ");
    const titulo = tituloInput || "Curso SCORM";
    const id = titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "curso";

    const actividades = generarActividades(preguntas, config);
    const salida = path.join(__dirname, "output", `${id}-scorm.zip`);

    console.log(`\nGenerando ${actividades.length} actividades...`);
    const res = await empaquetarSCORM({ actividades, titulo, id, salida });
    console.log(`Paquete SCORM creado: ${res.ruta}  (${(res.bytes / 1024).toFixed(1)} KB)`);

    const verLocal = (await pregunta(rl, "\n¿Quieres generar tambien una vista previa local sin LMS? (s/N): ")).toLowerCase();
    if (verLocal === "s" || verLocal === "si") {
        const carpeta = path.join(__dirname, "output", `${id}-preview`);
        const indexPath = await generarVistaPreviaLocal({ actividades, titulo, carpeta });
        console.log(`Vista previa: abre en el navegador -> ${indexPath}`);
    }

    console.log("\nSube el .zip al LMS (Moodle, etc.) como 'Paquete SCORM'.");
}

async function flujoExamenHTML(rl) {
    const preguntas = leerPreguntas();
    const config = await preguntarConfigActividades(rl, preguntas.length);

    const total = config.test + config.vf + config.matching + config.fill;
    if (total === 0) {
        console.log("\nNo se ha elegido ninguna actividad. Cancelado.");
        return;
    }

    const tituloInput = await pregunta(rl, "\nTitulo del curso (Enter = 'Curso'): ");
    const titulo = tituloInput || "Curso";
    const id = titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "curso";

    const actividades = generarActividades(preguntas, config);
    const carpeta = path.join(__dirname, "output", `${id}-preview`);
    const indexPath = await generarVistaPreviaLocal({ actividades, titulo, carpeta });
    console.log(`\nExamen HTML listo. Abrelo en el navegador:\n   ${indexPath}`);
}

async function pedirOpcionValida(rl) {
    let opcion = "";
    let valida = false;

    while (valida === false) {
        opcion = await pregunta(rl, "\nElige opcion (1-3): ");

        if (opcion === "") {
            console.log("No has escrito nada. Tienes que escribir un numero del 1 al 3.");
            continue;
        }

        let soloNumeros = true;
        for (let i = 0; i < opcion.length; i++) {
            const caracter = opcion[i];
            if (caracter < "0" || caracter > "9") {
                soloNumeros = false;
            }
        }

        if (soloNumeros === false) {
            console.log("No se permiten letras ni simbolos. Escribe solo un numero del 1 al 3.");
            continue;
        }

        const numero = parseInt(opcion, 10);
        if (numero < 1 || numero > 3) {
            console.log("Opcion fuera de rango. Tiene que ser 1, 2 o 3.");
            continue;
        }

        valida = true;
    }

    return opcion;
}

async function iniciarMenu() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log("\n===== GENERADOR SCORM / EXAMEN =====");
    console.log("1) Examen HTML local (preview en navegador)");
    console.log("2) Generar paquete SCORM (.zip para subir a un LMS)");
    console.log("3) Regenerar preguntas desde un PDF nuevo");

    try {
        const op = await pedirOpcionValida(rl);

        if (op === "1") {
            await flujoExamenHTML(rl);
        } else if (op === "2") {
            await flujoSCORM(rl);
        } else if (op === "3") {
            const ruta = await pregunta(rl, `Ruta del PDF (Enter = ${PDF_DEFAULT}): `);
            await generarPreguntasDesdePDF(ruta || PDF_DEFAULT, PREGUNTAS_PATH);
            console.log("Ya puedes lanzar las opciones 1 o 2 con las nuevas preguntas.");
        }
    } catch (err) {
        console.error("Error:", err.message);
    }

    rl.close();
}

module.exports = iniciarMenu;
