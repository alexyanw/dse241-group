function draw_stacked_bar(docid, columns, jsondata) {
  var screenwidth = $(window).width();
  var rotated = false;
  if(screenwidth < 800) {
    rotated = true;
  }
	var chart = c3.generate({
			bindto: docid,
			data: {
				json: jsondata,
				type: 'bar',
				keys: {
					x: 'Country',
					value: columns
				},
        groups: [columns ]
			},
			axis: {
          rotated: rotated,
					x: {
							type: 'category',
					}
			}
	});
}

function show_two_dimension(docid, years, categories, x_col, stack_col, csv_data) {
  var csv_data = csv_data.filter(function(r){
    return r.Year >= years[0] && r.Year<=years[1];
  });

  var data = d3.nest()
		.key(function(d) { return d[x_col];}).sortValues(d3.ascending)
		.key(function(d) { return d[stack_col];}).sortValues(d3.descending)
		.rollup(function(v) { 
			return v.length;
		}).entries(csv_data);

  var top_country_num = $('#select-country-count').val();
  top_countries = countries.slice(0, top_country_num);
  rows = data.map(function(d) {
	  var row = d3.nest()
			.key(function(d){ return d.key; })
			.rollup(function(v){ return v[0].values; })
		  .map(d.values);
    row['total'] = Object.values(row).reduce((a, b) => a + b);
    row[x_col] = d.key;
    return row; 
  }).filter(function(r){
    return top_countries.includes(r.Country);
  });
  rows.sort(function(a,b){ return b['total'] - a['total']; });

  draw_stacked_bar(docid, categories, rows);
}

function get_column(csv_data, column) {
  var column_count = d3.nest()
    .key(function(d) { return d[column]; })
    .rollup(function(v) { return v.length; })
    .map(csv_data);

  var items = Object.keys(column_count);
  items.sort(function(key1, key2) {
    return column_count[key2] - column_count[key1];
  });

  return items;
}
function draw_line_chart(docid, countries, jsondata) {
  var top_country_num = $('#select-country-count').val();
	var chart = c3.generate({
			bindto: docid,
			data: {
        x: 'Year',
				json: jsondata,
				type: 'line',
        keys: {
          x: 'Year',
					value: countries.slice(0,top_country_num),
        },
			},
			axis: {
					x: {
							type: 'category',
					}
			}
	});
}


function show_yearly_trend(docid, years, sports, countries, csv_data) {
  csv_data = csv_data.filter(function(r){
    return r.Year >= years[0] && r.Year<=years[1];
  });
  var data = d3.nest()
		.key(function(d) { return d.Year;}).sortValues(d3.ascending)
		.key(function(d) { return d.Country;}).sortValues(d3.descending)
		.rollup(function(v) { 
			return v.length;
		}).entries(csv_data);

  rows = data.map(function(d) {
	  var row = d3.nest()
			.key(function(d){ return d.key; })
			.rollup(function(v){ return v[0].values; })
		  .map(d.values);
    row['Year'] = d.key;
    return row; 
  });
  draw_line_chart(docid, countries, rows);
}

var csv_data;
var years, sports, countries;
var year_range = [1924, 2006];
var medals = ['Gold', 'Silver', 'Bronze'];
d3.csv("data/exercise2-olympics.csv", function(error, data) {
  csv_data = data;
  years = get_column(csv_data, 'Year');
  sports = get_column(csv_data, 'Sport');
  year_range = [years[years.length-1], years[0]];
  countries = get_column(csv_data, 'Country');

  show_yearly_trend('#line-year-country', year_range, sports, countries, csv_data);
  show_two_dimension('#barchart-country-sport', year_range, sports, 'Country', 'Sport', csv_data);
  show_two_dimension('#barchart-country-medal', year_range, medals, 'Country', 'Medal', csv_data);
});

function update_charts(){
  data_in_years = csv_data.filter(function(r){
    return r.Year >= year_range[0] && r.Year<=year_range[1];
  });
  countries = get_column(data_in_years, 'Country');
  show_yearly_trend('#line-year-country', year_range, sports, countries, data_in_years);
  show_two_dimension('#barchart-country-sport', year_range, sports, 'Country', 'Sport', data_in_years);
  show_two_dimension('#barchart-country-medal', year_range, medals, 'Country', 'Medal', data_in_years);
}
function play(y) {
	console.log('playing at year: ' + y);
  year_range = [y, 2006];
  slider_year.slider("values", year_range);
	$('#year-begin').text(y);
  update_charts();
}


