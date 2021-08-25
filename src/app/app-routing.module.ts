import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SuccessComponent } from './components/success/success.component';
import { AuthGuard } from './helpers/';

const routes: Routes = [
    { path: '', component: LoginComponent, pathMatch: 'full'  },
    { path: 'login', component: LoginComponent },
    { path: 'success', component: SuccessComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
