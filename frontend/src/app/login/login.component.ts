import { Component } from '@angular/core';
import { User } from '../Dtos/User';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Message } from 'primeng/api';
import { AuthService } from '../Services/auth.service';
import { NgForm } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  user:User={};
  errorMessage:string = '';
  messages: Message[]=[];
  constructor(
    private router: Router,
    private auth:AuthService
  ) {}
  onSubmit(userForm:NgForm) {
    console.log("IS PRODUCTION?: ",environment.production); 
    console.log("IS PRODUCTION?: ",environment.domain); 
    if (userForm.valid)
    {
      this.auth.login(this.user)
      .subscribe(response=>{
        console.log(response);
        if (this.user.username)
        this.auth.setLoginInfo(response,this.user.username);
        this.router.navigate(['/dashboard']);
      },
      (error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.messages = [{ severity: 'error', summary: 'Username or password incorrect'}];
        } 
      })
  }
    
  }
}
