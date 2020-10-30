import express from 'express'
import {
  get_market,
  get_markets,
  group_market_report,
  group_market_unreport,
} from "../controllers/cont_market";

const routerMarket = express.Router()

routerMarket.post('/unreport',group_market_unreport)
routerMarket.post('/report',group_market_report)

routerMarket.get('/',get_markets)
routerMarket.get('/:name',get_market)

export default routerMarket

