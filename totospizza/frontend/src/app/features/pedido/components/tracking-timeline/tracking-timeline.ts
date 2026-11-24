import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Check, LucideAngularModule } from 'lucide-angular';
import type { EtapaSeguimientoResponse } from '../../../../core/models/api';
import { formatearHora } from '../../../../core/utils/fechas';

@Component({
  selector: 'app-tracking-timeline',
  imports: [LucideAngularModule],
  templateUrl: './tracking-timeline.html',
  styleUrl: './tracking-timeline.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackingTimeline {
  readonly etapas = input.required<readonly EtapaSeguimientoResponse[]>();

  protected readonly hora = formatearHora;
  protected readonly CheckIcon = Check;
}
