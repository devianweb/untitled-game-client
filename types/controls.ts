export interface ControlInputs {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface InputHistoryEntry {
  seqId: number;
  inputs: ControlInputs;
}
