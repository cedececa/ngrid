import { Directive, Injector, Input, OnDestroy, ComponentFactoryResolver, ComponentRef } from '@angular/core';

import { UnRx } from '@neg/utils';
import { NegTableComponent, NegTablePluginController, TablePlugin } from '@neg/table';

import { NegTableCheckboxComponent } from './table-checkbox.component';

declare module '@neg/table/lib/ext/types' {
  interface NegTablePluginExtension {
    matCheckboxSelection?: NegTableMatCheckboxSelectionDirective;
  }
}

const PLUGIN_KEY: 'matCheckboxSelection' = 'matCheckboxSelection';

@TablePlugin({ id: PLUGIN_KEY })
@Directive({ selector: 'neg-table[matCheckboxSelection]' })
@UnRx()
export class NegTableMatCheckboxSelectionDirective implements OnDestroy {
  /**
   * Add's a selection column using material's `mat-checkbox` in the column specified.
   */
  @Input() get matCheckboxSelection(): string { return this._name; }
  set matCheckboxSelection(value: string ) {
    if (value !== this._name) {
      this._name = value;
      if (!value) {
        if (this.cmpRef) {
          this.cmpRef.destroy();
          this.cmpRef = undefined;
        }
      } else {
        if (!this.cmpRef) {
          this.cmpRef = this.cfr.resolveComponentFactory(NegTableCheckboxComponent).create(this.injector);
          this.cmpRef.instance.table = this.table;
          if (this._bulkSelectMode) {
            this.cmpRef.instance.bulkSelectMode = this._bulkSelectMode;
          }
        }
        this.cmpRef.instance.name = value;
        this.cmpRef.changeDetectorRef.detectChanges();
      }
    }
  }

  /**
   * Defines the behavior when clicking on the bulk select checkbox (header).
   * There are 2 options:
   *
   * - all: Will select all items in the current collection
   * - view: Will select only the rendered items in the view
   *
   * The default value is `all`
   */
  @Input() get bulkSelectMode(): 'all' | 'view' | 'none' { return this._bulkSelectMode; }
  set bulkSelectMode(value: 'all' | 'view' | 'none') {
    if (value !== this._bulkSelectMode) {
      this._bulkSelectMode = value;
      if (this.cmpRef) {
        this.cmpRef.instance.bulkSelectMode = value;
      }
    }
  }

  private _name: string;
  private _bulkSelectMode: 'all' | 'view' | 'none';
  private cmpRef: ComponentRef<NegTableCheckboxComponent>;
  private _removePlugin: (table: NegTableComponent<any>) => void;

  constructor(private table: NegTableComponent<any>,
              private cfr: ComponentFactoryResolver,
              private injector: Injector,
              pluginCtrl: NegTablePluginController) {
    this._removePlugin = pluginCtrl.setPlugin(PLUGIN_KEY, this);
  }

  ngOnDestroy() {
    if (this.cmpRef) {
      this.cmpRef.destroy();
    }
    this._removePlugin(this.table);
  }
}
