import express from 'express'
import {
  addExclusion_pair,
  autocompleteReasons,
  autocompleteSeverity,
  deleteExclusion_exchange,
  deleteExclusion_pair,
  group_market_report,
  group_market_unreport,
  group_pair_report, group_pair_unreport,
  newReason,
  updateExclusion_exchange,
  updateExclusions_pair
} from "../controllers/cont_exclusion";

const routeExclusion = express.Router()

routeExclusion.post('/pair/report/group',group_pair_report)
routeExclusion.post('/pair/unreport/group',group_pair_unreport)
routeExclusion.post('/pair/:name',addExclusion_pair)
routeExclusion.put('/pair/:name',updateExclusions_pair)
routeExclusion.delete('/pair/:name',deleteExclusion_pair)

routeExclusion.post('/exchange/unreport/group',group_market_unreport)
routeExclusion.post('/exchange/report/group',group_market_report)
routeExclusion.put('/exchange/:id',updateExclusion_exchange)
routeExclusion.delete('/exchange/:id',deleteExclusion_exchange)

routeExclusion.get('/severities',autocompleteSeverity)
routeExclusion.get('/reasons',autocompleteReasons)
routeExclusion.post('/reasons',newReason)

export default routeExclusion

