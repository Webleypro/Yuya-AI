from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from brain import YuyaBrain
from utils.email import send_verification_code
from utils.storage import save_conversation, load_conversations
import random
import string

app = Flask(__name__, static_folder='../frontend')
CORS(app, supports_credentials=True)

brain = YuyaBrain()
USERS_FILE = 'users.json'

# Fonction pour charger les utilisateurs depuis le fichier JSON
def load_users():
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Erreur lors du chargement des utilisateurs : {e}")
    return {}

# Fonction pour sauvegarder les utilisateurs dans le fichier JSON
def save_users(users):
    try:
        os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Erreur lors de la sauvegarde des utilisateurs : {e}")

# Route pour l'inscription
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Données manquantes'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email et mot de passe requis'}), 400
        
        users = load_users()
        
        # Si l'utilisateur existe déjà mais n'est pas vérifié, on peut lui renvoyer un code
        if email in users and users[email].get('verified', False):
            return jsonify({'error': 'Email déjà enregistré'}), 400
        
        verification_code = ''.join(random.choices(string.digits, k=6))
        print(f"Code de vérification pour {email}: {verification_code}")  # Pour le debug
        
        # Tentative d'envoi du code par email
        email_sent = send_verification_code(email, verification_code)
        if not email_sent:
            # En cas d'échec de l'envoi d'email, on utilise un code de test pour le développement
            verification_code = '123456'
            print(f"Utilisation du code de test pour {email}: {verification_code}")

        users[email] = {
            'password': password,
            'verified': False,
            'verification_code': verification_code
        }
        save_users(users)

        return jsonify({'message': 'Code de vérification envoyé'}), 200

    except Exception as e:
        print(f"Erreur lors de l'inscription: {e}")
        return jsonify({'error': 'Erreur interne'}), 500

# Route pour la vérification du code
@app.route('/api/verify', methods=['POST'])
def verify():
    try:
        data = request.get_json()
        email = data.get('email')
        verification_code = data.get('verificationCode')
        password = data.get('password')
        
        if not email or not verification_code or not password:
            return jsonify({'error': 'Données manquantes'}), 400
        
        users = load_users()
        user = users.get(email)

        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 400
        
        if user['verification_code'] != verification_code:
            return jsonify({'error': 'Code de vérification incorrect'}), 400

        # Vérifier et sauvegarder l'utilisateur comme vérifié
        user['verified'] = True
        save_users(users)

        return jsonify({'message': 'Compte vérifié avec succès'}), 200

    except Exception as e:
        print(f"Erreur lors de la vérification: {e}")
        return jsonify({'error': 'Erreur interne'}), 500

# Route pour la connexion
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email et mot de passe requis'}), 400
        
        users = load_users()
        user = users.get(email)

        if not user or user['password'] != password:
            return jsonify({'error': 'Identifiants incorrects'}), 400

        if not user['verified']:
            return jsonify({'error': 'Compte non vérifié'}), 400

        return jsonify({'message': 'Connexion réussie'}), 200

    except Exception as e:
        print(f"Erreur lors de la connexion: {e}")
        return jsonify({'error': 'Erreur interne'}), 500
