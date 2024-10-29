import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { HubConnection,  } from "@microsoft/signalr";
import * as signalR from "@microsoft/signalr";
import { lastOfArray, RxCollection, RxReplicationPullStreamItem } from "rxdb";
import { replicateRxCollection, RxReplicationState } from 'rxdb/plugins/replication';
import { Observable, Subject } from "rxjs";
import { environment } from "../../environment/environment";

@Injectable({
    providedIn:'root'
})

export class RxDbReplService
{
    hubConnection!:HubConnection
    baseUrl =  environment.apiBaseUrl;
    pullStream$ = new Subject<RxReplicationPullStreamItem<any, any>>();
    firstOpen = true;
    _http = inject(HttpClient)

    sync(x:RxCollection,url:string,h:HttpClient){
         const r = replicateRxCollection({
            collection: x,
            replicationIdentifier: 'my-rest-replication-to-'+url,
            live: true,
            deletedField:'isDeleted',
            autoStart:true,
            retryTime:5*1000,
            push: {
                 handler(docs) {
                    
                    const rawResponse = h.post(url+'push',docs, {
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                    });
                    /**
                     * Contains an array with all conflicts that appeared during this push.
                     * If there were no conflicts, return an empty array.
                     */
                    let response:any;
                    rawResponse.subscribe(r=> response = r);
                    console.log(response,'push-response')
                    return response;
                }
            },
            pull: {
                async handler(lastCheckpoint, batchSize) {
                    const minTimestamp = lastCheckpoint ? lastCheckpoint.updatedAt : new Date(0).toISOString();
                    if(minTimestamp === new Date(0).toISOString()){
                        lastCheckpoint = { id:0,updatedAt:minTimestamp}
                    }
                    /**
                     * In this example we replicate with a remote REST server
                     */
                    const response = h.get(
                        `${url}pull?minUpdatedAt=${minTimestamp}&limit=${batchSize}`
                    );
                    let documentsFromRemote:any =[]
                    response.subscribe(d=>{
                        documentsFromRemote = d;
                        console.log(d);
                    });
                    return {
                        
                        /**
                         * Contains the pulled documents from the remote.
                         * Not that if documentsFromRemote.length < batchSize,
                         * then RxDB assumes that there are no more un-replicated documents
                         * on the backend, so the replication will switch to 'Event observation' mode.
                         */
                        documents: documentsFromRemote,
                        /**
                         * The last checkpoint of the returned documents.
                         * On the next call to the pull handler,
                         * this checkpoint will be passed as 'lastCheckpoint'
                         */
                        checkpoint: documentsFromRemote.length === 0 ? lastCheckpoint : {
                            id: lastOfArray<any>(documentsFromRemote).productId,
                            updatedAt: lastOfArray<any>(documentsFromRemote).updatedAt
                        }
                    };
                },
                batchSize:10,
                stream$: this.pullStream$.asObservable()
            },
        });

this.getConnectionInfo().subscribe(info=>{
    console.log(info);
      let options = {
        accessTokenFactory: () => info.accessToken
      };
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(info.url,options)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  this.hubConnection.start().then(r=>{
    this.hubConnection.stream('sendStream',(data:any)=>{this.pullStream$.next(data); console.log(data)})
    if(this.firstOpen){
        this.firstOpen = false;
    }else{
        this.pullStream$.next('RESYNC');
    }
  })
    .catch((err: any) => console.error(err.toString()));
})
       
        
        
        

        return r;
    };
private getConnectionInfo(): Observable<any> {
    let requestUrl = `${this.baseUrl}streamhub/negotiate`;
    let header = new HttpHeaders();
    header = header.set("x-client-id",this.userId);
    let x = this._http.post(requestUrl,{},{
      headers:header
    });
    return x;
  }
  userId:any = localStorage.getItem("user_id");
}