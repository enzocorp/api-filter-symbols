import express from 'express'
import {
  get_market,
  get_markets, group_markets_report, group_markets_unreport,
} from "../controllers/cont_market";
import {coinapiLimit} from "../middlewares/sendCoinapiLimit";

const routerMarket = express.Router()

routerMarket.use(coinapiLimit)
routerMarket.post('/unreport',group_markets_unreport)
routerMarket.post('/report',group_markets_report)

routerMarket.get('/',get_markets)
routerMarket.get('/:name',get_market)

export default routerMarket

