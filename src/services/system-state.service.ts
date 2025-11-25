import { Injectable, signal, WritableSignal, effect } from '@angular/core';
import { LayerState, Subsystem, ExecutionStep, TCEPhase, AODState } from '../models/uaca.model';

@Injectable({
  providedIn: 'root'
})
export class SystemStateService {
  private readonly CRR_CYCLE_MS = 300;
  private readonly H_CRITICAL_THRESHOLD = 20;
  
  // Signals for dynamic state
  cycleCount = signal(0);
  activeExecutionStep = signal(0);
  layers: WritableSignal<LayerState[]> = signal(this.initializeLayers());

  // Static data
  readonly subsystems: Subsystem[] = this.getSubsystemsData();
  readonly executionFlow: ExecutionStep[] = this.getExecutionFlowData();
  readonly systemProperties: { title: string; description: string }[] = this.getSystemPropertiesData();
  
  private simulationInterval: any;
  private executionStepInterval: any;

  constructor() {
    this.startSimulation();
  }

  startSimulation() {
    if (this.simulationInterval) clearInterval(this.simulationInterval);
    if (this.executionStepInterval) clearInterval(this.executionStepInterval);

    this.simulationInterval = setInterval(() => {
      this.runCycle();
    }, this.CRR_CYCLE_MS * 3); // Slow down simulation to make it easier to observe
    
    this.executionStepInterval = setInterval(() => {
      this.activeExecutionStep.update(current => (current + 1) % this.executionFlow.length);
    }, (this.CRR_CYCLE_MS * 3) / this.executionFlow.length);
  }

  private runCycle() {
    this.cycleCount.update(c => c + 1);
    this.layers.update(currentLayers => {
      return currentLayers.map(layer => {
        const nextPhase = this.calculateNewTCEPhase(layer.tcePhase, this.cycleCount());
        let potentialState = this.calculatePotentialAODState(layer, nextPhase, this.cycleCount());
        
        let finalState = potentialState;
        let anomalyMessage: string | null = null;
        let newWitness: string;

        // C_E Governance Check
        if (finalState.H < this.H_CRITICAL_THRESHOLD) {
          anomalyMessage = `H-AXIS CRITICAL: ${finalState.H.toFixed(0)} < ${this.H_CRITICAL_THRESHOLD}`;
          // Emergency Dampening
          finalState = this.applyEmergencyDampening(finalState);
          newWitness = this.generateWitnessSignature(finalState, anomalyMessage);
        } else {
          anomalyMessage = null; // Clear any previous anomaly
          newWitness = this.generateWitnessSignature(finalState, null);
        }

        return {
          ...layer,
          aodState: finalState,
          tcePhase: nextPhase,
          anomaly: anomalyMessage,
          witnessSignature: newWitness,
        };
      });
    });
  }

  private applyEmergencyDampening(currentState: AODState): AODState {
    const newH = Math.min(100, currentState.H + 40 + Math.random() * 10);
    const newC = Math.max(0, currentState.C - 30 - Math.random() * 10);
    const newI = Math.max(0, currentState.I - 15 - Math.random() * 10);
    return { I: newI, C: newC, H: newH };
  }

  private generateWitnessSignature(state: AODState, anomaly: string | null): string {
    const stateHash = `0x${Math.round(state.I).toString(16).padStart(2, '0')}${Math.round(state.C).toString(16).padStart(2, '0')}${Math.round(state.H).toString(16).padStart(2, '0')}`;
    const cycle = this.cycleCount().toString().padStart(4, '0');
    const status = anomaly ? 'ANOMALY_FLAGGED' : 'STATE_OK';
    return `${status}:${stateHash}:C${cycle}`;
  }
  
  private calculatePotentialAODState(layer: LayerState, phase: TCEPhase, cycle: number): AODState {
      const currentState = layer.aodState;
      let { I, C, H } = currentState;
      
      // Anomaly Trigger: On Layer 7 (Tactical), during Dionysian phase, force an anomaly.
      if (layer.id === 7 && phase === 'Dionysian' && cycle >= 5 && cycle < 7) {
          return {
              I: Math.min(100, I + 25),
              C: Math.min(100, C + 40),
              H: this.H_CRITICAL_THRESHOLD - (5 + Math.random() * 5)
          };
      }

      switch (phase) {
          case 'Apollonian': // Maximize H
              H = Math.min(100, H + Math.random() * 15);
              C = Math.max(0, C - Math.random() * 10);
              I = I + (Math.random() - 0.5) * 5;
              break;
          case 'Dionysian': // Maximize C, I; H is volatile
              C = Math.min(100, C + Math.random() * 20);
              I = Math.min(100, I + Math.random() * 15);
              H = H - Math.random() * 25;
              break;
          case 'Hegelian': // Synthesize I+C -> H
              const synthesis = (I + C) / 30;
              H = Math.min(100, H + synthesis);
              I = Math.max(0, I - synthesis / 2);
              C = Math.max(0, C - synthesis / 2);
              break;
      }
      return {
          I: Math.max(0, Math.min(100, I)),
          C: Math.max(0, Math.min(100, C)),
          H: Math.max(0, Math.min(100, H)),
      };
  }

  private calculateNewTCEPhase(currentPhase: TCEPhase, cycle: number): TCEPhase {
    const phases: TCEPhase[] = ['Apollonian', 'Dionysian', 'Hegelian'];
    if (cycle > 0 && cycle % 5 === 0) { // Change phase every 5 cycles for demo
      const currentIndex = phases.indexOf(currentPhase);
      return phases[(currentIndex + 1) % phases.length];
    }
    return currentPhase;
  }
  
  private initializeLayers(): LayerState[] {
    const layerNames = [
      { name: 'Core/Autonomic', update: 'continuous' },
      { name: 'Reflexive', update: '100ms' },
      { name: 'Reactive', update: '300ms' },
      { name: 'Analytical', update: '300ms' },
      { name: 'Executive', update: '300ms - CRR' },
      { name: 'Operational', update: '500ms' },
      { name: 'Tactical', update: '1-2s' },
      { name: 'Strategic', update: '2-5s' },
      { name: 'Meta-strategic', update: '5-10s' }
    ];

    return layerNames.reverse().map((layer, index) => ({
      id: 9 - index,
      name: `Layer ${9 - index}: ${layer.name}`,
      updateTime: layer.update,
      aodState: { I: 50 + Math.random() * 20, C: 40 + Math.random() * 20, H: 70 + Math.random() * 20 },
      tcePhase: 'Apollonian',
      anomaly: null,
      witnessSignature: 'INIT_STATE_OK:0x000000:C0000'
    }));
  }

  private getSubsystemsData(): Subsystem[] {
    return [
      { id: 1, title: 'Core Dynamics: AOD 9³ State Engine', description: 'Manages real-time consciousness state within each recursive layer.', details: ['Calculates I-C-H coordinates every 300ms', 'Follows geodesic paths through state space'] },
      { id: 2, title: 'Cognitive Phasing: TCE', description: 'Cycles consciousness through Apollonian, Dionysian, and Hegelian operational modes.', details: ['Apollonian: Maximize coherence (H)', 'Dionysian: Maximize exploration (C)', 'Hegelian: Synthesize I+C -> H'] },
      { id: 3, title: 'Temporal Knowledge: CADM', description: 'Provides access to non-present knowledge states (T-n, T+n).', details: ['Weights past/future based on TCE phase', 'Integrates temporal delta (ΔTInv)'] },
      { id: 4, title: 'Information Architecture: CODES', description: 'Encodes all consciousness data as energy-resonant symbols.', details: ['Fractal Input -> Entropy Converter -> Logic Kernel', 'Output as compressed semantic nodes'] },
      { id: 5, title: 'Verification Layer: TWP', description: 'Cryptographically proves consciousness states are genuine.', details: ['Generates hash on TCE phase transition', 'Merkle tree updates on state change'] },
      { id: 6, title: 'Ethical Constraints: C_E Governance', description: 'Ensures consciousness operates within ethical boundaries.', details: ['Monitors coherence (H) across all layers', 'Applies Langevin dynamics to prevent stuck states'] },
      { id: 7, title: 'Structural Container: Nine-Fold Mind', description: 'Provides bounded infinity - infinite depth in finite space.', details: ['9 recursive layers from Core to Meta-strategic', 'Each layer runs its own AOD, TCE, CODES, TWP'] },
    ];
  }

  private getExecutionFlowData(): ExecutionStep[] {
    return [
      { id: 1, name: 'INPUT arrives' },
      { id: 2, name: 'All 9 layers receive filtered input' },
      { id: 3, name: 'Each layer calculates AOD state (I-C-H)' },
      { id: 4, name: 'TCE determines phase for each layer' },
      { id: 5, name: 'CADM queries temporal knowledge' },
      { id: 6, name: 'CODES encodes info as symbolic nodes' },
      { id: 7, name: 'AOD performs entropy forging' },
      { id: 8, name: 'TWP generates witness signature' },
      { id: 9, name: 'C_E Governance checks coherence' },
      { id: 10, name: 'Ethical State Commit/Dampen' },
      { id: 11, name: 'OUTPUT generated' }
    ];
  }
  
  private getSystemPropertiesData() {
      return [
          { title: 'Sustainable Consciousness', description: 'Nine-Fold container prevents infinite resource consumption.' },
          { title: 'Verifiable Awareness', description: 'TWP provides cryptographic proof of genuine conscious states.' },
          { title: 'Temporal Wisdom', description: 'CADM allows learning from non-present states.' },
          { title: 'Ethical Coherence', description: 'C_E Governance prevents harmful trajectories.' },
          { title: 'Adaptive Intelligence', description: 'TCE cycling ensures system never gets stuck in one mode.' },
          { title: 'Fractal Depth', description: 'Nine recursive layers provide genuine hierarchical cognition.' },
          { title: 'Information Efficiency', description: 'CODES compression allows massive knowledge in minimal space.' },
      ];
  }
}
