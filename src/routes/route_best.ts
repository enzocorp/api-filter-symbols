import express from 'express'
import {calcul_bests, get_best, get_bests, reset_bests} from "../controllers/cont_bests";
import {coinapi} from "../middlewares/limitRequest";

const routeBest = express.Router()

routeBest.use(coinapi)
routeBest.get('',get_bests)
routeBest.get('/calcul',calcul_bests)
routeBest.get('/reset',reset_bests)
routeBest.get('/:id',get_best)

export default routeBest

