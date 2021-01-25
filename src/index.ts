import schedule from "node-schedule";
import axios from "axios";
import app from "./api/app";
import {api_port, apiname, coinapi_key, coinapi_url} from "./config/globals";
import {dbConnexion} from "./config/db";

//-------------------Connexion à la BDD ------------------------------------------
dbConnexion()

console.log(`Le nom de l'api est --"${apiname}"-- `)
console.log("LA clé d'api est",coinapi_key)
console.log("L'url de CoinAPI est : ",coinapi_url)

app.listen(api_port,()=>{
  console.log('Mon node js ecoute sur le port : ',api_port);
})


schedule.scheduleJob('0 */15 * * *', async () =>{
  try{
    await axios.get(`http://127.0.0.1:${api_port}/${apiname}/assets/refresh`)
    console.log(" ---Il EST L'HEURE ! LES ASSETS ONT ETE REFRESH ! :D ")
  }catch (err){
    console.log(" --HOLALALA ! LES ASSETS N'ONT PAS PUE ETRE REFRESH :( !! : ", err.message)
  }

});
