
import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'app-me-release-index',
  templateUrl: './me-release-index.component.html',
  styleUrls: ['./me-release-index.component.css']
})
export class MeReleaseIndexComponent implements OnInit {
  
    // function to open left side navgivation bar
    _opened: boolean = false;



  constructor() { }

  ngOnInit() {

    

  }


    // Local Functions

    receiveToggleSidebarObj($event) {
      // Fetch the Customer Object Value from Event Emitter.
      this._opened = $event;
  
      // console.log("**** @@ Sidebar Open Object @@ ****");
      console.log(this._opened);
    }

}
