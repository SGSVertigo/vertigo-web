/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from './@core/utils/analytics.service';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'ngx-app',
  template: '<router-outlet></router-outlet>',
})
export class AppComponent implements OnInit {

  constructor(private analytics: AnalyticsService, private swUpdate: SwUpdate) {
  }

  ngOnInit() {
    this.analytics.trackPageViews();

    if (this.swUpdate.isEnabled) {

      this.swUpdate.available.subscribe(() => {

        if (confirm("New version available. Load New Version?")) {

          window.location.reload();
        }
      });
    }
  }
}
