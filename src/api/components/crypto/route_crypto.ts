import express from 'express'
import {
  autocompleteReasons,
  autocompleteSeverity,
  get_coinapi, init_app, newReason,
} from "./cont_crypto";
import {coinapiLimit} from "../../middleware/sendCoinapiLimit";

const routerCrypto = express.Router()

routerCrypto.get('/coinapi',get_coinapi)
routerCrypto.get('/init',coinapiLimit,init_app)

routerCrypto.get('/exclusion/severities',autocompleteSeverity)
routerCrypto.get('/exclusion/reasons',autocompleteReasons)
routerCrypto.post('/exclusion/reasons',newReason)

export default routerCrypto

