import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, inject } from "@angular/core";
import { paymentProcessor } from "../Models/PaymentProcessor";
import { AbstractControl, FormBuilder, NgForm, Validators } from "@angular/forms";
import { appUserService } from "../Services/AppUserService";
import { RegisterCredentials } from "../Models/RegisterCredentials";
import { paymentService } from "../Services/PaymentService";
import { apiKeyRequestService } from "../Services/ApiKeyRequestService";
import { OpenTimes } from "../Models/OpenTimes";
import { BehaviorSubject, Subject } from "rxjs";
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
import { ActivatedRoute } from "@angular/router";
import { environment } from "../../environment/environment";
import { ClrLoadingState } from "@clr/angular";

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
    appUser:BehaviorSubject<appUser> = new BehaviorSubject<appUser>(new appUser());
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
ReceiptBtnState: ClrLoadingState = ClrLoadingState.DEFAULT
PaymentBtnState: ClrLoadingState = ClrLoadingState.DEFAULT
    
    

constructor(private _appUserSrv: appUserService,private activatedRoute: ActivatedRoute,private cd:ChangeDetectorRef,private _testModeSVR:testModeService,
    private _openTimeSVR:openTimesService, private _authSVR:AuthenticationService,
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
                Name:['',Validators.required],
                ApiKey1:['',Validators.required],
                AccountId:['',Validators.required],
                SoftwareHouseId:['', Validators.required]
            
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


    ngOnInit(){
        //complete the inital tab form.
        this.activatedRoute.data.subscribe((x:any) => {
            this.appUser.next(x.appUser);
            console.log(this.appUser.getValue())
            loadStripe(environment.stripeTestKey).then(r=> this.stripe = r);
          });
        
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
         this.appUser.subscribe(r=>{
            
            this.CreatePaymentForm();
            this.settingsForm.get('accountDetails.firstName')?.setValue(r.firstName);
            this.settingsForm.get('accountDetails.lastName')?.setValue(r.lastName);
            this.settingsForm.get('accountDetails.email')?.setValue(r.email);
            this.settingsForm.get('accountDetails.phoneNumber')?.setValue(r.phoneNumber);
            this.settingsForm.get('testMode')?.setValue(r.testMode);
            this.Mode.mode.next(r.testMode);
            this.openingTimes = r.openingTimes;

             this.settingsUpdateForm = {
                businessName: r.businessName,
                businessAddress1:r.businessAddress1,
                businessAddress2:r.businessAddress2,
                state:r.state,
                postalCode:r.postalCode,
                country:r.country,
                firstName:r.firstName,
                lastName:r.lastName,
                email:r.email,
                phoneNumber:r.phoneNumber,
                deliveryDistance:r.deliveryDistance,
                deliveryFee:r.deliveryFee,
                paymentProcessor:r.paymentProcessor,
                vatCharge: r.vatCharge,
                serviceCharge:r.serviceCharge,
                openingTimes:r.openingTimes,
                paymentToken:r.paymentToken,
                testMode:r.testMode,
                smsMode:r.smsMode,
                voucherNotify:r.voucherNotify,
                birthdayNotify:r.birthdayNotify,
                isDeleted:r.isDeleted,
                id:r.id
            }
            this.cd.detectChanges();
            localStorage.setItem('password',r.password);
        }) 
        
       
        
        
        
        //complete the form to be sent.
        

       
    };
    

    onAccountDelete(x:any){
        x.preventDefault();
        this.delAcc.open();

    }

    deleteAccount(x:boolean){
        let user:appUser = this.appUser.getValue();
        user.isDeleted = true;
        return this._appUserSrv.deleteAppUserInfo(user)
        
    }

    fillShopSettings(){
        this.appUser.subscribe(r=>{
            this.settingsForm.get('shopSettings.vatCharge')?.setValue(r.vatCharge);
            this.settingsForm.get('shopSettings.serviceCharge')?.setValue(r.serviceCharge);
            
    
            this.settingsForm.get('businessDetails.businessName')?.setValue(r.businessName);
            this.settingsForm.get('businessDetails.businessAddressLine1')?.setValue(r.businessAddress1);
            this.settingsForm.get('businessDetails.businessAddressLine2')?.setValue(r.businessAddress2);
            this.settingsForm.get('businessDetails.city')?.setValue(r.state);
    
            this.settingsForm.get('businessDetails.postalCode')?.setValue(r.postalCode);
            this.settingsForm.get('businessDetails.country')?.setValue(r.country);
    
            this.settingsForm.get('logistics.deliveryDistance')?.setValue(r.deliveryDistance);
            this.settingsForm.get('logistics.deliveryFee')?.setValue(r.deliveryFee);
        })
       
        
        

    }

    fillIntegrationSettings(){
       this.appUser.subscribe(r=>{
        let processor = r.paymentProcessor;
        if(processor !== null){
            this.settingsForm.get('integrationSettings.processorName')?.setValue(processor.name);
            this.settingsForm.get('integrationSettings.processorApiKey')?.setValue(processor.apiKey1);
            this.settingsForm.get('integrationSettings.processorAccountId')?.setValue(processor.accountId);
            this.settingsForm.get('integrationSettings.processorSoftwareHouseId')?.setValue(processor.softwareHouseId); 

        }
       })

    }

    fillNotificationSettings(){
        this.appUser.subscribe(a=>{
            if(a.testMode){
                this.settingsForm.get('notifications.smsActivation')?.disable();
        
            }else{
                this.settingsForm.get('notifications.smsActivation')?.enable();
            }

            this.settingsForm.get('notifications.smsActivation')?.setValue(a.smsMode)
            this.settingsForm.get('notifications.birthdayNotifications')?.setValue(a.birthdayNotify);
            this.settingsForm.get('notifications.voucherNotifications')?.setValue(a.voucherNotify);
            this.cd.detectChanges();
        })
           

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
        this.appUser.subscribe(r=>{
            let a = this.settingsForm.get('businessDetails.businessAddressLine1')?.value;
            let b = this.settingsForm.get('businessDetails.businessAddressLine2')?.value;
            let c = this.settingsForm.get('businessDetails.city')?.value;
            let d = this.settingsForm.get('businessDetails.postalCode')?.value;
            let e = this.settingsForm.get('businessDetails.country')?.value;
    
            r.businessAddress1 = a;
            r.businessAddress2 = b;
            r.state = c;
            r.postalCode = d;
            r.country = e;
    
            this._appUserSrv.updateAppUserInfo(r.id,r).subscribe(x=>{
                this.showBusinessDetailsUpdateFeedback = true;
            },(er:Error)=>console.log(er.message));
        })
      
    }

    onChangeLogisticsDetails(){
        this.appUser.subscribe(r=>{
            let x = this.settingsForm.get('logistics.deliveryDistance')?.value;
            let y = this.settingsForm.get('logistics.deliveryFee')?.value;
    
            r.deliveryDistance = x;
            r.deliveryFee = y;
            
            this._appUserSrv.updateAppUserInfo(r.id,r).subscribe(r=>{
                this.showLogisticsUpdateFeedback = true;
            },(er:Error)=> console.log(er.message));
        })
       
    }

    //update the vat charge fee and the service charge. 
    onChangeReceiptDetails(){
        this.ReceiptBtnState = ClrLoadingState.LOADING;
            let r = this.appUser.getValue();
            let x = this.settingsForm.get('shopSettings.vatCharge')?.value;
            let y = this.settingsForm.get('shopSettings.serviceCharge')?.value;
    
            r.vatCharge = x;
            r.serviceCharge = y;
    
            this._appUserSrv.updateAppUserInfo(r.id,r).subscribe();
            this.showReceiptUpdateFeedback = true;
            
            this.ReceiptBtnState = ClrLoadingState.DEFAULT
            this.cd.detectChanges()
        
       
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
        this.PaymentBtnState = ClrLoadingState.LOADING;
        let r = this.appUser.getValue();
            x.preventDefault();
            let pp:paymentProcessor = this.settingsForm.get('integrationSettings')?.value;
            if(r.paymentProcessor == null)
            {
                pp.applicationUserID = r.id
                r.paymentProcessor = pp;
            }
            else
            {
                pp.paymentProcessorID = r.paymentProcessor.paymentProcessorID;
                pp.applicationUserID = r.paymentProcessor.applicationUserID;
                r.paymentProcessor = pp;
            }
        
            this._appUserSrv.updateAppUserInfo(r.id,r).subscribe(r=>{
                this.showPaymentProcessorUpdateFeedback = true;
                this.PaymentBtnState = ClrLoadingState.DEFAULT;
                this.cd.detectChanges()
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
       let y = this.settingsForm.get('integrationSettings.Name')?.value;
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
        let r = this.appUser.getValue();
        let s = this.settingsForm.get('notifications.voucherNotifications')?.value;
        r.voucherNotify = s;
        this._appUserSrv.updateAppUserInfo(r.id,r).subscribe();
    
    }
    
    onSmsActivation() {
        let r = this.appUser.getValue();
        let s = this.settingsForm.get('notifications.smsActivation')?.value;
        r.smsMode = s;
        this._appUserSrv.updateAppUserInfo(r.id,r).subscribe(()=>{
           let d = s == true?false:true;
           this._smsActivator.activaionState.next(d);
        });
    
    }
    
    onBirthdayNotifications() {
        let r = this.appUser.getValue();
        let s = this.settingsForm.get('notifications.birthdayNotifications')?.value;
        r.birthdayNotify = s;
        this._appUserSrv.updateAppUserInfo(r.id,r).subscribe();
    };
           
       
}

