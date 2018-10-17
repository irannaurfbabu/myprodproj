
/*
____________________________________________________________________________________________________________
## COMPONENT OBJECT FOR OWNER PROFILE ##
------------------------------------------------------------------------------------------------------------
|   VERSION     |   1.0      |   CREATED_ON  |   24-JAN-2018 |   CREATED_BY  |   AKASH
------------------------------------------------------------------------------------------------------------
## COMPONENT FUNTIONALITY DETAILS 	##
------------------------------------------------------------------------------------------------------------
|   ++ HTTP Service for Owner profile retrieval
|   
------------------------------------------------------------------------------------------------------------
## CHANGE LOG DETAILS 				##
------------------------------------------------------------------------------------------------------------
|   ++ 14-JUN-2018    v1.0     - Created the New Component.
|   ++
____________________________________________________________________________________________________________

*/

// -- @details : Built and Custom Imports  #################################################################
//  ~ Start  -----------------------------------------------------------------------------------------------
// Import Angular Core Libraries/Functionalities

import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import swal from "sweetalert2";
@Component({
  selector: 'app-me-access-denied',
  templateUrl: './me-access-denied.component.html',
  styleUrls: ['./me-access-denied.component.css']
})
export class MeAccessDeniedComponent implements OnInit {

  constructor(    public  router                    : Router
  ) { }

  ngOnInit() {
    swal({
      type: 'error',
      title: 'Access Denied',
      text: "You don't have any permission to access...",
      allowOutsideClick : false,
      allowEscapeKey : false,
      allowEnterKey : false,
      showConfirmButton: true
      
    }).then((result) => {

      if(result.value) {
        this.router.navigateByUrl('/login');

      }

}) // swal ~ end -----
  }

}
