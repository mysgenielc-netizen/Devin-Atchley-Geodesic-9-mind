
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SystemStateService } from '../../services/system-state.service';
import { NineFoldMindComponent } from '../nine-fold-mind/nine-fold-mind.component';
import { SubsystemCardComponent } from '../subsystem-card/subsystem-card.component';
import { ExecutionFlowComponent } from '../execution-flow/execution-flow.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NineFoldMindComponent, SubsystemCardComponent, ExecutionFlowComponent]
})
export class DashboardComponent {
  systemState = inject(SystemStateService);
}
