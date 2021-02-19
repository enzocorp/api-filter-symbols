import express from 'express'
import {
  autocompleteReasons,
  autocompleteSeverity, delete_apikey, getall_apikeys,
  get_coinapi, init_app, newReason, add_apikey, choose_apikey, refresh_apikey,
} from "./cont_crypto";
import {coinapiLimit} from "../../middleware/sendCoinapiLimit";

const routerCrypto = express.Router()

routerCrypto.get('/coinapi',get_coinapi)
routerCrypto.get('/init',coinapiLimit,init_app)

routerCrypto.get('/exclusion/severities',autocompleteSeverity)
routerCrypto.get('/exclusion/reasons',autocompleteReasons)
routerCrypto.post('/exclusion/reasons',newReason)

routerCrypto.post('/apikey',coinapiLimit,add_apikey)
routerCrypto.get('/apikey',coinapiLimit,getall_apikeys)
routerCrypto.get('/apikey/choose/:key',choose_apikey)
routerCrypto.get('/apikey/refresh/:key',refresh_apikey)
routerCrypto.delete('/apikey/:key',coinapiLimit,delete_apikey)

export default routerCrypto

