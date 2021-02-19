import express from 'express'
import {calcul_bests, get_best, get_bests, get_last_groupId, get_podium, reset_bests} from "./cont_bests";
import {coinapiLimit} from "../../middleware/sendCoinapiLimit";

const routerBest = express.Router()

routerBest.use(coinapiLimit)
routerBest.get('',get_bests)
routerBest.get('/podium/:groupId',get_podium)
routerBest.get('/groupId',get_last_groupId)
routerBest.get('/calcul',calcul_bests)
routerBest.get('/reset',reset_bests)
routerBest.get('/:id',get_best)

export default routerBest

