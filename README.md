## Getting Started

Install the dependencies.
```
npm install
```

Run the serve command and the server will be listening on [http://localhost:4200](http://localhost:4200)
```
ng serve
```

## Facebook Login

As Facebook has [enforced HTTPS](https://developers.facebook.com/blog/post/2018/06/08/enforce-https-facebook-login/) for the login, the project is using [ngrok](https://ngrok.com/download) to expose the localhost to a random generated public HTTPS URL.

Start `ngrok.exe` and run the following command.
```
ngrok.exe http 4200
```

### Facebook App Setup

Go to [Facebook Developer Apps](https://developers.facebook.com/apps) page.

Navigate to **Facebook Login** > **Quick Start** > **Web**.

Copy `https://YOUR-RANDOM-URL.ngrok.io` from `ngrok.exe` to **Site URL** and click **Save**.

Navigate to **Facebook Login** > **Settings** and enable **Login with the JavaScript SDK**.

Insert `https://YOUR-RANDOM-URL.ngrok.io` to **Allowed Domains for the JavaScript SDK** and click **Save Changes**.

Navigate to **Roles** > **Test Users** and make sure have the test user is created. This is for login purpose as the app is still in development mode.

### Replace App ID
Copy the **App ID** from the app page. Back to project folder `environments` and replace the following in `environment.ts` and `environment.prod.ts`
```
facebookAppId: 'YOUR-APP-ID'
```

## Start Project
Open up `https://YOUR-RANDOM-URL.ngrok.io` in the browser and the project is good to go.




