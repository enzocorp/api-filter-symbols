import express from 'express'
import {
  init_pair,
  get_pair,
  get_pairsv2, reset_moyennes, ping, get_infos_coinapi,
} from "../controllers/cont_crypto";
import {coinapi} from "../middlewares/limitRequest";

const routerCrypto = express.Router()

routerCrypto.get('/ping',ping)
routerCrypto.get('/coinapi',get_infos_coinapi)
routerCrypto.get('/init',init_pair)

routerCrypto.get('/pairsv2',get_pairsv2)
routerCrypto.get('/pairs/resetMoyennes',reset_moyennes)
routerCrypto.get('/pairs/:name',get_pair)


export default routerCrypto

