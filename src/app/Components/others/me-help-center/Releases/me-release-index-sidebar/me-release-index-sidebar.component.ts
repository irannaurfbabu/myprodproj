import { Component, OnInit } from '@angular/core';
import {PanelMenuModule} from 'primeng/panelmenu';
import {MenuItem} from 'primeng/api';

@Component({
  selector: 'app-me-release-index-sidebar',
  templateUrl: './me-release-index-sidebar.component.html',
  styleUrls: ['./me-release-index-sidebar.component.css']
})
export class MeReleaseIndexSidebarComponent implements OnInit {

  items: MenuItem[];

  constructor() { }

  ngOnInit() {

    this.items = [
      {
          label: 'Sep 2018',
          icon: 'pi pi-pw pi-calendar',
          items: [
            
              {label: 'Release v0.17', icon: 'pi pi-fw pi-external-link',routerLink: ['/releasesep18v017']},
              {separator: true},
              {label: 'Release v0.18', icon: 'pi pi-fw pi-external-link'},
              {separator: true},
          ]
      },
      {
          label: 'Oct 2018',
          icon: 'pi pi-fw pi-calendar',
          items: [
              {label: 'Coming Soon', icon: 'pi pi-fw pi-external-link'},
              {separator: true},
          ]
      }
      
  ];

  }

}
