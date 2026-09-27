import { Component, computed, inject, input } from '@angular/core';
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

  readonly condition = computed(() => this.task().condition ?? '');
  readonly executionMode = computed(() => this.task().executionMode ?? 'Sequential');
  readonly children = computed<BranchChildTask[]>(() => this.task().children ?? []);
  readonly childrenCount = computed(() => this.children().length);

  onConditionChange(v: string): void { this.task().condition = v; }

  onModeChange(v: string): void {
    this.task().executionMode = v === 'Parallel' ? 'Parallel' : 'Sequential';
  }

  /**
   * Opens the editor for one of this branch's children. The TaskEditorService
   * swaps the context in place; the effect in TaskEditorComponent notices the
   * change and re-renders the body with the child's fields. The modal stays
   * open throughout — no flicker, no close/reopen.
   */
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