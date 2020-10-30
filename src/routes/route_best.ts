import express from 'express'
import {calcul_bests, get_best, get_bests, reset_bests} from "../controllers/cont_bests";
import {coinapiLimit} from "../middlewares/limitRequest";

const routerBest = express.Router()

routerBest.use(coinapiLimit)
routerBest.get('',get_bests)
routerBest.get('/calcul',calcul_bests)
routerBest.get('/reset',reset_bests)
routerBest.get('/:id',get_best)

export default routerBest

