# ENVOYER EN PRODUCTION 
```sh
docker build -f prod.Dockerfile -t enzo13/api-arbitrage-p:3.0.1 ./
docker push enzo13/api-arbitrage-p:3.0.1
```

# ENV VARIABLES UTILISEES

### ---Base de données---
- MONGO_INITDB_USERNAME= {string} (user readwrite)
- MONGO_INITDB_PASSWORD= {string} (pwd user readwrite)
- MONGO_DB= {string} (working database)
- MONGO_URI= {string} (if using "SV" DNS )
- MONGO_HOSTNAME= {string} (if using "A" classic DNS)
- MONGO_PORT= {number} (if using "A" classic DNS )

(Useful **only on local env** Dev or Tests) 
- MONGO_DB_DEV= {string}
- MONGO_INITDB_ROOT_USERNAME= {string} (user superadmin)
- MONGO_INITDB_ROOT_PASSWORD= {string} (pwd superadmin)

### ---Api---

- API_NAME={string} (nom de l'api qui sera utilisé dans l'url)
- API_PORT={number}
- API_HOSTNAME={string} (pour le DNS docker)
- NODE_ENV= "development" | "test" | "production"
- DEBUG= "api:*" | " " (permet d'activer ou desactiver le debuger)
- DEBUG_COLOR= "api:*" | " " (permet d'activer ou de desactiver la colorisation du debuger)
