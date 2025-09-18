import { httpResource } from '@angular/common/http';
import { Component, effect, input, numberAttribute, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Control, customError, form, required, schema, validate } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { initialPassenger, Passenger } from '../../logic-passenger';


// (3) Field Logic: required, custom validator, disabled, hidden, readonly, etc.
const passengerSchema = schema<Passenger>(passengerPath => {
  required(passengerPath.name);
  validate(passengerPath.passengerStatus, ({ value }) =>
    !['A', 'C'].includes(value())
      ? customError({
        kind: 'passengerStatus',
        message: 'The field name has a passengerStatus error - please fix this!'
      })
      : undefined
  );
});


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
  protected passengerResource = httpResource<Passenger>(() => ({
    url: 'https://demo.angulararchitects.io/api/passenger',
    params: { id: this.id() }
  }), { defaultValue: initialPassenger });

  // (2) Field State: Meta Data - valid, dirty, touched, etc.
  protected editForm = form(this.passengerResource.value, passengerSchema);

  id = input(0, { transform: numberAttribute });
  
  protected save(): void {
    console.log(this.editForm().value());
  }
}
