import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
declare var require: any;

@Injectable()
export class MeGzipService {
  
  public _resultArray:any;
  public _resultArray2:any;

  constructor() { 

  }

  makeRequest_uncompress(response): Promise<any> {
    // console.log('inside gzip response2',response);
    let uncompress = (response) => new Promise((resolve, reject) => { 
      let Buffer = require('buffer').Buffer;  
      let zlib = require('zlib');
      
      zlib.gunzip(Buffer.from(response, 'base64'), function(err, uncompressedMessage) {
          if(err) {
            reject(err);
          } 
          else 
          {
            let resultobj = JSON.parse(uncompressedMessage.toString());  
            let resultArray = resultobj;

            resolve(resultArray);
          }
      });
    });

    
  return  uncompress(response).then(function(resultArray){ 
     
    return resultArray;
    }.bind(this)) 

   
  }




}
