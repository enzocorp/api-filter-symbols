import debuger, {Debugger} from "debug";
import ErrorsGenerator from "../../services/ErrorsGenerator";
import {StatusCodes} from "http-status-codes";

const debug : Debugger = debuger("api:md_error")

function errorsHandler(error, req, res, next) {
    if(error instanceof ErrorsGenerator){
      debug('%O',error)
      res.status(error.status)
        .send({
          title : error.title,
          message : error.message,
          status : error.status,
          instance : error.instance || 'none',
          type : error.type || 'none'
        });
    }
    else{
      console.log('unplanned error: ',error)
        res.status(StatusCodes.SERVICE_UNAVAILABLE)
          .json( {
              status : error.status,
              message : error.message,
          });
    }
}

export default errorsHandler


