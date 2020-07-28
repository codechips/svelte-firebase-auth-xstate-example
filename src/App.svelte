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

  console.log(import.meta.env);

  const firebaseConfig = {
    apiKey: `${import.meta.env.VITE_FIREBASE_KEY}`,
    authDomain: 'testing-firebase-emulators.firebaseapp.com',
    projectId: 'testing-firebase-emulators'
  };

  firebase.initializeApp(firebaseConfig);

  const { loginWithEmailPassword, loginWithGoogle, logout, user } = initAuth();
  let error = null;

  const loginHandler = async event => {
    const { email, password } = event.target.elements;
    try {
      error = null;
      await loginWithEmailPassword(email.value, password.value);
    } catch (err) {
      error = err;
    }
  };
</script>

<div class="wrapper">
  {#if $user}
    <div class="w-full max-w-xs">
      <div class="text-center">
        <h2>{$user.email}</h2>
        <button type="button" class="mt-3" on:click={logout}>Logout</button>
      </div>
    </div>
  {:else}
    <div class="w-full max-w-xs">
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
        {#if error}
          <div transition:fade class="p-2 mb-6 bg-red-300">{error.message}</div>
        {/if}
        <div>
          <button type="submit">Sign In</button>
        </div>
        <div class="mt-3">
          <button type="button" on:click|preventDefault={loginWithGoogle}>
            Sign In with Google
          </button>
        </div>
      </form>
    </div>
  {/if}
</div>
