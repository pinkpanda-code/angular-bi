import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError, from } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize, concatMap } from 'rxjs/operators';

// local storage accounts (as database)
let accounts = JSON.parse(<string>localStorage.getItem('accounts')) || [];
if(!accounts.length){
    accounts = [{'id': 1, 'username': "test@bi.com", 'password': "123qwe", facebookId: null, name: null}]
    localStorage.setItem('accounts', JSON.stringify(accounts));
}

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/accounts/fbAuthenticate') && method === 'POST':
                    return fbAuthenticate();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }
        }

        // route functions
        function authenticate() {
            const { username, password } = body;
            //compare with accounts array (as database)
            const account = accounts.find((x: { username: any; password: any; }) => x.username === username && x.password === password);
            if (!account) return error('Username or password is incorrect');
            return ok({
                id: account.id,
                username: account.username,
                token: 'fake-jwt-token'
            })
        }

        function fbAuthenticate() {
            const { accessToken } = body;

            return from(new Promise(resolve => {
                fetch(`https://graph.facebook.com/v11.0/me?access_token=${accessToken}`)
                    .then(response => {
                        resolve(response.json())
                    });
            })).pipe(concatMap((data: any) => {
                if (data.error) return unauthorized(data.error.message);

                let account = accounts.find((x: { facebookId: any; }) => x.facebookId === data.id);
                if (!account) {
                    // create new account if first time logging in
                    account = {
                        id: newAccountId(),
                        facebookId: data.id,
                        name: data.name,
                        username: data.id+"@bi.com", // new username, eg. facebookId-here@bi.com, can use for normal login after this
                        password: '123qwe' // default password
                    }
                    accounts.push(account);
                    localStorage.setItem('accounts', JSON.stringify(accounts)); //save new account to accounts with new username
                }
                localStorage.setItem('account', JSON.stringify(account)); //save current login account
                return ok({
                    ...account,
                    token: generateJwtToken(account)
                });
            }));
        }

        // helper functions
        function ok(body?: { id: number; username: string; token: string; }) {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500));
        }

        function error(message: string) {
            return throwError({ error: { message } });
        }

        function unauthorized(message = 'Unauthorized') {
            return throwError({ status: 401, error: { message } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function isLoggedIn() {
            return headers.get('Authorization')?.startsWith('Bearer fake-jwt-token');
        }

        function newAccountId() {
            return accounts.length ? Math.max(...accounts.map((x: { id: any; }) => x.id)) + 1 : 1;
        }

        function generateJwtToken(account: { id: number; facebookId: string; name: string; username: string; password: string; }) {
            // create token that expires in 15 minutes
            const tokenPayload = {
                exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000),
                id: account.id
            }
            return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
        }

    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};
