import { Injectable } from '@angular/core';
import { MomentModule  } from 'angular2-moment'; 
import * as moment from 'moment';

@Injectable()
export class MeCalculateDateService {

  from_date : any;
  to_date   : any;

  // set min and max dates for date fields.
  getDate = new Date();


  constructor() { }

  

  calculateDateRange(p_date_range:string):void {

    // Calculation of dates are done based on moment js library functions.
    // Source\Link - http://momentjs.com/docs/#/get-set/
    // Added .add(1, 'm') >> 1 minute additional time to consider the  recently processed records. 

    console.log("**** Value Received ****");
    console.log(p_date_range);

    if(p_date_range === 'today') {

      // calculate from date
      this.from_date = moment().startOf('date');
 
      //calculate to date
      this.to_date = moment().endOf('date');

    }

    if(p_date_range === 'yesterday') {

      // calculate from date
      this.from_date = moment().subtract(1, 'days').startOf('date');
      
      //calculate to date
      this.to_date = moment().subtract(1, 'days').endOf('date');

    }

    if(p_date_range === 'last_5_days') {

      // calculate from date
      this.from_date = moment().subtract(5, 'days').startOf('date');
      
      //calculate to date
      this.to_date =  moment().endOf('date');

    }

    if(p_date_range === 'last_7_days') {

      // calculate from date
      this.from_date = moment().subtract(7, 'days').startOf('date');
      
      //calculate to date
      this.to_date =  moment().endOf('date');

    }

    if(p_date_range === 'this_month') {

      // calculate from date
      this.from_date = moment().startOf('month');
      
      //calculate to date
      this.to_date =  moment().endOf('date');

    }


  }


}
