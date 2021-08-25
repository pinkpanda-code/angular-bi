import { AccountService } from '@app/services';
import { environment } from '@environments/environment';

export function appInitializer(accountService: AccountService) {
    return () => new Promise<void>(resolve => {
        // wait for facebook sdk to initialize before starting the angular app
        (window as { [key: string]: any })['fbAsyncInit'] = function () {
            FB.init({
                appId: environment.facebookAppId,
                cookie: true,
                xfbml: true,
                version: 'v11.0'
            });

            // auto authenticate with the api if already logged in with facebook - !!MUST CALL FROM HTTPS!!
            FB.getLoginStatus(({authResponse, status} : any) => {
                if (authResponse) {
                    accountService.apiAuthenticate(authResponse.accessToken)
                        .subscribe()
                        .add(resolve);
                } else {
                    resolve();
                }
            });
        };

        // load facebook sdk script
        (function (d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById('facebook-jssdk')) { return; }
            js = d.createElement('script'); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js";
            fjs.parentNode!.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    });
}
