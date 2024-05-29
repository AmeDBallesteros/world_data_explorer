from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('map.html')

@app.route('/country_info', methods=['POST'])
def country_info():
    country_name = request.form.get('country')
    # Fetch and process data about the country
    country_data = f"Information about {country_name}"  # Placeholder for actual data
    return country_data

if __name__ == '__main__':
    app.run(debug=True)
