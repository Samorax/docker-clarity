import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, inject } from "@angular/core";
import { paymentProcessor } from "../Models/PaymentProcessor";
import { AbstractControl, FormBuilder, NgForm, Validators } from "@angular/forms";
import { appUserService } from "../Services/AppUserService";
import { RegisterCredentials } from "../Models/RegisterCredentials";
import { paymentService } from "../Services/PaymentService";
import { apiKeyRequestService } from "../Services/ApiKeyRequestService";
import { OpenTimes } from "../Models/OpenTimes";
import { Subject } from "rxjs";
import { loadStripe } from "@stripe/stripe-js";
import { appUser } from "../Models/AppUser";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { testModeService } from "../Services/TestModeService";
import { disseminateModeService } from "../Services/DisseminateMode";
import { openTimesService } from "../Services/OpenTimesService";
import { operatingDaysComponent } from "./operatingDaysDialog.component";
import { editOperatingDaysComponent } from "./editOperatingDaysDialog.component";
import { delOperatingDaysComponent } from "./delOperatingDays.component";
import { AuthenticationService } from "../Services/AuthenticationService";
import { deleteAccountComponent } from "./delAccountDialog.component";
import { ChangeDetectionStrategy } from "@angular/core";
import { SmSActivatorService } from "../Services/SmsActivatorService";

@Component({
    templateUrl:'./settings.component.html',
    selector:'app-settings',
    styleUrl:'./settings.component.css',
    changeDetection:ChangeDetectionStrategy.OnPush,
    animations:[
        trigger('openClose',[
            state('close', style({
                height:'0px',
                display:'none'
            })),
            state('open', style({
                height:'100%',
                display:'block'
            })),
            
            transition('close => open',animate('0.8s 100ms ease-out')),
            transition('open => close',animate('0.8s 100ms ease-in')),
           
        ])
    ]
})
export class SettingsComponent implements OnInit, AfterViewInit{

    accountActive = true;
    paymentProvider:paymentProcessor = new paymentProcessor();
    appUserId: any = localStorage.getItem("user_id");
    currency: any = localStorage.getItem('currency_iso_code');
    appUser:any ={};
    feedBack!:string
    showSpinner:boolean = false;
    showFeeback:boolean = false;
    apiKey!:any;
    showKey: boolean = false;
    opentime:OpenTimes = new OpenTimes();
    times:OpenTimes[] = [];
    stripe: any;
    clientSecret: any;
    paymentElement: any;
    settingsUpdateForm!:appUser
    isOpen = true;
    isOpen2 = true;
    isOpen3 = true;

    selected:OpenTimes[] = [];
    showAccountDetailsFeedback: boolean = false;
    showChangePasswordFeedback: boolean = false;
    showPaymentUpdateFeedback: boolean = false;
    
    openingTimes:OpenTimes[] = [];
    isOpen7: boolean = true;
    isOpen6: boolean = true;
    isOpen5: boolean = true;
    isOpen8 = true;
    isOpen4 = true;
    Mode = inject(disseminateModeService)
    @ViewChild(operatingDaysComponent)oDC!:operatingDaysComponent
    @ViewChild(editOperatingDaysComponent)editODC!:editOperatingDaysComponent
    @ViewChild(delOperatingDaysComponent)delODC!:delOperatingDaysComponent
    @ViewChild(deleteAccountComponent)delAcc!:deleteAccountComponent

    showBusinessDetailsUpdateFeedback: boolean = false;
    showLogisticsUpdateFeedback: boolean = false;
    showReceiptUpdateFeedback: boolean = false;
    showPaymentProcessorUpdateFeedback: boolean = false;
    SwitchMode: boolean = false;
    
    

constructor(private _appUserSrv: appUserService,private cd:ChangeDetectorRef,private _testModeSVR:testModeService,private _openTimeSVR:openTimesService, private _authSVR:AuthenticationService,
    private _smsActivator:SmSActivatorService, private _apiKeySvr: apiKeyRequestService, private stripeIntentService: paymentService, private formBUilder:FormBuilder ){}

    ngAfterViewInit(): void {
        this.delAcc.isOk.subscribe(o=>{
            this.deleteAccount(o).subscribe(()=>{
                this._authSVR.logOut();
                this.delAcc.close();
            });
        })

        this.oDC.isOk.subscribe(o=>{
            this._openTimeSVR.addOpenTime(o).subscribe((op:any)=>{
                this.openingTimes.push(op);
                this.oDC.close();
            })
        });

        this.editODC.isOk.subscribe(o=>{
            this._openTimeSVR.updateOpenTime(o).subscribe(op=>{
                let index = this.openingTimes.findIndex(ot=>ot.id === o.id);
                this.openingTimes[index] = o;
                this.editODC.close();
            })
        })

        this.delODC.isOk.subscribe(o=>{
            o.forEach(op=>{
                this._openTimeSVR.deleteOpenTime(op).subscribe(()=>{
                    let index = this.openingTimes.findIndex(ot=>ot.id === op.id);
                    this.openingTimes.splice(index,1);
                })
            });

            this.delODC.close();
            
        })
    }

    settingsForm = this.formBUilder.group({
        accountDetails: this.formBUilder.group({
            firstName:['', Validators.required],
            lastName:['',Validators.required],
            email:['',[Validators.required,Validators.email]],
            phoneNumber:['',Validators.required],
            
        }),
        passwordReset:this.formBUilder.group({
            oldPassword:['',[Validators.required,Validators.pattern('^[A-Za-z\\d@$!%*?&]{8,}$')]],
            newPassword:['',Validators.required]
        }),
        paymentToken:['',Validators.required],
        businessDetails: this.formBUilder.group({
            businessName:['',Validators.required],
            businessAddressLine1:['',Validators.required],
            businessAddressLine2:[''],
            city:['',Validators.required],
            postalCode:['',Validators.required],
            country:['',Validators.required]
        }),
        shopSettings:this.formBUilder.group({
            vatCharge:[''],
            serviceCharge:['']
        }),
        operatingHours:this.formBUilder.group({
            day:['',Validators.required],
            startTime:['',Validators.required],
            endTime:['',Validators.required]
        }),
        notifications:this.formBUilder.group({
            smsActivation:[false,Validators.required],
            birthdayNotifications:['',Validators.required],
            voucherNotifications:['',Validators.required]
        }),
        integrationSettings:this.formBUilder.group({
                processorName:['',Validators.required],
                processorApiKey:['',Validators.required],
                processorAccountId:['',Validators.required],
                processorSoftwareHouseId:['', Validators.required]
            
        }),
        logistics:this.formBUilder.group({
            deliveryDistance:['',Validators.required],
            deliveryFee:['',Validators.required]
        }),
        testMode:['',Validators.required],
        },
        {
            validator: this.MustMatch('passwordReset.oldPassword','passwordReset.newPassword')
            
        }
        
    )


    async ngOnInit(){
        //complete the inital tab form.
        this._appUserSrv.getAppUserInfo()
          .subscribe((x:appUser) => {
            x = this.appUser;
          });
        this.stripe = await loadStripe("pk_test_51OZtsPLMinwGqDJe4WXbskkZ1G2voTezl8OneMarPyB4tweJbNANCrKtyWVdZ0hBxA9pAAid9hs9JVxc6i9kd11g00xRANg6LK");
    }

    NotMatch(controlName: string, matchingControlName: string) {
        return (group: AbstractControl) => {
            const control = group.get(controlName);
            const matchingControl = group.get(matchingControlName);
    
            if (!control || !matchingControl) {
                return null;
            }
    
            // return if another validator has already found an error on the matchingControl
            if (matchingControl.errors && !matchingControl.errors['mustNotMatch']) {
                return null;
            }
    
            // set error on matchingControl if validation fails
            if (control.value == matchingControl.value) {
                
                matchingControl.setErrors({ mustNotMatch: true });
            } else {
                matchingControl.setErrors(null);
            }
            return null;
        }
    }

    MustMatch(controlName: string, matchingControlName: string) {
        return (group: AbstractControl) => {
            const control = group.get(controlName);
            const matchingControl = group.get(matchingControlName);
    
            if (!control || !matchingControl) {
                return null;
            }
    
            // return if another validator has already found an error on the matchingControl
            if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
                return null;
            }
    
            // set error on matchingControl if validation fails
            if (control.value !== matchingControl.value) {
                
                matchingControl.setErrors({ mustMatch: true });
            } else {
                matchingControl.setErrors(null);
            }
            return null;
        }
    }
    
    
onAdd(){
this.oDC.open();
}

onDelete(){
    this.delODC.open(this.selected);
}

onEdit(){
this.editODC.open(this.selected[0]);
}

    showAccountSettings() {
     this.showAccountDetailsFeedback = false;
      this.isOpen = !this.isOpen;
    }

    toggle2(){
        this.isOpen2 = !this.isOpen2;
    }

    showPaymentDetailsSettings(){
        this.showPaymentUpdateFeedback = false;
        this.isOpen3 = !this.isOpen3;
    }

    showPaymentProcessorSettings(){
        this.showPaymentProcessorUpdateFeedback = false;
        this.isOpen4 = !this.isOpen4;
    }
    toggle5(){
        this.isOpen5 = !this.isOpen5;
    }

    showLogisticsSettings(){
        this.showLogisticsUpdateFeedback = false;
        this.isOpen6 = !this.isOpen6;
    }

    showReceiptSettings(){
        this.showReceiptUpdateFeedback = false;
        this.isOpen7 = !this.isOpen7;
    }
    showAddressSettings(){
        this.showBusinessDetailsUpdateFeedback =false;
        this.isOpen8 = !this.isOpen8;
    }

    fillAccountSettings(){
        this._appUserSrv.getAppUserInfo().subscribe(r=>{
        console.log(r.testMode,"checking app mode")
        this.appUser = r;
        this.cd.detectChanges();
        this.CreatePaymentForm();
        this.settingsForm.get('accountDetails.firstName')?.setValue(r.firstName);
        this.settingsForm.get('accountDetails.lastName')?.setValue(r.lastName);
        this.settingsForm.get('accountDetails.email')?.setValue(r.email);
        this.settingsForm.get('accountDetails.phoneNumber')?.setValue(r.phoneNumber);
        this.settingsForm.get('testMode')?.setValue(r.testMode);
        this.Mode.mode.next(r.testMode);
        
        
        this.openingTimes = r.openingTimes;
            this.cd.detectChanges();
        //complete the form to be sent.
        this.settingsUpdateForm = {
            businessName: this.appUser.businessName,
            businessAddress1:this.appUser.businessAddress1,
            businessAddress2:this.appUser.businessAddress2,
            state:this.appUser.state,
            postalCode:this.appUser.postalCode,
            country:this.appUser.country,
            firstName:this.appUser.firstName,
            lastName:this.appUser.lastName,
            email:this.appUser.email,
            phoneNumber:this.appUser.phoneNumber,
            deliveryDistance:this.appUser.deliveryDistance,
            deliveryFee:this.appUser.deliveryFee,
            paymentProcessor:this.appUser.paymentProcessor,
            vatCharge: this.appUser.vatCharge,
            serviceCharge:this.appUser.serviceCharge,
            openingTimes:this.appUser.openingTimes,
            paymentToken:this.appUser.paymentToken,
            testMode:this.appUser.testMode,
            smsMode:this.appUser.smsMode,
            voucherNotify:this.appUser.voucherNotifications,
            birthdayNotify:this.appUser.birthdayNotifications,
            id:this.appUser.id
        }

        localStorage.setItem('password',this.appUser.password);});
    }

    onAccountDelete(x:any){
        x.preventDefault();
        this.delAcc.open();

    }

    deleteAccount(x:boolean){
        this.appUser.isDeleted = true;
        return this._appUserSrv.deleteAppUserInfo(this.appUser)
        
    }

    fillShopSettings(){
        
        this._appUserSrv.getAppUserInfo().subscribe(a=>{
        this.appUser = a;
        this.settingsForm.get('shopSettings.vatCharge')?.setValue(this.appUser.vatCharge);
        this.settingsForm.get('shopSettings.serviceCharge')?.setValue(this.appUser.serviceCharge);
        

        this.settingsForm.get('businessDetails.businessName')?.setValue(this.appUser.businessName);
        this.settingsForm.get('businessDetails.businessAddressLine1')?.setValue(this.appUser.businessAddress1);
        this.settingsForm.get('businessDetails.businessAddressLine2')?.setValue(this.appUser.businessAddress2);
        this.settingsForm.get('businessDetails.city')?.setValue(this.appUser.state);

        this.settingsForm.get('businessDetails.postalCode')?.setValue(this.appUser.postalCode);
        this.settingsForm.get('businessDetails.country')?.setValue(this.appUser.country);

        this.settingsForm.get('logistics.deliveryDistance')?.setValue(this.appUser.deliveryDistance);
        this.settingsForm.get('logistics.deliveryFee')?.setValue(this.appUser.deliveryFee);
        })

    }

    fillIntegrationSettings(){
        this._appUserSrv.getAppUserInfo().subscribe((a:any)=>{
            this.appUser = a;
            let processor = a.paymentProcessor;
            if(processor !== null){
                this.settingsForm.get('integrationSettings.processorName')?.setValue(processor.name);
                this.settingsForm.get('integrationSettings.processorApiKey')?.setValue(processor.apiKey1);
                this.settingsForm.get('integrationSettings.processorAccountId')?.setValue(processor.accountId);
                this.settingsForm.get('integrationSettings.processorSoftwareHouseId')?.setValue(processor.softwareHouseId); 

            }
           
            
        })
    }

    fillNotificationSettings(){
        this._appUserSrv.getAppUserInfo().subscribe((a:appUser)=>{
            console.log(a)
            if(a.testMode){
                this.settingsForm.get('notifications.smsActivation')?.disable();
        
            }else{
                this.settingsForm.get('notifications.smsActivation')?.enable();
            }

            this.settingsForm.get('notifications.smsActivation')?.setValue(a.smsMode)
            this.settingsForm.get('notifications.birthdayNotifications')?.setValue(a.birthdayNotify);
            this.settingsForm.get('notifications.voucherNotifications')?.setValue(a.voucherNotify);
            this.cd.detectChanges();
        });
        


    }

    

    private CreatePaymentForm() {
        this.stripeIntentService.createPaymentIntent({ "amount": "49.99", "currency": "gbp" }).subscribe((c: any) => {
          this.clientSecret = c;
          
          let element = this.stripe?.elements({ clientSecret: this.clientSecret});
          this.paymentElement = element?.create("card",{
            hidePostalCode:true,
            style: {
              base: {
                iconColor: '#666EE8',
                color: '#31325F',
                lineHeight: '40px',
                fontWeight: 300,
                fontFamily: 'Helvetica Neue',
                fontSize: '15px',
          
                '::placeholder': {
                  color: '#CFD7E0',
                },
              },
            }
          });
          
          this.paymentElement?.mount("#payment-element");
          
        });
      }
    
    
    showDojoForms:boolean = false;

    onChangeBusinessDetails(){
        let a = this.settingsForm.get('businessDetails.businessAddressLine1')?.value;
        let b = this.settingsForm.get('businessDetails.businessAddressLine2')?.value;
        let c = this.settingsForm.get('businessDetails.city')?.value;
        let d = this.settingsForm.get('businessDetails.postalCode')?.value;
        let e = this.settingsForm.get('businessDetails.country')?.value;

        this.appUser.businessAddress1 = a;
        this.appUser.businessAddress2 = b;
        this.appUser.state = c;
        this.appUser.postalCode = d;
        this.appUser.country = e;

        this._appUserSrv.updateAppUserInfo(this.appUser.id,this.appUser).subscribe(x=>{
            this.showBusinessDetailsUpdateFeedback = true;
        },(er:Error)=>console.log(er.message));
    }

    onChangeLogisticsDetails(){
        let x = this.settingsForm.get('logistics.deliveryDistance')?.value;
        let y = this.settingsForm.get('logistics.deliveryFee')?.value;

        this.appUser.deliveryDistance = x;
        this.appUser.deliveryFee = y;
        
        this._appUserSrv.updateAppUserInfo(this.appUser.id,this.appUser).subscribe(r=>{
            this.showLogisticsUpdateFeedback = true;
        },(er:Error)=> console.log(er.message));
    }

    //update the vat charge fee and the service charge. 
    onChangeReceiptDetails(){
        let x = this.settingsForm.get('shopSettings.vatCharge')?.value;
        let y = this.settingsForm.get('shopSettings.serviceCharge')?.value;

        this.appUser.vatCharge = x;
        this.appUser.serviceCharge = y;

        this._appUserSrv.updateAppUserInfo(this.appUser.id,this.appUser).subscribe(r=>{
            this.showReceiptUpdateFeedback = true;
        },(er:Error)=>console.log(er.message));
    }
    
    onChangePaymentDetails(x:any){
        x.preventDefault();
        this.stripe.createToken(this.paymentElement)
        .then((c:any)=> {
            this.settingsUpdateForm.paymentToken = c;
            this._appUserSrv.updateAppUserInfo(this.settingsUpdateForm.id,this.settingsUpdateForm).subscribe(()=>{
                this.showPaymentUpdateFeedback = true;
            });
        })
        .catch((er:Error)=> console.log(er.message)); 
    }
    
    onChangePaymentProcessor(x:any){
        x.preventDefault();
        let pp = this.settingsForm.get('integrationSettings')?.value;
    
        this.settingsUpdateForm.paymentProcessor = pp;

        this._appUserSrv.updateAppUserInfo(this.settingsUpdateForm.id,this.settingsUpdateForm).subscribe(r=>{
            this.showPaymentProcessorUpdateFeedback = true;
        },(er:Error)=>console.log(er.message));
    }


    onChangeAccountDetails(){
        let x = this.settingsForm.get('accountDetails.lastName')?.value;
        let y = this.settingsForm.get('accountDetails.firstName')?.value;
        let z = this.settingsForm.get('accountDetails.email')?.value;
        let a = this.settingsForm.get('accountDetails.phoneNumber')?.value;

        this.settingsUpdateForm.firstName = y; this.settingsUpdateForm.lastName = x;
        this.settingsUpdateForm.email =  z; this.settingsUpdateForm.phoneNumber = a;

        this._appUserSrv.updateAppUserInfo(this.settingsUpdateForm.id,this.settingsUpdateForm).subscribe(x=>{
            this.showAccountDetailsFeedback = true;
            this.isOpen = false;
        });
    }

    onChangePassword(){
        let x = this.settingsForm.get('passwordReset.password')?.value;
        this.settingsUpdateForm.password = x;
        this._appUserSrv.changePassword(this.settingsUpdateForm.password).subscribe(x=>{
            this.showChangePasswordFeedback = true;
            this.isOpen2 = false;
        });
    }

    onAddOpenTime(x:NgForm){
      let o = <OpenTimes>x.value;
      o.applicationUserID = this.appUserId;
      this.times.push(o);
    }
    
   

    onDeleteOpenTimes(x:OpenTimes){
        let i = this.times.indexOf(x);
        this.times.splice(i,1);
    }

    onSubmit(){
        this.showSpinner = true;
        let pp = this.settingsForm.value;
        
        /*  this.paymentProvider.apiKey1 = pp.apiKey1;
        this.paymentProvider.apiKey2 = pp.apiKey2;
        this.paymentProvider.accountId = pp.accountId;
        this.paymentProvider.softwareHouseId = pp.softwareHouseId;
        this.paymentProvider.name = pp.name;
        this.paymentProvider.applicationUserID = this.appUserId;
        if(this.appUser !== undefined){
            this.appUser.paymentProcessor =  this.paymentProvider;
            this.appUser.vatCharge = pp.vatCharge;
          this.appUser.serviceCharge = pp.serviceCharge;
          this.appUser.deliveryFee = pp.deliveryFee;
            console.log(this.appUser); 
      }
       
        localStorage.setItem('apiKey1', this.appUser.paymentProcessor?.apiKey1 as string);
       
        this._appUserSrv.updateAppUserInfo(this.appUserId, this.appUser)
        .subscribe(
            (r:any)=>{ this.feedBack = r},
            (err:any)=> console.log(err),
            ()=> {
                this.showStripeForms = false;
                 this.showFeeback = true;
                 this.showSpinner = false;
                }); */
    }

    onAddHour(x:any){
        x.preventDefault();
        let h:OpenTimes = 
        {
            day:this.settingsForm.get('operatingHours.day')?.value,
            startTime:this.settingsForm.get('operatingHours.startTime')?.value,
            endTime:this.settingsForm.get('operatingHours.endTime')?.value,
            applicationUserID:this.appUserId
        };

        this.openingTimes.push(h);
    }

    onSaveHour(x:any){
        x.preventDefault();
        this.openingTimes.forEach(o=>{
            console.log(o);
            this._openTimeSVR.addOpenTime(o).subscribe(x=>{
                console.log(x);
            },(er:Error)=>console.log(er));
        })

       
    }

    onChangeProcessor(){
       let y = this.settingsForm.get('integrationSettings.processorName')?.value;
       if(y === 'Dojo'){
         this.showDojoForms = true;
        }
    }

    onApiRequest(x:any){
        x.preventDefault();
        this._apiKeySvr.getApiKey().subscribe(k=>{
            this.apiKey = k;
            this.showKey = true;
        },(er)=>console.log(er))
    }

    onSwitchMode(){
     this.SwitchMode = true;
     let y = this.settingsForm.get('testMode')?.value;
    
     this._testModeSVR.setMode(y).subscribe({
        next:(s:any)=>{

            localStorage.removeItem('access_token');
            localStorage.setItem('access_token',s);
            
            localStorage.removeItem('appMode');
            localStorage.setItem('appMode',y);
            
            let sms = this.settingsForm.get('notifications.smsActivation');
            this.Mode.mode.next(y);
            if(y == true)
            {
                sms?.disable();
                this._smsActivator.activaionState.next(true);
            }else{
                sms?.enable();
            } 
            this.SwitchMode = false;
           
            this.cd.detectChanges()
        },
        error:(er)=>console.log(er)
    })
    }

    onVoucherNotifications() {
        let s = this.settingsForm.get('notifications.voucherNotifications')?.value;
        this.appUser.voucherNotify = s;
        this._appUserSrv.updateAppUserInfo(this.appUser.id,this.appUser).subscribe();
    }

        onSmsActivation() {
         let s = this.settingsForm.get('notifications.smsActivation')?.value;
         this.appUser.smsMode = s;
         this._appUserSrv.updateAppUserInfo(this.appUser.id,this.appUser).subscribe(()=>{
            let d = s == true?false:true;
            this._smsActivator.activaionState.next(d);
         });
            
        }

        onBirthdayNotifications() {
        let s = this.settingsForm.get('notifications.birthdayNotifications')?.value;
        this.appUser.birthdayNotify = s;
        this._appUserSrv.updateAppUserInfo(this.appUser.id,this.appUser).subscribe();
        }
}
