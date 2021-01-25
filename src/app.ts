import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import schedule from "node-schedule"
import routerCrypto from './api/components/crypto/route_crypto'
import axios from 'axios'
import {dbConnexion} from "./config/db";
import routerMarket from "./api/components/markets/route_market";
import routerBest from "./api/components/bests/route_best";
import routerPair from "./api/components/pairs/route_pair";
import routerSymbol from "./api/components/symbols/route_symbol";
import routerTest from "./api/components/tests/route_test";
import routerAsset from "./api/components/assets/route_asset";
import {saveCoinapiLimitSucces, saveCoinapiLimitError} from "./api/middleware/axiosRespInterceptor";

//---------------------------Initialisation de l'App----------------------------

const app = express()
app.use(helmet())
app.use(compression())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser())


//-------------------Connexion à la BDD ------------------------------------------
dbConnexion()

//---------------------------Definition des headers de réponses ------------------

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origian, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Accept', 'application/json');
  next();
});

//---------------------------Definition des headers de requête ------------------

axios.defaults.headers.common['X-CoinAPI-Key'] = process.env.COINAPI_KEY;
axios.defaults.headers.common['Accept-Encoding'] = 'deflate, gzip';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.interceptors.response.use( saveCoinapiLimitSucces,saveCoinapiLimitError);

const defUrl = () => {
  switch (process.env.NODE_ENV) {
    case 'production' :
      return 'http://rest.coinapi.io'
    case 'development' :
      return 'http://rest-sandbox.coinapi.io'
    case 'test' :
      return 'http://rest.coinapi.io'
    default :
      return 'http://rest-sandbox.coinapi.io'
  }
}
export let COINAPI = defUrl()
console.log("L'url de CoinAPI est : ",COINAPI)

//-------------------Les Routes ------------------------------------------
const apiname = process.env.API_NAME || 'api1'
console.log(`Le nom de l'api est --"${apiname}"-- `)
console.log("LA clé d'api est",process.env.COINAPI_KEY )

let router = express.Router()
app.use(`/${apiname}`,router)

router.use('/test',routerTest)
router.use('/crypto',routerCrypto)
router.use('/pairs',routerPair)
router.use('/symbols',routerSymbol)
router.use('/markets',routerMarket)
router.use('/bests',routerBest)
router.use('/assets',routerAsset)

const port = process.env.API_PORT || 3000
app.listen(port,()=>{
  console.log('Mon node js ecoute sur le port : ',port);
})

schedule.scheduleJob('0 */15 * * *', async () =>{
  try{
    await axios.get(`http://127.0.0.1:${port}/${apiname}/assets/refresh`)
    console.log(" ---Il EST L'HEURE ! LES ASSETS ONT ETE REFRESH ! :D ")
  }catch (err){
    console.log(" --HOLALALA ! LES ASSETS N'ONT PAS PUE ETRE REFRESH :( !! : ", err.message)
  }

});
