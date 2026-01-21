import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProfileComponent } from "./pages/profile/profile";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ProfileComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('PruebaErronka2');
}
