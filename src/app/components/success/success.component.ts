import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/services';

@Component({
    selector: 'app-success',
    templateUrl: './success.component.html',
    styleUrls: ['./success.component.css']
})

export class SuccessComponent implements OnInit {
    loginAs!: string;

    constructor(
        private accountService: AccountService,
    ) { }

    ngOnInit(): void {
        this.loginAs = this.accountService.accountValue.username;
    }

    logout() {
        this.accountService.logout();
    }

}
