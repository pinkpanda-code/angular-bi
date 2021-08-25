import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, from, of, EMPTY } from 'rxjs';
import { map, concatMap } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Account } from '@app/models';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
    private accountSubject: BehaviorSubject<Account>;
    public account: Observable<Account>;
    private loginType!: string; //to differentiate normal and fb login

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private http: HttpClient
    ) {
        this.accountSubject = new BehaviorSubject<Account>(JSON.parse(<string>localStorage.getItem('account')) || null);
        this.account = this.accountSubject.asObservable();
    }

    public get accountValue(): Account {
        return this.accountSubject.value;
    }

    login(username: any, password: any) {
        return this.http.post<Account>(`${baseUrl}/authenticate`, { username, password })
            .pipe(map(account => {
                localStorage.setItem('account', JSON.stringify(account)); //save current login account
                this.loginType = 'normal';
                this.accountSubject.next(account);
                return account;
            }));
    }

    facebookLogin(){
        // login with facebook then authenticate with the API to get a JWT auth token
        this.facebookLoginCore()
            .pipe(concatMap(accessToken => this.apiAuthenticate(accessToken)))
            .subscribe(() => {
                this.loginType = 'fb';
                // get return url from query parameters or default to home page
                const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/success';
                this.router.navigateByUrl(returnUrl);
            });
    }

    facebookLoginCore() {
        // login with facebook and return observable with fb access token on success
        return from(new Promise<fb.StatusResponse>(resolve => FB.login(function (response){
            resolve(response)
        })))
            .pipe(concatMap(({ authResponse }) => {
                if (!authResponse) return EMPTY;
                return of(authResponse.accessToken);
            }));
    }

    apiAuthenticate(accessToken: string) {
        // authenticate with the api using a facebook access token,
        // on success the api returns an account object with a JWT auth token
        return this.http.post<any>(`${baseUrl}/fbAuthenticate`, { accessToken })
            .pipe(map(account => {
                this.accountSubject.next(account);
                this.startAuthenticateTimer();
                return account;
            }));
    }

    logout() {
        if(this.loginType == 'fb'){
            // revoke app permissions to logout completely because FB.logout() doesn't remove FB cookie
            FB.api('/me/permissions', 'delete', null!, () => FB.logout());
            this.stopAuthenticateTimer();
        }
        localStorage.removeItem('account'); //remove current login account, account remains in localstorage accounts
        this.accountSubject.next(null!);
        this.router.navigate(['/login']);
    }


    // helper methods
    private authenticateTimeout!: NodeJS.Timeout;

    private startAuthenticateTimer() {
        // parse json object from base64 encoded jwt token
        const jwtToken = JSON.parse(atob(this.accountValue.token!.split('.')[1]));

        // set a timeout to re-authenticate with the api one minute before the token expires
        const expires = new Date(jwtToken.exp * 1000);
        const timeout = expires.getTime() - Date.now() - (60 * 1000);
        const { accessToken } : any = FB.getAuthResponse();
        this.authenticateTimeout = setTimeout(() => {
            this.apiAuthenticate(accessToken).subscribe();
        }, timeout);
    }

    private stopAuthenticateTimer() {
        // cancel timer for re-authenticating with the api
        clearTimeout(this.authenticateTimeout);
    }
}
