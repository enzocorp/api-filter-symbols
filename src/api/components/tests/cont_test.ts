import modelReason from "../../models/mongoose/model.reason";
import {COINAPI_URL} from "../../../config/globals";
import axios from "axios";

export const healthchecking = async (req, res, next)=> {
    try {
        res.status(200).send()
    } catch (error) {
        return next(error)
    }
}


export const test1 = async  (req,res,next)=>{
    try{
        console.log('-------PING RECU------------')
        res.status(200).json({title: "le titre", message: "recu Ok OK"})
    }
    catch (error){
        return next(error)
    }

}

export const test2 = async  (req,res,next)=>{
    try{
        res.status(500).json({title: "j'envoi volontairement une erreur",message:"holala une erreur"})
    }
    catch (error){
        return next(error)
    }

}


export const test3 = async  (req,res,next)=>{
    try{
        const queryParam = req.query.for ? {for : req.query.for} : {}
        const reasons = await modelReason.find(queryParam)
        res.status(200).json(reasons)
    }
    catch (error){
        return next(error)
    }

}

export const test4 = async  (req,res,next)=>{
    try{
        let {data} = await axios.get(`${COINAPI_URL}/v1/assets/BTC`)
        console.log("okay")
        res.status(200).json({ok : "salut salut", data})
    }
    catch (error){
        return  next(error)
    }

}
