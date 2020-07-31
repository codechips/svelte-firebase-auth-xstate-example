import firebase from 'firebase/app';
import 'firebase/auth';
import { useMachine } from './useMachine';
import { initAuthMachine } from './authMachine';

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

		return useRedirect
			? auth.signInWithRedirect(provider)
			: auth.signInWithPopup(provider);
	};

	const services = {
		authChecker: () =>
			// wrap the onAuthStateChanged hook in a promise and
			// immediately unsubscribe when triggered
			new Promise((resolve, reject) => {
				const unsubscribe = firebase.auth().onAuthStateChanged(auth => {
					unsubscribe();
					return auth ? resolve(auth) : reject();
				});
			}),
		authenticator: (_, event) => {
			if (event.provider === 'email') {
				return loginWithEmailPassword(event.email, event.password);
			} else if (event.provider === 'google') {
				return loginWithGoogle();
			}
		},
		loader: (ctx, _) => {
			return new Promise(resolve => {
				setTimeout(() => {
					// auth object is already set on the app context
					// by authChecker service
					ctx.auth
						.getIdTokenResult()
						.then(({ claims }) => userMapper(claims))
						.then(resolve);
				}, 1500);
			});
		},
		logout: () => auth.signOut()
	};

	const authMachine = initAuthMachine(services);

	return useMachine(authMachine);
};
