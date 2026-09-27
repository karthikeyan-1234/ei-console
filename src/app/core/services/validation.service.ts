import { inject, Injectable } from '@angular/core';
import { BranchTask, Job, PipelineTask } from '../models';
import { ConnectionService } from './connection.service';
import { AuthProfileService } from './auth-profile.service';
import { JsonataService } from './jsonata.service';

@Injectable({ providedIn: 'root' })
export class ValidationService {
  private connections = inject(ConnectionService);
  private auths = inject(AuthProfileService);
  private jsonata = inject(JsonataService);

  validateJob(job: Job): string[] {
    const errors: string[] = [];
    const tasks = job.pipeline ?? [];

    if (!tasks.length) errors.push('Pipeline has no tasks. Add at least one task.');

    const checkConn = (t: any, where: string) => {
      if (!t.connectionId) errors.push(`${where}: no connection selected.`);
      else if (!this.connections.byId(t.connectionId)) errors.push(`${where}: connection no longer exists.`);
      if (t.authId && !this.auths.byId(t.authId)) errors.push(`${where}: auth profile no longer exists.`);
    };

    const checkNode = (t: PipelineTask, where: string) => {
      switch (t.type) {
        case 'ApiPull':
        case 'ApiPush': {
          checkConn(t, where);
          if (!t.url) errors.push(`${where}: endpoint path is empty.`);
          break;
        }
        case 'Transform': {
          if (!t.jsonata || !t.jsonata.trim()) {
            errors.push(`${where}: JSONata expression is empty.`);
          } else {
            const err = this.jsonata.validate(t.jsonata);
            if (err) errors.push(`${where}: ${err}`);
          }
          if (t.iterate && !(t.subtasks ?? []).length) {
            errors.push(`${where}: iterator has no sub-tasks.`);
          }
          break;
        }
        case 'Notify': {
          if (!t.kafkaTopic && !t.url) {
            errors.push(`${where}: set a Kafka topic or webhook URL.`);
          }
          break;
        }
        case 'Branch': {
          const branch = t as BranchTask;
          if (branch.condition) {
            const err = this.jsonata.validate(branch.condition);
            if (err) errors.push(`${where}: condition ${err}`);
          }
          if (!(branch.children ?? []).length) {
            errors.push(`${where}: branch has no children.`);
          }
          (branch.children ?? []).forEach((c, k) => {
            checkNode(c as PipelineTask, `${where} › child ${k + 1} ${c.name || c.type}`);
          });
          break;
        }
        case 'JoinPoint': {
          if (!t.joinMode) errors.push(`${where}: await mode is required.`);
          if (t.joinMode === 'WaitN' && (!t.joinThreshold || t.joinThreshold < 1)) {
            errors.push(`${where}: WaitN requires a threshold ≥ 1.`);
          }
          break;
        }
      }
    };

    tasks.forEach((t, i) => checkNode(t, `#${i + 1} ${t.name || t.type}`));

    // Consecutive-branch check
    let branchRun = 0;
    tasks.forEach(t => {
      if (t.type === 'Branch') branchRun++;
      else if (t.type === 'JoinPoint' && branchRun > 0) branchRun = 0;
      else if (branchRun >= 2) {
        errors.push(`After ${branchRun} consecutive branches, add an Await barrier.`);
        branchRun = 0;
      }
    });
    if (branchRun >= 2) {
      errors.push(`The ${branchRun} trailing branches have no Await barrier — add one to synchronise.`);
    }

    return errors;
  }
}