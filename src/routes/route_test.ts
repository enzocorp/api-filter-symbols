import express from 'express'
import {ping, test1, test2, test3, test4} from "../controllers/cont_test";

const routerTest = express.Router()

routerTest.get('/',ping)
routerTest.get('/1',test1)
routerTest.get('/2',test2)

routerTest.get('/3',test3)
routerTest.get('/4',test4)

export default routerTest

