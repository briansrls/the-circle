# the-circle

Inspo: dining philosophers

Enjoy!

## Frontend (React + Vite)

The frontend is a React application built with Vite, located in the `frontend/` directory.

### Running the Frontend Development Server

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Compile Protocol Buffers (if you modified `.proto` files):
    ```bash
    npm run compile:proto
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
    The application should now be accessible in your browser (usually at `http://localhost:5173`).

### Frontend Environment Variables (API Keys)

To provide a default API key for services like Gemini, you can use an environment file:

1.  Create a new file named `.env` in the `frontend/` directory (i.e., `frontend/.env`).
2.  Add your API key to this file, prefixed with `VITE_`. For example, for a default Gemini API key:
    ```
    VITE_DEFAULT_GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
    Replace `"YOUR_GEMINI_API_KEY_HERE"` with your actual API key.

    **Note:** The `frontend/.env` file is ignored by Git (as configured in `frontend/.gitignore`) to prevent accidental commitment of sensitive keys. You can create a `frontend/.env.example` file if you want to provide a template for other developers.

    If an API key is provided directly in an agent's configuration form in the UI, it will take precedence over the default key from the `.env` file for that specific agent.
