import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class DevModeService {

  // Flip this ONE line to control validation everywhere in the app
  readonly enabled = true;

  /** Strips all validators from every control in a form, plus the group-level validator */
  stripValidators(form: FormGroup): void {
    if (!this.enabled) return;

    Object.keys(form.controls).forEach(key => {
      form.get(key)?.clearValidators();
      form.get(key)?.updateValueAndValidity();
    });
    form.clearValidators();
    form.updateValueAndValidity();
  }
}