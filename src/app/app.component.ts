import { Component } from '@angular/core';
import { RouterModule, Routes, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';


  constructor(private router: Router) {

  };

// Configuration for Angular Progressbar on top of the page
//~ Start -------------------------------------------------------------------------------------------
  options = {
    min: 8,
    max: 100,
    ease: 'easeInOutQuad',
    speed: 200,
    trickleSpeed: 300,
    meteor: true,
    spinner: false,
    spinnerPosition: 'right',
    direction: 'ltr+',
    color: 'orange',
    thick: true
  };

  startedClass = false;
  completedClass = false;
  preventAbuse = false;

  onStarted() {
    this.startedClass = true;
    setTimeout(() => {
      this.startedClass = false;
    }, 800);
  }

  onCompleted() {
    this.completedClass = true;
    setTimeout(() => {
      this.completedClass = false;
    }, 800);
  }

//~ End -------------------------------------------------------------------------------------------

}
