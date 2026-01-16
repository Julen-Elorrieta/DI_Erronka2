import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class Auth {
  loginForm: FormGroup;
  hidePassword = true;
  loginError = false;
  private http = inject(HttpClient);

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const { username, password } = this.loginForm.value;
      // Llama al backend usando la URL del environment
      this.http.post(`${environment.apiUrl}/login`, { username, password }).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loginError = false;
            this.router.navigate(['/dashboard']);
          } else {
            this.loginError = true;
          }
        },
        error: (err) => {
          console.error('Error during authentication:', err);
          this.loginError = true;
        }
      });
    } else {
      this.loginError = true;
    }
  }
}