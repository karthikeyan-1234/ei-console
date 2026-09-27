import { Component, input } from '@angular/core';
import { TaskType } from '../../../../../core/models';

@Component({
  selector: 'ei-placeholder-fields',
  imports: [],
  templateUrl: './placeholder-fields.html',
})
export class PlaceholderFieldsComponent {
  readonly type = input.required<TaskType>();
}