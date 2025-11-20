function httpMigration() {
    const domain = "factoryidle.com";
    const localstorageExistenceCheckKey = "FactoryIdleUserHash"
    const migrateHtmlFile = "httpMigrate.html"
    const https = "https:"
    const http = "http:"
    const NEW = https + "//" + domain;
    const OLD = http + "//" + domain;
    return {
        inIndexFile: () => {
            setTimeout(() => {
                if (window.location.protocol === http) {
                    if (!window.localStorage[localstorageExistenceCheckKey]) {
                        document.location = NEW
                    } else {
                        window.addEventListener('message', (ev) => {
                            if (ev.origin === NEW) {
                                if (ev.data === "_migration_updated") {
                                    document.location = NEW
                                } else if (ev.data === "_https_loaded") {
                                    element.contentWindow.postMessage(JSON.stringify({type: "_updateStorage", data: window.localStorage}), "*");
                                } else if (ev.data === "__conflict_detected") {
                                    alert("You are playing this game on HTTP domain! \n" +
                                        "HTTP will be deprecated soon and you will lose your game progress!\n\n" +
                                        "How to migrate?\n" +
                                        "1) Just in case save your game to one of the slots\n" +
                                        "2) Go to settings and copy your user hash.\n" +
                                        "3) Go to " + NEW + ", then settings and update user hash.\n");
                                }
                            }
                        });
                        const element = document.createElement("iframe");
                        element.src = NEW + "/" + migrateHtmlFile
                        element.style.display = "none";
                        setTimeout(() => {
                            document.body.append(element);
                        }, 100)
                    }
                }
            }, 5000)
        },
        inMigrationFile: () => {
            if (window.location.protocol === https) {
                window.addEventListener('message', (ev) => {
                    if (ev.origin === OLD) {
                        const data = JSON.parse(ev.data);
                        if (data.type === "_updateStorage") {
                            for (const k in data.data) {
                                window.localStorage[k] = data.data[k];
                            }
                            parent.postMessage("_migration_updated", "*");
                        }
                    }
                });
                if (window.localStorage[localstorageExistenceCheckKey]) {
                    parent.postMessage("__conflict_detected", "*");
                } else {
                    parent.postMessage("_https_loaded", "*");
                }
            }
        }
    }
}
