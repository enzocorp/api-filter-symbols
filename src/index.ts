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


//Execute un raffraichissement des assets toutes les 7 heures
schedule.scheduleJob('0 */7 * * *', async () =>{
  try{
    await axios.get(`http://127.0.0.1:${API_PORT}/${API_NAME}/assets/refresh`)
    console.log(" ---Il EST L'HEURE ! LES ASSETS ONT ETE REFRESH ! :D ")
  }catch (err){
    console.log(" --HOLALALA ! LES ASSETS N'ONT PAS PUE ETRE REFRESH :( !! : ", err.message)
  }
});


//Lance un calcul des best tous les jours à 14h00 Paris
schedule.scheduleJob({hour: 14, tz: 'Europe/Paris'}, async () =>{
  try{
    if (NODE_ENV === "production") {
      await axios.get(`http://127.0.0.1:${API_PORT}/${API_NAME}/crypto/apikey/refresh`)
      await axios.get(`http://127.0.0.1:${API_PORT}/${API_NAME}/assets/refresh/all`)
      await axios.get(`http://127.0.0.1:${API_PORT}/${API_NAME}/bests/calcul`)
    }
    console.log(" ---EXECUTION AUTOMATIQUE D'UN NOUVEAU CALCUL DES BESTS ! :D ")
  }catch (err){
    console.log(" --OUPS ! UNE ERREUR S'EST PRODUITE PENDANT LE CALCUL AUTOTMAIQUE DES BEST !! : /n ", err.message)
  }
});
