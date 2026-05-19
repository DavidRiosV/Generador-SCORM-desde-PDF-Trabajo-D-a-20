const fs = require("fs");
const path = require("path");
const archiver = require("archiver");

function escapeXML(s) {
    return String(s).replace(/[<>&"']/g, c => ({
        "<": "&lt;", ">": "&gt;", "&": "&amp;", "\"": "&quot;", "'": "&apos;"
    })[c]);
}

function generarManifest({ id, titulo }) {
    const idSeguro = String(id).replace(/[^a-zA-Z0-9_-]/g, "_");
    const tituloXML = escapeXML(titulo);
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST_${idSeguro}" version="1.2"
    xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
    xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                        http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                        http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
    <metadata>
        <schema>ADL SCORM</schema>
        <schemaversion>1.2</schemaversion>
    </metadata>
    <organizations default="ORG_${idSeguro}">
        <organization identifier="ORG_${idSeguro}">
            <title>${tituloXML}</title>
            <item identifier="ITEM_${idSeguro}" identifierref="RES_${idSeguro}" isvisible="true">
                <title>${tituloXML}</title>
                <adlcp:masteryscore>50</adlcp:masteryscore>
            </item>
        </organization>
    </organizations>
    <resources>
        <resource identifier="RES_${idSeguro}" type="webcontent" adlcp:scormtype="sco" href="index.html">
            <file href="index.html"/>
            <file href="styles.css"/>
            <file href="app.js"/>
            <file href="scormApi.js"/>
            <file href="actividades.js"/>
        </resource>
    </resources>
</manifest>
`;
}

function generarActividadesJS(actividades, titulo) {
    return `window.CURSO_TITULO = ${JSON.stringify(titulo)};
window.ACTIVIDADES = ${JSON.stringify(actividades, null, 2)};
`;
}

async function empaquetarSCORM({ actividades, titulo, id, salida }) {
    const webDir = path.join(__dirname, "web");
    const archivosWeb = ["index.html", "styles.css", "app.js", "scormApi.js"];

    for (const f of archivosWeb) {
        if (!fs.existsSync(path.join(webDir, f))) {
            throw new Error(`Falta el archivo web/${f}`);
        }
    }

    fs.mkdirSync(path.dirname(salida), { recursive: true });

    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(salida);
        const zip = archiver("zip", { zlib: { level: 9 } });

        output.on("close", () => resolve({ ruta: salida, bytes: zip.pointer() }));
        zip.on("error", reject);
        zip.pipe(output);

        for (const f of archivosWeb) {
            zip.file(path.join(webDir, f), { name: f });
        }
        zip.append(generarActividadesJS(actividades, titulo), { name: "actividades.js" });
        zip.append(generarManifest({ id, titulo }), { name: "imsmanifest.xml" });

        zip.finalize();
    });
}

async function generarVistaPreviaLocal({ actividades, titulo, carpeta }) {
    const webDir = path.join(__dirname, "web");
    fs.mkdirSync(carpeta, { recursive: true });
    for (const f of ["index.html", "styles.css", "app.js", "scormApi.js"]) {
        fs.copyFileSync(path.join(webDir, f), path.join(carpeta, f));
    }
    fs.writeFileSync(path.join(carpeta, "actividades.js"), generarActividadesJS(actividades, titulo));
    return path.join(carpeta, "index.html");
}

module.exports = { empaquetarSCORM, generarVistaPreviaLocal };
