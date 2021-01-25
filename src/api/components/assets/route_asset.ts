import express from 'express'
import {
  get_asset,
  get_assets,
  group_assets_report,
  group_assets_unreport,
  refresh_price
} from "./cont_asset";
import {coinapiLimit} from "../../middleware/sendCoinapiLimit";

const routerAsset = express.Router()

routerAsset.get('/',get_assets)
routerAsset.get('/refresh',coinapiLimit,refresh_price)
routerAsset.post('/report',group_assets_report)
routerAsset.post('/unreport',group_assets_unreport)
routerAsset.get('/:name',get_asset)

export default routerAsset

