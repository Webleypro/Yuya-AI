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

def load_users():
    try:
        if os.path.exists(USERS_FILE):
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
    except Exception as e:
        print(f"Erreur lors du chargement des utilisateurs : {e}")
    return {}

def save_users(users):
    try:
        os.makedirs(os.path.dirname(USERS_FILE), exist_ok=True)
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(users, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Erreur lors de la sauvegarde des utilisateurs : {e}")

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
            'verification_code': verification_code,
            'verified': False
        }
        save_users(users)
        
        return jsonify({
            'message': 'Code de vérification envoyé',
            'test_code': '123456' if not email_sent else None  # Pour le développement uniquement
        })
        
    except Exception as e:
        print(f"Erreur lors de l'inscription : {e}")
        return jsonify({'error': 'Erreur lors de l\'inscription'}), 500

@app.route('/api/verify', methods=['POST'])
def verify():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Données manquantes'}), 400
        
        email = data.get('email')
        code = data.get('code')
        
        if not email or not code:
            return jsonify({'error': 'Email et code requis'}), 400
        
        users = load_users()
        
        if email not in users:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        user = users[email]
        if user.get('verification_code') != code:
            return jsonify({'error': 'Code de vérification invalide'}), 400
        
        user['verified'] = True
        save_users(users)
        
        return jsonify({'message': 'Compte vérifié avec succès'})
        
    except Exception as e:
        print(f"Erreur lors de la vérification : {e}")
        return jsonify({'error': 'Erreur lors de la vérification'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Données manquantes'}), 400
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email et mot de passe requis'}), 400
        
        users = load_users()
        
        if email not in users:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
        user = users[email]
        if not user.get('verified', False):
            return jsonify({'error': 'Compte non vérifié'}), 400
        
        if user.get('password') != password:
            return jsonify({'error': 'Mot de passe incorrect'}), 400
        
        return jsonify({'message': 'Connexion réussie'})
        
    except Exception as e:
        print(f"Erreur lors de la connexion : {e}")
        return jsonify({'error': 'Erreur lors de la connexion'}), 500

if __name__ == '__main__':
    # Changez le port à 5001 (ou un autre port si 5001 est déjà utilisé)
    app.run(debug=True, host='0.0.0.0', port=5001)
