import express from 'express'
import {
  autocompleteReasons,
  autocompleteSeverity,
  get_coinapi, init_app, newReason,
  ping
} from "../controllers/cont_crypto";

const routerCrypto = express.Router()

routerCrypto.get('/ping',ping)
routerCrypto.get('/coinapi',get_coinapi)
routerCrypto.get('/init',init_app)

routerCrypto.get('/exclusion/severities',autocompleteSeverity)
routerCrypto.get('/exclusion/reasons',autocompleteReasons)
routerCrypto.post('/exclusion/reasons',newReason)

export default routerCrypto

