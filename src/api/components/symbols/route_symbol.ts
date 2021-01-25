import express from 'express'
import {
  get_symbol,
  get_symbols,group_symbols_report, group_symbols_unreport,
} from "./cont_symbol";

const routerSymbol = express.Router()

routerSymbol.post('/unreport',group_symbols_unreport)
routerSymbol.post('/report',group_symbols_report)

routerSymbol.get('/',get_symbols)
routerSymbol.get('/:name',get_symbol)

export default routerSymbol

