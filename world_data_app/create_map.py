import folium
import geopandas as gpd

# Load GeoJSON data
world_geo = gpd.read_file(gpd.datasets.get_path('naturalearth_lowres')).to_json()

# Create a Folium map
m = folium.Map(location=[0, 0], zoom_start=2, min_zoom=2, max_zoom=5, no_wrap=True, max_bounds=True)

# Add GeoJSON to the map with click functionality
folium.GeoJson(
    world_geo,
    name="World",
    style_function=lambda x: {'fillColor': 'green', 'color': 'green', 'weight': 1},
    tooltip=folium.GeoJsonTooltip(fields=['name']),
    popup=folium.GeoJsonPopup(fields=['name'])
).add_to(m)

# Save the map to an HTML file
m.save('templates/map.html')
