import express from 'express'
import {
  get_symbol,
  get_symbols,
  group_symbol_report,
  group_symbol_unreport,
} from "../controllers/cont_symbol";

const routerSymbol = express.Router()

routerSymbol.post('/unreport',group_symbol_unreport)
routerSymbol.post('/report',group_symbol_report)

routerSymbol.get('/',get_symbols)
routerSymbol.get('/:name',get_symbol)

export default routerSymbol

