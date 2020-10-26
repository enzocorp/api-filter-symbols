import express from 'express'
import {get_pair, get_pairs, reset_moyennes_pairs} from "../controllers/cont_pair";
import {group_pair_report, group_pair_unreport} from "../controllers/cont_exclusion";
import routeExclusion from "./route_exclusion";


const routerPair = express.Router()

routeExclusion.post('/report',group_pair_report)
routeExclusion.post('/unreport',group_pair_unreport)

routerPair.get('/',get_pairs)
routerPair.get('/resetMoyennes',reset_moyennes_pairs)
routerPair.get('/:name',get_pair)


export default routerPair

