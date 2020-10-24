import express from 'express'
import {get_market, get_markets, get_podiumpairs, reset_moyennes} from "../controllers/cont_market";

const routeMarket = express.Router()

routeMarket.get('/',get_markets)
routeMarket.get('/reset',reset_moyennes)
routeMarket.get('/podiumpairs/:id',get_podiumpairs)
routeMarket.get('/:id',get_market)

export default routeMarket

