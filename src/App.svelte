<style lang="postcss">
	label {
		@apply block mb-2 text-sm font-bold text-gray-700;
	}
	.input-field {
		@apply border w-full py-2 px-3 text-gray-700 mb-3;
	}
	.input-field:focus {
		@apply shadow-outline outline-none;
	}
	button {
		@apply w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-sm;
	}
	button:hover {
		@apply bg-blue-700;
	}
	button:focus {
		@apply outline-none shadow-outline;
	}
	.wrapper {
		@apply flex flex-grow h-screen justify-center items-center bg-blue-100;
	}
</style>

<script>
	import firebase from 'firebase/app';
	import { initAuth } from './auth';
	import { fade } from 'svelte/transition';

	const firebaseConfig = {
		// vite reads env variables from .env file in root dir
		apiKey: `${import.meta.env.VITE_FIREBASE_KEY}`,
		authDomain: 'testing-firebase-emulators.firebaseapp.com',
		projectId: 'testing-firebase-emulators'
	};

	firebase.initializeApp(firebaseConfig);

	// use custom auth machine store
	const { state, send } = initAuth();

	const loginHandler = async event => {
		const { email, password } = event.target.elements;
		// send login event
		send('LOGIN', {
			provider: 'email',
			email: email.value,
			password: password.value
		});
	};

	// we don't want to be explicit about signingIn state
	$: displayLoginForm = ['signingIn', 'signedOut'].some($state.matches);
</script>

<div class="wrapper">
	<div class="w-full max-w-xs">
		{#if $state.matches('authenticating')}
			<h2 class="text-2xl text-center">Authenticating ...</h2>
		{/if}

		{#if $state.matches('loading')}
			<h2 class="text-2xl text-center">Loading ...</h2>
		{/if}

		<!-- uncomment if you want to be explicit about signingIn state -->
		<!--
		{#if $state.matches('signingIn')}
			<h2 class="text-2xl text-center">Signing in ...</h2>
		{/if}
		-->

		{#if $state.matches('signedIn')}
			<div class="text-center">
				<h2 class="text-2xl">{$state.context.user.email}</h2>
				<button type="button" class="mt-3" on:click={() => send('LOGOUT')}>
					Logout
				</button>
			</div>
		{/if}

		{#if displayLoginForm}
			<form
				on:submit|preventDefault={loginHandler}
				class="px-8 pt-6 pb-8 bg-white shadow-md"
			>
				<div class="mb-4">
					<label for="email">Email</label>
					<input
						class="input-field"
						id="email"
						type="email"
						placeholder="name@acme.com"
					/>
				</div>
				<div class="mb-6">
					<label for="password">Password</label>
					<input
						class="input-field"
						id="password"
						type="password"
						placeholder="******************"
					/>
				</div>
				<!-- show auth errors -->
				{#if $state.context.error}
					<div class="bg-red-500 p-3 mb-6" transition:fade>
						{$state.context.error}
					</div>
				{/if}
				<div>
					<button type="submit">Sign In</button>
				</div>
				<div class="mt-3">
					<!-- tell auth machine that this is a Google login -->
					<button
						type="button"
						on:click|preventDefault={() => send('LOGIN', {
								provider: 'google'
							})}
					>
						Sign In with Google
					</button>
				</div>
			</form>
		{/if}

	</div>
</div>
