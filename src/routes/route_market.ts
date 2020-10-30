import express from 'express'
import {
  get_market,
  get_markets,
  group_market_report,
  group_market_unreport,
} from "../controllers/cont_market";

const routeMarket = express.Router()

routeMarket.post('/unreport',group_market_unreport)
routeMarket.post('/report',group_market_report)

routeMarket.get('/',get_markets)
routeMarket.get('/:name',get_market)

export default routeMarket

