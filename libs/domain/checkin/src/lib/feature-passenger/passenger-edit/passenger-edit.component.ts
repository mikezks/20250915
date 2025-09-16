import { Component, effect, inject, input, numberAttribute } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { connectFormQueryParamSignal } from '@flight-demo/shared/core';
import { PassengerService } from '../../logic-passenger/data-access/passenger.service';
import { validatePassengerStatus } from '../../util-validation';


@Component({
  selector: 'app-passenger-edit',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './passenger-edit.component.html'
})
export class PassengerEditComponent {
  private passengerService = inject(PassengerService);
  protected editForm = inject(NonNullableFormBuilder).group({
    id: [0],
    firstName: [''],
    name: [''],
    bonusMiles: [0],
    passengerStatus: ['', [
      validatePassengerStatus(['A', 'B', 'C'])
    ]]
  });
  protected bonusMiles = connectFormQueryParamSignal(
    this.editForm.controls.bonusMiles,
    'bonusMiles'
  );

  id = input(0, { transform: numberAttribute });
  protected passengerResource = this.passengerService.findByIdAsResource(this.id);
  
  constructor() {
    effect(() => {
      if (this.passengerResource.hasValue()) {
        this.editForm.patchValue(this.passengerResource.value());
      }
    });
  }

  protected save(): void {
    this.passengerResource.set(this.editForm.getRawValue());
    console.log(this.editForm.value);
  }
}
