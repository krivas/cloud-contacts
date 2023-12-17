import { Component } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {
  private apiUrl = 'http://localhost:8000'; 
messages: Message[] | undefined;
registrationForm(arg0: any) {
throw new Error('Method not implemented.');
}
  user = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
 
registration: any;
userForm: any;
constructor(private auth:AuthService,
            private router: Router,
			private messageService: MessageService) { }

onSubmit(): void {
  this.auth.registration(this.user)
    .subscribe(
      response => {
        console.log('registered successfully', response);
		 this.messageService.add({ severity: 'success', summary: 'Success', detail: 'New user created' });
        this.router.navigate(['/login']);
        // Handle success - e.g., show success message, redirect, etc.

      },
      error => {
        console.error('Registration failed', error);
        // Handle error - e.g., show error message, handle specific errors, etc.
      }
    );
}
goToLogin()
{
  this.router.navigate(['/login'])
}

}