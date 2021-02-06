import schedule from "node-schedule";
import axios from "axios";
import app from "./api/app";
import {API_PORT, API_NAME, COINAPI_KEY, COINAPI_URL, NODE_ENV} from "./config/globals";
import {dbConnexion} from "./config/db";

//-------------------Connexion à la BDD ------------------------------------------
dbConnexion()

console.log(`Le nom de l'api est --"${API_NAME}"-- `)
console.log("LA clé d'api est",COINAPI_KEY)
console.log("L'url de CoinAPI est : ",COINAPI_URL)

app.listen(API_PORT,()=>{
  console.log('Mon node js ecoute sur le port : ',API_PORT);
})


//-------------------Executions récurantes ------------------------------------------


//Execute un raffraichissement des assets tous les 15h
schedule.scheduleJob('0 */15 * * *', async () =>{
  try{
    await axios.get(`http://127.0.0.1:${API_PORT}/${API_NAME}/assets/refresh`)
    console.log(" ---Il EST L'HEURE ! LES ASSETS ONT ETE REFRESH ! :D ")
  }catch (err){
    console.log(" --HOLALALA ! LES ASSETS N'ONT PAS PUE ETRE REFRESH :( !! : ", err.message)
  }

});



//Lance un calcul des best tous les jours à 14h(UTC Coordinated Universal Time) = 13h UTC+1 (Paris)
schedule.scheduleJob('* 14 * * *', async () =>{
  try{
    if (NODE_ENV === "production")
      await axios.get(`http://127.0.0.1:${API_PORT}/${API_NAME}/bests/calcul`)
    console.log(" ---EXECUTION AUTOMATIQUE D'UN NOUVEAU CALCUL DES BETS ! :D ")
  }catch (err){
    console.log(" --OUPS ! UNE ERREUR S'EST PRODUITE PENDANT LE CALCUL AUTOTMAIQUE DES BEST !! : /n ", err.message)
  }
});
