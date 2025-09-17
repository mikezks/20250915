import { httpResource } from '@angular/common/http';
import { Component, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Control, form } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { initialPassenger, Passenger } from '../../logic-passenger';
import { validatePassengerStatus } from '../../util-validation';

// (3) Field Logic: required, custom validator, disabled, hidden, readonly, etc.

@Component({
  selector: 'app-passenger-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    // (4) UI Control: Template Binding
    Control
  ],
  templateUrl: './passenger-edit.component.html'
})
export class PassengerEditComponent {
  // (1) Data Model: Writable Signal
  private passenger = signal(initialPassenger);

  // (2) Field State: Meta Data - valid, dirty, touched, etc.
  protected editForm = form(this.passenger);

  id = input(0, { transform: numberAttribute });
  protected passengerResource = httpResource<Passenger>(() => ({
    url: 'https://demo.angulararchitects.io/api/passenger',
    params: { id: this.id() }
  }));
  
  constructor() {
    effect(() => {
      if (this.passengerResource.hasValue()) {
        this.passenger.set(this.passengerResource.value());
      }
    });
  }

  protected save(): void {
    this.passengerResource.set(this.editForm().value());
    console.log(this.editForm().value());
  }
}
