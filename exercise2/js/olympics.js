colormap_countries = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628'];
colormap_sports = ['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628'];
colormap_medals = ['gold','silver','#b87333'];
colormap = [
['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b'],
['#f7fcfd','#e0ecf4','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#810f7c','#4d004b'],
['#f7f4f9','#e7e1ef','#d4b9da','#c994c7','#df65b0','#e7298a','#ce1256','#980043','#67001f'],
['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a','#e31a1c','#bd0026','#800026'],
['#fff7f3','#fde0dd','#fcc5c0','#fa9fb5','#f768a1','#dd3497','#ae017e','#7a0177','#49006a'],
['#fff7fb','#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d','#023858'],
['#ffffff','#f0f0f0','#d9d9d9','#bdbdbd','#969696','#737373','#525252','#252525','#000000'],
];
function draw_stacked_bar(docid, columns, jsondata, colormap) {
  colormap_dict = {};
  columns.forEach(function(col, i) { colormap_dict[col] = colormap[i]; });
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
            groups: [columns],
            colors: colormap_dict,
			color: function (color, d) {
				if(d.id == undefined) {
					return color;
				}
				col = d3.hsl(color)
				//col.l += d.index * 0.1;  // increase luminance
				//console.log(d.index, color, col);
				//return col.brighter(d.index*0.2);
				return col;
			}
        },
        axis: {
            rotated: rotated,
            x: {
                type: 'category',
            }
        }
    });
}

function show_two_dimension(docid, years, categories, x_col, stack_col, csv_data, colormap) {
  var csv_data = csv_data.filter(function(r){
    return r.Year >= years[0] && r.Year<=years[1];
  });

  var data = d3.nest()
		.key(function(d) { return d[x_col];}).sortValues(d3.ascending)
		.key(function(d) { return d[stack_col];}).sortKeys(function(a,b) { return medals.indexOf(a) - medals.indexOf(b); })
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

  draw_stacked_bar(docid, categories, rows, colormap);
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
  top_countries = countries.slice(0,top_country_num);

  colormap_dict = {};
  top_countries.forEach(function(col, i) { colormap_dict[col] = colormap_countries[i]; });

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
        colors: colormap_dict,
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
  show_two_dimension('#barchart-country-sport', year_range, sports, 'Country', 'Sport', csv_data, colormap_sports);
  show_two_dimension('#barchart-country-medal', year_range, medals, 'Country', 'Medal', csv_data, colormap_medals);
});

function update_charts(){
  data_in_years = csv_data.filter(function(r){
    return r.Year >= year_range[0] && r.Year<=year_range[1];
  });
  countries = get_column(data_in_years, 'Country');
  show_yearly_trend('#line-year-country', year_range, sports, countries, data_in_years);
  show_two_dimension('#barchart-country-sport', year_range, sports, 'Country', 'Sport', csv_data, colormap_sports);
  show_two_dimension('#barchart-country-medal', year_range, medals, 'Country', 'Medal', csv_data, colormap_medals);
}
function play(y) {
	console.log('playing at year: ' + y);
  year_range = [y, 2006];
  slider_year.slider("values", year_range);
	$('#year-begin').text(y);
  update_charts();
}


