from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid  
# ← Important line
from werkzeug.security import generate_password_hash, check_password_hash

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
 
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///vaultkey.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class Partner(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))  # Partner Name (from RegisteredPartner)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # Who added this partner
    registered_partner_id = db.Column(db.Integer, db.ForeignKey('registered_partner.id'))  # Link to master




class Consent(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    partner_id = db.Column(db.Integer, db.ForeignKey('partner.id'))
    data_type = db.Column(db.String(50))
    token = db.Column(db.String(120), unique=True)
    expires_at = db.Column(db.DateTime)
    revoked = db.Column(db.Boolean, default=False)

class RegisteredPartner(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    partner_name = db.Column(db.String(120), nullable=False)
    partner_id = db.Column(db.String(80), unique=True, nullable=False)
    passcode = db.Column(db.String(120), nullable=False)  # hashed




# --------- Routes ---------
from datetime import datetime, timedelta
import uuid

# Health check
@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "Smart Privacy Vault is running"}), 200



@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    new_user = User(username=username, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


# Login (simulated)
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    user = User.query.filter_by(username=username).first()
    if not user or user.password != password:
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({"message": "Login successful"}), 200



# Add a new partner
@app.route("/add_partner", methods=["POST"])
def add_partner():
    data = request.json
    username = data.get("username")
    partner_name = data.get("partner_name")  # Selected from dropdown of REGISTERED partners

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    registered_partner = RegisteredPartner.query.filter_by(partner_name=partner_name).first()
    if not registered_partner:
        return jsonify({"error": "No such registered partner"}), 404

    # Create actual partner entry
    partner = Partner(
        name=partner_name,
        user_id=user.id,
        registered_partner_id=registered_partner.id
    )
    db.session.add(partner)
    db.session.commit()

    return jsonify({"message": "Partner added successfully"})


# Get user profile and data
@app.route("/profile", methods=["GET"])
def get_profile():
    username = request.args.get("username")
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    partners = Partner.query.filter_by(user_id=user.id).all()
    partner_names = [p.name for p in partners]

    # For now, mock data
    dummy_data = {
        "salary": 85000,
        "credit_score": 735,
        "account_balance": 42350.75,
        "transaction_history": ["Paid $50 to Netflix", "Received $200 from client"]
    }

    return jsonify({
        "username": username,
        "partners": partner_names,
        "data": dummy_data
    }), 200


# --------------------------------------
@app.route("/grant_consent", methods=["POST"])
def grant_consent():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        username = data.get("username")
        partner_name = data.get("partner")
        data_type = data.get("data_type")

        if not all([username, partner_name, data_type]):
            return jsonify({"error": "Missing required fields"}), 400

        print(f"Processing consent for: {username}, {partner_name}, {data_type}")  # Debug log

        user = User.query.filter_by(username=username).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        partner = Partner.query.filter_by(name=partner_name, user_id=user.id).first()
        if not partner:
            return jsonify({"error": "Partner not found for user"}), 404

        token_id = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(days=180)
        
        
        consent = Consent(
            user_id=user.id,
            partner_id=partner.id,
            data_type=data_type,
            token=token_id,
            expires_at=expires_at,
            revoked=False
        )

        db.session.add(consent)
        db.session.commit()

        return jsonify({
            "message": "Consent granted",
            "token": {
                "token_id": token_id,
                "username": username,
                "partner": partner_name,
                "data_type": data_type,
                "expires_at": expires_at.isoformat()
            }
        }), 200

    except Exception as e:
        print(f"Error in grant_consent: {str(e)}")  # Debug log
        db.session.rollback()  # Rollback any failed transaction
        return jsonify({"error": str(e)}), 500

    




@app.route("/use_token", methods=["POST"])
def use_token():
    data = request.json
    token_id = data.get("token_id")
    partner_name = data.get("partner")

    consent = Consent.query.filter_by(token=token_id).first()
    if not consent:
        return jsonify({"error": "Invalid token"}), 404

    if consent.revoked:
        return jsonify({"error": "Token has been revoked"}), 403

    if datetime.utcnow() > consent.expires_at:
        return jsonify({"error": "Token expired"}), 403

    partner = Partner.query.get(consent.partner_id)
    if not partner or partner.name != partner_name:
        return jsonify({"error": "Unauthorized partner"}), 403

    user = User.query.get(consent.user_id)
    # For now, return a mock data value (as real data is still not stored in DB)
    dummy_data = {
        "salary": 85000,
        "credit_score": 735,
        "account_balance": 42350.75,
        "transaction_history": ["Paid $50 to Netflix", "Received $200 from client"]
    }
    value = dummy_data.get(consent.data_type, "Unavailable")

    return jsonify({
        "partner": partner_name,
        "data_type": consent.data_type,
        "value": value
    }), 200


@app.route("/revoke_token", methods=["POST"])
def revoke_token():
    data = request.json
    token_id = data.get("token_id")
    username = data.get("username")

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    consent = Consent.query.filter_by(token=token_id, user_id=user.id).first()
    if not consent:
        return jsonify({"error": "Token not found for user"}), 404

    consent.revoked = True
    db.session.commit()

    return jsonify({"message": f"Token {token_id} revoked"}), 200


@app.route("/get_tokens", methods=["POST"])
def get_tokens():
    data = request.json
    username = data.get("username")
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    consents = Consent.query.filter_by(user_id=user.id).all()
    result = []
    for c in consents:
        partner = Partner.query.get(c.partner_id)
        result.append({
            "token_id": c.token,
            "username": username,
            "partner": partner.name if partner else "Unknown",
            "data_type": c.data_type,
            "expires_at": c.expires_at.isoformat(),
            "revoked": c.revoked,
            "expired": datetime.utcnow() > c.expires_at
        })

    return jsonify({"tokens": result}), 200



@app.route('/get_partners', methods=['GET'])
def get_partners():
    username = request.args.get('username')
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    partners = Partner.query.filter_by(user_id=user.id).all()
    partner_names = [p.name for p in partners]

    return jsonify({"partners": partner_names})


@app.route("/register_partner", methods=["POST"])
def register_partner():
    data = request.json
    partner_name = data.get("partner_name")
    partner_id = data.get("partner_id")
    passcode = data.get("passcode")

    if not partner_name or not partner_id or not passcode:
        return jsonify({"error": "All fields are required"}), 400

    # Check if partner ID already exists
    if RegisteredPartner.query.filter_by(partner_id=partner_id).first():
        return jsonify({"error": "Partner ID already taken"}), 409

    # Hash the passcode for security
    hashed_passcode = generate_password_hash(passcode)

    new_registered_partner = RegisteredPartner(
        partner_name=partner_name,
        partner_id=partner_id,
        passcode=hashed_passcode
    )

    db.session.add(new_registered_partner)
    db.session.commit()

    return jsonify({"message": "Partner registered successfully!"}), 201


from werkzeug.security import check_password_hash

@app.route("/login_partner", methods=["POST"])
def login_partner():
    data = request.json
    partner_id = data.get("partner_id")
    passcode = data.get("passcode")

    if not partner_id or not passcode:
        return jsonify({"error": "Missing credentials"}), 400

    partner = RegisteredPartner.query.filter_by(partner_id=partner_id).first()

    if not partner or not check_password_hash(partner.passcode, passcode):
        return jsonify({"error": "Invalid Partner ID or passcode"}), 401

    return jsonify({"message": "Partner login successful", "partner_name": partner.partner_name}), 200
@app.route("/get_partner_tokens", methods=["POST"])
def get_partner_tokens():
    data = request.json
    partner_id = data.get("partner_id")  # Unique ID used in login

    if not partner_id:
        return jsonify({"error": "Partner ID is required"}), 400

    reg_partner = RegisteredPartner.query.filter_by(partner_id=partner_id).first()
    if not reg_partner:
        return jsonify({"tokens": []}), 200  # No tokens yet

    # Get all partner instances linked to this registered partner
    partners = Partner.query.filter_by(registered_partner_id=reg_partner.id).all()

    result = []
    for partner in partners:
        consents = Consent.query.filter_by(partner_id=partner.id).all()
        for c in consents:
            user = User.query.get(c.user_id)
            result.append({
                "token_id": c.token,
                "username": user.username if user else "Unknown",
                "data_type": c.data_type,
                "expires_at": c.expires_at.isoformat(),
                "revoked": c.revoked,
                "expired": datetime.utcnow() > c.expires_at
            })

    return jsonify({"tokens": result}), 200



@app.route('/all_partners', methods=['GET'])
def get_all_partners():
    try:
        registered = RegisteredPartner.query.all()
        partner_names = [p.partner_name for p in registered]
        return jsonify({"partners": partner_names}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/registered_partners", methods=["GET"])
def registered_partners():
    partners = RegisteredPartner.query.all()
    result = [{"partner_name": p.partner_name, "partner_id": p.partner_id} for p in partners]
    return jsonify({"partners": result}), 200







if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)

