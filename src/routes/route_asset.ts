import express from 'express'
import {
  get_pair,
  get_pairs,
  group_pairs_report,
  group_pairs_unreport,
  reset_moyennes_pairs
} from "../controllers/cont_pair";
import {
  get_asset,
  get_assets,
  group_assets_report,
  group_assets_unreport,
  refresh_price
} from "../controllers/cont_asset";
import {coinapiLimit} from "../middlewares/limitRequest";

const routerAsset = express.Router()

routerAsset.get('/',get_assets)
routerAsset.get('/refresh',coinapiLimit,refresh_price)
routerAsset.post('/report',group_assets_report)
routerAsset.post('/unreport',group_assets_unreport)
routerAsset.get('/:name',get_asset)

export default routerAsset

