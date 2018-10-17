import { Injectable } from '@angular/core';
import { NotificationsService } from 'angular2-notifications';
import { SimpleNotificationsModule } from 'angular2-notifications';

@Injectable()
export class MeToastNotificationService {

  // Common  Messages for all Form
  Mssg01 = ' Please fill all required fields';
  Mssg02 = ' You have not made any changes to form';
  Mssg03 = ' Error - ';


  constructor(public _service: NotificationsService) { }
  // general mssgs
  ShowPreDefinedMessage(p_message_type, p_message_text) {  // 2 parameters rcvd from resp from.

    if (p_message_type === 'w' && p_message_text === 'CMN-001') {  // cmn-001 is a rcved parameter .
      this.Warning();
      console.log('adi');
    }
    if (p_message_type === 'I' && p_message_text === 'CMN-002') {  // cmn-001 is a rcved parameter .
      this.Info();
    }

  }
  // custom message function
  ShowCustomMessage(p_message_type, p_message_text) {
    if (p_message_type === 'w') {                       // w - warning 
      this._service.warn('<strong>Warning</strong>',
        p_message_text,              // custom message is printing
        {
          timeOut: 3000,
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: true,
          maxLength: 1000,
          maxStack:1
          // position: ['bottom', 'center'], // postion is not working , Css written for this case
        }
      );
    }
    if (p_message_type === 'I') {                     // i -information tag
      this._service.info('<strong>Info</strong>',
        p_message_text,
        {
          timeOut: 3000,
          showProgressBar: true,
          pauseOnHover: true,
          clickToClose: true,
          maxLength: 1000,
          maxStack:1
        }
      );
    }
  }

  // separate function for common notifications 

  Warning() {
    this._service.warn('<strong>Warning</strong>',
      this.Mssg01,
      {
        timeOut: 3000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 1000,
        maxStack:1
      }
    );
  }

  Info() {
    this._service.info('<strong>INFO</strong>',
      this.Mssg02,
      {
        timeOut: 3000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 1000,
        maxStack:1
      }
    );
  }
  Error() {
    this._service.error('<strong>Error</strong>',
      this.Mssg02,
      {
        timeOut: 3000,
        showProgressBar: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 1000,
        maxStack:1
      }
    );
  }
}
