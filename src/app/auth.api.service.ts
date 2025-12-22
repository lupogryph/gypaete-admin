import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

const TOKEN = 'TOKEN';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  constructor(private cookie: CookieService) {}

  public setAccessToken(token: string) {
    this.cookie.set(TOKEN, token);
  }

  public getAccessToken(): string {
    return this.cookie.get(TOKEN);
  }

  public removeAccessToken() {
    this.cookie.delete(TOKEN);
  }
}
