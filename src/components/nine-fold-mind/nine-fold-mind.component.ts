import { ChangeDetectionStrategy, Component, computed, input, Signal } from '@angular/core';
import { LayerState, TCEPhase } from '../../models/uaca.model';

@Component({
  selector: 'app-nine-fold-mind',
  templateUrl: './nine-fold-mind.component.html',
  styleUrls: ['./nine-fold-mind.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NineFoldMindComponent {
  layers = input.required<LayerState[]>();

  getPhaseColor(phase: TCEPhase): string {
    switch (phase) {
      case 'Apollonian': return 'border-blue-400';
      case 'Dionysian': return 'border-yellow-400';
      case 'Hegelian': return 'border-purple-400';
      default: return 'border-gray-500';
    }
  }

  getBorderClass(layer: LayerState): string {
    if (layer.anomaly) {
      return 'border-red-500 shadow-red-500/40 shadow-lg';
    }
    return this.getPhaseColor(layer.tcePhase);
  }

  getPhaseTextColor(phase: TCEPhase): string {
    switch (phase) {
      case 'Apollonian': return 'text-blue-300';
      case 'Dionysian': return 'text-yellow-300';
      case 'Hegelian': return 'text-purple-300';
      default: return 'text-gray-400';
    }
  }
}
