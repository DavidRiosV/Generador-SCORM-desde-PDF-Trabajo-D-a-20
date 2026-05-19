(function () {
    "use strict";

    function buscarAPI(win) {
        let intentos = 0;
        while (win && win.API == null && win.parent && win.parent !== win && intentos < 10) {
            intentos++;
            win = win.parent;
        }
        if (win && win.API) return win.API;
        return null;
    }

    function localizarAPI() {
        let api = buscarAPI(window);
        if (!api && window.opener) api = buscarAPI(window.opener);
        return api;
    }

    const api = localizarAPI();
    const conectado = !!api;
    let iniciado = false;

    function init() {
        if (!conectado) return false;
        if (iniciado) return true;
        const r = api.LMSInitialize("");
        iniciado = r === "true" || r === true;
        return iniciado;
    }

    function set(key, value) {
        if (!conectado || !iniciado) return false;
        return api.LMSSetValue(key, String(value)) === "true";
    }

    function commit() {
        if (!conectado || !iniciado) return false;
        return api.LMSCommit("") === "true";
    }

    function finish() {
        if (!conectado || !iniciado) return false;
        const r = api.LMSFinish("");
        iniciado = false;
        return r === "true";
    }

    function get(key) {
        if (!conectado || !iniciado) return "";
        return api.LMSGetValue(key);
    }

    window.SCORM = {
        conectado,
        init,
        get,
        set,
        commit,
        finish,
        guardarNota(porcentaje, aprobado) {
            if (!conectado || !iniciado) return;
            set("cmi.core.score.raw", String(Math.round(porcentaje)));
            set("cmi.core.score.min", "0");
            set("cmi.core.score.max", "100");
            set("cmi.core.lesson_status", aprobado ? "passed" : "failed");
            commit();
        }
    };
})();
