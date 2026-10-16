import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'ei-pagination',
  imports: [],
  templateUrl: './pagination.html',
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalItems = input.required<number>();

  readonly pageChanged = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize())),
  );

  readonly canPrev = computed(() => this.page() > 1);
  readonly canNext = computed(() => this.page() < this.totalPages());

  /**
   * Which page numbers to render. For <=7 pages, show all. Above that,
   * show first, last, current ± 1, and '…' where a gap exists. Null
   * entries are ellipsis markers.
   */
  readonly pageNumbers = computed<(number | null)[]>(() => {
    const total = this.totalPages();
    const current = this.page();

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | null)[] = [1];

    const left = Math.max(2, current - 1);
    const right = Math.min(total - 1, current + 1);

    if (left > 2) pages.push(null);
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < total - 1) pages.push(null);

    pages.push(total);
    return pages;
  });

  readonly rangeLabel = computed(() => {
    const total = this.totalItems();
    if (total === 0) return '0 items';

    const size = this.pageSize();
    const start = (this.page() - 1) * size + 1;
    const end = Math.min(total, this.page() * size);
    return `${start}–${end} of ${total}`;
  });

  goPrev(): void {
    if (this.canPrev()) this.pageChanged.emit(this.page() - 1);
  }

  goNext(): void {
    if (this.canNext()) this.pageChanged.emit(this.page() + 1);
  }

  goTo(p: number): void {
    if (p < 1 || p > this.totalPages() || p === this.page()) return;
    this.pageChanged.emit(p);
  }
}