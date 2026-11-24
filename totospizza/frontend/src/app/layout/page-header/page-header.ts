import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChevronRight, LucideAngularModule } from 'lucide-angular';

export interface Breadcrumb {
  readonly label: string;
  readonly route?: string;
}

@Component({
  selector: 'app-page-header',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly breadcrumbs = input<readonly Breadcrumb[]>([]);

  protected readonly SeparatorIcon = ChevronRight;
}
