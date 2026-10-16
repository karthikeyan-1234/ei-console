import { Component, input } from '@angular/core';
import {
  JoinMode,
  JoinPointTask,
  JoinTimeoutAction,
} from '../../../../../core/models';

@Component({
  selector: 'ei-join-point-fields',
  imports: [],
  templateUrl: './join-point-fields.html',
})
export class JoinPointFieldsComponent {
  readonly task = input.required<JoinPointTask>();

  readonly modes: { value: JoinMode; label: string }[] = [
    { value: 'WaitAll', label: 'WaitAll — all branches must settle' },
    { value: 'WaitAny', label: 'WaitAny — first success is enough' },
    { value: 'WaitN',   label: 'WaitN — N branches settle' },
  ];

  readonly timeoutActions: { value: JoinTimeoutAction; label: string }[] = [
    { value: 'Fail',                label: 'Fail the execution' },
    { value: 'ContinueWithSettled', label: 'Continue with settled branches' },
  ];

  // Methods — task is mutated in place.

  mode(): JoinMode { return this.task().joinMode ?? 'WaitAll'; }
  threshold(): number { return this.task().joinThreshold ?? 1; }
  timeoutSeconds(): number { return this.task().joinTimeoutSeconds ?? 600; }
  timeoutAction(): JoinTimeoutAction { return this.task().joinTimeoutAction ?? 'Fail'; }

  isWaitN(): boolean { return this.mode() === 'WaitN'; }

  onModeChange(v: string): void {
    this.task().joinMode = v as JoinMode;
  }

  onThresholdChange(v: string): void {
    const n = parseInt(v, 10);
    this.task().joinThreshold = isNaN(n) || n < 1 ? 1 : n;
  }

  onTimeoutSecondsChange(v: string): void {
    const n = parseInt(v, 10);
    this.task().joinTimeoutSeconds = isNaN(n) || n < 1 ? 600 : n;
  }

  onTimeoutActionChange(v: string): void {
    this.task().joinTimeoutAction = v as JoinTimeoutAction;
  }
}