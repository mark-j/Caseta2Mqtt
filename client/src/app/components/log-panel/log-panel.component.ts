import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { DataService } from 'src/app/services/data/data.service';

@Component({
  selector: 'c2m-log-panel',
  templateUrl: './log-panel.component.html',
  styleUrls: ['./log-panel.component.scss']
})
export class LogPanelComponent implements AfterViewInit {
  private scrollContainer: any;
  private isNearBottom = true;
  public isOpen: boolean;
  public logs = this._dataService.logs;

  constructor(private _dataService: DataService) { }

  @ViewChild('container', {static: false})
  public containerElementRef: ElementRef;

  @ViewChildren('log')
  public logElementRefs: QueryList<any>;

  public ngAfterViewInit() {
    this.scrollContainer = this.containerElementRef.nativeElement;
    this.logElementRefs.changes.subscribe(_ => this._handleListChange());
    this._scrollToBottomAfterDelay();
  }

  public toggleOpen() {
    this.isOpen = !this.isOpen;
    this._scrollToBottomAfterDelay();
  }

  public updateScrollPosition(): void {
    this.isNearBottom = this._isUserNearBottom();
  }

  private _handleListChange(): void {
    if (this.isNearBottom || !this.isOpen) {
      this._scrollToBottom();
    }
  }

  public _scrollToBottomAfterDelay(): void {
    setTimeout(() => this._scrollToBottom(), 250);
  }

  private _scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  private _isUserNearBottom(): boolean {
    const threshold = 30;
    const position = this.scrollContainer.scrollTop + this.scrollContainer.offsetHeight;
    const height = this.scrollContainer.scrollHeight;
    return position > height - threshold;
  }
}
