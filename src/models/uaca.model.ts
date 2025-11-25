export type TCEPhase = 'Apollonian' | 'Dionysian' | 'Hegelian';

export interface AODState {
  I: number; // Information
  C: number; // Complexity
  H: number; // Coherence
}

export interface LayerState {
  id: number;
  name: string;
  updateTime: string;
  aodState: AODState;
  tcePhase: TCEPhase;
  anomaly: string | null;
  witnessSignature: string;
}

export interface Subsystem {
  id: number;
  title: string;
  description: string;
  details: string[];
}

export interface ExecutionStep {
  id: number;
  name: string;
}
