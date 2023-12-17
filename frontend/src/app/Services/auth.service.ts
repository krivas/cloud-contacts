import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { User } from '../Dtos/User';
import { Router } from '@angular/router';
import { UserGet } from '../Dtos/UserGet';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private domain:string| undefined;
  private endpoint:string | undefined;
    constructor(
      private http:HttpClient,
      private router:Router
      ) {
        this.domain=environment.domain;
        this.endpoint='users';
       }
     
     login(user:User)
     {
      return this.http.post<number>(`${this.domain}/${this.endpoint}/login`,user)
     }
      logout() {
        localStorage.removeItem("user");
        localStorage.removeItem("username");
        this.router.navigate(['login']) ;
      }

      setLoginInfo(id:number,username:string)
      {
        localStorage.setItem("user",id.toString());
        localStorage.setItem("username",username);
      }
     
      
      isLoggedIn():boolean {
        const response=this.getLoginInfo();
        if (response)
          return true;
        else
          return false;
      }

      getLoginInfo() {
        return localStorage.getItem("user") ;
      }  
      getUserName() {
        return localStorage.getItem("username") ;
      }   
      registration(user: any): Observable<any> {
        return this.http.post<any>(`${this.domain}/${this.endpoint}/register`, user);
      }

      getUsers(userId:number): Observable<UserGet[]> {
        return this.http.get<UserGet[]>(`${this.domain}/${this.endpoint}/${userId}`);
      }
}