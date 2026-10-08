from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)  # Allows your React app to communicate with this API

# Load the trained model
model = joblib.load('model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Receive data from React frontend
        data = request.get_json()
        
        # Convert JSON data into a DataFrame format the model expects
        # Features must match the list used in Phase 2 Cell 1
        input_data = pd.DataFrame([{
            'Pclass': int(data['Pclass']),
            'Sex': int(data['Sex']), # 0 for male, 1 for female
            'Age': float(data['Age']),
            'SibSp': int(data['SibSp']),
            'Parch': int(data['Parch']),
            'Fare': float(data['Fare']),
            'FamilySize': int(data['FamilySize']),
            'IsAlone': int(data['IsAlone'])
        }])

        # Get survival probability (class 1) [cite: 95]
        prediction_prob = model.predict_proba(input_data)[0][1]
        
        return jsonify({
            'success': True,
            'probability': round(float(prediction_prob) * 100, 2),
            'survived': bool(prediction_prob > 0.5)
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

if __name__ == '__main__':
    # Run on port 5000 [cite: 14]
    app.run(debug=True, port=5000)

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Load model once at startup
try:
    model = joblib.load('model.pkl')
    logger.info("✅ Model loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load model: {e}")
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'success': False, 'error': 'Model not loaded'}), 500
        
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        # Safely extract with defaults
        input_data = pd.DataFrame([{
            'Pclass': int(data.get('Pclass', 3)),
            'Sex': int(data.get('Sex', 0)),
            'Age': float(data.get('Age', 30)),
            'SibSp': int(data.get('SibSp', 0)),
            'Parch': int(data.get('Parch', 0)),
            'Fare': float(data.get('Fare', 30)),
            'FamilySize': int(data.get('FamilySize', 1)),
            'IsAlone': int(data.get('IsAlone', 1))
        }])

        # Predict probability of class 1 (Survived)
        proba = model.predict_proba(input_data)[0][1]
        probability = round(float(proba) * 100, 2)
        
        logger.info(f"Prediction: {probability}% | Input: {input_data.to_dict()}")
        
        return jsonify({
            'success': True,
            'probability': probability,
            'survived': probability > 50
        })

    except KeyError as e:
        return jsonify({'success': False, 'error': f'Missing field: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
    return jsonify({'success': False, 'error': str(e)}), 500
