import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'grid';
params = {"start_date":"2021-08-01T00:00:00.000Z","end_date":"2022-07-31T00:00:00.000Z","granularity":"MONTH","aggregate_all":true,"forecast_version_ids":{"PROMO":"530"},"layout_level":-1,"fact_column_include":false,"promo_forecast_include":false,"layout_type":"PRODUCTS"};
granularity = "MONTH";
metrics = "RUBLES";
point = "руб";
type = "ROLE_HEAD";
baseForecastVersion = {"version_id":"530","name":"2021-11-22 13:53","what_if_version_ids":null,"published":true,"forecast_type":"PROMO","status":"CALCULATED","last_date_calculate":"2021-07-01T00:00:00.000Z","forecast_version_workflow_status":"APPROVED","start_date":"2021-08-01T00:00:00.000Z","end_date":"2022-07-31T00:00:00.000Z","what_if_data":null,"calculate_available":false,"what_if":false};
regularForecastVersion = null;
rawCells = [{"label":"Все","value":"all","checked":true},{"label":"Базовый прогноз","value":"PROMO","version_id":"530","checked":false}];
}
