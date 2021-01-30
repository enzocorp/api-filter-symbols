import schedule from "node-schedule";
import axios from "axios";
import app from "./api/app";
import {API_PORT, API_NAME, COINAPI_KEY, COINAPI_URL} from "./config/globals";
import {dbConnexion} from "./config/db";

//-------------------Connexion à la BDD ------------------------------------------
dbConnexion()

console.log(`Le nom de l'api est --"${API_NAME}"-- `)
console.log("LA clé d'api est",COINAPI_KEY)
console.log("L'url de CoinAPI est : ",COINAPI_URL)

app.listen(API_PORT,()=>{
  console.log('Mon node js ecoute sur le port : ',API_PORT);
})


schedule.scheduleJob('0 */15 * * *', async () =>{
  try{
    await axios.get(`http://127.0.0.1:${API_PORT}/${API_NAME}/assets/refresh`)
    console.log(" ---Il EST L'HEURE ! LES ASSETS ONT ETE REFRESH ! :D ")
  }catch (err){
    console.log(" --HOLALALA ! LES ASSETS N'ONT PAS PUE ETRE REFRESH :( !! : ", err.message)
  }

});
