# ENV VARIABLES UTILISEES

### ---Base de données---
MONGO_PORT= {number}
MONGO_DB= {string}
MONGO_DB_DEV= {string}
MONGO_HOSTNAME= {string}
MONGO_INITDB_USERNAME= {string} (user readwrite)
MONGO_INITDB_PASSWORD= {string} (pwd user readwrite)

### ---Api---

API_NAME={string} (nom de l'api qui sera utilisé dans l'url)
API_PORT={number}
API_HOSTNAME={string} (pour le DNS docker)
COINAPI_KEY={string} (clé d'api du site coinapi)
NODE_ENV= "development" | "test" | "production"
DEBUG= "api:*" | " " (permet d'activer ou desactiver le debuger)
