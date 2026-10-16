import { Component, inject, input } from '@angular/core';
import { BranchChildTask, BranchTask } from '../../../../../core/models';
import { TaskEditorService } from '../../../services/task-editor.service';

@Component({
  selector: 'ei-branch-fields',
  imports: [],
  templateUrl: './branch-fields.html',
})
export class BranchFieldsComponent {
  private readonly taskEditor = inject(TaskEditorService);

  readonly task = input.required<BranchTask>();
  readonly jobId = input.required<number>();

  readonly modes: { value: 'Sequential' | 'Parallel'; label: string }[] = [
    { value: 'Sequential', label: 'Sequential' },
    { value: 'Parallel',   label: 'Parallel' },
  ];

  // Methods — task is mutated in place.

  condition(): string { return this.task().condition ?? ''; }
  executionMode(): string { return this.task().executionMode ?? 'Sequential'; }
  children(): BranchChildTask[] { return this.task().children ?? []; }
  childrenCount(): number { return (this.task().children ?? []).length; }

  onConditionChange(v: string): void { this.task().condition = v; }

  onModeChange(v: string): void {
    this.task().executionMode = v === 'Parallel' ? 'Parallel' : 'Sequential';
  }

  onEditChild(child: BranchChildTask): void {
    this.taskEditor.openForTask(this.jobId(), child);
  }

  iconFor(child: BranchChildTask): string {
    switch (child.type) {
      case 'ApiPull':   return '↓';
      case 'Transform': return 'ƒ';
      case 'ApiPush':   return '↑';
      case 'Notify':    return '✉';
      default:          return '•';
    }
  }
}