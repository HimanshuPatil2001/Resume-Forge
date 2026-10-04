import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private isMobileMenuOpenSubject = new BehaviorSubject<boolean>(false);
  isMobileMenuOpen$ = this.isMobileMenuOpenSubject.asObservable();

  constructor(private router: Router) {
    // Automatically close mobile menu when navigating to a new route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMobileMenu();
      });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpenSubject.next(!this.isMobileMenuOpenSubject.value);
  }

  openMobileMenu(): void {
    this.isMobileMenuOpenSubject.next(true);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpenSubject.next(false);
  }
}
