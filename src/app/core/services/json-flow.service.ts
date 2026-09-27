import { Injectable, computed, inject, signal } from '@angular/core';
import {
  BranchTask,
  JsonFlow,
  JsonFlowMap,
  Job,
  PipelineTask,
} from '../models';
import { JsonataService } from './jsonata.service';
import { safeJsonParse, resolvePath } from '../utils/json.util';

@Injectable({ providedIn: 'root' })
export class JsonFlowService {
  private jsonata = inject(JsonataService);

  private readonly _job = signal<Job | null>(null);
  private readonly _flow = signal<JsonFlowMap>({});

  readonly flow = computed(() => this._flow());
  readonly flowFor = (taskId: string): JsonFlow | undefined => this._flow()[taskId];

  /** Recomputes the flow for the given job. Call whenever the job's pipeline changes. */
  recompute(job: Job | null): void {
    this._job.set(job);
    if (!job) {
      this._flow.set({});
      return;
    }
    this._flow.set(this.compute(job));
  }

  private compute(job: Job): JsonFlowMap {
    const flow: JsonFlowMap = {};
    const context: Record<string, unknown> = {};

    let lastValue: unknown = null;
    let lastSourceLabel = 'pipeline trigger';
    let lastSourceId: string | null = null;

    const runNode = (node: PipelineTask, input: unknown): unknown => {
      if (node.type === 'ApiPull') {
        let resp = safeJsonParse<unknown>(node.sampleResponse, null);
        if (resp == null) {
          resp = {
            _note: 'Provide sampleResponse on this API Pull',
            endpoint: node.url || '',
            items: [],
          };
        }
        if (node.outputKey) context[node.outputKey] = resp;
        return resp;
      }

      if (node.type === 'Transform') {
        let src = input;

        if (node.inputSource) {
          let resolved = resolvePath(context, node.inputSource);
          if (resolved === undefined) resolved = resolvePath(input, node.inputSource);
          if (resolved !== undefined) src = resolved;
        }

        if (node.useSampleInput && node.sampleInput) {
          const override = safeJsonParse<unknown>(node.sampleInput, undefined);
          if (override !== undefined) src = override;
        } else if (src == null && node.sampleInput) {
          const fb = safeJsonParse<unknown>(node.sampleInput, undefined);
          if (fb !== undefined) src = fb;
        }

        if (src == null && node.inputSource) src = context;

        const res = this.jsonata.evaluateSync(node.jsonata, src);
        if (!res.ok) return { _error: res.error };
        if (node.outputKey) context[node.outputKey] = res.value;
        return res.value;
      }

      return input;
    };

    const walkChildren = (
      node: BranchTask,
      preForkInput: unknown,
      preForkLabel: string,
      preForkId: string | null,
    ) => {
      (node.children ?? []).forEach(c => {
        const childOutput = runNode(c as PipelineTask, preForkInput);
        flow[c.id] = {
          inputJson: preForkInput,
          outputJson: childOutput,
          sourceLabel: preForkLabel,
          sourceId: preForkId,
        };
      });
    };

    const walkTop = (tasks: PipelineTask[]) => {
      for (const t of tasks) {
        const input = lastValue;
        const sourceLabel = lastSourceLabel;
        const sourceId = lastSourceId;

        let output: unknown;
        if (t.type === 'Branch') {
          walkChildren(t, input, sourceLabel, sourceId);
          output = input;
        } else {
          output = runNode(t, input);
        }

        flow[t.id] = {
          inputJson: input,
          outputJson: output,
          sourceLabel,
          sourceId,
        };

        if (t.type === 'Transform' && t.iterate && Array.isArray(output) && output.length) {
          const sampleItem = output[0];
          (t.subtasks ?? []).forEach(st => {
            const per = runNode(st as unknown as PipelineTask, sampleItem);
            flow[st.id] = {
              inputJson: sampleItem,
              outputJson: per,
              sourceLabel: `${t.name || 'Transform'} — one item per run (${output.length} items)`,
              sourceId: t.id,
              iterator: true,
            };
          });
        } else if (t.type === 'Transform' && Array.isArray(output)) {
          (t.subtasks ?? []).forEach(st => {
            flow[st.id] = {
              inputJson: output,
              outputJson: (st as any).body ?? '—',
              sourceLabel: t.name || 'Transform',
              sourceId: t.id,
            };
          });
        }

        lastValue = output;
        // A Branch shares its input with the pre-fork task and with every
        // other branch in the same fork run. Its own name must NOT become
        // the source label for the next sibling branch — otherwise the second
        // and later lanes would show "input from: <previous branch>" instead
        // of the actual pre-fork task. Only non-Branch tasks advance the label.
        if (t.type !== 'Branch') {
          lastSourceLabel = t.name || t.type;
          lastSourceId = t.id;
        }
      }
    };

    walkTop(job.pipeline ?? []);
    return flow;
  }
}