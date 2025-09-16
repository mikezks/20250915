import { Component, effect, inject, input, numberAttribute, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { validatePassengerStatus } from '../../util-validation';
import { initialPassenger } from '../../logic-passenger';
import { PassengerService } from '../../logic-passenger/data-access/passenger.service';
import { switchMap } from 'rxjs';
import { Router, RouterLink } from '@angular/router';


export function injectQueryParamsConnector(
  formOrControl: AbstractControl,
  queryParamName: string
) {
  const router = inject(Router);
  formOrControl.valueChanges.pipe(
    takeUntilDestroyed()
  ).subscribe({
    next: paramValue => router.navigate([], {
      queryParams: { [queryParamName]: paramValue }
    })
  });
}


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

  id = input(0, { transform: numberAttribute });
  protected passengerResource = this.passengerService.findByIdAsResource(this.id);
  
  constructor() {
    injectQueryParamsConnector(this.editForm.controls.bonusMiles, 'bonusMiles');
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
