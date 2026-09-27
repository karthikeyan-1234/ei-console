export interface JsonFlow {
  inputJson: unknown;
  outputJson: unknown;
  sourceLabel: string;
  sourceId: string | null;
  iterator?: boolean;
}

export type JsonFlowMap = Record<string, JsonFlow>;