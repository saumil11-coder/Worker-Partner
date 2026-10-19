import { Component, computed, input } from '@angular/core';

/**
 * Icon registry:  key  →  SVG path data.
 * The key is what the backend stores in service_category.icon_key.
 * To add an icon, add one entry here. Unknown keys fall back to 'default'.
 */
export const SERVICE_ICONS: Record<string, string[]> = {
  'plumbing': [
    'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
  ],
  'electrical': [
    'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  ],
  'cleaning': [
    'M10 5l1.9 5.6 5.6 1.9-5.6 1.9L10 20l-1.9-5.6-5.6-1.9 5.6-1.9z',
    'M19 3v4',
    'M17 5h4',
    'M20 17v3',
    'M18.5 18.5h3',
  ],
  'tutoring': [
    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
    'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  ],
  'painting': [
    'M5 3h11a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z',
    'M18 6h2.5a.5.5 0 0 1 .5.5V11a1 1 0 0 1-1 1h-7a1 1 0 0 0-1 1v2',
    'M11 15h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z',
  ],
  'carpentry': [
    'M12 6l3-3 6 6-3 3z',
    'M13.5 10.5L4 20',
  ],
  'ac-repair': [
    'M2 12h20',
    'M12 2v20',
    'm20 16-4-4 4-4',
    'm4 8 4 4-4 4',
    'm16 4-4 4-4-4',
    'm8 20 4-4 4 4',
  ],
  'appliance-repair': [
    'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z',
    'M12 10a4 4 0 1 0 0 8 4 4 0 1 0 0-8z',
    'M8 6h.01',
    'M12 6h.01',
  ],
  'default': [
    'M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z',
    'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16',
  ],
};

@Component({
  selector: 'app-service-icon',
  standalone: true,
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: [`
    :host { display: inline-block; width: 1.5rem; height: 1.5rem; }
    svg { display: block; width: 100%; height: 100%; }
  `],
})
export class ServiceIcon {
  /** The icon key coming from the backend, e.g. 'plumbing' */
  name = input<string | null | undefined>('default');

  paths = computed(() => SERVICE_ICONS[(this.name() ?? '').toLowerCase()] ?? SERVICE_ICONS['default']);
}
