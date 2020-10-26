import express from 'express'
import {
  get_pair,
  get_pairs,
  group_pairs_report,
  group_pairs_unreport,
  reset_moyennes_pairs
} from "../controllers/cont_pair";

const routerPair = express.Router()

routerPair.post('/report',group_pairs_report)
routerPair.post('/unreport',group_pairs_unreport)

routerPair.get('/',get_pairs)
routerPair.get('/resetMoyennes',reset_moyennes_pairs)
routerPair.get('/:name',get_pair)

export default routerPair

