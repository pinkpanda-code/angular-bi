import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { fakeBackendProvider, JwtInterceptor, appInitializer } from './helpers/';
import { AccountService } from './services';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { ButtonComponent } from './components/button/button.component';
import { LoginComponent } from './components/login/login.component';
import { SuccessComponent } from './components/success/success.component';

@NgModule({
    declarations: [
        AppComponent,
        HeaderComponent,
        ButtonComponent,
        LoginComponent,
        SuccessComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        ReactiveFormsModule,
        HttpClientModule
    ],
    providers: [
        { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [AccountService] },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },

        fakeBackendProvider
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
