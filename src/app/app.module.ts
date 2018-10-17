

/*
  @details -   Angular Modules\Libraries ----------------------------------------------------------------------------
*/
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { DatePipe } from '@angular/common';

// import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxPaginationModule } from 'ngx-pagination';
import { HttpClientModule } from '@angular/common/http';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressRouterModule } from '@ngx-progressbar/router';
import { PersistenceModule } from 'angular-persistence';
import { SweetAlert2Module } from '@toverux/ngx-sweetalert2';
import { NguiAutoCompleteModule } from '@ngui/auto-complete';
import { SimpleNotificationsModule } from 'angular2-notifications';
// import { NotificationsService } from 'angular2-notifications';

import { ChartsModule } from 'ng2-charts';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import * as moment from 'moment';
// import * as jsPDF from 'jspdf'

import { MomentModule } from 'angular2-moment';
import { SidebarModule } from 'ng-sidebar'; 
// import { Angular2CsvModule } from 'angular2-csv';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import 'hammerjs';
declare var jsPDF: any; // Important


/*
  @details -   Angular Modules\Libraries
  !!! IMPORTANT !!!
    - Add Angular Material Modules as needed in the application.
*/



import {
  MatFormFieldModule,
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  DateAdapter,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import { Ng2OrderModule } from 'ng2-order-pipe'; //importing the module
import {HashLocationStrategy, Location, LocationStrategy} from '@angular/common';


// Import the Covalent Core NgModule
import { CovalentLayoutModule,
  CovalentPagingModule, 
  CovalentSearchModule,
  CovalentDataTableModule, 
  CovalentMediaModule, 
  CovalentLoadingModule,
  CovalentNotificationsModule,  
  CovalentMenuModule,
  CovalentStepsModule,
  CovalentCommonModule, 
  CovalentDialogsModule
} from '@covalent/core';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core/data-table';

// primeng Modules
import {TableModule} from 'primeng/table';
import {PanelMenuModule} from 'primeng/panelmenu';
import {ContextMenuModule} from 'primeng/contextmenu';
import {DialogModule} from 'primeng/dialog';
import {MenuModule} from 'primeng/menu';
import {ButtonModule} from 'primeng/button';
import {TieredMenuModule} from 'primeng/tieredmenu';
import {SplitButtonModule} from 'primeng/splitbutton';
/*
  @details -   Customer Modules\Libraries ----------------------------------------------------------------------------
*/
// Common Components
import { AppComponent } from './app.component';
import { MeLoginComponent } from './Components/common/me-login/me-login.component';
import { MeHomeComponent } from './Components/common/me-home/me-home.component';
import { MeHeaderNavComponent } from './Components/common/me-header-nav/me-header-nav.component';
import { MeLeftSideNavComponent } from './Components/common/me-left-side-nav/me-left-side-nav.component';
import { MeFormsLinksComponent } from './Components/common/me-forms-links/me-forms-links.component';
import { MeFooterComponent } from './Components/common/me-footer/me-footer.component';
import { MeTablePreloaderComponent } from './Components/common/me-table-preloader/me-table-preloader.component';
import { MePaginationComponent } from './Components/common/me-pagination/me-pagination.component';
import { MePageNotFoundComponent } from './Components/common/me-page-not-found/me-page-not-found.component';
import { MeOwnerProfileComponent } from './Components/common/me-owner-profile/me-owner-profile.component';
import { MeAccessDeniedComponent } from './Components/common/me-access-denied/me-access-denied.component';
import { MeBarcodeComponent } from './Components/mobicable/me-barcode/me-barcode.component';

// Functional Components
import { MeManageAreaComponent } from './Components/mobicable/me-manage-area/me-manage-area.component';
import { MeCreateAreaComponent } from './Components/mobicable/me-create-area/me-create-area.component';
import { MeEditAreaComponent } from './Components/mobicable/me-edit-area/me-edit-area.component';
import { MeManagePackComponent } from './Components/mobicable/me-manage-pack/me-manage-pack.component';
import { MeCreatePackComponent } from './Components/mobicable/me-create-pack/me-create-pack.component';
import { MeEditPackComponent } from './Components/mobicable/me-edit-pack/me-edit-pack.component';
import { MeManageUserComponent } from './Components/mobicable/me-manage-user/me-manage-user.component';
import { MeCreateUserComponent } from './Components/mobicable/me-create-user/me-create-user.component';
import { MeEditUserComponent } from './Components/mobicable/me-edit-user/me-edit-user.component';

import { MeManageComplaintComponent } from './Components/mobicable/me-manage-complaint/me-manage-complaint.component';
import { MeCreateComplaintComponent } from './Components/mobicable/me-create-complaint/me-create-complaint.component';
import { MeEditComplaintComponent } from './Components/mobicable/me-edit-complaint/me-edit-complaint.component';


import { MeManageCustomerComponent } from './Components/mobicable/me-manage-customer/me-manage-customer.component';
import { MeCreateCustomerComponent } from './Components/mobicable/me-create-customer/me-create-customer.component';
import { MeEditCustomerComponent } from './Components/mobicable/me-edit-customer/me-edit-customer.component';

import { MeManagePaymentsComponent } from './Components/mobicable/me-manage-payments/me-manage-payments.component';
import { MeAddBalanceComponent      } from './Components/mobicable/me-add-balance/me-add-balance.component';
import { MeAddReversalComponent     } from './Components/mobicable/me-add-reversal/me-add-reversal.component';
import { MeCollectPaymentComponent } from './Components/mobicable/me-collect-payment/me-collect-payment.component';
import { MeCustomerDetailsComponent } from './Components/mobicable/me-customer-details/me-customer-details.component';
import { MeAddChargesComponent } from './Components/mobicable/me-add-charges/me-add-charges.component';
import { MeAddRebateComponent } from './Components/mobicable/me-add-rebate/me-add-rebate.component';
import { MeBillHistoryComponent } from './Components/mobicable/me-bill-history/me-bill-history.component';
import { MePaymentHistoryComponent } from './Components/mobicable/me-payment-history/me-payment-history.component';
import { MeStbDetailsComponent } from './Components/mobicable/me-stb-details/me-stb-details.component';
import { MeProformaInvoiceComponent } from './Components/mobicable/me-proforma-invoice/me-proforma-invoice.component';
import { MeStbHistoryComponent } from './Components/mobicable/me-stb-history/me-stb-history.component';
import { MeManageExpenseComponent } from './Components/mobicable/me-manage-expense/me-manage-expense.component';
import { MeCreateExpenseComponent } from './Components/mobicable/me-create-expense/me-create-expense.component';
import { MeEditExpenseComponent } from './Components/mobicable/me-edit-expense/me-edit-expense.component';
import { MeHelpCenterComponent } from './Components/others/me-help-center/me-help-center.component';
import { MeFormPreloaderComponent }       from './Components/common/me-form-preloader/me-form-preloader.component';
import { MePreloaderCircularComponent }   from './Components/common/me-preloader-circular/me-preloader-circular.component';

// Reports
import { MeCollectionReportComponent } from './Components/reports/me-collection-report/me-collection-report.component';
import { MeUnpaidReportComponent } from './Components/reports/me-unpaid-report/me-unpaid-report.component';
import { MeCustomerReportComponent } from './Components/reports/me-customer-report/me-customer-report.component';
import { MeCollectionReportNewComponent } from './Components/reports/me-collection-report-new/me-collection-report-new.component';
import { MeGstReportComponent } from './Components/reports/me-gst-report/me-gst-report.component';
// import { MeCustomerReportComponentOld } from './Components/reports/me-customer-report-old/me-customer-report-old.component';
// Release Components
import { MeReleaseIndexComponent } from './Components/others/me-help-center/Releases/me-release-index/me-release-index.component';
import { MeReleaseIndexSidebarComponent } from './Components/others/me-help-center/Releases/me-release-index-sidebar/me-release-index-sidebar.component';
import { MeReleaseSep18V017Component } from './Components/others/me-help-center/Releases/me-release-sep18-v017/me-release-sep18-v017.component';

// Services
import { MeCalculatePackPriceService }    from './Service/me-calculate-pack-price.service';
import { MeValidateFormFieldsService }    from './Service/me-validate-form-fields.service';
import { MeCallHttpGetService }           from './Service/me-call-http-get.service';
import { MeCallHttpPostService }          from './Service/me-call-http-post.service';
import { MeUserProfileService }           from './Service/me-user-profile.service';
import { MeAuthGuardService }             from './Service/me-auth-guard.service';
import { MeAuthService }                  from './Service/me-auth.service';
import { MeSendSmsService } from './Service/me-send-sms.service';
import { MeToastNotificationService } from './Service/me-toast-notification.service'; // notification Service
import { DateFormat } from './Components/mobicable/me-class/date-format';
import { MeCalculateDateService } from './Service/me-calculate-date.service';
import { MeGzipService } from './Service/me-gzip.service';
import { MeDataExchangeService        } from "./Service/me-data-exchange.service";

// Directives
import { RestrictInputDirective }         from './Components/mobicable/me-class/RestrictInputDirective';
import { DisableControlDirective }        from './Components/mobicable/me-class/DisableControlDirective';
import { MeCustomerReportOldComponent } from './Components/reports/me-customer-report-old/me-customer-report-old.component';





const appRoutes: Routes = [
  { path: 'login', component: MeLoginComponent },
  { path: 'home', canActivate: [MeAuthGuardService], component: MeHomeComponent },
  { path: 'managearea', canActivate: [MeAuthGuardService], component: MeManageAreaComponent },
  { path: 'createarea', canActivate: [MeAuthGuardService], component: MeCreateAreaComponent },
  { path: 'editarea/:id', canActivate: [MeAuthGuardService], component: MeEditAreaComponent },
  { path: 'managepack', canActivate: [MeAuthGuardService], component: MeManagePackComponent },
  { path: 'createpack', canActivate: [MeAuthGuardService], component: MeCreatePackComponent },
  { path: 'editpack/:id', canActivate: [MeAuthGuardService], component: MeEditPackComponent },
  { path: 'manageuser', canActivate: [MeAuthGuardService], component: MeManageUserComponent },
  { path: 'createuser', canActivate: [MeAuthGuardService], component: MeCreateUserComponent },
  { path: 'edituser/:id', canActivate: [MeAuthGuardService], component: MeEditUserComponent },
  { path: 'managecomplaint', canActivate: [MeAuthGuardService], component: MeManageComplaintComponent },
  { path: 'createcomplaint', canActivate: [MeAuthGuardService], component: MeCreateComplaintComponent },
  { path: 'editcomplaint/:id', canActivate: [MeAuthGuardService], component: MeEditComplaintComponent },
  { path: 'managecustomer', canActivate: [MeAuthGuardService],  component: MeManageCustomerComponent },
  { path: 'createcustomer', canActivate: [MeAuthGuardService], component: MeCreateCustomerComponent },
  { path: 'editcustomer', canActivate: [MeAuthGuardService], component: MeEditCustomerComponent },
  { path: 'managepayments', canActivate: [MeAuthGuardService], component: MeManagePaymentsComponent },
  { path:  'addrebate', canActivate: [MeAuthGuardService], component:   MeAddRebateComponent      },
  { path:  'addbalance', canActivate: [MeAuthGuardService], component:   MeAddBalanceComponent      },
  { path:  'addreversal', canActivate: [MeAuthGuardService], component:   MeAddReversalComponent     },
  { path:  'collectpayment', canActivate: [MeAuthGuardService], component:   MeCollectPaymentComponent  },
  { path:  'addcharges', canActivate: [MeAuthGuardService], component:   MeAddChargesComponent  },
  // { path:  'collectionreport', canActivate: [MeAuthGuardService], component:   MeCollectionReportComponent  },
  { path:  'customerreport', canActivate: [MeAuthGuardService], component:   MeCustomerReportComponent  },
  { path:  'customerreportold', canActivate: [MeAuthGuardService], component:   MeCustomerReportOldComponent  },
  { path: 'ownerprofile', canActivate: [MeAuthGuardService], component: MeOwnerProfileComponent },
  { path: 'accessdenied', canActivate: [MeAuthGuardService], component:   MeAccessDeniedComponent  },
  { path: 'manageexpense', canActivate: [MeAuthGuardService], component:   MeManageExpenseComponent  },
  { path: 'createexpense', canActivate: [MeAuthGuardService], component:   MeCreateExpenseComponent  },
  { path: 'editexpense/:id', canActivate: [MeAuthGuardService], component:   MeEditExpenseComponent  },
  { path: 'collectionreport', canActivate: [MeAuthGuardService], component:   MeCollectionReportNewComponent  },
  { path: 'unpaidreport', canActivate: [MeAuthGuardService], component:   MeUnpaidReportComponent  },
  { path: 'gstreport', canActivate: [MeAuthGuardService], component:   MeGstReportComponent  },

  { path: 'helpcenter', canActivate: [MeAuthGuardService], component:   MeHelpCenterComponent  },
  { path: 'releaseindex', canActivate: [MeAuthGuardService], component:   MeReleaseIndexComponent  },
  { path: 'releasesep18v017', canActivate: [MeAuthGuardService], component:   MeReleaseSep18V017Component  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: MePageNotFoundComponent }
  // { path: 'contact', component: ContactComponent },
  // { path: 'contactus', redirectTo: 'contact' },
];


@NgModule({
  declarations: [
    AppComponent,
    MeLoginComponent,
    MeHomeComponent,
    MeHeaderNavComponent,
    MeLeftSideNavComponent,
    MeFormsLinksComponent,
    MeFooterComponent,
    MePaginationComponent,
    MeTablePreloaderComponent,
    MePageNotFoundComponent,
    MeManageAreaComponent,
    MeCreateAreaComponent,
    MeEditAreaComponent,
    MeManagePackComponent,
    MeCreatePackComponent,
    MeEditPackComponent,
    MeManageUserComponent,
    MeCreateUserComponent,
    MeManageComplaintComponent,
    MeCreateComplaintComponent,
    MeManageCustomerComponent,
    MeFormPreloaderComponent,
    MeCreateCustomerComponent,
    MeEditCustomerComponent,
    MeEditUserComponent,
    MeManagePaymentsComponent,
    MeEditComplaintComponent,
    MeAddBalanceComponent,
    MeCustomerDetailsComponent,
    MeAddReversalComponent,
    MePreloaderCircularComponent,
    MeCollectPaymentComponent,
    RestrictInputDirective,
    DisableControlDirective,
    MeCollectionReportComponent,
    MeUnpaidReportComponent,
    MeBillHistoryComponent,
    MePaymentHistoryComponent,
    MeStbDetailsComponent,
    MeAddChargesComponent,
  MeAddRebateComponent,
  MeCustomerReportComponent,
  MeStbHistoryComponent,
  MeOwnerProfileComponent,
  MeAccessDeniedComponent,
  MeManageExpenseComponent,
  MeCreateExpenseComponent,
  MeProformaInvoiceComponent,
  MeEditExpenseComponent,
  MeCollectionReportNewComponent,
  MeBarcodeComponent,
  MeHelpCenterComponent,
  MeReleaseIndexComponent,
  MeReleaseSep18V017Component,
  MeReleaseIndexSidebarComponent,
  MeGstReportComponent,
  MeCustomerReportOldComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    MatSortModule,
    MatInputModule,
    // Ng2SearchPipeModule,
    NgxPaginationModule,
    HttpClientModule,
    MatDialogModule,
    MatMenuModule,
    //DateValueAccessorModule,
    //AutocompleteModule.forRoot(),
    NguiAutoCompleteModule,
    Ng2OrderModule ,
    MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  CovalentLayoutModule,
  CovalentPagingModule, 
  CovalentSearchModule,
  CovalentDataTableModule, 
  CovalentMediaModule, 
  CovalentLoadingModule,
  CovalentNotificationsModule,  
  CovalentMenuModule,
  CovalentStepsModule,
  CovalentCommonModule, 
  CovalentDialogsModule,
  SimpleNotificationsModule.forRoot(),
  TableModule, 
  PanelMenuModule,
  ContextMenuModule,
  DialogModule,
  MenuModule,
  ButtonModule,
  TieredMenuModule,  
  SplitButtonModule,
  SweetAlert2Module.forRoot(),
  NgProgressModule.forRoot(),
  NgProgressModule.forRoot(),
  NgProgressRouterModule,
  PersistenceModule,
  ChartsModule,
  NgxChartsModule,
  MomentModule,
  SimpleNotificationsModule.forRoot(),
  SidebarModule.forRoot(),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  exports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatRippleModule,
    MatSnackBarModule,
    MatSortModule,
    MatAutocompleteModule,
    MatNativeDateModule,
    MatDialogModule,
    MatMenuModule,
    MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,  
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  ],
  providers: [
    MeValidateFormFieldsService,
    MeCallHttpPostService,
    MeCallHttpGetService,
    MeUserProfileService,
    MeCalculatePackPriceService,
    MeAuthGuardService,
    MeAuthService,
    MeDataExchangeService,
    TdDataTableService,
    // NotificationsService,
    MeSendSmsService,
    DatePipe,
    MeToastNotificationService,
    MeCalculateDateService,
    MeGzipService,
    Location, {provide: LocationStrategy, useClass: HashLocationStrategy},
    { provide: DateAdapter, useClass: DateFormat },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private dateAdapter:DateAdapter<Date>) {
    dateAdapter.setLocale('en-in');
  }
}
