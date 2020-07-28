import firebase from 'firebase/app';
import 'firebase/auth';
import { readable } from 'svelte/store';

const userMapper = claims => ({
	id: claims.user_id,
	name: claims.name,
	email: claims.email,
	picture: claims.picture
});

// construction function. need to call it after we
// initialize our firebase app
export const initAuth = (useRedirect = false) => {
	const auth = firebase.auth();

	const loginWithEmailPassword = (email, password) =>
		auth.signInWithEmailAndPassword(email, password);

	const loginWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();

		if (useRedirect) {
			return auth.signInWithRedirect(provider);
		} else {
			return auth.signInWithPopup(provider);
		}
	};

	const logout = () => auth.signOut();

	// wrap Firebase user in a Svelte readable store
	const user = readable(null, set => {
		const unsub = auth.onAuthStateChanged(async fireUser => {
			if (fireUser) {
				const token = await fireUser.getIdTokenResult();
				const user = userMapper(token.claims);
				set(user);
			} else {
				set(null);
			}
		});

		return unsub;
	});

	return {
		user,
		loginWithGoogle,
		loginWithEmailPassword,
		logout
	};
};
