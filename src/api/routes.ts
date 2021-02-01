import express from 'express'
import routerTest from "./components/tests/route_test";
import routerCrypto from "./components/crypto/route_crypto";
import routerPair from "./components/pairs/route_pair";
import routerSymbol from "./components/symbols/route_symbol";
import routerMarket from "./components/markets/route_market";
import routerBest from "./components/bests/route_best";
import routerAsset from "./components/assets/route_asset";
import errorsHandler from "./middleware/md_errors";

const router = express.Router()

router.use('/test',routerTest)
router.use('/crypto',routerCrypto)
router.use('/pairs',routerPair)
router.use('/symbols',routerSymbol)
router.use('/markets',routerMarket)
router.use('/bests',routerBest)
router.use('/assets',routerAsset)
router.use(errorsHandler)

export default router

