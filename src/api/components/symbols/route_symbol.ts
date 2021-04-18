import express from 'express'
import {
  get_symbol,
  get_symbols, group_symbols_report, group_symbols_unreport, reset_moyennes_symbols,
} from "./cont_symbol";

const routerSymbol = express.Router()

routerSymbol.post('/unreport',group_symbols_unreport)
routerSymbol.post('/report',group_symbols_report)
routerSymbol.get('/resetMoyennes',reset_moyennes_symbols)

routerSymbol.get('/',get_symbols)
routerSymbol.get('/:name',get_symbol)

export default routerSymbol

