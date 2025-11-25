
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ExecutionStep } from '../../models/uaca.model';

@Component({
  selector: 'app-execution-flow',
  templateUrl: './execution-flow.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutionFlowComponent {
  executionFlow = input.required<ExecutionStep[]>();
  activeStep = input.required<number>();
}
