import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private isLoggedIn = false;

  constructor() { }

  public isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  public login() {
    this.isLoggedIn = true;
    console.log('Usuario logueado');
  }

  public logout() {
    this.isLoggedIn = false;
    console.log('Usuario deslogueado');
  }
}
