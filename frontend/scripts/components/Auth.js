const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        let response;
        let data;

        if (isLogin) {
            if (email === 'a@admin' && password === 'adminn') {
                console.log('Connexion admin détectée');
                onAdmin();
                return;
            }

            console.log('Tentative de connexion utilisateur...');
            response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            console.log('Réponse reçue pour /login', response);
            data = await response.json();

            if (response.ok) {
                console.log('Connexion réussie', data);
                onAuth(email);
            } else {
                console.error('Erreur de connexion', data);
                setError(data.error || 'Erreur de connexion');
            }
        } else {
            if (!showVerification) {
                console.log('Tentative d\'inscription...');
                response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, password }),
                });

                console.log('Réponse reçue pour /register', response);
                data = await response.json();

                if (response.ok) {
                    console.log('Inscription réussie, code envoyé', data);
                    setShowVerification(true);
                    alert('Un code de vérification a été envoyé à votre email.');
                } else {
                    console.error('Erreur d\'inscription', data);
                    setError(data.error || 'Erreur d\'inscription');
                }
            } else {
                console.log('Tentative de vérification...');
                response = await fetch(`${API_URL}/verify`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ email, code: verificationCode }),
                });

                console.log('Réponse reçue pour /verify', response);
                data = await response.json();

                if (response.ok) {
                    console.log('Vérification réussie', data);
                    setIsLogin(true);
                    setShowVerification(false);
                    alert('Compte vérifié avec succès ! Vous pouvez maintenant vous connecter.');
                } else {
                    console.error('Erreur de vérification', data);
                    setError(data.error || 'Code de vérification incorrect');
                }
            }
        }
    } catch (err) {
        console.error('Erreur de connexion au serveur', err);
        setError('Erreur de connexion au serveur');
    } finally {
        setLoading(false);
    }
};
