//---------------------------Initialisation de l'App----------------------------

import express from "express";
import helmet from "helmet";
import compression from "compression";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import axios from "axios";
import {saveCoinapiLimitError, saveCoinapiLimitSucces} from "./middleware/axiosRespInterceptor";
import router from "./routes";
import {API_NAME} from "../config/globals";
import {coinapi_key} from "../config/apikey";

const app = express()
app.use(helmet())
app.use(compression())
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(cookieParser())



//---------------------------Definition des headers de réponses ------------------

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origian, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Accept', 'application/json');
  next();
});

//---------------------------Definition des headers de requête ------------------

let defineHeaders = async () : Promise<void> => {
  axios.defaults.headers.common['X-CoinAPI-Key'] = await coinapi_key()
  axios.defaults.headers.common['Accept-Encoding'] = 'deflate, gzip';
  axios.defaults.headers.common['Accept'] = 'application/json';
  axios.interceptors.response.use( saveCoinapiLimitSucces,saveCoinapiLimitError);
}
defineHeaders().then()



//-------------------Les Routes ------------------------------------------
app.use(`/${API_NAME}`,router)

export default app
