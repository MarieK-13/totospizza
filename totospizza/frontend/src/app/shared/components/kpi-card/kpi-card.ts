import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule, TrendingDown, TrendingUp } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';

export type KpiTone = 'rojo' | 'verde' | 'amarillo' | 'neutro';

@Component({
  selector: 'app-kpi-card',
  imports: [LucideAngularModule],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"kpi kpi--" + tone()' },
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input<LucideIconData>();
  readonly tone = input<KpiTone>('neutro');
  readonly hint = input<string>();
  readonly trend = input<number>();

  protected readonly TrendUp = TrendingUp;
  protected readonly TrendDown = TrendingDown;
  protected readonly trendUp = computed(() => (this.trend() ?? 0) >= 0);
  protected readonly trendLabel = computed(() => {
    const value = this.trend();
    return value === undefined ? '' : `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  });
}
