from flask import Flask, render_template_string, jsonify, request
from werkzeug.utils import secure_filename
import os
from ultralytics import YOLO  # Make sure to install this package
import logging
from flask_cors import CORS

logging.basicConfig(level=logging.DEBUG)
logging.getLogger('flask_cors').level = logging.DEBUG

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize YOLO model
model = YOLO('best.pt')  # Replace 'best.pt' with the path to your own model

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def hello_world():
    return render_template_string('<h1>Hello, World!</h1>')

@app.route('/detect', methods=['POST'])
def detect():
    logging.info("Received request for detection")
    if 'image' not in request.files:
        # Handle binary data
        try:
            image_data = request.get_data()
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], "received_image.jpg")
            with open(filepath, "wb") as f:
                f.write(image_data)
        except Exception as e:
            print(e)
            return jsonify({"error": "An error occurred"}), 500
    else:
        # Handle uploaded image
        image = request.files['image']
        filename = secure_filename(image.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        image.save(filepath)
    
    # Perform detection using YOLO
    results = model([filepath])
    output = None
    names = model.names
    
    for r in results:
        for c in r.boxes.cls:
            output = names[int(c)]

    logging.info(f"Detected food type: {output}")
    
    # Remove the temporary saved image
    os.remove(filepath)
    logging.info(f"Removed temporary image at {filepath}")
    
    return jsonify({"food_type": output})

# Run the Flask app
if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(host='0.0.0.0', port=8000, debug=True)
