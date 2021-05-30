import schedule from "node-schedule";
import axios from "axios";
import app from "./api/app";
import {API_PORT, API_NAME, COINAPI_URL, NODE_ENV} from "./config/globals";
import {dbConnexion} from "./config/db";
import {coinapi_key} from "./config/apikey";

//-------------------Connexion à la BDD ------------------------------------------
dbConnexion()

console.log(`L'environemment est en mode --"${NODE_ENV}"-- `)
console.log(`Le nom de l'api est --"${API_NAME}"-- `)
coinapi_key().then(key => console.log("La clé d'api est",key))
console.log(`L'url de CoinAPI est : "${COINAPI_URL}"`)
app.listen(API_PORT,()=>{
  console.log(`Mon node js ecoute sur le port : "${API_PORT}" `);
})



//-------------------Executions récurantes ------------------------------------------


//Lance un calcul des best tous les jours à 14h00(Paris)
schedule.scheduleJob({hour: 14, minute:0, tz: 'Europe/Paris'}, async () =>{
  try{
    console.log(" ---EXECUTION AUTOMATIQUE D'UN NOUVEAU CALCUL DES BESTS ! :D ")
    if (NODE_ENV === "production") {
      await axios.get(`http://127.0.0.1:${API_PORT}/${API_NAME}/crypto/apikey/refresh`)
      await axios.get(`http://127.0.0.1:${API_PORT}/${API_NAME}/assets/refresh`)
      await axios.get(`http://127.0.0.1:${API_PORT}/${API_NAME}/bests/calcul`)
    }
  }catch (err){
    console.log(" --OUPS ! UNE ERREUR S'EST PRODUITE PENDANT LE CALCUL AUTOTMAIQUE DES BEST !! : /n ", err.message)
  }

});
