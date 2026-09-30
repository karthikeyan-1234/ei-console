import { Injectable, inject } from '@angular/core';
import {
  BranchChildTask,
  BranchTask,
  Job,
  SubTask,
  TransformTask,
} from '../../../core/models';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { uid } from '../../../core/utils/string.util';
import { TaskEditorService } from './task-editor.service';

export type NodePath =
  | { level: 'top'; topIdx: number }
  | { level: 'sub'; topIdx: number; subIdx: number }
  | { level: 'branch-child'; topIdx: number; childIdx: number };

@Injectable({ providedIn: 'root' })
export class PipelineMutationService {
  private readonly jobs = inject(JobService);
  private readonly toasts = inject(ToastService);
  private readonly editor = inject(TaskEditorService);

  // -----------------------------------------------------------------------
  // Remove
  // -----------------------------------------------------------------------

  async removeTask(jobId: number, path: NodePath): Promise<void> {
    const job = this.jobs.byId(jobId);
    if (!job) return;

    const pipeline = [...job.pipeline];

    if (path.level === 'top') {
      const t = pipeline[path.topIdx];
      if (!t) return;

      // A branch that is part of a fork cannot be removed individually —
      // the user must remove the whole fork, or use the lane ✕.
      if (t.type === 'Branch' && this.isInFork(pipeline, path.topIdx)) {
        this.toasts.warn('Remove the whole fork, or use the lane ✕');
        return;
      }

      const childCount = t.type === 'Branch' ? (t.children ?? []).length : 0;
      const msg = childCount
        ? `Remove "${t.name || t.type}" and its ${childCount} child(ren)?`
        : `Remove "${t.name || t.type}"?`;
      if (!confirm(msg)) return;

      pipeline.splice(path.topIdx, 1);
    } else if (path.level === 'sub') {
      const parent = pipeline[path.topIdx];
      if (!parent || parent.type !== 'Transform' || !parent.subtasks) return;
      const subtasks = [...parent.subtasks];
      subtasks.splice(path.subIdx, 1);
      pipeline[path.topIdx] = { ...parent, subtasks };
    } else {
      const parent = pipeline[path.topIdx];
      if (!parent || parent.type !== 'Branch') return;
      const children = [...parent.children];
      children.splice(path.childIdx, 1);
      pipeline[path.topIdx] = { ...parent, children };
    }

    await this.jobs.update(jobId, { pipeline });
    this.toasts.warn('Removed');
  }

  // -----------------------------------------------------------------------
  // Add — sub-task on a Transform
  // -----------------------------------------------------------------------

  async addSubTask(jobId: number, topIdx: number): Promise<void> {
    const job = this.jobs.byId(jobId);
    if (!job) return;
    const parent = job.pipeline[topIdx];
    if (!parent || parent.type !== 'Transform') return;

    const subtasks = [...(parent.subtasks ?? [])];
    const newSub: SubTask = {
      id: uid('s'),
      type: 'ApiPush',
      name: 'Push item',
      method: 'POST',
      timeout: 30,
    };
    const newSubIdx = subtasks.length;
    subtasks.push(newSub);

    const pipeline = [...job.pipeline];
    pipeline[topIdx] = { ...parent, subtasks };

    await this.jobs.update(jobId, { pipeline });

    // Open the editor for the freshly-inserted sub-task. If the user cancels,
    // TaskEditorService's spliceOut path removes it from the pipeline.
    this.editor.openForPath(
      jobId,
      { level: 'sub', topIdx, subIdx: newSubIdx },
      true,
    );
  }

  // -----------------------------------------------------------------------
  // Add — child on a Branch
  // -----------------------------------------------------------------------

  async addChild(jobId: number, topIdx: number): Promise<void> {
    const job = this.jobs.byId(jobId);
    if (!job) return;
    const parent = job.pipeline[topIdx];
    if (!parent || parent.type !== 'Branch') return;

    const children = [...(parent.children ?? [])];
    const newChild: BranchChildTask = {
      id: uid('t'),
      type: 'Transform',
      name: 'New child',
      jsonata: '$',
    };
    const newChildIdx = children.length;
    children.push(newChild);

    const pipeline = [...job.pipeline];
    pipeline[topIdx] = { ...parent, children };

    await this.jobs.update(jobId, { pipeline });

    this.editor.openForPath(
      jobId,
      { level: 'branch-child', topIdx, childIdx: newChildIdx },
      true,
    );
  }

  // -----------------------------------------------------------------------
  // Add — lane on a fork
  // -----------------------------------------------------------------------

  async addLane(jobId: number, forkStartIdx: number): Promise<void> {
    const job = this.jobs.byId(jobId);
    if (!job) return;

    const pipeline = [...job.pipeline];

    let lastBranch = forkStartIdx;
    while (
      lastBranch + 1 < pipeline.length &&
      pipeline[lastBranch + 1].type === 'Branch'
    ) {
      lastBranch++;
    }

    const laneCount = lastBranch - forkStartIdx + 1;
    const letter = String.fromCharCode(65 + laneCount);

    const newBranch: BranchTask = {
      id: uid('t'),
      type: 'Branch',
      name: `Branch ${letter}`,
      condition: 'true',
      executionMode: 'Sequential',
      children: [],
    };

    const newBranchIdx = lastBranch + 1;
    pipeline.splice(newBranchIdx, 0, newBranch);

    await this.jobs.update(jobId, { pipeline });

    this.editor.openForPath(
      jobId,
      { level: 'top', topIdx: newBranchIdx },
      true,
    );
  }

  // -----------------------------------------------------------------------
  // Remove — lane
  // -----------------------------------------------------------------------

  async removeLane(jobId: number, laneIdx: number): Promise<void> {
    const job = this.jobs.byId(jobId);
    if (!job) return;
    const lane = job.pipeline[laneIdx];
    if (!lane || lane.type !== 'Branch') return;

    const childCount = (lane.children ?? []).length;
    const msg = childCount
      ? `Remove lane "${lane.name || 'Branch'}" and its ${childCount} child(ren)?`
      : `Remove lane "${lane.name || 'Branch'}"?`;
    if (!confirm(msg)) return;

    const pipeline = [...job.pipeline];
    pipeline.splice(laneIdx, 1);

    await this.jobs.update(jobId, { pipeline });
    this.toasts.warn('Lane removed');
  }

  // -----------------------------------------------------------------------
  // Remove — whole fork
  // -----------------------------------------------------------------------

  async removeFork(
    jobId: number,
    startIdx: number,
    endIdx: number,
  ): Promise<void> {
    const job = this.jobs.byId(jobId);
    if (!job) return;

    const count = endIdx - startIdx + 1;
    const ok = confirm(
      `Remove the whole fork (${count} branch${count === 1 ? '' : 'es'} and all their children)?`,
    );
    if (!ok) return;

    const pipeline = [...job.pipeline];
    pipeline.splice(startIdx, count);

    await this.jobs.update(jobId, { pipeline });
    this.toasts.warn('Fork removed');
  }

  // -----------------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------------

  private isInFork(pipeline: Job['pipeline'], idx: number): boolean {
    const before = pipeline[idx - 1];
    const after = pipeline[idx + 1];
    return before?.type === 'Branch' || after?.type === 'Branch';
  }
}