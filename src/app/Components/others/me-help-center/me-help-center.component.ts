import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-me-help-center',
  templateUrl: './me-help-center.component.html',
  styleUrls: ['./me-help-center.component.css']
})
export class MeHelpCenterComponent implements OnInit {

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
