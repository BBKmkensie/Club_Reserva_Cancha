import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isOpenSubject = new BehaviorSubject<boolean>(this.defaultOpen());
  public isOpen$ = this.isOpenSubject.asObservable();

  private defaultOpen(): boolean {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  }

  toggle() {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  open() {
    this.isOpenSubject.next(true);
  }

  close() {
    this.isOpenSubject.next(false);
  }

  get isOpen(): boolean {
    return this.isOpenSubject.value;
  }
}
