import {
  BranchChildTask,
  BranchTask,
  Job,
  PipelineBlock,
  PipelineTask,
  SubTask,
} from '../models';
/**
 * Groups consecutive Branch tasks into a single `fork` block so the canvas
 * renderer can draw one fork header with multiple lanes, rather than N
 * independent branch cards.
 */
export function groupPipelineIntoBlocks(pipeline: PipelineTask[]): PipelineBlock[] {
  const blocks: PipelineBlock[] = [];
  let i = 0;

  while (i < pipeline.length) {
    const t = pipeline[i];

    if (t.type === 'Branch') {
      let j = i;
      while (j < pipeline.length && pipeline[j].type === 'Branch') j++;

      const count = j - i;
      if (count >= 2) {
        const branches: { branch: BranchTask; idx: number }[] = [];
        for (let k = i; k < j; k++) {
          branches.push({ branch: pipeline[k] as BranchTask, idx: k });
        }
        blocks.push({
          type: 'fork',
          branches,
          startIdx: i,
          endIdx: j - 1,
        });
        i = j;
      } else {
        blocks.push({
          type: 'node',
          task: t,
          idx: i,
          isLoneBranch: true,
          startIdx: i,
          endIdx: i,
        });
        i++;
      }
    } else {
      blocks.push({
        type: 'node',
        task: t,
        idx: i,
        startIdx: i,
        endIdx: i,
      });
      i++;
    }
  }

  return blocks;
}



function hasField(obj: unknown, field: string, id: string): boolean {
  if (!obj || typeof obj !== 'object') return false;
  return (obj as Record<string, unknown>)[field] === id;
}

/**
 * Walks every job's pipeline (top-level tasks, sub-tasks of Transform nodes,
 * and children of Branch nodes) and returns a list of every reference that
 * matches `field === id`.
 *
 * Output format matches the original console:
 *   "JobName › TaskName"
 *   "JobName › BranchName › ChildName"
 */
export function findTasksUsing(
  jobs: Job[],
  field: 'connectionId' | 'authId',
  id: string,
): string[] {
  const out: string[] = [];

  for (const job of jobs) {
    for (const task of job.pipeline) {
      if (hasField(task, field, id)) {
        out.push(`${job.name} › ${task.name || task.type}`);
      }

      if (task.type === 'Transform') {
        for (const sub of (task.subtasks ?? []) as SubTask[]) {
          if (hasField(sub, field, id)) {
            out.push(`${job.name} › ${task.name || 'Transform'}`);
          }
        }
      }

      if (task.type === 'Branch') {
        for (const child of (task.children ?? []) as BranchChildTask[]) {
          if (hasField(child, field, id)) {
            out.push(`${job.name} › ${task.name || 'Branch'} › ${child.name || child.type}`);
          }
        }
      }
    }
  }

  return out;
}