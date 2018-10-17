import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-me-release-sep18-v017',
  templateUrl: './me-release-sep18-v017.component.html',
  styleUrls: ['./me-release-sep18-v017.component.css']
})
export class MeReleaseSep18V017Component implements OnInit {

  // function to open left side navgivation bar
  _opened: boolean = false;
  
  constructor() { }

  ngOnInit() {
  }

  
  receiveToggleSidebarObj($event) {
    // Fetch the Customer Object Value from Event Emitter.
    this._opened = $event;

    // console.log("**** @@ Sidebar Open Object @@ ****");
    console.log(this._opened);
  }

}
